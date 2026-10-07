package com.bakery.cottage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminOrderDTO {
    private String id;
    private String orderNumber;
    private String userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private BigDecimal subtotal;
    private BigDecimal deliveryFee;
    private BigDecimal grandTotal;
    private String orderStatus;
    private String paymentStatus;
    private String paymentMethod;
    private String deliveryAddress;
    private String preferredDeliveryDate;
    private String preferredDeliveryTime;
    private List<AdminOrderItemDTO> items;
    private String deliveryPartnerId;
    private String deliveryPartnerName;
    private String deliveryPartnerPhone;
    private LocalDateTime assignedAt;
    private LocalDateTime outForDeliveryAt;
    private LocalDateTime deliveredAt;
    private String deliveryOtp;
    private String deliveryFailureReason;
    private LocalDateTime createdAt;
}
