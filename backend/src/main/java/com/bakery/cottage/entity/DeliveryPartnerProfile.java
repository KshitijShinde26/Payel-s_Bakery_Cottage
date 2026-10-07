package com.bakery.cottage.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_partner_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryPartnerProfile {

    @Id
    @Column(length = 36)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "service_area", nullable = false, length = 150)
    private String serviceArea;

    @Column(name = "vehicle_type", length = 50)
    private String vehicleType;

    @Column(name = "vehicle_number", length = 50)
    private String vehicleNumber;

    @Column(name = "emergency_contact", length = 20)
    private String emergencyContact;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE";

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
            status = "ACTIVE";
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
