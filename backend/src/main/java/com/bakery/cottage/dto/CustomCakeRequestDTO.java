package com.bakery.cottage.dto;

import com.bakery.cottage.entity.CustomCakeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomCakeRequestDTO {
    private String id;
    private String userId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String cakeType;
    private String flavor;
    private String weight;
    private String dietaryPreference;
    private String customMessage;
    private String specialInstructions;
    private String referenceImageUrl;
    private String referenceImageName;
    private Long referenceImageSize;
    private String preferredDeliveryDate;
    private String preferredDeliveryTime;
    private CustomCakeStatus status;
    private BigDecimal estimatedPrice;
    private BigDecimal confirmedPrice;
    private String feasibilityDecision;
    private String bakeryNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
