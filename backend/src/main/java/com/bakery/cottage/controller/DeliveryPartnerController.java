package com.bakery.cottage.controller;

import com.bakery.cottage.dto.*;
import com.bakery.cottage.security.UserPrincipal;
import com.bakery.cottage.service.DeliveryPartnerService;
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
import java.util.Map;

@RestController
@RequestMapping("/delivery-partner")
@PreAuthorize("hasRole('DELIVERY_PARTNER')")
@Tag(name = "Delivery Partner Operations", description = "Endpoints restricted exclusively to verified DELIVERY_PARTNER accounts")
@SecurityRequirement(name = "bearerAuth")
public class DeliveryPartnerController {

    private final DeliveryPartnerService deliveryPartnerService;

    public DeliveryPartnerController(DeliveryPartnerService deliveryPartnerService) {
        this.deliveryPartnerService = deliveryPartnerService;
    }

    private String getPartnerUserId(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            if (auth.getPrincipal() instanceof UserPrincipal userPrincipal) {
                return userPrincipal.getId();
            }
        }
        return principal != null ? principal.getName() : null;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get live Delivery Partner dashboard statistics and today's assigned orders")
    public ResponseEntity<DeliveryPartnerDashboardSummaryDTO> getDashboard(Principal principal) {
        String partnerId = getPartnerUserId(principal);
        return ResponseEntity.ok(deliveryPartnerService.getDashboardSummary(partnerId));
    }

    @GetMapping("/orders")
    @Operation(summary = "Get all orders assigned exclusively to authenticated delivery partner")
    public ResponseEntity<List<OrderDTO>> getAssignedOrders(Principal principal) {
        String partnerId = getPartnerUserId(principal);
        return ResponseEntity.ok(deliveryPartnerService.getAssignedOrders(partnerId));
    }

    @GetMapping("/orders/{id}")
    @Operation(summary = "Get single assigned order details by ID with ownership isolation")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable String id, Principal principal) {
        String partnerId = getPartnerUserId(principal);
        return ResponseEntity.ok(deliveryPartnerService.getOrderById(partnerId, id));
    }

    @RequestMapping(value = "/orders/{id}/out-for-delivery", method = {RequestMethod.PATCH, RequestMethod.POST})
    @Operation(summary = "Start delivery run, transition order to OUT_FOR_DELIVERY, and generate Customer Delivery OTP")
    public ResponseEntity<OrderDTO> startDelivery(
            @PathVariable String id,
            Principal principal,
            HttpServletRequest servletRequest) {
        String partnerId = getPartnerUserId(principal);
        OrderDTO updated = deliveryPartnerService.startDelivery(partnerId, id, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(updated);
    }

    @PostMapping({"/orders/{id}/deliver", "/orders/{id}/verify-delivery-otp", "/orders/{id}/verify-otp"})
    @Operation(summary = "Confirm handover and complete delivery by verifying Customer Delivery OTP")
    public ResponseEntity<OrderDTO> confirmDelivery(
            @PathVariable String id,
            @Valid @RequestBody DeliveryOtpVerificationRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String partnerId = getPartnerUserId(principal);
        OrderDTO updated = deliveryPartnerService.confirmDelivery(partnerId, id, request.getOtp(), servletRequest.getRemoteAddr());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/orders/{id}/delivery-failed")
    @Operation(summary = "Report a failed delivery with structured reason and operational notes")
    public ResponseEntity<OrderDTO> reportDeliveryFailure(
            @PathVariable String id,
            @Valid @RequestBody DeliveryFailureRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String partnerId = getPartnerUserId(principal);
        OrderDTO updated = deliveryPartnerService.reportDeliveryFailure(
                partnerId, id, request.getReason(), request.getNotes(), servletRequest.getRemoteAddr()
        );
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/profile")
    @Operation(summary = "Get delivery partner profile and vehicle information")
    public ResponseEntity<DeliveryPartnerDTO> getProfile(Principal principal) {
        String partnerId = getPartnerUserId(principal);
        return ResponseEntity.ok(deliveryPartnerService.getProfile(partnerId));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update allowed delivery partner profile fields")
    public ResponseEntity<DeliveryPartnerDTO> updateProfile(
            @Valid @RequestBody UpdateDeliveryPartnerRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String partnerId = getPartnerUserId(principal);
        DeliveryPartnerDTO updated = deliveryPartnerService.updateProfile(partnerId, request, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change delivery partner account password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String partnerId = getPartnerUserId(principal);
        deliveryPartnerService.changePassword(partnerId, request, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }
}
