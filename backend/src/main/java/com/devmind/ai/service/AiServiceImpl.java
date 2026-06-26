package com.devmind.ai.service;

import com.devmind.ai.provider.AiProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final AiProvider aiProvider;

    @Override
    public String generate(String prompt) {
        return aiProvider.generate(prompt);
    }

    @Override
    public void generateStream(String prompt, StreamCallback callback) {
        aiProvider.generateStream(prompt, callback);
    }
}
