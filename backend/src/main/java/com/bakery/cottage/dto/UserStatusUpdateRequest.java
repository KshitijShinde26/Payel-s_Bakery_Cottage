package com.bakery.cottage.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusUpdateRequest {
    @NotNull(message = "Enabled status must be specified")
    private Boolean enabled;
}
