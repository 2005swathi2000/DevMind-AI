package com.devmind.ai.service;

import com.devmind.ai.provider.AiProviderRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final AiProviderRegistry registry;

    @Override
    public String generate(String provider, String prompt) {
        return registry.get(provider).generate(prompt);
    }

    @Override
    public void generateStream(String provider, String prompt, StreamCallback callback) {
        registry.get(provider).generateStream(prompt, callback);
    }
}

