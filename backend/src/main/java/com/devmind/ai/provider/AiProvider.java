package com.devmind.ai.provider;

import com.devmind.ai.service.StreamCallback;

public interface AiProvider {
    String generate(String prompt);
    void generateStream(String prompt, StreamCallback callback);
}
