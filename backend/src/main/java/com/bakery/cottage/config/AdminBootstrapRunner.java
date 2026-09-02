package com.bakery.cottage.config;

import com.bakery.cottage.entity.Role;
import com.bakery.cottage.entity.User;
import com.bakery.cottage.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AdminBootstrapRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.default.enabled:true}")
    private boolean bootstrapEnabled;

    @Value("${admin.default.name:Payal Bakery Admin}")
    private String adminName;

    @Value("${admin.default.email:admin@bakerycottage.com}")
    private String adminEmail;

    @Value("${admin.default.phone:9999999999}")
    private String adminPhone;

    @Value("${admin.default.password:Admin@12345}")
    private String adminPassword;

    public AdminBootstrapRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!bootstrapEnabled) {
            return;
        }

        String normalizedEmail = (adminEmail != null && !adminEmail.isBlank())
                ? adminEmail.trim().toLowerCase()
                : "admin@bakerycottage.com";

        Optional<User> existingUserOpt = userRepository.findByEmail(normalizedEmail);

        if (existingUserOpt.isPresent()) {
            User existing = existingUserOpt.get();
            boolean needsSave = false;

            // Ensure role is explicitly set to ADMIN
            if (existing.getRole() != Role.ADMIN) {
                existing.setRole(Role.ADMIN);
                needsSave = true;
            }

            // Ensure email is marked verified so login is not rejected
            if (!existing.isEmailVerified()) {
                existing.setEmailVerified(true);
                needsSave = true;
            }

            // Ensure account is enabled
            if (!existing.isEnabled()) {
                existing.setEnabled(true);
                needsSave = true;
            }

            // Clear any soft-deletion
            if (existing.getDeletedAt() != null) {
                existing.setDeletedAt(null);
                needsSave = true;
            }

            // Ensure password matches the configured administrative password
            if (!passwordEncoder.matches(adminPassword, existing.getPassword())) {
                existing.setPassword(passwordEncoder.encode(adminPassword));
                needsSave = true;
            }

            if (needsSave) {
                userRepository.save(existing);
                logger.info("AdminBootstrap: Existing account [{}] verified and synchronized to active ADMIN.", normalizedEmail);
            }
        } else {
            // Check if any other admin exists in the database
            boolean anyAdminExists = userRepository.findAll().stream()
                    .anyMatch(u -> u.getRole() == Role.ADMIN && u.getDeletedAt() == null);

            if (!anyAdminExists) {
                String phone = (adminPhone != null && !adminPhone.isBlank()) ? adminPhone.trim() : "9999999999";

                // Check if phone number is already in use by another user
                Optional<User> phoneUserOpt = userRepository.findByPhoneNumber(phone);
                if (phoneUserOpt.isPresent()) {
                    phone = "98" + (System.currentTimeMillis() % 100000000L);
                    if (phone.length() > 10) {
                        phone = phone.substring(0, 10);
                    }
                }

                User admin = User.builder()
                        .fullName(adminName != null ? adminName.trim() : "Payal Bakery Admin")
                        .email(normalizedEmail)
                        .phoneNumber(phone)
                        .password(passwordEncoder.encode(adminPassword))
                        .role(Role.ADMIN)
                        .emailVerified(true)
                        .enabled(true)
                        .build();

                userRepository.save(admin);
                logger.info("AdminBootstrap: Initial Administrator account created successfully for [{}]", normalizedEmail);
            }
        }
    }
}
