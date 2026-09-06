package com.bakery.cottage.dto;

import com.bakery.cottage.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserRoleRequest {
    @NotNull(message = "Role is required")
    private Role role;
}
