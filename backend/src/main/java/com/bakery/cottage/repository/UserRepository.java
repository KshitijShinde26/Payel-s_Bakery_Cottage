package com.bakery.cottage.repository;

import com.bakery.cottage.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    List<User> findByRoleAndDeletedAtIsNullOrderByCreatedAtDesc(Role role);
    List<User> findAllByDeletedAtIsNullOrderByCreatedAtDesc();
    long countByRoleAndDeletedAtIsNull(Role role);
    long countByRoleAndEnabledTrueAndDeletedAtIsNull(Role role);
}
