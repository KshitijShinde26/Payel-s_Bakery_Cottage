package com.bakery.cottage.controller;

import com.bakery.cottage.dto.LoginRequest;
import com.bakery.cottage.dto.RegisterRequest;
import com.bakery.cottage.entity.Role;
import com.bakery.cottage.entity.User;
import com.bakery.cottage.mapper.UserMapper;
import com.bakery.cottage.security.JwtAuthenticationFilter;
import com.bakery.cottage.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.UUID;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters to isolate validation and controller logic
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean private AuthService authService;
    @MockitoBean private UserMapper userMapper;
    @MockitoBean private JwtAuthenticationFilter jwtAuthenticationFilter;

    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll());
            return http.build();
        }
    }

    @Test
    void register_ValidPayload_Returns21Created() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("John Doe");
        request.setEmail("john@example.com");
        request.setPhoneNumber("9876543210");
        request.setPassword("Password123!");
        request.setRole("CUSTOMER");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Registration successful. Please verify your email."));

        verify(authService, times(1)).register(
                eq("John Doe"),
                eq("john@example.com"),
                eq("9876543210"),
                eq("Password123!"),
                eq("CUSTOMER"),
                anyString()
        );
    }

    @Test
    void register_WithShopkeeperRole_Returns201Created() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Jane Shop");
        request.setEmail("jane@example.com");
        request.setPhoneNumber("9876543210");
        request.setPassword("Password123!");
        request.setRole("SHOPKEEPER");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Registration successful. Please verify your email."));

        verify(authService, times(1)).register(
                eq("Jane Shop"),
                eq("jane@example.com"),
                eq("9876543210"),
                eq("Password123!"),
                eq("SHOPKEEPER"),
                anyString()
        );
    }

    @Test
    void register_InvalidEmail_Returns400BadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("John Doe");
        request.setEmail("invalidemail");
        request.setPhoneNumber("9876543210");
        request.setPassword("Password123!");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.data.email").value("Please enter a valid email address"));
    }

    @Test
    void register_WeakPassword_Returns400BadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("John Doe");
        request.setEmail("john@example.com");
        request.setPhoneNumber("9876543210");
        request.setPassword("123"); // Weak password

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.data.password").value("Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character"));
    }

    @Test
    void login_ValidPayload_Returns200Ok() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("Password123!");

        User testUser = User.builder()
                .id(UUID.randomUUID().toString())
                .fullName("John Doe")
                .email("john@example.com")
                .phoneNumber("9876543210")
                .role(Role.CUSTOMER)
                .emailVerified(true)
                .build();

        AuthService.LoginResult loginResult = new AuthService.LoginResult("access-token", "refresh-token", testUser);
        when(authService.login(anyString(), anyString(), nullable(String.class), anyString())).thenReturn(loginResult);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"));
    }

    @Test
    void login_WithRolePayload_Returns200Ok() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@example.com");
        request.setPassword("Password123!");
        request.setRole("ADMIN");

        User testAdmin = User.builder()
                .id(UUID.randomUUID().toString())
                .fullName("Admin User")
                .email("admin@example.com")
                .phoneNumber("9876543211")
                .role(Role.ADMIN)
                .emailVerified(true)
                .build();

        AuthService.LoginResult loginResult = new AuthService.LoginResult("access-token", "refresh-token", testAdmin);
        when(authService.login(eq("admin@example.com"), eq("Password123!"), eq("ADMIN"), anyString())).thenReturn(loginResult);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"));
    }

    @Test
    void refresh_WithValidCookie_ReturnsNewAccessTokenAndSetsCookie() throws Exception {
        User testUser = User.builder()
                .id(UUID.randomUUID().toString())
                .fullName("John Doe")
                .email("john@example.com")
                .role(Role.CUSTOMER)
                .build();

        AuthService.LoginResult refreshResult = new AuthService.LoginResult("new-access-token", "rotated-refresh-token", testUser);
        when(authService.refreshAccessToken(eq("old-refresh-token"), anyString())).thenReturn(refreshResult);

        mockMvc.perform(post("/auth/refresh")
                        .cookie(new jakarta.servlet.http.Cookie("refreshToken", "old-refresh-token")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access-token"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().exists(org.springframework.http.HttpHeaders.SET_COOKIE));
    }

    @Test
    void refresh_WithMissingToken_Returns401Unauthorized() throws Exception {
        mockMvc.perform(post("/auth/refresh"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Refresh token is missing"));
    }
}
