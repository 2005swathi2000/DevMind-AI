package com.devmind.workspace.dto;

import com.devmind.enums.ToolType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkspaceSessionResponse {
    private UUID id;
    private ToolType toolType;
    private String title;
    private String language;
    private String inputCode;
    private String aiResponse;
    private Long tokensUsed;
    private Long executionTimeMs;
    private boolean favorite;
    private boolean pinned;
    private boolean shared;
    private LocalDateTime createdAt;
}
