package com.devmind.analytics.controller;

import com.devmind.analytics.dto.AnalyticsSummaryResponse;
import com.devmind.analytics.service.AnalyticsService;
import com.devmind.common.dto.ApiResponse;
import com.devmind.security.user.CustomUserDetails;
import com.devmind.user.entity.User;
import com.devmind.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepository;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AnalyticsSummaryResponse>> getSummary(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        AnalyticsSummaryResponse summary = analyticsService.getSummary(user);
        return ResponseEntity.ok(ApiResponse.success("Analytics summary retrieved successfully", summary));
    }
}
