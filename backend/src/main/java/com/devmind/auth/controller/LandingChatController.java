package com.devmind.auth.controller;

import com.devmind.ai.service.AiService;
import com.devmind.ai.service.StreamCallback;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class LandingChatController {

    private final AiService aiService;

    @Data
    public static class ChatRequest {
        private String message;
        private List<ChatMessage> history;
        private String provider;
    }

    @Data
    public static class ChatMessage {
        private String sender;
        private String text;
    }

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(@RequestBody ChatRequest request) {
        String provider = request.getProvider() != null ? request.getProvider() : "gemini";
        
        // 1. Build prompt with system instructions and chat memory context
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("You are DevMind AI, an AI Software Engineering Assistant. ");
        promptBuilder.append("Your job is to help developers, students, and recruiters understand DevMind AI, ");
        promptBuilder.append("answer software engineering questions, explain coding concepts, describe project features, ");
        promptBuilder.append("provide career guidance, and answer general programming questions. ");
        promptBuilder.append("If someone asks about DevMind AI, answer based on its capabilities (like code reviews, bug finder, ");
        promptBuilder.append("asynchronous worker queues, custom templates, metrics, and achievements). ");
        promptBuilder.append("Be polite, helpful, and concise.\n\n");

        // Append historical conversation memory
        if (request.getHistory() != null) {
            for (ChatMessage msg : request.getHistory()) {
                if ("user".equalsIgnoreCase(msg.getSender())) {
                    promptBuilder.append("User: ").append(msg.getText()).append("\n");
                } else {
                    promptBuilder.append("AI: ").append(msg.getText()).append("\n");
                }
            }
        }

        // Append active prompt
        promptBuilder.append("User: ").append(request.getMessage()).append("\n");
        promptBuilder.append("AI:");

        String prompt = promptBuilder.toString();
        SseEmitter emitter = new SseEmitter(180000L); // 3 minutes timeout

        aiService.generateStream(provider, prompt, new StreamCallback() {
            @Override
            public void onChunk(String chunk) throws Exception {
                emitter.send(SseEmitter.event().data(chunk));
            }

            @Override
            public void onComplete() throws Exception {
                emitter.complete();
            }

            @Override
            public void onError(Throwable throwable) {
                log.error("Error in landing chat stream", throwable);
                emitter.completeWithError(throwable);
            }
        });

        return emitter;
    }
}
