package com.bakery.cottage.service;

import com.bakery.cottage.entity.AuditLog;
import com.bakery.cottage.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logEvent(String eventType, String email, String details, String ipAddress) {
        AuditLog log = AuditLog.builder()
                .eventType(eventType)
                .email(email)
                .details(details)
                .ipAddress(ipAddress)
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);
    }
}
