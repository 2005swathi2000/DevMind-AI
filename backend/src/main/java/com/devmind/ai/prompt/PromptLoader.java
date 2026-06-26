package com.devmind.ai.prompt;

import com.devmind.enums.ToolType;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.EnumMap;
import java.util.Map;

@Component
@Slf4j
public class PromptLoader {

    private final Map<ToolType, String> templates = new EnumMap<>(ToolType.class);

    @PostConstruct
    public void init() {
        loadTemplate(ToolType.CODE_REVIEW, "prompts/code-review.md");
        loadTemplate(ToolType.BUG_FINDER, "prompts/bug-finder.md");
        loadTemplate(ToolType.COMPLEXITY, "prompts/complexity.md");
        loadTemplate(ToolType.DOCUMENTATION, "prompts/documentation.md");
        loadTemplate(ToolType.EXPLAIN_CODE, "prompts/explain-code.md");
        loadTemplate(ToolType.UNIT_TEST, "prompts/unit-test.md");
        loadTemplate(ToolType.COMMIT_GENERATOR, "prompts/commit.md");
    }

    private void loadTemplate(ToolType type, String resourcePath) {
        try {
            ClassPathResource resource = new ClassPathResource(resourcePath);
            String content = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
            templates.put(type, content);
            log.info("Successfully loaded prompt template for: {}", type);
        } catch (IOException e) {
            log.error("Failed to load prompt template from path: {}", resourcePath, e);
            templates.put(type, "Analyze this {{language}} code:\n{{code}}");
        }
    }

    public String getPrompt(ToolType type, String code, String language) {
        String template = templates.getOrDefault(type, "Analyze this {{language}} code:\n{{code}}");
        return template
                .replace("{{code}}", code != null ? code : "")
                .replace("{{language}}", language != null ? language : "Code");
    }
}
