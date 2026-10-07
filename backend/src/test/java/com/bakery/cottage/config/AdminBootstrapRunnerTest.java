package com.bakery.cottage.config;

import com.bakery.cottage.entity.Role;
import com.bakery.cottage.entity.User;
import com.bakery.cottage.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminBootstrapRunnerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminBootstrapRunner adminBootstrapRunner;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(adminBootstrapRunner, "bootstrapEnabled", true);
        ReflectionTestUtils.setField(adminBootstrapRunner, "adminName", "Payal Bakery Admin");
        ReflectionTestUtils.setField(adminBootstrapRunner, "adminEmail", "admin@bakerycottage.com");
        ReflectionTestUtils.setField(adminBootstrapRunner, "adminPhone", "9999999999");
        ReflectionTestUtils.setField(adminBootstrapRunner, "adminPassword", "Admin@12345");
    }

    @Test
    void run_NoAdminExists_CreatesAdmin() {
        when(userRepository.findByEmail("admin@bakerycottage.com")).thenReturn(Optional.empty());
        when(userRepository.findAll()).thenReturn(Collections.emptyList());
        when(userRepository.findByPhoneNumber("9999999999")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Admin@12345")).thenReturn("hashed_admin_password");

        adminBootstrapRunner.run();

        verify(userRepository, times(1)).save(argThat(user ->
                user.getEmail().equals("admin@bakerycottage.com") &&
                user.getRole() == Role.ADMIN &&
                user.isEmailVerified() &&
                user.isEnabled() &&
                user.getPassword().equals("hashed_admin_password")
        ));
    }

    @Test
    void run_ExistingAccountAsCustomer_UpdatesToAdminAndSyncsPassword() {
        User existingUser = User.builder()
                .id("existing-id")
                .fullName("Old User")
                .email("admin@bakerycottage.com")
                .phoneNumber("9999999999")
                .password("old_hash")
                .role(Role.CUSTOMER)
                .emailVerified(false)
                .enabled(false)
                .build();

        when(userRepository.findByEmail("admin@bakerycottage.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("Admin@12345", "old_hash")).thenReturn(false);
        when(passwordEncoder.encode("Admin@12345")).thenReturn("new_admin_hash");

        adminBootstrapRunner.run();

        verify(userRepository, times(1)).save(argThat(user ->
                user.getEmail().equals("admin@bakerycottage.com") &&
                user.getRole() == Role.ADMIN &&
                user.isEmailVerified() &&
                user.isEnabled() &&
                user.getPassword().equals("new_admin_hash")
        ));
    }

    @Test
    void run_BootstrapDisabled_DoesNothing() {
        ReflectionTestUtils.setField(adminBootstrapRunner, "bootstrapEnabled", false);

        adminBootstrapRunner.run();

        verify(userRepository, never()).findByEmail(anyString());
        verify(userRepository, never()).save(any());
    }
}
