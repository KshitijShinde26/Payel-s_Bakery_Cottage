package com.bakery.cottage.service;

import com.bakery.cottage.entity.RefreshToken;
import com.bakery.cottage.entity.User;
import com.bakery.cottage.exception.DuplicateResourceException;
import com.bakery.cottage.exception.ResourceNotFoundException;
import com.bakery.cottage.repository.RefreshTokenRepository;
import com.bakery.cottage.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;
    private final AuditService auditService;

    public UserService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            CloudinaryService cloudinaryService,
            AuditService auditService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.cloudinaryService = cloudinaryService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public User getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getDeletedAt() != null) {
            throw new ResourceNotFoundException("User account has been deleted");
        }
        return user;
    }

    @Transactional
    public User updateProfile(String id, String fullName, String phoneNumber, String ipAddress) {
        User user = getUserById(id);

        // Enforce uniqueness of phone number
        if (!user.getPhoneNumber().equals(phoneNumber) && userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new DuplicateResourceException("Phone number is already in use by another account");
        }

        user.setFullName(fullName);
        user.setPhoneNumber(phoneNumber);
        User savedUser = userRepository.save(user);

        auditService.logEvent("PROFILE_UPDATE", user.getEmail(), "Updated name and phone number", ipAddress);
        return savedUser;
    }

    @Transactional
    public void changePassword(String id, String currentPassword, String newPassword, String ipAddress) {
        User user = getUserById(id);

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Invalidate all active sessions (security best practice)
        List<RefreshToken> tokens = refreshTokenRepository.findByUser(user);
        tokens.forEach(token -> {
            token.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(token);
        });

        auditService.logEvent("PASSWORD_CHANGE", user.getEmail(), "Successfully updated password and revoked refresh tokens", ipAddress);
    }

    @Transactional
    public User updateAvatar(String id, MultipartFile file, String ipAddress) throws IOException {
        User user = getUserById(id);
        String avatarUrl = cloudinaryService.uploadAvatar(file);
        user.setAvatarUrl(avatarUrl);
        User savedUser = userRepository.save(user);

        auditService.logEvent("AVATAR_UPDATE", user.getEmail(), "Updated profile avatar URL to: " + avatarUrl, ipAddress);
        return savedUser;
    }
}
