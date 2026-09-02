package com.bakery.cottage.service;

import com.bakery.cottage.dto.*;
import com.bakery.cottage.entity.*;
import com.bakery.cottage.exception.ResourceNotFoundException;
import com.bakery.cottage.repository.CustomCakeRequestRepository;
import com.bakery.cottage.repository.OrderRepository;
import com.bakery.cottage.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ShopkeeperService {

    private final OrderRepository orderRepository;
    private final CustomCakeRequestRepository customCakeRequestRepository;
    private final ProductRepository productRepository;

    public ShopkeeperService(OrderRepository orderRepository,
                             CustomCakeRequestRepository customCakeRequestRepository,
                             ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.customCakeRequestRepository = customCakeRequestRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public ShopkeeperSummaryDTO getShopkeeperSummary() {
        List<Product> products = productRepository.findAllByDeletedAtIsNull();
        long totalProducts = products.size();
        long availableProducts = products.stream().filter(Product::isAvailable).count();

        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        long totalOrders = orders.size();

        long pendingOrders = orders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.AWAITING_PAYMENT || o.getOrderStatus() == OrderStatus.CONFIRMED)
                .count();

        long preparingOrders = orders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.PREPARING)
                .count();

        long readyOrders = orders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.READY)
                .count();

        long outForDeliveryOrders = orders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.OUT_FOR_DELIVERY)
                .count();

        long completedOrders = orders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.DELIVERED || o.getOrderStatus() == OrderStatus.COMPLETED)
                .count();

        long pendingPayments = orders.stream()
                .filter(o -> o.getPaymentStatus() == PaymentStatus.PENDING)
                .count();

        List<CustomCakeRequestEntity> cakes = customCakeRequestRepository.findAllByOrderByCreatedAtDesc();
        long totalCustomCakes = cakes.size();
        long pendingCustomCakes = cakes.stream()
                .filter(c -> c.getStatus() == CustomCakeStatus.PENDING_REVIEW || c.getStatus() == CustomCakeStatus.UNDER_REVIEW)
                .count();

        LocalDate today = LocalDate.now();
        long todayOrders = orders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().toLocalDate().isEqual(today))
                .count();

        return ShopkeeperSummaryDTO.builder()
                .totalProducts(totalProducts)
                .availableProducts(availableProducts)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .preparingOrders(preparingOrders)
                .readyOrders(readyOrders)
                .outForDeliveryOrders(outForDeliveryOrders)
                .completedOrders(completedOrders)
                .pendingPayments(pendingPayments)
                .pendingCustomCakes(pendingCustomCakes)
                .totalCustomCakes(totalCustomCakes)
                .todayOrders(todayOrders)
                .build();
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getActiveOrders(OrderStatus status) {
        List<Order> orders;
        if (status != null) {
            orders = orderRepository.findByOrderStatusOrderByCreatedAtDesc(status);
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }
        return orders.stream().map(this::mapToOrderDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(String orderId) {
        Order order = orderRepository.findById(orderId)
                .or(() -> orderRepository.findByOrderNumber(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return mapToOrderDto(order);
    }

    public OrderDTO updateOrderStatus(String orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .or(() -> orderRepository.findByOrderNumber(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setOrderStatus(request.getStatus());
        if (request.getKitchenNotes() != null && !request.getKitchenNotes().isBlank()) {
            order.setKitchenNotes(request.getKitchenNotes());
        }

        // Automatic payment status adjustment on delivery/completion if COD
        if (request.getStatus() == OrderStatus.DELIVERED || request.getStatus() == OrderStatus.COMPLETED) {
            if ("CASH_ON_DELIVERY".equalsIgnoreCase(order.getPaymentMethod())) {
                order.setPaymentStatus(PaymentStatus.PAID);
            }
        }

        Order saved = orderRepository.save(order);
        return mapToOrderDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CustomCakeRequestDTO> getCustomCakeRequests(CustomCakeStatus status) {
        List<CustomCakeRequestEntity> list;
        if (status != null) {
            list = customCakeRequestRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            list = customCakeRequestRepository.findAllByOrderByCreatedAtDesc();
        }
        return list.stream().map(this::mapToCustomCakeDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomCakeRequestDTO getCustomCakeRequestById(String id) {
        CustomCakeRequestEntity entity = customCakeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CustomCakeRequest", "id", id));
        return mapToCustomCakeDto(entity);
    }

    public CustomCakeRequestDTO reviewCustomCakeRequest(String id, ShopkeeperCustomCakeReviewRequest request) {
        CustomCakeRequestEntity entity = customCakeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CustomCakeRequest", "id", id));

        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
        if (request.getConfirmedPrice() != null) {
            entity.setConfirmedPrice(request.getConfirmedPrice());
        }
        if (request.getEstimatedPrice() != null) {
            entity.setEstimatedPrice(request.getEstimatedPrice());
        }
        if (request.getFeasibilityDecision() != null) {
            entity.setFeasibilityDecision(request.getFeasibilityDecision());
        }
        if (request.getBakeryNotes() != null) {
            entity.setBakeryNotes(request.getBakeryNotes());
        }

        CustomCakeRequestEntity saved = customCakeRequestRepository.save(entity);
        return mapToCustomCakeDto(saved);
    }

    public OrderDTO mapToOrderDto(Order order) {
        List<OrderItemDTO> items = order.getItems() != null
                ? order.getItems().stream().map(item -> OrderItemDTO.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .productImage(item.getProductImage())
                        .category(item.getCategory())
                        .weightOption(item.getWeightOption())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getSubtotal())
                        .build()).collect(Collectors.toList())
                : List.of();

        DeliveryAddressDTO address = DeliveryAddressDTO.builder()
                .fullName(order.getAddressFullName())
                .phoneNumber(order.getAddressPhone())
                .addressLine(order.getAddressLine())
                .areaLocality(order.getAddressArea())
                .city(order.getAddressCity())
                .state(order.getAddressState())
                .pincode(order.getAddressPincode())
                .landmark(order.getAddressLandmark())
                .build();

        return OrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .customerEmail(order.getCustomerEmail())
                .items(items)
                .subtotal(order.getSubtotal())
                .deliveryChargeText(order.getDeliveryChargeText())
                .grandTotal(order.getGrandTotal())
                .deliveryAddress(address)
                .preferredDeliveryDate(order.getPreferredDeliveryDate())
                .preferredDeliveryTime(order.getPreferredDeliveryTime())
                .paymentMethod(order.getPaymentMethod())
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .kitchenNotes(order.getKitchenNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    public CustomCakeRequestDTO mapToCustomCakeDto(CustomCakeRequestEntity entity) {
        return CustomCakeRequestDTO.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .customerName(entity.getCustomerName())
                .customerPhone(entity.getCustomerPhone())
                .customerEmail(entity.getCustomerEmail())
                .cakeType(entity.getCakeType())
                .flavor(entity.getFlavor())
                .weight(entity.getWeight())
                .dietaryPreference(entity.getDietaryPreference())
                .customMessage(entity.getCustomMessage())
                .specialInstructions(entity.getSpecialInstructions())
                .referenceImageUrl(entity.getReferenceImageUrl())
                .referenceImageName(entity.getReferenceImageName())
                .referenceImageSize(entity.getReferenceImageSize())
                .preferredDeliveryDate(entity.getPreferredDeliveryDate())
                .preferredDeliveryTime(entity.getPreferredDeliveryTime())
                .status(entity.getStatus())
                .estimatedPrice(entity.getEstimatedPrice())
                .confirmedPrice(entity.getConfirmedPrice())
                .feasibilityDecision(entity.getFeasibilityDecision())
                .bakeryNotes(entity.getBakeryNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
