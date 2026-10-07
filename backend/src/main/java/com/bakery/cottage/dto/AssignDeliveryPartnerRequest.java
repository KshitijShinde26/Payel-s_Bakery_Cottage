package com.bakery.cottage.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignDeliveryPartnerRequest {

    @NotBlank(message = "Delivery partner ID is required")
    private String deliveryPartnerId;

    private String deliveryNotes;
}
