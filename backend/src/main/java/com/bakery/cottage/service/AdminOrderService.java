package com.bakery.cottage.service;

import com.bakery.cottage.dto.AdminOrderDTO;
import com.bakery.cottage.dto.AdminOrderItemDTO;
import com.bakery.cottage.entity.Order;
import com.bakery.cottage.entity.OrderStatus;
import com.bakery.cottage.entity.PaymentStatus;
import com.bakery.cottage.exception.ResourceNotFoundException;
import com.bakery.cottage.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminOrderService {

    private final OrderRepository orderRepository;
    private final AuditService auditService;

    public AdminOrderService(OrderRepository orderRepository, AuditService auditService) {
        this.orderRepository = orderRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<AdminOrderDTO> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminOrderDTO getOrderById(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return mapToDto(order);
    }

    @Transactional
    public AdminOrderDTO updateOrderStatus(String id, String newStatus, String adminEmail, String ipAddress) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        String oldStatus = (order.getOrderStatus() != null) ? order.getOrderStatus().name() : "CONFIRMED";
        try {
            order.setOrderStatus(OrderStatus.valueOf(newStatus));
        } catch (Exception e) {
            order.setOrderStatus(OrderStatus.CONFIRMED);
        }
        Order updated = orderRepository.save(order);

        auditService.logEvent(
                "ADMIN_ORDER_STATUS_UPDATE",
                adminEmail,
                "Admin changed status for order " + order.getOrderNumber() + " from " + oldStatus + " to " + newStatus,
                ipAddress
        );

        return mapToDto(updated);
    }

    private AdminOrderDTO mapToDto(Order order) {
        List<AdminOrderItemDTO> items = (order.getItems() != null)
                ? order.getItems().stream().map(item -> AdminOrderItemDTO.builder()
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

        String addressText = (order.getAddressLine() != null && !order.getAddressLine().isBlank())
                ? order.getAddressLine() + ", " + (order.getAddressCity() != null ? order.getAddressCity() : "")
                : (order.getAddressFullName() != null ? order.getAddressFullName() : "Bakery Order Address");

        return AdminOrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .customerName(order.getCustomerName())
                .customerEmail(order.getCustomerEmail())
                .customerPhone(order.getCustomerPhone())
                .subtotal(order.getSubtotal())
                .deliveryFee(BigDecimal.ZERO)
                .grandTotal(order.getGrandTotal())
                .orderStatus((order.getOrderStatus() != null) ? order.getOrderStatus().name() : "CONFIRMED")
                .paymentStatus((order.getPaymentStatus() != null) ? order.getPaymentStatus().name() : "PENDING")
                .paymentMethod(order.getPaymentMethod())
                .deliveryAddress(addressText)
                .preferredDeliveryDate(order.getPreferredDeliveryDate())
                .preferredDeliveryTime(order.getPreferredDeliveryTime())
                .items(items)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
