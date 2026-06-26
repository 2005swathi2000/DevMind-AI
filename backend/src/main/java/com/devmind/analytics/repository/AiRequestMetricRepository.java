package com.devmind.analytics.repository;

import com.devmind.analytics.entity.AiRequestMetric;
import com.devmind.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AiRequestMetricRepository extends JpaRepository<AiRequestMetric, UUID> {
    List<AiRequestMetric> findByUserOrderByCreatedAtDesc(User user);
    long countByUser(User user);
}
