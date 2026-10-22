package com.bakery.cottage.controller;

import com.bakery.cottage.dto.OrderDTO;
import com.bakery.cottage.entity.*;
import com.bakery.cottage.exception.ResourceNotFoundException;
import com.bakery.cottage.repository.OrderRepository;
import com.bakery.cottage.security.UserPrincipal;
import com.bakery.cottage.service.ShopkeeperService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/orders")
@Tag(name = "Customer Orders", description = "Endpoints for customer order placement and tracking")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderRepository orderRepository;
    private final ShopkeeperService shopkeeperService;
    private final com.bakery.cottage.repository.ProductRepository productRepository;

    public OrderController(OrderRepository orderRepository,
                           ShopkeeperService shopkeeperService,
                           com.bakery.cottage.repository.ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.shopkeeperService = shopkeeperService;
        this.productRepository = productRepository;
    }

    private UserPrincipal getPrincipal(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken) {
            Object p = ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
            if (p instanceof UserPrincipal) {
                return (UserPrincipal) p;
            }
        }
        return null;
    }

    @PostMapping
    @Operation(summary = "Place a new customer order")
    public ResponseEntity<OrderDTO> createOrder(@Valid @RequestBody OrderDTO request, Principal principal) {
        UserPrincipal userPrincipal = getPrincipal(principal);
        String userId = userPrincipal != null ? userPrincipal.getId() : (request.getUserId() != null ? request.getUserId() : "guest");
        String customerName = userPrincipal != null ? userPrincipal.getUser().getFullName() : (request.getDeliveryAddress() != null ? request.getDeliveryAddress().getFullName() : "Valued Customer");
        String customerPhone = userPrincipal != null ? userPrincipal.getUser().getPhoneNumber() : (request.getDeliveryAddress() != null ? request.getDeliveryAddress().getPhoneNumber() : "");
        String customerEmail = userPrincipal != null ? userPrincipal.getUsername() : request.getCustomerEmail();

        BigDecimal deliveryCharge = request.getDeliveryCharge() != null ? request.getDeliveryCharge() : BigDecimal.valueOf(60);
        String chargeText = request.getDeliveryChargeText() != null && !request.getDeliveryChargeText().isBlank()
                ? request.getDeliveryChargeText()
                : "Rs. " + deliveryCharge.stripTrailingZeros().toPlainString();
        BigDecimal grandTotal = request.getGrandTotal() != null
                ? request.getGrandTotal()
                : (request.getSubtotal() != null ? request.getSubtotal().add(deliveryCharge) : deliveryCharge);

        Order order = Order.builder()
                .orderNumber(request.getOrderNumber() != null ? request.getOrderNumber() : "PBC-" + System.currentTimeMillis())
                .userId(userId)
                .customerName(customerName)
                .customerPhone(customerPhone)
                .customerEmail(customerEmail)
                .subtotal(request.getSubtotal())
                .deliveryCharge(deliveryCharge)
                .deliveryChargeText(chargeText)
                .grandTotal(grandTotal)
                .addressFullName(request.getDeliveryAddress() != null ? request.getDeliveryAddress().getFullName() : customerName)
                .addressPhone(request.getDeliveryAddress() != null ? request.getDeliveryAddress().getPhoneNumber() : customerPhone)
                .addressLine(request.getDeliveryAddress() != null ? request.getDeliveryAddress().getAddressLine() : "")
                .addressArea(request.getDeliveryAddress() != null ? request.getDeliveryAddress().getAreaLocality() : "")
                .addressCity(request.getDeliveryAddress() != null ? request.getDeliveryAddress().getCity() : "")
                .addressState(request.getDeliveryAddress() != null ? request.getDeliveryAddress().getState() : "")
                .addressPincode(request.getDeliveryAddress() != null ? request.getDeliveryAddress().getPincode() : "")
                .addressLandmark(request.getDeliveryAddress() != null ? request.getDeliveryAddress().getLandmark() : "")
                .preferredDeliveryDate(request.getPreferredDeliveryDate())
                .preferredDeliveryTime(request.getPreferredDeliveryTime())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "UPI_QR")
                .orderStatus(OrderStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        if (request.getItems() != null) {
            for (var itemDto : request.getItems()) {
                if (itemDto.getProductId() != null) {
                    productRepository.findById(itemDto.getProductId()).ifPresent(prod -> {
                        int requestedQty = itemDto.getQuantity() != null && itemDto.getQuantity() > 0 ? itemDto.getQuantity() : 1;
                        int currentStock = prod.getStockQuantity() != null ? prod.getStockQuantity() : 0;
                        if (currentStock < requestedQty) {
                            throw new com.bakery.cottage.exception.BusinessException("Insufficient stock available for " + prod.getName() + " (Available: " + currentStock + ")");
                        }
                        int updatedStock = currentStock - requestedQty;
                        prod.setStockQuantity(updatedStock);
                        if (updatedStock <= 0) {
                            prod.setAvailable(false);
                        }
                        productRepository.save(prod);
                    });
                }

                OrderItem item = OrderItem.builder()
                        .productId(itemDto.getProductId())
                        .productName(itemDto.getProductName())
                        .productImage(itemDto.getProductImage())
                        .category(itemDto.getCategory())
                        .weightOption(itemDto.getWeightOption())
                        .unitPrice(itemDto.getUnitPrice())
                        .quantity(itemDto.getQuantity())
                        .subtotal(itemDto.getSubtotal())
                        .build();
                order.addItem(item);
            }
        }

        Order saved = orderRepository.save(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(shopkeeperService.mapToOrderDto(saved));
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Get current customer orders")
    public ResponseEntity<List<OrderDTO>> getMyOrders(Principal principal) {
        UserPrincipal userPrincipal = getPrincipal(principal);
        if (userPrincipal == null) {
            return ResponseEntity.ok(List.of());
        }
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userPrincipal.getId());
        return ResponseEntity.ok(orders.stream().map(shopkeeperService::mapToOrderDto).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details by ID")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable String id, Principal principal) {
        UserPrincipal userPrincipal = getPrincipal(principal);
        Order order = orderRepository.findById(id)
                .or(() -> orderRepository.findByOrderNumber(id))
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        // Enforce customer ownership isolation: Non-staff users can only access their own orders
        if (userPrincipal != null) {
            boolean isStaff = userPrincipal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SHOPKEEPER"));
            if (!isStaff && !order.getUserId().equals(userPrincipal.getId())) {
                throw new ResourceNotFoundException("Order", "id", id);
            }
        }
        return ResponseEntity.ok(shopkeeperService.mapToOrderDto(order));
    }
}
