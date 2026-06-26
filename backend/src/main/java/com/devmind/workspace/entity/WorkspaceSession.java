package com.devmind.workspace.entity;

import com.devmind.common.entity.BaseAuditEntity;
import com.devmind.enums.ToolType;
import com.devmind.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "workspace_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkspaceSession extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "tool_type", nullable = false)
    private ToolType toolType;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String language;

    @Column(name = "input_code", nullable = false, columnDefinition = "TEXT")
    private String inputCode;

    @Column(name = "ai_response", nullable = false, columnDefinition = "TEXT")
    private String aiResponse;

    @Column(name = "code_hash", nullable = false)
    private String codeHash;

    @Column(name = "tokens_used")
    private Long tokensUsed = 0L;

    @Column(name = "execution_time_ms")
    private Long executionTimeMs = 0L;

    @Column(nullable = false)
    private boolean favorite = false;

    @Column(nullable = false)
    private boolean pinned = false;

    @Column(nullable = false)
    private boolean shared = false;
}
