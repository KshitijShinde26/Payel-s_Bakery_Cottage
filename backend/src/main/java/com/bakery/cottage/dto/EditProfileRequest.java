package com.bakery.cottage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EditProfileRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, message = "Name must be at least 2 characters")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be exactly 10 digits")
    private String phoneNumber;
}
