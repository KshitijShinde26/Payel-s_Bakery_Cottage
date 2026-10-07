package com.bakery.cottage.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class JwtTokenProviderTest {

    private static final String TEST_SECRET = "dGhpcy1pcy1hLXNlY3VyZS01MTItYml0LXNlY3JldC1rZXktZm9yLWRldmVsb3BtZW50LXB1cnBvc2VzLW9ubHk=";
    private static final long ACCESS_EXPIRATION_MS = 3600000; // 1 hour

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(TEST_SECRET, ACCESS_EXPIRATION_MS);
    }

    @Test
    void generateAccessToken_Customer_ContainsCorrectClaims() {
        String token = jwtTokenProvider.generateAccessToken("user-123", "customer@example.com", "CUSTOMER");

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("customer@example.com", jwtTokenProvider.getEmailFromJWT(token));
        assertEquals("user-123", jwtTokenProvider.getUserIdFromJWT(token));
        assertEquals("CUSTOMER", jwtTokenProvider.getRoleFromJWT(token));
    }

    @Test
    void generateAccessToken_Shopkeeper_ContainsCorrectClaims() {
        String token = jwtTokenProvider.generateAccessToken("shop-456", "shop@example.com", "SHOPKEEPER");

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("shop@example.com", jwtTokenProvider.getEmailFromJWT(token));
        assertEquals("shop-456", jwtTokenProvider.getUserIdFromJWT(token));
        assertEquals("SHOPKEEPER", jwtTokenProvider.getRoleFromJWT(token));
    }

    @Test
    void generateAccessToken_Admin_ContainsCorrectClaims() {
        String token = jwtTokenProvider.generateAccessToken("admin-789", "admin@bakerycottage.com", "ADMIN");

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("admin@bakerycottage.com", jwtTokenProvider.getEmailFromJWT(token));
        assertEquals("admin-789", jwtTokenProvider.getUserIdFromJWT(token));
        assertEquals("ADMIN", jwtTokenProvider.getRoleFromJWT(token));
    }

    @Test
    void validateToken_ExpiredToken_ReturnsFalse() {
        // Create an expired token manually with negative duration
        JwtTokenProvider shortLivedProvider = new JwtTokenProvider(TEST_SECRET, -1000);
        String expiredToken = shortLivedProvider.generateAccessToken("user-expired", "expired@example.com", "CUSTOMER");

        assertFalse(jwtTokenProvider.validateToken(expiredToken));
    }

    @Test
    void validateToken_TamperedToken_ReturnsFalse() {
        String token = jwtTokenProvider.generateAccessToken("user-123", "user@example.com", "CUSTOMER");
        // Tamper with payload segment
        String[] parts = token.split("\\.");
        String tamperedToken = parts[0] + "." + parts[1] + "X." + parts[2];

        assertFalse(jwtTokenProvider.validateToken(tamperedToken));
    }

    @Test
    void validateToken_MalformedToken_ReturnsFalse() {
        assertFalse(jwtTokenProvider.validateToken("invalid.malformed.jwt.token"));
        assertFalse(jwtTokenProvider.validateToken(""));
        assertFalse(jwtTokenProvider.validateToken(null));
    }

    @Test
    void validateToken_SignedWithDifferentKey_ReturnsFalse() {
        // Create another key
        String anotherSecret = "YW5vdGhlci1zZWN1cmUtNTEyLWJpdC1zZWNyZXQta2V5LWZvci1kZXZlbG9wbWVudC1wdXJwb3Nlcy1vbmx5IQ==";
        JwtTokenProvider differentKeyProvider = new JwtTokenProvider(anotherSecret, ACCESS_EXPIRATION_MS);
        String tokenFromDifferentKey = differentKeyProvider.generateAccessToken("user-diff", "diff@example.com", "CUSTOMER");

        assertFalse(jwtTokenProvider.validateToken(tokenFromDifferentKey));
    }
}
