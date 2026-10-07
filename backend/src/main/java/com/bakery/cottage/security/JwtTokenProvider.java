package com.bakery.cottage.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final SecretKey key;
    private final long accessExpirationInMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expiration:3600000}") long accessExpirationInMs) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.accessExpirationInMs = accessExpirationInMs;
    }

    public String generateAccessToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return generateAccessToken(userPrincipal.getUser().getId(), userPrincipal.getUsername(), userPrincipal.getUser().getRole().name());
    }

    public String generateAccessTokenFromEmail(String email, String role) {
        return generateAccessToken(null, email, role);
    }

    public String generateAccessToken(String userId, String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessExpirationInMs);

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        if (userId != null) {
            claims.put("userId", userId);
        }

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String getEmailFromJWT(String token) {
        Claims claims = getClaimsFromJWT(token);
        return claims.getSubject();
    }

    public String getRoleFromJWT(String token) {
        Claims claims = getClaimsFromJWT(token);
        return claims.get("role", String.class);
    }

    public String getUserIdFromJWT(String token) {
        Claims claims = getClaimsFromJWT(token);
        return claims.get("userId", String.class);
    }

    public Claims getClaimsFromJWT(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(authToken);
            return true;
        } catch (SignatureException ex) {
            logger.warn("Invalid JWT signature: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            logger.warn("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            logger.warn("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            logger.warn("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            logger.warn("JWT claims string is empty: {}", ex.getMessage());
        }
        return false;
    }
}
