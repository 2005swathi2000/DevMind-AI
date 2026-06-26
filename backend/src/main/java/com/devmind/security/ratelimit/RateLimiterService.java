package com.devmind.security.ratelimit;

import com.devmind.exception.RateLimitExceededException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    private final ConcurrentHashMap<UUID, List<Long>> userRequests = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_HOUR = 20;
    private static final long ONE_HOUR_IN_MS = 3600000;

    public void checkRateLimit(UUID userId) {
        long now = System.currentTimeMillis();
        userRequests.compute(userId, (key, timestamps) -> {
            if (timestamps == null) {
                timestamps = new ArrayList<>();
            }
            timestamps.removeIf(t -> now - t > ONE_HOUR_IN_MS);
            
            if (timestamps.size() >= MAX_REQUESTS_PER_HOUR) {
                long oldestTimestamp = timestamps.get(0);
                long waitTimeMinutes = ((oldestTimestamp + ONE_HOUR_IN_MS) - now) / 60000 + 1;
                throw new RateLimitExceededException("Rate limit exceeded. Maximum 20 requests per hour. Try again in " + waitTimeMinutes + " minutes.");
            }
            
            timestamps.add(now);
            return timestamps;
        });
    }
}
