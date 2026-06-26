package com.devmind.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsSummaryResponse {
    private long totalRequests;
    private double averageLatencyMs;
    private double cacheHitRate;
    private double successRate;
    private long totalEstimatedTokens;
    private Map<String, Long> requestsByProvider;
    private Map<String, Long> requestsByToolType;
}
