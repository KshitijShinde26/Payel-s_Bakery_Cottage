package com.bakery.cottage.dto;

import com.bakery.cottage.entity.CustomCakeStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopkeeperCustomCakeReviewRequest {

    @NotNull(message = "Review status is required")
    private CustomCakeStatus status;

    private BigDecimal confirmedPrice;

    private BigDecimal estimatedPrice;

    private String feasibilityDecision;

    private String bakeryNotes;
}
