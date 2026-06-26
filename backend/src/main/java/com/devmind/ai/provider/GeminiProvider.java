package com.devmind.ai.provider;

import com.devmind.ai.service.StreamCallback;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class GeminiProvider implements AiProvider {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public GeminiProvider(
            ObjectMapper objectMapper,
            @Value("${devmind.security.gemini.api-key:dummy-api-key}") String apiKey) {
        this.httpClient = HttpClient.newBuilder().build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
    }

    @Override
    public String generate(String prompt) {
        if (isDummyKey()) {
            return generateMockResponse(prompt);
        }
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
            String jsonPayload = objectMapper.writeValueAsString(createGeminiRequest(prompt));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Gemini API call failed. Status: {}, Body: {}", response.statusCode(), response.body());
                throw new RuntimeException("Gemini API call failed with status: " + response.statusCode());
            }

            JsonNode rootNode = objectMapper.readTree(response.body());
            return rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            throw new RuntimeException("Error communicating with AI Provider: " + e.getMessage(), e);
        }
    }

    @Override
    public void generateStream(String prompt, StreamCallback callback) {
        if (isDummyKey()) {
            generateMockStream(prompt, callback);
            return;
        }
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=" + apiKey;
            String jsonPayload = objectMapper.writeValueAsString(createGeminiRequest(prompt));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofInputStream())
                    .thenAccept(response -> {
                        if (response.statusCode() != 200) {
                            log.error("Gemini API stream call failed. Status: {}", response.statusCode());
                            callback.onError(new RuntimeException("Gemini API call failed with status: " + response.statusCode()));
                            return;
                        }

                        try (BufferedReader reader = new BufferedReader(new InputStreamReader(response.body(), StandardCharsets.UTF_8))) {
                            String line;
                            while ((line = reader.readLine()) != null) {
                                if (line.startsWith("data: ")) {
                                    String jsonStr = line.substring(6).trim();
                                    if (jsonStr.isEmpty() || jsonStr.equals("[DONE]")) {
                                        continue;
                                    }
                                    try {
                                        JsonNode rootNode = objectMapper.readTree(jsonStr);
                                        JsonNode candidates = rootNode.path("candidates");
                                        if (candidates.isArray() && !candidates.isEmpty()) {
                                            String chunkText = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
                                            if (chunkText != null && !chunkText.isEmpty()) {
                                                callback.onChunk(chunkText);
                                            }
                                        }
                                    } catch (Exception parseEx) {
                                        log.warn("Failed to parse stream chunk: {}", jsonStr, parseEx);
                                    }
                                }
                            }
                            callback.onComplete();
                        } catch (Exception ioEx) {
                            log.error("IO error during Gemini stream reading", ioEx);
                            callback.onError(ioEx);
                        }
                    })
                    .exceptionally(ex -> {
                        log.error("Asynchronous exception in Gemini streaming", ex);
                        callback.onError(ex);
                        return null;
                    });
        } catch (Exception e) {
            log.error("Failed to start Gemini stream", e);
            callback.onError(e);
        }
    }

    private boolean isDummyKey() {
        return apiKey == null || apiKey.isEmpty() || apiKey.trim().equals("dummy-api-key");
    }

    private String generateMockResponse(String prompt) {
        if (prompt.contains("review") || prompt.contains("REVIEW")) {
            return "Mock Code Review: Code quality is good (85/100). Rating: Grade B.";
        }
        return "Mock AI Assistant Response.";
    }

    private void generateMockStream(String prompt, StreamCallback callback) {
        new Thread(() -> {
            try {
                String responseText;
                if (prompt.contains("review") || prompt.contains("REVIEW") || prompt.contains("Quality")) {
                    responseText = """
                            # AI Code Review Report
                            
                            ### 1. Code Quality Score: **85/100**
                            
                            ### 2. Best Practices
                            - **Encapsulation**: Ensure field variables are marked private.
                            - **Resource Handling**: Implement try-with-resources to prevent memory leaks.
                            
                            ### 3. Security Analysis
                            - **Injection Check**: Safe from SQL injection.
                            - **Input Sanitization**: Add boundary validation checks to avoid index out of bound exceptions.
                            
                            ### 4. Refactored Code
                            ```java
                            public class CodeRefactored {
                                public void execute() {
                                    System.out.println("Optimized Code Execution");
                                }
                            }
                            ```
                            
                            ### 5. Final Rating: **Grade B**
                            """;
                } else if (prompt.contains("complexity") || prompt.contains("COMPLEXITY")) {
                    responseText = """
                            # Complexity Analysis Report
                            
                            ### 1. Time Complexity: **O(N)**
                            - The method traverses the collection in a single loop, leading to linear time complexity.
                            
                            ### 2. Space Complexity: **O(1)**
                            - No auxiliary space is allocated, resulting in constant space complexity.
                            
                            ### 3. Optimization Suggestions
                            - Consider using early exit conditions to optimize search routines in large arrays.
                            """;
                } else {
                    responseText = """
                            # AI Assistant Analysis
                            
                            Successfully processed the input code.
                            
                            - **Language**: Verified.
                            - **Execution**: Verified.
                            - **Logic**: No major syntax errors identified.
                            
                            Recommended to write unit tests to ensure high test coverage.
                            """;
                }

                String[] chunks = responseText.split("(?<=\\s)|(?=\\n)");
                for (String chunk : chunks) {
                    callback.onChunk(chunk);
                    Thread.sleep(30); // 30ms streaming delay
                }
                callback.onComplete();
            } catch (Exception e) {
                log.error("Error in mock streaming", e);
                callback.onError(e);
            }
        }).start();
    }

    private Map<String, Object> createGeminiRequest(String prompt) {
        return Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );
    }
}
