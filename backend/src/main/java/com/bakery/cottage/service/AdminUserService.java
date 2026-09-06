package com.bakery.cottage.service;

import com.bakery.cottage.dto.AdminUserDTO;
import com.bakery.cottage.entity.Role;
import com.bakery.cottage.entity.User;
import com.bakery.cottage.exception.ResourceNotFoundException;
import com.bakery.cottage.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final AuditService auditService;

    public AdminUserService(UserRepository userRepository, AuditService auditService) {
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<AdminUserDTO> getCustomers() {
        return userRepository.findByRoleAndDeletedAtIsNullOrderByCreatedAtDesc(Role.CUSTOMER)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminUserDTO> getShopkeepers() {
        return userRepository.findByRoleAndDeletedAtIsNullOrderByCreatedAtDesc(Role.SHOPKEEPER)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminUserDTO> getAllUsers() {
        return userRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminUserDTO updateUserStatus(String userId, boolean enabled, String adminEmail, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setEnabled(enabled);
        User updated = userRepository.save(user);

        auditService.logEvent(
                "ADMIN_USER_STATUS_CHANGE",
                adminEmail,
                "Admin updated status for user " + user.getEmail() + " to enabled=" + enabled,
                ipAddress
        );

        return mapToDto(updated);
    }

    @Transactional
    public AdminUserDTO updateUserRole(String userId, Role newRole, String adminEmail, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Role oldRole = user.getRole();
        user.setRole(newRole);
        User updated = userRepository.save(user);

        auditService.logEvent(
                "ADMIN_USER_ROLE_CHANGE",
                adminEmail,
                "Admin changed role for user " + user.getEmail() + " from " + oldRole + " to " + newRole,
                ipAddress
        );

        return mapToDto(updated);
    }

    private AdminUserDTO mapToDto(User user) {
        return AdminUserDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .enabled(user.isEnabled())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
