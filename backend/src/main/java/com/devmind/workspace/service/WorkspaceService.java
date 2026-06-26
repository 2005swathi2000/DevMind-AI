package com.devmind.workspace.service;

import com.devmind.enums.ToolType;
import com.devmind.user.entity.User;
import com.devmind.workspace.dto.WorkspaceRequest;
import com.devmind.workspace.dto.WorkspaceSessionResponse;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

public interface WorkspaceService {
    void analyze(WorkspaceRequest request, User user, SseEmitter emitter);
    List<WorkspaceSessionResponse> getHistory(User user);
    List<WorkspaceSessionResponse> getHistoryByToolType(User user, ToolType toolType);
    WorkspaceSessionResponse getSession(UUID id, User user);
    WorkspaceSessionResponse toggleFavorite(UUID id, User user);
    WorkspaceSessionResponse togglePin(UUID id, User user);
    void deleteSession(UUID id, User user);
}
