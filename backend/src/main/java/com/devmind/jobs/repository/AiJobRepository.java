package com.devmind.jobs.repository;

import com.devmind.jobs.entity.AiJob;
import com.devmind.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiJobRepository extends JpaRepository<AiJob, UUID> {
    List<AiJob> findByUserOrderByCreatedAtDesc(User user);
    Optional<AiJob> findByIdAndUser(UUID id, User user);
}
