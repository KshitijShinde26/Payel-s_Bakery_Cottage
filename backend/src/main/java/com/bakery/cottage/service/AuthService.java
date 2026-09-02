package com.bakery.cottage.service;

import com.bakery.cottage.entity.*;
import com.bakery.cottage.exception.*;
import com.bakery.cottage.repository.*;
import com.bakery.cottage.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetOTPRepository passwordResetOTPRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final AuditService auditService;

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshExpirationInMs;

    private static final int MAX_OTP_ATTEMPTS = 5;
    private static final int OTP_EXPIRY_MINUTES = 15;
    private static final int OTP_COOLDOWN_SECONDS = 60;

    public AuthService(
            UserRepository userRepository,
            PendingRegistrationRepository pendingRegistrationRepository,
            RefreshTokenRepository refreshTokenRepository,
            EmailVerificationTokenRepository emailVerificationTokenRepository,
            PasswordResetOTPRepository passwordResetOTPRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            EmailService emailService,
            AuditService auditService) {
        this.userRepository = userRepository;
        this.pendingRegistrationRepository = pendingRegistrationRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordResetOTPRepository = passwordResetOTPRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.emailService = emailService;
        this.auditService = auditService;
    }

    @Transactional
    public void register(String fullName, String email, String phoneNumber, String password, String ipAddress) {
        register(fullName, email, phoneNumber, password, "CUSTOMER", ipAddress);
    }

    @Transactional
    public void register(String fullName, String email, String phoneNumber, String password, String requestedRole, String ipAddress) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email address is already in use");
        }
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new DuplicateResourceException("Phone number is already in use");
        }

        // Validate requested role strictly
        Role userRole;
        if (requestedRole == null || requestedRole.isBlank()) {
            userRole = Role.CUSTOMER;
        } else {
            try {
                userRole = Role.valueOf(requestedRole.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid registration role. Allowed roles are CUSTOMER and SHOPKEEPER.");
            }
        }

        // Critical Security Rule: Public registration cannot create ADMIN users
        if (userRole == Role.ADMIN) {
            throw new IllegalArgumentException("Public registration as Administrator is not permitted. Please contact the system administrator.");
        }

        // Generate Verification OTP
        String otp = generateOtpCode();

        // Store pending registration securely without creating an active user yet
        pendingRegistrationRepository.deleteByEmail(email);

        PendingRegistration pendingRegistration = PendingRegistration.builder()
                .fullName(fullName.trim())
                .email(email.trim().toLowerCase())
                .phoneNumber(phoneNumber.trim())
                .password(passwordEncoder.encode(password))
                .role(userRole)
                .otpCode(otp)
                .expiryDate(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .attempts(0)
                .lastSentAt(LocalDateTime.now())
                .build();

        pendingRegistrationRepository.save(pendingRegistration);

        // Send Email OTP
        emailService.sendVerificationOtp(email, fullName, otp);

        auditService.logEvent("PENDING_REGISTRATION", email,
                "Pending registration stored for " + userRole.name() + ", verification OTP dispatched", ipAddress);
    }

    @Transactional
    public void verifyEmail(String email, String code, String ipAddress) {
        verifyOtp(email, code, ipAddress);
    }

    @Transactional
    public void verifyOtp(String email, String code, String ipAddress) {
        String normalizedEmail = email.trim().toLowerCase();
        String normalizedCode = code.trim();

        // 1. Check pending registrations (Standard primary flow)
        PendingRegistration pending = pendingRegistrationRepository.findByEmail(normalizedEmail).orElse(null);

        if (pending != null) {
            if (pending.isExpired()) {
                pendingRegistrationRepository.delete(pending);
                throw new ExpiredTokenException("Verification code has expired. Please register again or request a new OTP.");
            }

            if (!pending.getOtpCode().equals(normalizedCode)) {
                pending.setAttempts(pending.getAttempts() + 1);
                if (pending.getAttempts() >= MAX_OTP_ATTEMPTS) {
                    pendingRegistrationRepository.delete(pending);
                    logger.warn("Pending registration for email {} deleted due to exceeding maximum incorrect OTP attempts.", normalizedEmail);
                    throw new IllegalArgumentException("Maximum verification attempts exceeded. Please register again.");
                }
                pendingRegistrationRepository.save(pending);
                throw new IllegalArgumentException("Invalid verification code");
            }

            // OTP verified! Create active User with the ORIGINAL validated role stored in pending registration
            User user = User.builder()
                    .fullName(pending.getFullName())
                    .email(pending.getEmail())
                    .phoneNumber(pending.getPhoneNumber())
                    .password(pending.getPassword())
                    .role(pending.getRole())
                    .emailVerified(true)
                    .enabled(true)
                    .build();

            userRepository.save(user);
            pendingRegistrationRepository.delete(pending);

            auditService.logEvent("REGISTRATION_COMPLETE", normalizedEmail,
                    "Email verified and user account created as " + user.getRole().name(), ipAddress);
            return;
        }

        // 2. Fallback check: email_verification_tokens table (for legacy or unverified existing users)
        EmailVerificationToken token = emailVerificationTokenRepository.findByEmailAndCode(normalizedEmail, normalizedCode)
                .orElseThrow(() -> {
                    emailVerificationTokenRepository.findByEmail(normalizedEmail).ifPresent(t -> {
                        t.setAttempts(t.getAttempts() + 1);
                        if (t.getAttempts() >= MAX_OTP_ATTEMPTS) {
                            emailVerificationTokenRepository.delete(t);
                        } else {
                            emailVerificationTokenRepository.save(t);
                        }
                    });
                    return new IllegalArgumentException("Invalid verification code or no pending registration found");
                });

        if (token.isExpired()) {
            emailVerificationTokenRepository.delete(token);
            throw new ExpiredTokenException("Verification code has expired");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setEmailVerified(true);
        user.setEnabled(true);
        userRepository.save(user);

        emailVerificationTokenRepository.delete(token);
        auditService.logEvent("EMAIL_VERIFICATION", normalizedEmail, "Email address verified successfully", ipAddress);
    }

    @Transactional
    public void resendVerificationOtp(String email, String ipAddress) {
        String normalizedEmail = email.trim().toLowerCase();

        // Check if there is a pending registration
        PendingRegistration pending = pendingRegistrationRepository.findByEmail(normalizedEmail).orElse(null);

        if (pending != null) {
            if (pending.getLastSentAt().plusSeconds(OTP_COOLDOWN_SECONDS).isAfter(LocalDateTime.now())) {
                throw new BusinessException("Please wait " + OTP_COOLDOWN_SECONDS + " seconds before requesting a new OTP.");
            }

            String otp = generateOtpCode();
            pending.setOtpCode(otp);
            pending.setExpiryDate(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
            pending.setLastSentAt(LocalDateTime.now());
            pending.setAttempts(0);
            pendingRegistrationRepository.save(pending);

            emailService.sendResendOtp(normalizedEmail, otp);
            auditService.logEvent("OTP_RESEND", normalizedEmail, "Pending registration OTP resent successfully", ipAddress);
            return;
        }

        // Otherwise check active users table
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("No pending registration or account found for this email address"));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("Email is already verified. Please proceed to sign in.");
        }

        emailVerificationTokenRepository.findByEmail(normalizedEmail).ifPresent(t -> {
            if (t.getLastSentAt().plusSeconds(OTP_COOLDOWN_SECONDS).isAfter(LocalDateTime.now())) {
                throw new BusinessException("Please wait " + OTP_COOLDOWN_SECONDS + " seconds before requesting a new OTP.");
            }
        });

        String otp = generateOtpCode();
        EmailVerificationToken token = EmailVerificationToken.builder()
                .code(otp)
                .email(normalizedEmail)
                .expiryDate(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .lastSentAt(LocalDateTime.now())
                .attempts(0)
                .build();

        emailVerificationTokenRepository.deleteByEmail(normalizedEmail);
        emailVerificationTokenRepository.save(token);

        emailService.sendResendOtp(normalizedEmail, otp);
        auditService.logEvent("OTP_RESEND", normalizedEmail, "Verification code resent successfully", ipAddress);
    }

    @Transactional
    public LoginResult login(String email, String password, String ipAddress) {
        return login(email, password, null, ipAddress);
    }

    @Transactional
    public LoginResult login(String email, String password, String requestedRole, String ipAddress) {
        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (user.getDeletedAt() != null) {
            throw new BadCredentialsException("Account has been deleted");
        }

        if (!user.isEnabled()) {
            throw new DisabledException("Account has been disabled. Please contact support.");
        }

        if (!user.isEmailVerified()) {
            throw new AccountUnverifiedException("Email is not verified. Please verify your email before logging in.", normalizedEmail);
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            auditService.logEvent("FAILED_AUTHENTICATION", normalizedEmail, "Failed login attempt: Incorrect password", ipAddress);
            throw new BadCredentialsException("Invalid email or password");
        }

        // Validate requested role if supplied (tab selection check)
        if (requestedRole != null && !requestedRole.isBlank()) {
            String userRole = user.getRole().name();
            boolean roleMatches = requestedRole.trim().equalsIgnoreCase(userRole);

            if (!roleMatches) {
                auditService.logEvent("FAILED_AUTHENTICATION_ROLE_MISMATCH", normalizedEmail,
                        "Failed login attempt: Stored user role is " + userRole + " but requested role was " + requestedRole, ipAddress);
                throw new BadCredentialsException("Invalid credentials for the selected " + requestedRole + " role");
            }
        }

        // Generate Access Token using ACTUAL database role
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), normalizedEmail, user.getRole().name());
        RefreshToken refreshToken = createRefreshToken(user);

        auditService.logEvent("AUTHENTICATION_SUCCESS", normalizedEmail, "User logged in successfully as " + user.getRole().name(), ipAddress);

        return new LoginResult(accessToken, refreshToken.getToken(), user);
    }

    @Transactional
    public RefreshToken createRefreshToken(User user) {
        // Revoke any existing active refresh tokens for this user
        List<RefreshToken> activeTokens = refreshTokenRepository.findByUser(user);
        activeTokens.forEach(t -> {
            if (t.getRevokedAt() == null) {
                t.setRevokedAt(LocalDateTime.now());
                refreshTokenRepository.save(t);
            }
        });

        long expirationMillis = refreshExpirationInMs > 0 ? refreshExpirationInMs : 604800000L;
        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiryDate(LocalDateTime.now().plus(java.time.Duration.ofMillis(expirationMillis)))
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public LoginResult refreshAccessToken(String token, String ipAddress) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        if (refreshToken.isExpired() || refreshToken.isRevoked()) {
            if (refreshToken.isRevoked()) {
                // Reuse detection: Possible compromised token -> revoke all active sessions for this user
                refreshTokenRepository.deleteByUser(refreshToken.getUser());
                logger.warn("Security Alert: Revoked refresh token reuse detected for user {}. All sessions purged.",
                        refreshToken.getUser().getEmail());
            }
            throw new ExpiredTokenException("Refresh token is expired or revoked. Please log in again.");
        }

        User user = refreshToken.getUser();
        if (!user.isEnabled() || user.getDeletedAt() != null) {
            throw new DisabledException("User account is disabled or deleted");
        }

        // Generate new access token using actual database role
        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());

        // Single-Use Refresh Token Rotation: Revoke current refresh token and generate a new one
        refreshToken.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(refreshToken);

        RefreshToken newRefreshToken = createRefreshToken(user);

        auditService.logEvent("TOKEN_REFRESH", user.getEmail(), "Rotated access and refresh tokens", ipAddress);

        return new LoginResult(newAccessToken, newRefreshToken.getToken(), user);
    }

    @Transactional
    public void logout(String token, String ipAddress) {
        if (token != null && !token.isBlank()) {
            refreshTokenRepository.findByToken(token).ifPresent(t -> {
                t.setRevokedAt(LocalDateTime.now());
                refreshTokenRepository.save(t);
                auditService.logEvent("LOGOUT", t.getUser().getEmail(), "User logged out, refresh token revoked", ipAddress);
            });
        }
    }

    @Transactional
    public void forgotPassword(String email, String ipAddress) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("No account registered with this email address"));

        if (user.getDeletedAt() != null || !user.isEnabled()) {
            throw new BusinessException("Account is inactive or deleted");
        }

        String otp = generateOtpCode();
        PasswordResetOTP resetOtp = PasswordResetOTP.builder()
                .code(otp)
                .email(normalizedEmail)
                .expiryDate(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .attempts(0)
                .verified(false)
                .used(false)
                .build();

        passwordResetOTPRepository.deleteByEmail(normalizedEmail);
        passwordResetOTPRepository.save(resetOtp);

        emailService.sendPasswordResetOtp(normalizedEmail, otp);
        auditService.logEvent("PASSWORD_RESET_REQUEST", normalizedEmail, "Password reset code sent to email", ipAddress);
    }

    @Transactional
    public void resetPassword(String email, String code, String newPassword, String ipAddress) {
        String normalizedEmail = email.trim().toLowerCase();
        PasswordResetOTP resetOtp = passwordResetOTPRepository.findByEmailAndCode(normalizedEmail, code.trim())
                .orElseThrow(() -> {
                    passwordResetOTPRepository.findByEmail(normalizedEmail).ifPresent(t -> {
                        t.setAttempts(t.getAttempts() + 1);
                        if (t.getAttempts() >= MAX_OTP_ATTEMPTS) {
                            passwordResetOTPRepository.delete(t);
                        } else {
                            passwordResetOTPRepository.save(t);
                        }
                    });
                    return new IllegalArgumentException("Invalid password reset code");
                });

        if (resetOtp.isExpired() || resetOtp.isUsed()) {
            passwordResetOTPRepository.delete(resetOtp);
            throw new ExpiredTokenException("Password reset code has expired or already been used");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark OTP as used and purge
        resetOtp.setUsed(true);
        resetOtp.setVerified(true);
        passwordResetOTPRepository.delete(resetOtp);

        // Invalidate all active sessions for this user on password reset
        List<RefreshToken> activeTokens = refreshTokenRepository.findByUser(user);
        activeTokens.forEach(t -> {
            t.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(t);
        });

        emailService.sendPasswordChangedNotification(normalizedEmail, user.getFullName());
        auditService.logEvent("PASSWORD_RESET_SUCCESS", normalizedEmail, "Password reset successfully and sessions revoked", ipAddress);
    }

    private String generateOtpCode() {
        SecureRandom random = new SecureRandom();
        int num = 100000 + random.nextInt(900000);
        return String.valueOf(num);
    }

    public static class LoginResult {
        private final String accessToken;
        private final String refreshToken;
        private final User user;

        public LoginResult(String accessToken, String refreshToken, User user) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.user = user;
        }

        public String getAccessToken() { return accessToken; }
        public String getRefreshToken() { return refreshToken; }
        public User getUser() { return user; }
    }
}
