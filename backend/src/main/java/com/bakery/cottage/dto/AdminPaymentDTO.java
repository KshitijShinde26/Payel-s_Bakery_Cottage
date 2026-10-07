package com.bakery.cottage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPaymentDTO {
    private String id;
    private String orderId;
    private String orderNumber;
    private String userId;
    private BigDecimal amount;
    private String paymentMethod;
    private String status;
    private String transactionRef;
    private String verifiedBy;
    private LocalDateTime verifiedAt;
    private LocalDateTime createdAt;
}
