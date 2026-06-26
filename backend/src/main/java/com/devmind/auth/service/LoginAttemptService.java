package com.devmind.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private final int maxAttempts;
    private final long lockoutDurationMs;

    private final ConcurrentHashMap<String, Integer> attemptsCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> lockoutsCache = new ConcurrentHashMap<>();

    public LoginAttemptService(
            @Value("${devmind.security.brute-force.max-attempts:5}") int maxAttempts,
            @Value("${devmind.security.brute-force.lockout-duration-ms:900000}") long lockoutDurationMs) {
        this.maxAttempts = maxAttempts;
        this.lockoutDurationMs = lockoutDurationMs;
    }

    public void loginSucceeded(String key) {
        attemptsCache.remove(key);
        lockoutsCache.remove(key);
    }

    public void loginFailed(String key) {
        int attempts = attemptsCache.getOrDefault(key, 0) + 1;
        attemptsCache.put(key, attempts);

        if (attempts >= maxAttempts) {
            lockoutsCache.put(key, System.currentTimeMillis() + lockoutDurationMs);
        }
    }

    public boolean isLocked(String key) {
        if (!lockoutsCache.containsKey(key)) {
            return false;
        }
        long lockoutEndTime = lockoutsCache.get(key);
        if (System.currentTimeMillis() > lockoutEndTime) {
            attemptsCache.remove(key);
            lockoutsCache.remove(key);
            return false;
        }
        return true;
    }

    public long getLockoutTimeRemainingSeconds(String key) {
        if (!lockoutsCache.containsKey(key)) {
            return 0;
        }
        long lockoutEndTime = lockoutsCache.get(key);
        long remainingMs = lockoutEndTime - System.currentTimeMillis();
        return Math.max(0, remainingMs / 1000);
    }
}
