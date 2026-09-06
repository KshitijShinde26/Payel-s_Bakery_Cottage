package com.bakery.cottage.service;

import com.bakery.cottage.dto.AdminOrderDTO;
import com.bakery.cottage.dto.AdminOrderItemDTO;
import com.bakery.cottage.entity.Order;
import com.bakery.cottage.exception.ResourceNotFoundException;
import com.bakery.cottage.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        String oldStatus = order.getOrderStatus();
        order.setOrderStatus(newStatus);
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

        return AdminOrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .customerName(order.getCustomerName())
                .customerEmail(order.getCustomerEmail())
                .customerPhone(order.getCustomerPhone())
                .subtotal(order.getSubtotal())
                .deliveryFee(order.getDeliveryFee())
                .grandTotal(order.getGrandTotal())
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .deliveryAddress(order.getDeliveryAddress())
                .preferredDeliveryDate(order.getPreferredDeliveryDate())
                .preferredDeliveryTime(order.getPreferredDeliveryTime())
                .items(items)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
