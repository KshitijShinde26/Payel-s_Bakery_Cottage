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

        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(u -> u.getRole() == Role.ADMIN && u.getDeletedAt() == null);

        if (!adminExists) {
            // Check if user with adminEmail exists, if not create
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = User.builder()
                        .fullName(adminName)
                        .email(adminEmail)
                        .phoneNumber(adminPhone)
                        .password(passwordEncoder.encode(adminPassword))
                        .role(Role.ADMIN)
                        .emailVerified(true)
                        .enabled(true)
                        .build();

                userRepository.save(admin);
                logger.info("Bootstrap: Initial Administrator account created successfully for [{}]", adminEmail);
            }
        }
    }
}
