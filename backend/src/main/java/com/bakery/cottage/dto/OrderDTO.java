package com.bakery.cottage.dto;

import com.bakery.cottage.entity.OrderStatus;
import com.bakery.cottage.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private String id;
    private String orderNumber;
    private String userId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private List<OrderItemDTO> items;
    private BigDecimal subtotal;
    private String deliveryChargeText;
    private BigDecimal grandTotal;
    private DeliveryAddressDTO deliveryAddress;
    private String preferredDeliveryDate;
    private String preferredDeliveryTime;
    private String paymentMethod;
    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
    private String kitchenNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
