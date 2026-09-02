package com.bakery.cottage.repository;

import com.bakery.cottage.entity.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, String> {
    Optional<EmailVerificationToken> findByEmail(String email);
    Optional<EmailVerificationToken> findByEmailAndCode(String email, String code);
    void deleteByEmail(String email);
}
