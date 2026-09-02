package com.bakery.cottage.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @Column(name = "user_id", length = 36)
    private String userId;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @Column(name = "customer_email", length = 100)
    private String customerEmail;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "delivery_charge_text", length = 255)
    private String deliveryChargeText;

    @Column(name = "grand_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal grandTotal;

    @Column(name = "address_full_name", length = 100)
    private String addressFullName;

    @Column(name = "address_phone", length = 20)
    private String addressPhone;

    @Column(name = "address_line", length = 255)
    private String addressLine;

    @Column(name = "address_area", length = 100)
    private String addressArea;

    @Column(name = "address_city", length = 50)
    private String addressCity;

    @Column(name = "address_state", length = 50)
    private String addressState;

    @Column(name = "address_pincode", length = 20)
    private String addressPincode;

    @Column(name = "address_landmark", length = 100)
    private String addressLandmark;

    @Column(name = "preferred_delivery_date", length = 50)
    private String preferredDeliveryDate;

    @Column(name = "preferred_delivery_time", length = 100)
    private String preferredDeliveryTime;

    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false, length = 50)
    private OrderStatus orderStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 50)
    private PaymentStatus paymentStatus;

    @Column(name = "kitchen_notes", columnDefinition = "TEXT")
    private String kitchenNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
        if (orderNumber == null) {
            orderNumber = "PBC-" + System.currentTimeMillis();
        }
        if (orderStatus == null) {
            orderStatus = OrderStatus.CONFIRMED;
        }
        if (paymentStatus == null) {
            paymentStatus = PaymentStatus.PENDING;
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}
