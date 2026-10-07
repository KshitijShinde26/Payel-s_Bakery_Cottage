package com.bakery.cottage.repository;

import com.bakery.cottage.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
    List<AuditLog> findByEmail(String email);
    List<AuditLog> findAllByOrderByTimestampDesc();
}
