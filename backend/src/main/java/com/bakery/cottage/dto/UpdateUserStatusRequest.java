package com.bakery.cottage.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserStatusRequest {
    @NotNull(message = "Enabled status is required")
    private Boolean enabled;
}
