package com.devmind.analytics.service;

import com.devmind.analytics.dto.AnalyticsSummaryResponse;
import com.devmind.analytics.entity.AiRequestMetric;
import com.devmind.analytics.repository.AiRequestMetricRepository;
import com.devmind.enums.ToolType;
import com.devmind.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsServiceImpl implements AnalyticsService {

    private final AiRequestMetricRepository repository;

    @Override
    @Transactional
    public void record(User user, String provider, ToolType toolType, long latencyMs,
                       int promptChars, int responseChars, boolean cacheHit,
                       boolean success, String errorType) {
        
        int estimatedTokens = (promptChars + responseChars) / 4;

        AiRequestMetric metric = AiRequestMetric.builder()
                .user(user)
                .provider(provider != null ? provider : "gemini")
                .toolType(toolType)
                .latencyMs(latencyMs)
                .promptCharacters(promptChars)
                .responseCharacters(responseChars)
                .estimatedTokens(estimatedTokens)
                .cacheHit(cacheHit)
                .success(success)
                .errorType(errorType)
                .build();

        repository.save(metric);

        // Structured logging
        log.info("AI_METRIC: user={}, provider={}, tool={}, latency={}ms, cacheHit={}, success={}, tokens={}",
                user.getEmail(), metric.getProvider(), toolType.name(), latencyMs, cacheHit, success, estimatedTokens);
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getSummary(User user) {
        List<AiRequestMetric> metrics = repository.findByUserOrderByCreatedAtDesc(user);

        if (metrics.isEmpty()) {
            return AnalyticsSummaryResponse.builder()
                    .totalRequests(0)
                    .averageLatencyMs(0)
                    .cacheHitRate(0)
                    .successRate(100)
                    .totalEstimatedTokens(0)
                    .requestsByProvider(Map.of())
                    .requestsByToolType(Map.of())
                    .build();
        }

        long total = metrics.size();
        double avgLatency = metrics.stream().mapToLong(AiRequestMetric::getLatencyMs).average().orElse(0.0);
        long cacheHits = metrics.stream().filter(AiRequestMetric::isCacheHit).count();
        long successCount = metrics.stream().filter(AiRequestMetric::isSuccess).count();
        long totalTokens = metrics.stream().mapToLong(AiRequestMetric::getEstimatedTokens).sum();

        Map<String, Long> byProvider = metrics.stream()
                .collect(Collectors.groupingBy(AiRequestMetric::getProvider, Collectors.counting()));

        Map<String, Long> byTool = metrics.stream()
                .collect(Collectors.groupingBy(m -> m.getToolType().name(), Collectors.counting()));

        return AnalyticsSummaryResponse.builder()
                .totalRequests(total)
                .averageLatencyMs(avgLatency)
                .cacheHitRate(((double) cacheHits / total) * 100.0)
                .successRate(((double) successCount / total) * 100.0)
                .totalEstimatedTokens(totalTokens)
                .requestsByProvider(byProvider)
                .requestsByToolType(byTool)
                .build();
    }
}
