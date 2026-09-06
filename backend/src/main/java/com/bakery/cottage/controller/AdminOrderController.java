package com.bakery.cottage.controller;

import com.bakery.cottage.dto.AdminOrderDTO;
import com.bakery.cottage.dto.UpdateOrderStatusRequest;
import com.bakery.cottage.service.AdminOrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/admin/orders")
@PreAuthorize("hasAnyRole('ADMIN') or hasAuthority('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    public AdminOrderController(AdminOrderService adminOrderService) {
        this.adminOrderService = adminOrderService;
    }

    @GetMapping
    public ResponseEntity<List<AdminOrderDTO>> getAllOrders() {
        return ResponseEntity.ok(adminOrderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminOrderDTO> getOrderById(@PathVariable("id") String id) {
        return ResponseEntity.ok(adminOrderService.getOrderById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AdminOrderDTO> updateOrderStatus(
            @PathVariable("id") String id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = (principal != null) ? principal.getName() : "admin@bakery.com";
        AdminOrderDTO updated = adminOrderService.updateOrderStatus(
                id,
                request.getOrderStatus(),
                adminEmail,
                servletRequest.getRemoteAddr()
        );
        return ResponseEntity.ok(updated);
    }
}
