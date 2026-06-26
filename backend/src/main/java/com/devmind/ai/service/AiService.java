package com.devmind.ai.service;

public interface AiService {
    String generate(String prompt);
    void generateStream(String prompt, StreamCallback callback);
}
