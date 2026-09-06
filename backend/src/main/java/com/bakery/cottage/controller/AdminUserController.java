package com.bakery.cottage.controller;

import com.bakery.cottage.dto.AdminUserDTO;
import com.bakery.cottage.dto.UpdateUserRoleRequest;
import com.bakery.cottage.dto.UpdateUserStatusRequest;
import com.bakery.cottage.service.AdminUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<List<AdminUserDTO>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @GetMapping("/customers")
    public ResponseEntity<List<AdminUserDTO>> getCustomers() {
        return ResponseEntity.ok(adminUserService.getCustomers());
    }

    @GetMapping("/shopkeepers")
    public ResponseEntity<List<AdminUserDTO>> getShopkeepers() {
        return ResponseEntity.ok(adminUserService.getShopkeepers());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AdminUserDTO> updateUserStatus(
            @PathVariable("id") String id,
            @Valid @RequestBody UpdateUserStatusRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = (principal != null) ? principal.getName() : "admin@bakery.com";
        AdminUserDTO updated = adminUserService.updateUserStatus(
                id,
                request.getEnabled(),
                adminEmail,
                servletRequest.getRemoteAddr()
        );
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<AdminUserDTO> updateUserRole(
            @PathVariable("id") String id,
            @Valid @RequestBody UpdateUserRoleRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = (principal != null) ? principal.getName() : "admin@bakery.com";
        AdminUserDTO updated = adminUserService.updateUserRole(
                id,
                request.getRole(),
                adminEmail,
                servletRequest.getRemoteAddr()
        );
        return ResponseEntity.ok(updated);
    }
}
