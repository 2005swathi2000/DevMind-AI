package com.devmind.analytics.service;

import com.devmind.analytics.dto.AnalyticsSummaryResponse;
import com.devmind.enums.ToolType;
import com.devmind.user.entity.User;

public interface AnalyticsService {
    void record(User user, String provider, ToolType toolType, long latencyMs,
                int promptChars, int responseChars, boolean cacheHit,
                boolean success, String errorType);

    AnalyticsSummaryResponse getSummary(User user);
}
