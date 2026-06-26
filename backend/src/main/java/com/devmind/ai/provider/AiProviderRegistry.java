package com.devmind.ai.provider;

import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class AiProviderRegistry {

    private final Map<String, AiProvider> providers;

    public AiProviderRegistry(List<AiProvider> providerList) {
        this.providers = providerList.stream()
            .collect(Collectors.toMap(
                p -> p.getName().toLowerCase(),
                Function.identity()
            ));
    }

    public AiProvider get(String provider) {
        if (provider == null) {
            return providers.get("gemini");
        }
        return providers.getOrDefault(
            provider.toLowerCase(),
            providers.get("gemini")
        );
    }
}
