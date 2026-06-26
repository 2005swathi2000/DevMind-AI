package com.devmind.ai.service;

public interface AiService {
    String generate(String provider, String prompt);
    void generateStream(String provider, String prompt, StreamCallback callback);
}

