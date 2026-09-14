package com.bakery.cottage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryOtpResponseDTO {
    private String orderId;
    private String orderNumber;
    private String deliveryOtp;
    private LocalDateTime expiresAt;
    private boolean expired;
    private boolean used;
    private int attempts;
    private int maxAttempts;
    private String message;
}
