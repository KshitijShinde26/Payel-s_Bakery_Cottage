package com.bakery.cottage.dto;

import com.bakery.cottage.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserDTO {
    private String id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Role role;
    private boolean emailVerified;
    private boolean enabled;
    private String avatarUrl;
    private LocalDateTime createdAt;
}
