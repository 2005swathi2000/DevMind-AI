package com.devmind.workspace.cache;

import com.devmind.enums.ToolType;
import com.devmind.user.entity.User;
import com.devmind.workspace.entity.WorkspaceSession;
import com.devmind.workspace.repository.WorkspaceSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AnalysisResponseCache {

    private final WorkspaceSessionRepository repository;

    public Optional<WorkspaceSession> get(ToolType toolType, String code, User user) {
        String hash = calculateHash(toolType, code);
        return repository.findFirstByCodeHashAndUser(hash, user);
    }

    public String calculateHash(ToolType toolType, String code) {
        try {
            String combined = toolType.name() + ":" + (code != null ? code : "");
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(combined.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            throw new RuntimeException("Failed to calculate code hash", ex);
        }
    }
}
