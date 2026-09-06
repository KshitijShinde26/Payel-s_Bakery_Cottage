package com.bakery.cottage.service;

import com.bakery.cottage.dto.AdminPaymentDTO;
import com.bakery.cottage.entity.Order;
import com.bakery.cottage.entity.Payment;
import com.bakery.cottage.entity.OrderStatus;
import com.bakery.cottage.entity.PaymentStatus;
import com.bakery.cottage.exception.ResourceNotFoundException;
import com.bakery.cottage.repository.OrderRepository;
import com.bakery.cottage.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminPaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final AuditService auditService;

    public AdminPaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            AuditService auditService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<AdminPaymentDTO> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminPaymentDTO> getPendingVerificationPayments() {
        return paymentRepository.findByStatusOrderByCreatedAtDesc("VERIFICATION_REQUIRED")
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminPaymentDTO verifyPayment(String paymentId, String adminEmail, String ipAddress) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        payment.setStatus("PAID");
        payment.setVerifiedBy(adminEmail);
        payment.setVerifiedAt(LocalDateTime.now());
        Payment saved = paymentRepository.save(payment);

        // Update corresponding Order payment status
        if (payment.getOrderId() != null) {
            orderRepository.findById(payment.getOrderId()).ifPresent(order -> {
                order.setPaymentStatus(PaymentStatus.PAID);
                if (order.getOrderStatus() == OrderStatus.AWAITING_PAYMENT) {
                    order.setOrderStatus(OrderStatus.CONFIRMED);
                }
                orderRepository.save(order);
            });
        }

        auditService.logEvent(
                "ADMIN_PAYMENT_VERIFIED",
                adminEmail,
                "Admin verified payment " + paymentId + " for amount " + payment.getAmount(),
                ipAddress
        );

        return mapToDto(saved);
    }

    @Transactional
    public AdminPaymentDTO rejectPayment(String paymentId, String reason, String adminEmail, String ipAddress) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        payment.setStatus("REJECTED");
        payment.setVerifiedBy(adminEmail);
        payment.setVerifiedAt(LocalDateTime.now());
        Payment saved = paymentRepository.save(payment);

        if (payment.getOrderId() != null) {
            orderRepository.findById(payment.getOrderId()).ifPresent(order -> {
                order.setPaymentStatus(PaymentStatus.PENDING);
                orderRepository.save(order);
            });
        }

        auditService.logEvent(
                "ADMIN_PAYMENT_REJECTED",
                adminEmail,
                "Admin rejected payment " + paymentId + ". Reason: " + reason,
                ipAddress
        );

        return mapToDto(saved);
    }

    private AdminPaymentDTO mapToDto(Payment payment) {
        String orderNumber = payment.getOrderId();
        if (payment.getOrderId() != null) {
            orderNumber = orderRepository.findById(payment.getOrderId())
                    .map(Order::getOrderNumber)
                    .orElse(payment.getOrderId());
        }

        return AdminPaymentDTO.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .orderNumber(orderNumber)
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .transactionRef(payment.getTransactionRef())
                .verifiedBy(payment.getVerifiedBy())
                .verifiedAt(payment.getVerifiedAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
