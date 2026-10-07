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
public class DeliveryFailureRequest {

    @NotBlank(message = "Failure reason is required")
    private String reason;

    private String notes;
}
