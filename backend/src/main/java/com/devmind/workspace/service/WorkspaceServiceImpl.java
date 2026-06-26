package com.devmind.workspace.service;

import com.devmind.ai.prompt.PromptLoader;
import com.devmind.ai.service.AiService;
import com.devmind.ai.service.StreamCallback;
import com.devmind.enums.ToolType;
import com.devmind.security.ratelimit.RateLimiterService;
import com.devmind.user.entity.User;
import com.devmind.workspace.cache.AnalysisResponseCache;
import com.devmind.workspace.dto.WorkspaceRequest;
import com.devmind.workspace.dto.WorkspaceSessionResponse;
import com.devmind.workspace.entity.WorkspaceSession;
import com.devmind.workspace.repository.WorkspaceSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceServiceImpl implements WorkspaceService {

    private final WorkspaceSessionRepository repository;
    private final PromptLoader promptLoader;
    private final AiService aiService;
    private final AnalysisResponseCache responseCache;
    private final RateLimiterService rateLimiterService;

    @Override
    public void analyze(WorkspaceRequest request, User user, SseEmitter emitter) {
        rateLimiterService.checkRateLimit(user.getId());

        String codeHash = responseCache.calculateHash(request.getToolType(), request.getCode());
        var cachedSessionOpt = responseCache.get(request.getToolType(), request.getCode(), user);

        if (cachedSessionOpt.isPresent()) {
            WorkspaceSession cachedSession = cachedSessionOpt.get();
            log.info("Cache hit for code hash: {}", codeHash);
            try {
                emitter.send(SseEmitter.event().data(cachedSession.getAiResponse()));
                emitter.complete();
            } catch (Exception e) {
                log.error("Failed to emit cached response", e);
                emitter.completeWithError(e);
            }
            return;
        }

        String prompt = promptLoader.getPrompt(request.getToolType(), request.getCode(), request.getLanguage());

        long startTime = System.currentTimeMillis();
        StringBuilder responseBuilder = new StringBuilder();

        aiService.generateStream(prompt, new StreamCallback() {
            @Override
            public void onChunk(String chunk) throws Exception {
                responseBuilder.append(chunk);
                emitter.send(SseEmitter.event().data(chunk));
            }

            @Override
            public void onComplete() throws Exception {
                long duration = System.currentTimeMillis() - startTime;
                String finalResponse = responseBuilder.toString();
                long estimatedTokens = (prompt.length() + finalResponse.length()) / 4;

                String title = request.getToolType().name().replace("_", " ") + " (" + request.getLanguage() + ")";
                WorkspaceSession session = WorkspaceSession.builder()
                        .user(user)
                        .toolType(request.getToolType())
                        .title(title)
                        .language(request.getLanguage())
                        .inputCode(request.getCode())
                        .aiResponse(finalResponse)
                        .codeHash(codeHash)
                        .tokensUsed(estimatedTokens)
                        .executionTimeMs(duration)
                        .favorite(false)
                        .pinned(false)
                        .shared(false)
                        .build();

                repository.save(session);
                emitter.complete();
                log.info("Analysis session saved successfully with ID: {}", session.getId());
            }

            @Override
            public void onError(Throwable throwable) {
                log.error("Error streaming content from AI provider", throwable);
                emitter.completeWithError(throwable);
            }
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkspaceSessionResponse> getHistory(User user) {
        return repository.findByUserOrderByPinnedDescCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkspaceSessionResponse> getHistoryByToolType(User user, ToolType toolType) {
        return repository.findByUserAndToolTypeOrderByPinnedDescCreatedAtDesc(user, toolType).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WorkspaceSessionResponse getSession(UUID id, User user) {
        WorkspaceSession session = repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Session not found with ID: " + id));
        return mapToResponse(session);
    }

    @Override
    @Transactional
    public WorkspaceSessionResponse toggleFavorite(UUID id, User user) {
        WorkspaceSession session = repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Session not found with ID: " + id));
        session.setFavorite(!session.isFavorite());
        return mapToResponse(repository.save(session));
    }

    @Override
    @Transactional
    public WorkspaceSessionResponse togglePin(UUID id, User user) {
        WorkspaceSession session = repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Session not found with ID: " + id));
        session.setPinned(!session.isPinned());
        return mapToResponse(repository.save(session));
    }

    @Override
    @Transactional
    public void deleteSession(UUID id, User user) {
        WorkspaceSession session = repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Session not found with ID: " + id));
        repository.delete(session);
    }

    private WorkspaceSessionResponse mapToResponse(WorkspaceSession session) {
        return WorkspaceSessionResponse.builder()
                .id(session.getId())
                .toolType(session.getToolType())
                .title(session.getTitle())
                .language(session.getLanguage())
                .inputCode(session.getInputCode())
                .aiResponse(session.getAiResponse())
                .tokensUsed(session.getTokensUsed())
                .executionTimeMs(session.getExecutionTimeMs())
                .favorite(session.isFavorite())
                .pinned(session.isPinned())
                .shared(session.isShared())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
