package com.devmind.jobs.dto;

import com.devmind.enums.JobStatus;
import com.devmind.enums.ToolType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {
    private UUID id;
    private ToolType toolType;
    private String provider;
    private JobStatus status;
    private String inputCode;
    private String language;
    private String response;
    private String errorMessage;
    private int retryCount;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
