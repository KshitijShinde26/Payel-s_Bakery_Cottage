package com.bakery.cottage.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "custom_cake_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomCakeRequestEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", length = 36)
    private String userId;

    @Column(name = "customer_name", length = 100)
    private String customerName;

    @Column(name = "customer_phone", length = 20)
    private String customerPhone;

    @Column(name = "customer_email", length = 100)
    private String customerEmail;

    @Column(name = "cake_type", nullable = false, length = 100)
    private String cakeType;

    @Column(nullable = false, length = 100)
    private String flavor;

    @Column(nullable = false, length = 50)
    private String weight;

    @Column(name = "dietary_preference", nullable = false, length = 50)
    private String dietaryPreference;

    @Column(name = "custom_message", length = 255)
    private String customMessage;

    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;

    @Column(name = "reference_image_url", length = 500)
    private String referenceImageUrl;

    @Column(name = "reference_image_name", length = 255)
    private String referenceImageName;

    @Column(name = "reference_image_size")
    private Long referenceImageSize;

    @Column(name = "preferred_delivery_date", length = 50)
    private String preferredDeliveryDate;

    @Column(name = "preferred_delivery_time", length = 100)
    private String preferredDeliveryTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CustomCakeStatus status;

    @Column(name = "estimated_price", precision = 10, scale = 2)
    private BigDecimal estimatedPrice;

    @Column(name = "confirmed_price", precision = 10, scale = 2)
    private BigDecimal confirmedPrice;

    @Column(name = "feasibility_decision", length = 50)
    private String feasibilityDecision;

    @Column(name = "bakery_notes", columnDefinition = "TEXT")
    private String bakeryNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
        if (status == null) {
            status = CustomCakeStatus.PENDING_REVIEW;
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
