package com.bakery.cottage.controller;

import com.bakery.cottage.dto.*;
import com.bakery.cottage.entity.AuditLog;
import com.bakery.cottage.entity.CustomCakeStatus;
import com.bakery.cottage.entity.OrderStatus;
import com.bakery.cottage.entity.Role;
import com.bakery.cottage.service.AdminService;
import com.bakery.cottage.service.CloudinaryService;
import com.bakery.cottage.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Central Administrator Operations", description = "Endpoints restricted exclusively to verified ADMIN users")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;
    private final ProductService productService;
    private final CloudinaryService cloudinaryService;
    private final com.bakery.cottage.service.AdminDeliveryPartnerService adminDeliveryPartnerService;

    public AdminController(
            AdminService adminService,
            ProductService productService,
            CloudinaryService cloudinaryService,
            com.bakery.cottage.service.AdminDeliveryPartnerService adminDeliveryPartnerService) {
        this.adminService = adminService;
        this.productService = productService;
        this.cloudinaryService = cloudinaryService;
        this.adminDeliveryPartnerService = adminDeliveryPartnerService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get aggregated live dashboard business metrics and sales analytics")
    public ResponseEntity<AdminSummaryDTO> getAdminSummary() {
        return ResponseEntity.ok(adminService.getAdminSummary());
    }

    @GetMapping("/users")
    @Operation(summary = "Get registered users with optional role and search filters")
    public ResponseEntity<List<UserDTO>> getAllUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getAllUsers(role, search));
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Enable or disable a user account")
    public ResponseEntity<UserDTO> updateUserStatus(
            @PathVariable String id,
            @Valid @RequestBody UserStatusUpdateRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = principal != null ? principal.getName() : "admin";
        UserDTO updated = adminService.updateUserStatus(id, request.getEnabled(), adminEmail, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/orders")
    @Operation(summary = "Get all platform orders with line items")
    public ResponseEntity<List<OrderDTO>> getAllOrders(
            @RequestParam(required = false) OrderStatus status) {
        return ResponseEntity.ok(adminService.getAllOrders(status));
    }

    @PutMapping("/orders/{id}/status")
    @Operation(summary = "Update status of an order from Admin Console")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = principal != null ? principal.getName() : "admin";
        OrderDTO updated = adminService.updateOrderStatus(id, request, adminEmail, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/custom-cakes")
    @Operation(summary = "Get all customer custom cake requests")
    public ResponseEntity<List<CustomCakeRequestDTO>> getAllCustomCakes(
            @RequestParam(required = false) CustomCakeStatus status) {
        return ResponseEntity.ok(adminService.getAllCustomCakes(status));
    }

    @PutMapping("/custom-cakes/{id}/review")
    @Operation(summary = "Review and submit pricing / feasibility quote for a custom cake")
    public ResponseEntity<CustomCakeRequestDTO> reviewCustomCake(
            @PathVariable String id,
            @Valid @RequestBody ShopkeeperCustomCakeReviewRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = principal != null ? principal.getName() : "admin";
        CustomCakeRequestDTO reviewed = adminService.reviewCustomCake(id, request, adminEmail, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(reviewed);
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get platform security, authentication and operational audit logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }

    // ==========================================
    // COMPLETE ADMIN PRODUCT MANAGEMENT APIS
    // ==========================================

    @GetMapping("/products")
    @Operation(summary = "Get all products in the catalogue including unavailable ones")
    public ResponseEntity<List<ProductDTO>> getAdminProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(productService.getProducts(category, search, null, null, null, null, "newest"));
    }

    @PostMapping("/products")
    @Operation(summary = "Add a new bakery product")
    public ResponseEntity<ProductDTO> createProduct(
            @Valid @RequestBody ProductRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = principal != null ? principal.getName() : "admin";
        ProductDTO created = productService.createProduct(request, adminEmail, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(created);
    }

    @PostMapping(value = "/products/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload product photo to Cloudinary")
    public ResponseEntity<Map<String, String>> uploadProductImage(
            @RequestParam("file") MultipartFile file) throws IOException {
        String imageUrl = cloudinaryService.uploadProductImage(file);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    @GetMapping("/products/{id}")
    @Operation(summary = "Get single product details by ID for admin editing")
    public ResponseEntity<ProductDTO> getAdminProductById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Update an existing bakery product")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody ProductRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = principal != null ? principal.getName() : "admin";
        ProductDTO updated = productService.updateProduct(id, request, adminEmail, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/products/{id}/availability")
    @Operation(summary = "Toggle product availability status for sale")
    public ResponseEntity<ProductDTO> toggleProductAvailability(
            @PathVariable String id,
            @RequestParam(required = false) Boolean available,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = principal != null ? principal.getName() : "admin";
        ProductDTO updated = productService.toggleAvailability(id, available, adminEmail, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Safely soft-delete an existing product without corrupting order history")
    public ResponseEntity<Map<String, String>> deleteProduct(
            @PathVariable String id,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = principal != null ? principal.getName() : "admin";
        productService.deleteProduct(id, adminEmail, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(Map.of("message", "Product safely deleted from catalog."));
    }

    // ==========================================
    // DELIVERY PARTNER MANAGEMENT APIS
    // ==========================================

    @GetMapping("/delivery-partners")
    @Operation(summary = "Get all registered delivery partners with active and completed delivery counts")
    public ResponseEntity<List<DeliveryPartnerDTO>> getAllDeliveryPartners() {
        return ResponseEntity.ok(adminDeliveryPartnerService.getAllDeliveryPartners());
    }

    @PostMapping("/delivery-partners")
    @Operation(summary = "Add a new delivery partner with temporary password credentials")
    public ResponseEntity<DeliveryPartnerDTO> createDeliveryPartner(
            @Valid @RequestBody CreateDeliveryPartnerRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = principal != null ? principal.getName() : "admin";
        DeliveryPartnerDTO created = adminDeliveryPartnerService.createDeliveryPartner(request, adminEmail, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(created);
    }

    @GetMapping("/delivery-partners/{id}")
    @Operation(summary = "Get single delivery partner details by ID")
    public ResponseEntity<DeliveryPartnerDTO> getDeliveryPartnerById(@PathVariable String id) {
        return ResponseEntity.ok(adminDeliveryPartnerService.getDeliveryPartnerById(id));
    }

    @PutMapping("/delivery-partners/{id}")
    @Operation(summary = "Update delivery partner details, vehicle info, and service area")
    public ResponseEntity<DeliveryPartnerDTO> updateDeliveryPartner(
            @PathVariable String id,
            @Valid @RequestBody UpdateDeliveryPartnerRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = principal != null ? principal.getName() : "admin";
        DeliveryPartnerDTO updated = adminDeliveryPartnerService.updateDeliveryPartner(id, request, adminEmail, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/delivery-partners/{id}/status")
    @Operation(summary = "Activate or deactivate a delivery partner account")
    public ResponseEntity<DeliveryPartnerDTO> updateDeliveryPartnerStatus(
            @PathVariable String id,
            @RequestParam boolean enabled,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = principal != null ? principal.getName() : "admin";
        DeliveryPartnerDTO updated = adminDeliveryPartnerService.updatePartnerStatus(id, enabled, adminEmail, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/orders/{orderId}/assign-delivery-partner")
    @Operation(summary = "Assign or reassign an order to an active delivery partner")
    public ResponseEntity<OrderDTO> assignDeliveryPartner(
            @PathVariable String orderId,
            @Valid @RequestBody AssignDeliveryPartnerRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = principal != null ? principal.getName() : "admin";
        OrderDTO updated = adminDeliveryPartnerService.assignOrderToDeliveryPartner(orderId, request, adminEmail, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/delivery-partners/analytics")
    @Operation(summary = "Get live platform delivery operations analytics and counts")
    public ResponseEntity<AdminDeliveryAnalyticsDTO> getDeliveryAnalytics() {
        return ResponseEntity.ok(adminDeliveryPartnerService.getDeliveryAnalytics());
    }
}
