package com.bakery.cottage.controller;

import com.bakery.cottage.dto.*;
import com.bakery.cottage.entity.CustomCakeStatus;
import com.bakery.cottage.entity.OrderStatus;
import com.bakery.cottage.service.ProductService;
import com.bakery.cottage.service.ShopkeeperService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shopkeeper")
@PreAuthorize("hasRole('SHOPKEEPER') or hasRole('ADMIN')")
@Tag(name = "Shopkeeper Dashboard Operations", description = "Endpoints for managing bakery kitchen queue, order fulfillment, read-only catalog viewing, and reviewing custom cake requests")
@SecurityRequirement(name = "bearerAuth")
public class ShopkeeperController {

    private final ShopkeeperService shopkeeperService;
    private final ProductService productService;

    public ShopkeeperController(
            ShopkeeperService shopkeeperService,
            ProductService productService) {
        this.shopkeeperService = shopkeeperService;
        this.productService = productService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get live shopkeeper dashboard business metrics and order statistics")
    public ResponseEntity<ShopkeeperSummaryDTO> getShopkeeperSummary() {
        return ResponseEntity.ok(shopkeeperService.getShopkeeperSummary());
    }

    // ==========================================
    // ORDER MANAGEMENT APIS
    // ==========================================

    @GetMapping("/orders")
    @Operation(summary = "Fetch active bakery orders", description = "Retrieves orders awaiting baking, packaging, or delivery fulfillment")
    public ResponseEntity<List<OrderDTO>> getOrders(
            @RequestParam(required = false) OrderStatus status) {
        List<OrderDTO> orders = shopkeeperService.getActiveOrders(status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/orders/{id}")
    @Operation(summary = "Get order details by ID", description = "Retrieves a specific order and its line items")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable String id) {
        OrderDTO order = shopkeeperService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/orders/{id}/status")
    @Operation(summary = "Update order status", description = "Transitions an order status (e.g., PAYMENT_VERIFIED -> PREPARING -> READY -> OUT_FOR_DELIVERY -> DELIVERED)")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderDTO updated = shopkeeperService.updateOrderStatus(id, request);
        return ResponseEntity.ok(updated);
    }

    // ==========================================
    // CUSTOM CAKE MANAGEMENT APIS
    // ==========================================

    @GetMapping("/custom-cakes")
    @Operation(summary = "Retrieve custom cake requests", description = "Fetches customer custom cake inquiries requiring bakery feasibility analysis and quote approval")
    public ResponseEntity<List<CustomCakeRequestDTO>> getCustomCakes(
            @RequestParam(required = false) CustomCakeStatus status) {
        List<CustomCakeRequestDTO> requests = shopkeeperService.getCustomCakeRequests(status);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/custom-cakes/{id}")
    @Operation(summary = "Get custom cake request details", description = "Retrieves a single custom cake request with customer design photos and specifications")
    public ResponseEntity<CustomCakeRequestDTO> getCustomCakeById(@PathVariable String id) {
        CustomCakeRequestDTO cake = shopkeeperService.getCustomCakeRequestById(id);
        return ResponseEntity.ok(cake);
    }

    @PutMapping("/custom-cakes/{id}/review")
    @Operation(summary = "Review and quote custom cake", description = "Submits bakery pricing, feasibility decision, and kitchen preparation instructions for a custom cake request")
    public ResponseEntity<CustomCakeRequestDTO> reviewCustomCake(
            @PathVariable String id,
            @Valid @RequestBody ShopkeeperCustomCakeReviewRequest request) {
        CustomCakeRequestDTO reviewed = shopkeeperService.reviewCustomCakeRequest(id, request);
        return ResponseEntity.ok(reviewed);
    }

    // ==========================================
    // READ-ONLY PRODUCT CATALOG VIEWING FOR SHOPKEEPER
    // Note: All product CRUD/write operations belong strictly to ADMIN (/admin/products/**)
    // ==========================================

    @GetMapping("/products")
    @Operation(summary = "Get products in the catalog for shopkeeper read-only reference")
    public ResponseEntity<List<ProductDTO>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(productService.getProducts(category, search, null, null, null, null, "newest"));
    }

    @GetMapping("/products/{id}")
    @Operation(summary = "Get single product details by ID (read-only)")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }
}
