package com.devmind.workspace.repository;

import com.devmind.enums.ToolType;
import com.devmind.user.entity.User;
import com.devmind.workspace.entity.WorkspaceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkspaceSessionRepository extends JpaRepository<WorkspaceSession, UUID> {
    List<WorkspaceSession> findByUserOrderByPinnedDescCreatedAtDesc(User user);
    List<WorkspaceSession> findByUserAndToolTypeOrderByPinnedDescCreatedAtDesc(User user, ToolType toolType);
    List<WorkspaceSession> findByUserAndFavoriteOrderByPinnedDescCreatedAtDesc(User user, boolean favorite);
    Optional<WorkspaceSession> findByIdAndUser(UUID id, User user);
    Optional<WorkspaceSession> findFirstByCodeHashAndUser(String codeHash, User user);
}
