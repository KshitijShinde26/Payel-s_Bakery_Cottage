package com.bakery.cottage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryPartnerDTO {
    private String id;
    private String userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String serviceArea;
    private String vehicleType;
    private String vehicleNumber;
    private String emergencyContact;
    private String status;
    private boolean enabled;
    private String avatarUrl;
    private long activeDeliveriesCount;
    private long completedDeliveriesCount;
    private LocalDateTime createdAt;
}
