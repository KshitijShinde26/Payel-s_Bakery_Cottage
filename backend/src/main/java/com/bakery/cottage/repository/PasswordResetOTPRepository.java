package com.bakery.cottage.repository;

import com.bakery.cottage.entity.PasswordResetOTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PasswordResetOTPRepository extends JpaRepository<PasswordResetOTP, String> {
    Optional<PasswordResetOTP> findByEmail(String email);
    Optional<PasswordResetOTP> findByEmailAndCode(String email, String code);
    void deleteByEmail(String email);
}
