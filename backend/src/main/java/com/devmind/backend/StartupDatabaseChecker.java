package com.devmind.backend;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class StartupDatabaseChecker implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("=== STARTING ENVIRONMENT & DATABASE DIAGNOSTICS ===");
        
        // Print Non-Secret Environment Variables
        log.info("SPRING_PROFILES_ACTIVE: {}", System.getenv("SPRING_PROFILES_ACTIVE"));
        log.info("SPRING_DATASOURCE_URL: {}", System.getenv("SPRING_DATASOURCE_URL"));
        log.info("SPRING_DATASOURCE_USERNAME: {}", System.getenv("SPRING_DATASOURCE_USERNAME"));
        log.info("JWT_SECRET configured: {}", System.getenv("JWT_SECRET") != null && !System.getenv("JWT_SECRET").isEmpty());
        log.info("DEVMIND_SECURITY_GEMINI_API_KEY configured: {}", System.getenv("DEVMIND_SECURITY_GEMINI_API_KEY") != null && !System.getenv("DEVMIND_SECURITY_GEMINI_API_KEY").isEmpty());
        
        // Check Database Connection
        try {
            log.info("Attempting to connect to Neon PostgreSQL database...");
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            log.info("Neon Database Connection Status: SUCCESS (Query returned: {})", result);
            
            // Check if User table exists
            log.info("Checking database tables...");
            Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
            log.info("Database Schema Check: SUCCESS ('users' table exists, records count: {})", userCount);
        } catch (Exception ex) {
            log.error("=========================================================");
            log.error("DATABASE CONNECTION OR SCHEMA DIAGNOSTIC FAILED!");
            log.error("Error details: ", ex);
            log.error("=========================================================");
        }
    }
}
