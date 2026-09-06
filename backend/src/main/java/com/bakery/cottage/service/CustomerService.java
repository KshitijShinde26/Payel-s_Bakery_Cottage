package com.bakery.cottage.service;

import com.bakery.cottage.dto.*;
import com.bakery.cottage.entity.*;
import com.bakery.cottage.exception.BusinessException;
import com.bakery.cottage.exception.ResourceNotFoundException;
import com.bakery.cottage.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final CustomCakeRequestRepository customCakeRequestRepository;
    private final PaymentRepository paymentRepository;
    private final ProductService productService;
    private final ShopkeeperService shopkeeperService;
    private final AuditService auditService;

    public CustomerService(
            UserRepository userRepository,
            OrderRepository orderRepository,
            CustomCakeRequestRepository customCakeRequestRepository,
            PaymentRepository paymentRepository,
            ProductService productService,
            ShopkeeperService shopkeeperService,
            AuditService auditService) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.customCakeRequestRepository = customCakeRequestRepository;
        this.paymentRepository = paymentRepository;
        this.productService = productService;
        this.shopkeeperService = shopkeeperService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public CustomerDashboardDTO getCustomerDashboardSummary(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        long totalOrders = orderRepository.countByUserId(userId);
        long activeOrders = orderRepository.countByUserIdAndOrderStatusIn(
                userId,
                List.of(OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY)
        );
        long completedOrders = orderRepository.countByUserIdAndOrderStatus(userId, OrderStatus.DELIVERED);

        List<CustomCakeRequestEntity> cakeRequests = customCakeRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
        long totalCakeRequests = cakeRequests.size();
        long pendingCakeRequests = cakeRequests.stream()
                .filter(c -> c.getStatus() == CustomCakeStatus.PENDING_REVIEW || c.getStatus() == CustomCakeStatus.UNDER_REVIEW)
                .count();

        List<Payment> userPayments = paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        long pendingPayments = userPayments.stream()
                .filter(p -> "PENDING".equalsIgnoreCase(p.getStatus()) || "VERIFICATION_REQUIRED".equalsIgnoreCase(p.getStatus()))
                .count();

        List<Order> recentOrdersList = orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .limit(5)
                .toList();

        List<OrderDTO> recentOrdersDto = recentOrdersList.stream()
                .map(shopkeeperService::mapToOrderDto)
                .collect(Collectors.toList());

        List<CustomCakeRequestDTO> recentCakesDto = cakeRequests.stream()
                .limit(4)
                .map(shopkeeperService::mapToCustomCakeDto)
                .collect(Collectors.toList());

        List<ProductDTO> featuredProducts = productService.getFeaturedProducts();
        List<ProductDTO> bestSellers = productService.getBestSellers();

        String memberSince = (user.getCreatedAt() != null)
                ? user.getCreatedAt().format(DateTimeFormatter.ofPattern("MMMM yyyy"))
                : "2026";

        return CustomerDashboardDTO.builder()
                .customerId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .memberSince(memberSince)
                .totalOrdersCount(totalOrders)
                .activeOrdersCount(activeOrders)
                .completedOrdersCount(completedOrders)
                .customCakesCount(totalCakeRequests)
                .pendingCustomCakesCount(pendingCakeRequests)
                .pendingPaymentsCount(pendingPayments)
                .recentOrders(recentOrdersDto)
                .recentCustomCakes(recentCakesDto)
                .featuredProducts(featuredProducts)
                .bestSellers(bestSellers)
                .build();
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getCustomerOrders(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(shopkeeperService::mapToOrderDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDTO getCustomerOrderById(String orderId, String userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .or(() -> orderRepository.findByOrderNumberAndUserId(orderId, userId))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found or not authorized for this customer"));
        return shopkeeperService.mapToOrderDto(order);
    }

    @Transactional(readOnly = true)
    public List<CustomerPaymentDTO> getCustomerPayments(String userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapPaymentToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerPaymentDTO submitPayment(String userId, CustomerPaymentRequest request, String ipAddress) {
        Order order = orderRepository.findByIdAndUserId(request.getOrderId(), userId)
                .or(() -> orderRepository.findByOrderNumberAndUserId(request.getOrderId(), userId))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found or does not belong to the authenticated customer"));

        if (request.getTransactionRef() == null || request.getTransactionRef().trim().length() < 6) {
            throw new BusinessException("Please enter a valid 12-digit UPI UTR / Transaction Reference number");
        }

        // Check if payment already exists for this order
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(() -> Payment.builder()
                        .orderId(order.getId())
                        .userId(userId)
                        .amount(order.getGrandTotal())
                        .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "UPI_QR")
                        .build());

        payment.setAmount(request.getAmount() != null ? request.getAmount() : order.getGrandTotal());
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "UPI_QR");
        payment.setTransactionRef(request.getTransactionRef().trim());
        payment.setStatus("VERIFICATION_REQUIRED");
        Payment saved = paymentRepository.save(payment);

        auditService.logEvent(
                "CUSTOMER_PAYMENT_SUBMITTED",
                order.getCustomerEmail(),
                "Customer submitted payment UTR " + request.getTransactionRef().trim() + " for order #" + order.getOrderNumber(),
                ipAddress
        );

        return mapPaymentToDto(saved);
    }

    private CustomerPaymentDTO mapPaymentToDto(Payment payment) {
        String orderNumber = payment.getOrderId();
        if (payment.getOrderId() != null) {
            orderNumber = orderRepository.findById(payment.getOrderId())
                    .map(Order::getOrderNumber)
                    .orElse(payment.getOrderId());
        }

        return CustomerPaymentDTO.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .orderNumber(orderNumber)
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .transactionRef(payment.getTransactionRef())
                .createdAt(payment.getCreatedAt())
                .verifiedAt(payment.getVerifiedAt())
                .build();
    }
}
