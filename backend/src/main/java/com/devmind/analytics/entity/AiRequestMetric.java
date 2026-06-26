package com.devmind.analytics.entity;

import com.devmind.enums.ToolType;
import com.devmind.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_request_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiRequestMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String provider;

    @Enumerated(EnumType.STRING)
    @Column(name = "tool_type", nullable = false)
    private ToolType toolType;

    @Column(name = "latency_ms", nullable = false)
    private long latencyMs;

    @Column(name = "prompt_characters", nullable = false)
    private int promptCharacters;

    @Column(name = "response_characters", nullable = false)
    private int responseCharacters;

    @Column(name = "estimated_tokens", nullable = false)
    private int estimatedTokens;

    @Column(name = "cache_hit", nullable = false)
    private boolean cacheHit;

    @Column(nullable = false)
    private boolean success;

    @Column(name = "error_type")
    private String errorType;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
