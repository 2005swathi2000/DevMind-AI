package com.devmind.workspace.controller;

import com.devmind.enums.ToolType;
import com.devmind.security.user.CustomUserDetails;
import com.devmind.user.entity.User;
import com.devmind.user.repository.UserRepository;
import com.devmind.workspace.dto.WorkspaceRequest;
import com.devmind.workspace.dto.WorkspaceSessionResponse;
import com.devmind.workspace.service.WorkspaceService;
import com.devmind.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspace")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;
    private final UserRepository userRepository;

    @PostMapping(value = "/analyze", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter analyze(
            @Valid @RequestBody WorkspaceRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        SseEmitter emitter = new SseEmitter(180000L); // 3 minutes timeout
        workspaceService.analyze(request, user, emitter);
        return emitter;
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<WorkspaceSessionResponse>>> getHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) ToolType toolType) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<WorkspaceSessionResponse> history;
        if (toolType != null) {
            history = workspaceService.getHistoryByToolType(user, toolType);
        } else {
            history = workspaceService.getHistory(user);
        }

        return ResponseEntity.ok(ApiResponse.success("History fetched successfully", history));
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<ApiResponse<WorkspaceSessionResponse>> getSession(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        WorkspaceSessionResponse response = workspaceService.getSession(id, user);
        return ResponseEntity.ok(ApiResponse.success("Session details fetched", response));
    }

    @PutMapping("/history/{id}/favorite")
    public ResponseEntity<ApiResponse<WorkspaceSessionResponse>> toggleFavorite(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        WorkspaceSessionResponse response = workspaceService.toggleFavorite(id, user);
        return ResponseEntity.ok(ApiResponse.success("Favorite status updated", response));
    }

    @PutMapping("/history/{id}/pin")
    public ResponseEntity<ApiResponse<WorkspaceSessionResponse>> togglePin(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        WorkspaceSessionResponse response = workspaceService.togglePin(id, user);
        return ResponseEntity.ok(ApiResponse.success("Pin status updated", response));
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        workspaceService.deleteSession(id, user);
        return ResponseEntity.ok(ApiResponse.success("Session deleted successfully", null));
    }
}
