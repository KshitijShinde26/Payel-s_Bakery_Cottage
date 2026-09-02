package com.bakery.cottage.service;

import com.bakery.cottage.entity.*;
import com.bakery.cottage.exception.*;
import com.bakery.cottage.repository.*;
import com.bakery.cottage.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PendingRegistrationRepository pendingRegistrationRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private EmailVerificationTokenRepository emailVerificationTokenRepository;
    @Mock private PasswordResetOTPRepository passwordResetOTPRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private EmailService emailService;
    @Mock private AuditService auditService;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user-uuid")
                .fullName("John Doe")
                .email("john@example.com")
                .phoneNumber("9876543210")
                .password("hashed_password")
                .role(Role.CUSTOMER)
                .emailVerified(false)
                .enabled(true)
                .build();
    }

    @Test
    void register_Customer_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhoneNumber(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");

        authService.register("John Doe", "john@example.com", "9876543210", "Password123!", "CUSTOMER", "127.0.0.1");

        verify(pendingRegistrationRepository, times(1)).save(argThat(pending ->
                pending.getRole() == Role.CUSTOMER &&
                pending.getEmail().equals("john@example.com") &&
                pending.getOtpCode() != null
        ));
        verify(emailService, times(1)).sendVerificationOtp(eq("john@example.com"), eq("John Doe"), anyString());
    }

    @Test
    void register_Shopkeeper_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhoneNumber(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");

        authService.register("Shop Keeper", "shop@example.com", "9876543210", "Password123!", "SHOPKEEPER", "127.0.0.1");

        verify(pendingRegistrationRepository, times(1)).save(argThat(pending ->
                pending.getRole() == Role.SHOPKEEPER
        ));
    }

    @Test
    void register_Admin_RejectedSecurely() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhoneNumber(anyString())).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                authService.register("Attacker", "admin@example.com", "9876543210", "Password123!", "ADMIN", "127.0.0.1")
        );

        assertTrue(exception.getMessage().contains("Public registration as Administrator is not permitted"));
        verify(pendingRegistrationRepository, never()).save(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_InvalidRole_ThrowsException() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhoneNumber(anyString())).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                authService.register("User", "user@example.com", "9876543210", "Password123!", "SUPER_USER", "127.0.0.1")
        );

        assertTrue(exception.getMessage().contains("Invalid registration role"));
    }

    @Test
    void register_DuplicateEmail_ThrowsException() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () ->
                authService.register("John Doe", "john@example.com", "9876543210", "Password123!", "CUSTOMER", "127.0.0.1")
        );
    }

    @Test
    void verifyOtp_Success_CreatesUserWithOriginalRole() {
        PendingRegistration pending = PendingRegistration.builder()
                .id("pending-uuid")
                .fullName("Shop Manager")
                .email("manager@example.com")
                .phoneNumber("9876543210")
                .password("hashed_password")
                .role(Role.SHOPKEEPER)
                .otpCode("123456")
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .attempts(0)
                .build();

        when(pendingRegistrationRepository.findByEmail("manager@example.com")).thenReturn(Optional.of(pending));

        authService.verifyOtp("manager@example.com", "123456", "127.0.0.1");

        // Verify active User is created with the exact role stored in pending registration
        verify(userRepository, times(1)).save(argThat(user ->
                user.getRole() == Role.SHOPKEEPER &&
                user.getEmail().equals("manager@example.com") &&
                user.isEmailVerified() &&
                user.isEnabled()
        ));
        verify(pendingRegistrationRepository, times(1)).delete(pending);
    }

    @Test
    void verifyOtp_InvalidCode_IncrementsAttempts() {
        PendingRegistration pending = PendingRegistration.builder()
                .id("pending-uuid")
                .email("user@example.com")
                .otpCode("123456")
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .attempts(0)
                .build();

        when(pendingRegistrationRepository.findByEmail("user@example.com")).thenReturn(Optional.of(pending));

        assertThrows(IllegalArgumentException.class, () ->
                authService.verifyOtp("user@example.com", "999999", "127.0.0.1")
        );

        assertEquals(1, pending.getAttempts());
        verify(pendingRegistrationRepository, times(1)).save(pending);
        verify(userRepository, never()).save(any());
    }

    @Test
    void verifyOtp_ExpiredToken_ThrowsException() {
        PendingRegistration pending = PendingRegistration.builder()
                .id("pending-uuid")
                .email("user@example.com")
                .otpCode("123456")
                .expiryDate(LocalDateTime.now().minusMinutes(5)) // Expired
                .build();

        when(pendingRegistrationRepository.findByEmail("user@example.com")).thenReturn(Optional.of(pending));

        assertThrows(ExpiredTokenException.class, () ->
                authService.verifyOtp("user@example.com", "123456", "127.0.0.1")
        );
        verify(pendingRegistrationRepository, times(1)).delete(pending);
    }

    @Test
    void login_Success() {
        testUser.setEmailVerified(true);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("Password123!", "hashed_password")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(any(), anyString(), anyString())).thenReturn("jwt_access_token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthService.LoginResult result = authService.login("john@example.com", "Password123!", "127.0.0.1");

        assertNotNull(result);
        assertEquals("jwt_access_token", result.getAccessToken());
        assertEquals(testUser, result.getUser());
    }

    @Test
    void login_UnverifiedAccount_ThrowsException() {
        testUser.setEmailVerified(false);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));

        assertThrows(AccountUnverifiedException.class, () ->
                authService.login("john@example.com", "Password123!", "127.0.0.1")
        );
    }

    @Test
    void login_InvalidPassword_ThrowsException() {
        testUser.setEmailVerified(true);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("WrongPassword!", "hashed_password")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () ->
                authService.login("john@example.com", "WrongPassword!", "127.0.0.1")
        );
    }

    @Test
    void login_Success_WithMatchingRole() {
        testUser.setEmailVerified(true);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("Password123!", "hashed_password")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(any(), anyString(), anyString())).thenReturn("jwt_access_token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthService.LoginResult result = authService.login("john@example.com", "Password123!", "CUSTOMER", "127.0.0.1");

        assertNotNull(result);
        assertEquals("jwt_access_token", result.getAccessToken());
        assertEquals(testUser, result.getUser());
    }

    @Test
    void login_RoleMismatch_ThrowsException() {
        testUser.setEmailVerified(true);
        testUser.setRole(Role.CUSTOMER);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("Password123!", "hashed_password")).thenReturn(true);

        assertThrows(BadCredentialsException.class, () ->
                authService.login("john@example.com", "Password123!", "ADMIN", "127.0.0.1")
        );
    }

    @Test
    void refreshAccessToken_Success() {
        testUser.setEmailVerified(true);
        RefreshToken validToken = RefreshToken.builder()
                .id("token-uuid")
                .token("valid_refresh_token")
                .user(testUser)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revokedAt(null)
                .build();

        when(refreshTokenRepository.findByToken("valid_refresh_token")).thenReturn(Optional.of(validToken));
        when(jwtTokenProvider.generateAccessToken(any(), eq("john@example.com"), eq("CUSTOMER")))
                .thenReturn("new_jwt_access_token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthService.LoginResult result = authService.refreshAccessToken("valid_refresh_token", "127.0.0.1");

        assertNotNull(result);
        assertEquals("new_jwt_access_token", result.getAccessToken());
        assertNotNull(result.getRefreshToken());
        assertNotEquals("valid_refresh_token", result.getRefreshToken());
        assertEquals(testUser, result.getUser());
        assertNotNull(validToken.getRevokedAt()); // Old token rotated and revoked
    }

    @Test
    void refreshAccessToken_InvalidToken_ThrowsException() {
        when(refreshTokenRepository.findByToken("non_existent_token")).thenReturn(Optional.empty());

        assertThrows(InvalidTokenException.class, () ->
                authService.refreshAccessToken("non_existent_token", "127.0.0.1")
        );
    }

    @Test
    void refreshAccessToken_RevokedToken_TriggersPurge_ThrowsException() {
        RefreshToken revokedToken = RefreshToken.builder()
                .id("token-uuid")
                .token("revoked_refresh_token")
                .user(testUser)
                .expiryDate(LocalDateTime.now().plusDays(5))
                .revokedAt(LocalDateTime.now().minusHours(1))
                .build();

        when(refreshTokenRepository.findByToken("revoked_refresh_token")).thenReturn(Optional.of(revokedToken));

        assertThrows(ExpiredTokenException.class, () ->
                authService.refreshAccessToken("revoked_refresh_token", "127.0.0.1")
        );
        verify(refreshTokenRepository, times(1)).deleteByUser(testUser);
    }

    @Test
    void logout_Success() {
        RefreshToken token = RefreshToken.builder()
                .id("token-uuid")
                .token("logout_token")
                .user(testUser)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revokedAt(null)
                .build();

        when(refreshTokenRepository.findByToken("logout_token")).thenReturn(Optional.of(token));

        authService.logout("logout_token", "127.0.0.1");

        assertNotNull(token.getRevokedAt());
        verify(refreshTokenRepository, times(1)).save(token);
    }

    @Test
    void login_Shopkeeper_ReturnsJwtWithShopkeeperRole() {
        User shopkeeper = User.builder()
                .id("shopkeeper-uuid")
                .fullName("Shop Manager")
                .email("shopkeeper@example.com")
                .phoneNumber("9876543212")
                .password("hashed_password")
                .role(Role.SHOPKEEPER)
                .emailVerified(true)
                .enabled(true)
                .build();

        when(userRepository.findByEmail("shopkeeper@example.com")).thenReturn(Optional.of(shopkeeper));
        when(passwordEncoder.matches("Password123!", "hashed_password")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken("shopkeeper-uuid", "shopkeeper@example.com", "SHOPKEEPER"))
                .thenReturn("shopkeeper_jwt_token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthService.LoginResult result = authService.login("shopkeeper@example.com", "Password123!", "SHOPKEEPER", "127.0.0.1");

        assertNotNull(result);
        assertEquals("shopkeeper_jwt_token", result.getAccessToken());
        assertEquals(Role.SHOPKEEPER, result.getUser().getRole());
    }

    @Test
    void login_Admin_ReturnsJwtWithAdminRole() {
        User admin = User.builder()
                .id("admin-uuid")
                .fullName("Admin User")
                .email("admin@example.com")
                .phoneNumber("9876543213")
                .password("hashed_password")
                .role(Role.ADMIN)
                .emailVerified(true)
                .enabled(true)
                .build();

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("Admin@12345", "hashed_password")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken("admin-uuid", "admin@example.com", "ADMIN"))
                .thenReturn("admin_jwt_token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthService.LoginResult result = authService.login("admin@example.com", "Admin@12345", "ADMIN", "127.0.0.1");

        assertNotNull(result);
        assertEquals("admin_jwt_token", result.getAccessToken());
        assertEquals(Role.ADMIN, result.getUser().getRole());
    }

    @Test
    void refreshAccessToken_Shopkeeper_PreservesShopkeeperRole() {
        User shopkeeper = User.builder()
                .id("shopkeeper-uuid")
                .fullName("Shop Manager")
                .email("shopkeeper@example.com")
                .role(Role.SHOPKEEPER)
                .emailVerified(true)
                .enabled(true)
                .build();

        RefreshToken validToken = RefreshToken.builder()
                .id("token-uuid")
                .token("valid_shopkeeper_refresh_token")
                .user(shopkeeper)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revokedAt(null)
                .build();

        when(refreshTokenRepository.findByToken("valid_shopkeeper_refresh_token")).thenReturn(Optional.of(validToken));
        when(jwtTokenProvider.generateAccessToken(eq("shopkeeper-uuid"), eq("shopkeeper@example.com"), eq("SHOPKEEPER")))
                .thenReturn("new_shopkeeper_jwt");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthService.LoginResult result = authService.refreshAccessToken("valid_shopkeeper_refresh_token", "127.0.0.1");

        assertNotNull(result);
        assertEquals("new_shopkeeper_jwt", result.getAccessToken());
        assertEquals(Role.SHOPKEEPER, result.getUser().getRole());
    }

    @Test
    void refreshAccessToken_ExpiredToken_ThrowsException() {
        RefreshToken expiredToken = RefreshToken.builder()
                .id("token-uuid")
                .token("expired_token")
                .user(testUser)
                .expiryDate(LocalDateTime.now().minusMinutes(10)) // Expired
                .revokedAt(null)
                .build();

        when(refreshTokenRepository.findByToken("expired_token")).thenReturn(Optional.of(expiredToken));

        assertThrows(ExpiredTokenException.class, () ->
                authService.refreshAccessToken("expired_token", "127.0.0.1")
        );
    }
}
