package com.bakery.cottage.controller;

import com.bakery.cottage.dto.*;
import com.bakery.cottage.entity.User;
import com.bakery.cottage.mapper.UserMapper;
import com.bakery.cottage.security.UserPrincipal;
import com.bakery.cottage.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication & Authorization", description = "Endpoints for registration, email OTP verification, login, token refresh, and session management")
public class AuthController {

    private final AuthService authService;
    private final UserMapper userMapper;

    @Value("${server.servlet.context-path:/api}")
    private String contextPath;

    public AuthController(AuthService authService, UserMapper userMapper) {
        this.authService = authService;
        this.userMapper = userMapper;
    }

    private String getAuthCookiePath() {
        if (contextPath != null && !contextPath.isBlank()) {
            return contextPath.endsWith("/") ? contextPath + "auth" : contextPath + "/auth";
        }
        return "/api/auth";
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new customer or shopkeeper account and trigger OTP verification")
    public ResponseEntity<Map<String, String>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest servletRequest) {

        authService.register(
                request.getFullName(),
                request.getEmail(),
                request.getPhoneNumber(),
                request.getPassword(),
                request.getRole(),
                servletRequest.getRemoteAddr()
        );

        Map<String, String> response = new HashMap<>();
        response.put("message", "Registration successful. Please verify your email.");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify email OTP code and activate account with original registered role")
    public ResponseEntity<Map<String, String>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request,
            HttpServletRequest servletRequest) {

        authService.verifyOtp(request.getEmail(), request.getCode(), servletRequest.getRemoteAddr());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Email successfully verified. You can now log in.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Alias for OTP verification")
    public ResponseEntity<Map<String, String>> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request,
            HttpServletRequest servletRequest) {

        authService.verifyOtp(request.getEmail(), request.getCode(), servletRequest.getRemoteAddr());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Email successfully verified. You can now log in.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-otp")
    @Operation(summary = "Resend a new email OTP verification code")
    public ResponseEntity<Map<String, String>> resendOtp(
            @Valid @RequestBody ResendOtpRequest request,
            HttpServletRequest servletRequest) {

        authService.resendVerificationOtp(request.getEmail(), servletRequest.getRemoteAddr());

        Map<String, String> response = new HashMap<>();
        response.put("message", "A new verification code has been sent to your email.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate credentials and obtain access token & rotating refresh cookie")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {

        AuthService.LoginResult result = authService.login(
                request.getEmail(),
                request.getPassword(),
                request.getRole(),
                servletRequest.getRemoteAddr()
        );

        // Set HttpOnly refresh token cookie
        ResponseCookie cookie = ResponseCookie.from("refreshToken", result.getRefreshToken())
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .path(getAuthCookiePath())
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .sameSite("Lax")
                .build();
        servletResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        UserDTO userDTO = userMapper.toDto(result.getUser());
        return ResponseEntity.ok(new LoginResponse(result.getAccessToken(), userDTO));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate refresh token and issue a fresh access token")
    public ResponseEntity<Map<String, String>> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {

        if (refreshToken == null || refreshToken.isBlank()) {
            // Check fallback header
            String authHeader = servletRequest.getHeader("X-Refresh-Token");
            if (authHeader != null && !authHeader.isBlank()) {
                refreshToken = authHeader;
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Refresh token is missing"));
            }
        }

        AuthService.LoginResult result = authService.refreshAccessToken(refreshToken, servletRequest.getRemoteAddr());

        // Set newly rotated refresh token in HttpOnly cookie
        ResponseCookie cookie = ResponseCookie.from("refreshToken", result.getRefreshToken())
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .path(getAuthCookiePath())
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Lax")
                .build();
        servletResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        Map<String, String> response = new HashMap<>();
        response.put("accessToken", result.getAccessToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Invalidate refresh token server-side and purge cookie")
    public ResponseEntity<Map<String, String>> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {

        authService.logout(refreshToken, servletRequest.getRemoteAddr());

        // Clear refresh token cookie
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path(getAuthCookiePath())
                .maxAge(0)
                .sameSite("Lax")
                .build();
        servletResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Successfully logged out.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Initiate password reset and dispatch OTP code")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest servletRequest) {

        authService.forgotPassword(request.getEmail(), servletRequest.getRemoteAddr());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset code sent to your email.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using OTP verification code")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request,
            HttpServletRequest servletRequest) {

        authService.resetPassword(
                request.getEmail(),
                request.getCode(),
                request.getNewPassword(),
                servletRequest.getRemoteAddr()
        );

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successful. Please sign in.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user details")
    public ResponseEntity<UserDTO> getMe(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            if (auth.getPrincipal() instanceof UserPrincipal userPrincipal) {
                User user = userPrincipal.getUser();
                return ResponseEntity.ok(userMapper.toDto(user));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}
