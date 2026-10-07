package com.bakery.cottage.controller;

import com.bakery.cottage.dto.AdminPaymentDTO;
import com.bakery.cottage.service.AdminPaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/payments")
@PreAuthorize("hasAnyRole('ADMIN') or hasAuthority('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminPaymentController {

    private final AdminPaymentService adminPaymentService;

    public AdminPaymentController(AdminPaymentService adminPaymentService) {
        this.adminPaymentService = adminPaymentService;
    }

    @GetMapping
    public ResponseEntity<List<AdminPaymentDTO>> getAllPayments() {
        return ResponseEntity.ok(adminPaymentService.getAllPayments());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AdminPaymentDTO>> getPendingPayments() {
        return ResponseEntity.ok(adminPaymentService.getPendingVerificationPayments());
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<AdminPaymentDTO> verifyPayment(
            @PathVariable("id") String id,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = (principal != null) ? principal.getName() : "admin@bakery.com";
        AdminPaymentDTO updated = adminPaymentService.verifyPayment(
                id,
                adminEmail,
                servletRequest.getRemoteAddr()
        );
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<AdminPaymentDTO> rejectPayment(
            @PathVariable("id") String id,
            @RequestBody(required = false) Map<String, String> body,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = (principal != null) ? principal.getName() : "admin@bakery.com";
        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "Payment details could not be verified.";
        AdminPaymentDTO updated = adminPaymentService.rejectPayment(
                id,
                reason,
                adminEmail,
                servletRequest.getRemoteAddr()
        );
        return ResponseEntity.ok(updated);
    }
}
