package com.bakery.cottage.controller;

import com.bakery.cottage.dto.CustomCakeRequestDTO;
import com.bakery.cottage.dto.OrderDTO;
import com.bakery.cottage.dto.ShopkeeperCustomCakeReviewRequest;
import com.bakery.cottage.dto.UpdateOrderStatusRequest;
import com.bakery.cottage.entity.CustomCakeStatus;
import com.bakery.cottage.entity.OrderStatus;
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
@Tag(name = "Shopkeeper Dashboard Operations", description = "Endpoints for managing bakery kitchen queue, order fulfillment, and reviewing custom cake requests")
@SecurityRequirement(name = "bearerAuth")
public class ShopkeeperController {

    private final ShopkeeperService shopkeeperService;

    public ShopkeeperController(ShopkeeperService shopkeeperService) {
        this.shopkeeperService = shopkeeperService;
    }

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
}
