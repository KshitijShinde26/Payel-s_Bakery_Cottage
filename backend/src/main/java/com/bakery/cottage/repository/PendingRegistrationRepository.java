package com.bakery.cottage.repository;

import com.bakery.cottage.entity.PendingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, String> {
    Optional<PendingRegistration> findByEmail(String email);
    Optional<PendingRegistration> findByEmailAndOtpCode(String email, String otpCode);
    void deleteByEmail(String email);
}
