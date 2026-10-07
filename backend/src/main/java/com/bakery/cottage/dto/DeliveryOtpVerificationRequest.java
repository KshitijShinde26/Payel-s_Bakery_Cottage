package com.bakery.cottage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryOtpVerificationRequest {

    @NotBlank(message = "Delivery OTP is required")
    @Pattern(regexp = "^\\d{6}$", message = "Delivery OTP must be exactly 6 digits")
    private String otp;
}
