package com.devmind.jobs.dto;

import com.devmind.enums.ToolType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobRequest {

    @NotBlank(message = "Code block is required")
    private String code;

    @NotNull(message = "Tool type is required")
    private ToolType toolType;

    @NotBlank(message = "Language is required")
    private String language;

    private String provider = "gemini";
}
