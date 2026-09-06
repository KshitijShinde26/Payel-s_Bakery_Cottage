package com.bakery.cottage.controller;

import com.bakery.cottage.dto.*;
import com.bakery.cottage.security.UserPrincipal;
import com.bakery.cottage.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/customer")
@PreAuthorize("hasRole('CUSTOMER')")
@Tag(name = "Customer Operations", description = "Endpoints for Customer dashboard overview, orders, cake design inquiries, and payment verification submissions")
@SecurityRequirement(name = "bearerAuth")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    private String getUserId(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken) {
            Object p = ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
            if (p instanceof UserPrincipal) {
                return ((UserPrincipal) p).getId();
            }
        }
        throw new IllegalStateException("Authenticated customer user details could not be resolved.");
    }

    @GetMapping("/summary")
    @Operation(summary = "Get live customer dashboard summary, counts, and recent activities")
    public ResponseEntity<CustomerDashboardDTO> getCustomerSummary(Principal principal) {
        String userId = getUserId(principal);
        return ResponseEntity.ok(customerService.getCustomerDashboardSummary(userId));
    }

    @GetMapping("/dashboard/summary")
    @Operation(summary = "Get live customer dashboard metrics alias")
    public ResponseEntity<CustomerDashboardDTO> getCustomerDashboardSummary(Principal principal) {
        String userId = getUserId(principal);
        return ResponseEntity.ok(customerService.getCustomerDashboardSummary(userId));
    }

    @GetMapping("/orders")
    @Operation(summary = "Get current customer order history")
    public ResponseEntity<List<OrderDTO>> getCustomerOrders(Principal principal) {
        String userId = getUserId(principal);
        return ResponseEntity.ok(customerService.getCustomerOrders(userId));
    }

    @GetMapping("/orders/{id}")
    @Operation(summary = "Get specific customer order details")
    public ResponseEntity<OrderDTO> getCustomerOrderById(@PathVariable String id, Principal principal) {
        String userId = getUserId(principal);
        return ResponseEntity.ok(customerService.getCustomerOrderById(id, userId));
    }

    @GetMapping("/payments")
    @Operation(summary = "Get payment records submitted by current customer")
    public ResponseEntity<List<CustomerPaymentDTO>> getCustomerPayments(Principal principal) {
        String userId = getUserId(principal);
        return ResponseEntity.ok(customerService.getCustomerPayments(userId));
    }

    @PostMapping("/payments/submit")
    @Operation(summary = "Submit UTR reference / transaction details for order payment verification")
    public ResponseEntity<CustomerPaymentDTO> submitPayment(
            @Valid @RequestBody CustomerPaymentRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String userId = getUserId(principal);
        CustomerPaymentDTO submitted = customerService.submitPayment(
                userId,
                request,
                servletRequest.getRemoteAddr()
        );
        return ResponseEntity.ok(submitted);
    }
}
