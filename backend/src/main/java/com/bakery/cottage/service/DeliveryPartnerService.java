package com.bakery.cottage.service;

import com.bakery.cottage.dto.*;
import com.bakery.cottage.entity.*;
import com.bakery.cottage.exception.BusinessException;
import com.bakery.cottage.exception.ResourceNotFoundException;
import com.bakery.cottage.repository.DeliveryPartnerProfileRepository;
import com.bakery.cottage.repository.OrderRepository;
import com.bakery.cottage.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DeliveryPartnerService {

    private final UserRepository userRepository;
    private final DeliveryPartnerProfileRepository profileRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final ShopkeeperService shopkeeperService;

    public DeliveryPartnerService(
            UserRepository userRepository,
            DeliveryPartnerProfileRepository profileRepository,
            OrderRepository orderRepository,
            PasswordEncoder passwordEncoder,
            AuditService auditService,
            ShopkeeperService shopkeeperService) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.shopkeeperService = shopkeeperService;
    }

    private User validateActivePartner(String partnerUserId) {
        User user = userRepository.findById(partnerUserId)
                .filter(u -> u.getRole() == Role.DELIVERY_PARTNER && u.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner account not found"));

        if (!user.isEnabled()) {
            throw new BusinessException("Delivery partner account is disabled. Access denied.");
        }

        DeliveryPartnerProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        if (profile != null && "INACTIVE".equalsIgnoreCase(profile.getStatus())) {
            throw new BusinessException("Delivery partner status is inactive.");
        }

        return user;
    }

    @Transactional(readOnly = true)
    public DeliveryPartnerDashboardSummaryDTO getDashboardSummary(String partnerUserId) {
        User user = validateActivePartner(partnerUserId);
        DeliveryPartnerProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);

        List<Order> assignedOrders = orderRepository.findByDeliveryPartnerIdOrderByCreatedAtDesc(partnerUserId);

        long assignedDeliveries = assignedOrders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.CONFIRMED ||
                             o.getOrderStatus() == OrderStatus.PREPARING ||
                             o.getOrderStatus() == OrderStatus.READY ||
                             o.getOrderStatus() == OrderStatus.OUT_FOR_DELIVERY)
                .count();

        long pickupsPending = assignedOrders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.CONFIRMED ||
                             o.getOrderStatus() == OrderStatus.PREPARING ||
                             o.getOrderStatus() == OrderStatus.READY)
                .count();

        long outForDelivery = assignedOrders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.OUT_FOR_DELIVERY)
                .count();

        LocalDate today = LocalDate.now();
        long deliveredToday = assignedOrders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.DELIVERED || o.getOrderStatus() == OrderStatus.COMPLETED)
                .filter(o -> (o.getDeliveredAt() != null && o.getDeliveredAt().toLocalDate().isEqual(today))
                        || (o.getDeliveredAt() == null && o.getUpdatedAt() != null && o.getUpdatedAt().toLocalDate().isEqual(today)))
                .count();

        long failedDeliveries = assignedOrders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.DELIVERY_FAILED)
                .count();

        List<OrderDTO> orderDtos = assignedOrders.stream()
                .map(shopkeeperService::mapToOrderDto)
                .collect(Collectors.toList());

        DeliveryPartnerDTO partnerDto = DeliveryPartnerDTO.builder()
                .id(profile != null ? profile.getId() : user.getId())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .serviceArea(profile != null ? profile.getServiceArea() : "All Areas")
                .vehicleType(profile != null ? profile.getVehicleType() : null)
                .vehicleNumber(profile != null ? profile.getVehicleNumber() : null)
                .emergencyContact(profile != null ? profile.getEmergencyContact() : null)
                .status(profile != null ? profile.getStatus() : "ACTIVE")
                .enabled(user.isEnabled())
                .avatarUrl(user.getAvatarUrl())
                .activeDeliveriesCount(assignedDeliveries)
                .completedDeliveriesCount(deliveredToday)
                .createdAt(user.getCreatedAt())
                .build();

        return DeliveryPartnerDashboardSummaryDTO.builder()
                .assignedDeliveries(assignedDeliveries)
                .pickupsPending(pickupsPending)
                .outForDelivery(outForDelivery)
                .deliveredToday(deliveredToday)
                .failedDeliveries(failedDeliveries)
                .todayOrders(orderDtos)
                .partnerProfile(partnerDto)
                .build();
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getAssignedOrders(String partnerUserId) {
        validateActivePartner(partnerUserId);
        List<Order> orders = orderRepository.findByDeliveryPartnerIdOrderByCreatedAtDesc(partnerUserId);
        return orders.stream().map(shopkeeperService::mapToOrderDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(String partnerUserId, String orderId) {
        validateActivePartner(partnerUserId);
        Order order = orderRepository.findById(orderId)
                .or(() -> orderRepository.findByOrderNumber(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        // Strict Server-Side Ownership Check
        if (order.getDeliveryPartnerId() == null || !order.getDeliveryPartnerId().equals(partnerUserId)) {
            throw new ResourceNotFoundException("Order not found or not assigned to this delivery partner");
        }

        return shopkeeperService.mapToOrderDto(order);
    }

    public OrderDTO startDelivery(String partnerUserId, String orderId, String ipAddress) {
        User partner = validateActivePartner(partnerUserId);

        Order order = orderRepository.findById(orderId)
                .or(() -> orderRepository.findByOrderNumber(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        // Strict Server-Side Ownership Check
        if (order.getDeliveryPartnerId() == null || !order.getDeliveryPartnerId().equals(partnerUserId)) {
            throw new ResourceNotFoundException("Order not assigned to authenticated delivery partner");
        }

        // Validate state transition
        if (order.getOrderStatus() == OrderStatus.OUT_FOR_DELIVERY && order.getDeliveryOtp() != null && !order.getDeliveryOtp().isBlank()) {
            return shopkeeperService.mapToOrderDto(order);
        }

        if (order.getOrderStatus() != OrderStatus.READY &&
            order.getOrderStatus() != OrderStatus.CONFIRMED &&
            order.getOrderStatus() != OrderStatus.PREPARING &&
            order.getOrderStatus() != OrderStatus.OUT_FOR_DELIVERY) {
            throw new BusinessException("Order in status " + order.getOrderStatus() + " cannot be moved to OUT_FOR_DELIVERY");
        }

        // Generate secure 6-digit Delivery OTP (server-side only)
        String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        order.setDeliveryOtp(otp);
        order.setDeliveryOtpExpiresAt(LocalDateTime.now().plusMinutes(30));
        order.setDeliveryOtpUsed(false);
        order.setDeliveryOtpAttempts(0);
        order.setOrderStatus(OrderStatus.OUT_FOR_DELIVERY);
        order.setOutForDeliveryAt(LocalDateTime.now());

        Order saved = orderRepository.save(order);

        auditService.logEvent(
                "ORDER_OUT_FOR_DELIVERY",
                partner.getEmail(),
                "Delivery Partner started delivery for Order #" + order.getOrderNumber() + ". Delivery OTP generated with 30-min validity.",
                ipAddress
        );

        return shopkeeperService.mapToOrderDto(saved);
    }

    public OrderDTO confirmDelivery(String partnerUserId, String orderId, String otp, String ipAddress) {
        User partner = validateActivePartner(partnerUserId);

        Order order = orderRepository.findById(orderId)
                .or(() -> orderRepository.findByOrderNumber(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        // Strict Server-Side Ownership Check
        if (order.getDeliveryPartnerId() == null || !order.getDeliveryPartnerId().equals(partnerUserId)) {
            throw new ResourceNotFoundException("Order not assigned to authenticated delivery partner");
        }

        if (order.getOrderStatus() == OrderStatus.DELIVERED) {
            return shopkeeperService.mapToOrderDto(order);
        }

        if (order.getOrderStatus() != OrderStatus.OUT_FOR_DELIVERY) {
            throw new BusinessException("Order must be OUT_FOR_DELIVERY to be marked DELIVERED. Current status: " + order.getOrderStatus());
        }

        // Check if OTP was already consumed
        if (order.isDeliveryOtpUsed()) {
            throw new BusinessException("Delivery OTP has already been used and cannot be reused.");
        }

        // Check max verification attempts (limit to 5 attempts)
        if (order.getDeliveryOtpAttempts() >= 5) {
            throw new BusinessException("Maximum delivery OTP verification attempts exceeded. Please ask the customer to regenerate OTP.");
        }

        // Check expiration (30 minutes default)
        if (order.getDeliveryOtpExpiresAt() != null && LocalDateTime.now().isAfter(order.getDeliveryOtpExpiresAt())) {
            throw new BusinessException("Delivery OTP has expired. Please request a new OTP.");
        }

        // Strictly verify Delivery OTP
        if (order.getDeliveryOtp() == null || order.getDeliveryOtp().isBlank() || otp == null || !otp.trim().equals(order.getDeliveryOtp().trim())) {
            order.setDeliveryOtpAttempts(order.getDeliveryOtpAttempts() + 1);
            orderRepository.save(order);

            auditService.logEvent(
                    "DELIVERY_OTP_FAILED",
                    partner.getEmail(),
                    "Incorrect delivery OTP entered for Order #" + order.getOrderNumber() + " (Attempt " + order.getDeliveryOtpAttempts() + "/5)",
                    ipAddress
            );
            throw new IllegalArgumentException("Invalid delivery OTP. Please ask the customer to provide the correct OTP.");
        }

        order.setDeliveryOtpUsed(true);
        order.setOrderStatus(OrderStatus.DELIVERED);
        order.setDeliveredAt(LocalDateTime.now());

        // Automatically set payment to PAID if COD
        if ("CASH_ON_DELIVERY".equalsIgnoreCase(order.getPaymentMethod())) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }

        Order saved = orderRepository.save(order);

        auditService.logEvent(
                "ORDER_DELIVERED_SUCCESSFULLY",
                partner.getEmail(),
                "Delivery Partner completed handover and delivery for Order #" + order.getOrderNumber(),
                ipAddress
        );

        return shopkeeperService.mapToOrderDto(saved);
    }

    public OrderDTO reportDeliveryFailure(String partnerUserId, String orderId, String reason, String notes, String ipAddress) {
        User partner = validateActivePartner(partnerUserId);

        Order order = orderRepository.findById(orderId)
                .or(() -> orderRepository.findByOrderNumber(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        // Strict Server-Side Ownership Check
        if (order.getDeliveryPartnerId() == null || !order.getDeliveryPartnerId().equals(partnerUserId)) {
            throw new ResourceNotFoundException("Order not assigned to authenticated delivery partner");
        }

        if (order.getOrderStatus() == OrderStatus.DELIVERED || order.getOrderStatus() == OrderStatus.COMPLETED) {
            throw new BusinessException("Cannot mark delivered order as failed.");
        }

        order.setOrderStatus(OrderStatus.DELIVERY_FAILED);
        order.setDeliveryFailureReason(reason != null ? reason.trim() : "Unable to complete delivery");
        if (notes != null && !notes.isBlank()) {
            order.setDeliveryNotes(notes.trim());
        }

        Order saved = orderRepository.save(order);

        auditService.logEvent(
                "ORDER_DELIVERY_FAILED",
                partner.getEmail(),
                "Delivery Partner marked Order #" + order.getOrderNumber() + " as failed. Reason: " + reason,
                ipAddress
        );

        return shopkeeperService.mapToOrderDto(saved);
    }

    @Transactional(readOnly = true)
    public DeliveryPartnerDTO getProfile(String partnerUserId) {
        User user = validateActivePartner(partnerUserId);
        DeliveryPartnerProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);

        long activeCount = orderRepository.countByDeliveryPartnerIdAndOrderStatusIn(
                user.getId(),
                List.of(OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY)
        );
        long completedCount = orderRepository.countByDeliveryPartnerIdAndOrderStatus(user.getId(), OrderStatus.DELIVERED);

        return DeliveryPartnerDTO.builder()
                .id(profile != null ? profile.getId() : user.getId())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .serviceArea(profile != null ? profile.getServiceArea() : "All Areas")
                .vehicleType(profile != null ? profile.getVehicleType() : null)
                .vehicleNumber(profile != null ? profile.getVehicleNumber() : null)
                .emergencyContact(profile != null ? profile.getEmergencyContact() : null)
                .status(profile != null ? profile.getStatus() : "ACTIVE")
                .enabled(user.isEnabled())
                .avatarUrl(user.getAvatarUrl())
                .activeDeliveriesCount(activeCount)
                .completedDeliveriesCount(completedCount)
                .createdAt(user.getCreatedAt())
                .build();
    }

    public DeliveryPartnerDTO updateProfile(String partnerUserId, UpdateDeliveryPartnerRequest request, String ipAddress) {
        User user = validateActivePartner(partnerUserId);

        DeliveryPartnerProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> DeliveryPartnerProfile.builder().user(user).build());

        // Partner can update allowed profile fields (vehicle, emergency contact, service area)
        if (request.getServiceArea() != null && !request.getServiceArea().isBlank()) {
            profile.setServiceArea(request.getServiceArea().trim());
        }
        if (request.getVehicleType() != null) {
            profile.setVehicleType(request.getVehicleType().trim());
        }
        if (request.getVehicleNumber() != null) {
            profile.setVehicleNumber(request.getVehicleNumber().trim());
        }
        if (request.getEmergencyContact() != null) {
            profile.setEmergencyContact(request.getEmergencyContact().trim());
        }

        DeliveryPartnerProfile savedProfile = profileRepository.save(profile);

        auditService.logEvent(
                "DELIVERY_PARTNER_PROFILE_UPDATE",
                user.getEmail(),
                "Delivery Partner updated their profile information",
                ipAddress
        );

        return getProfile(partnerUserId);
    }

    public void changePassword(String partnerUserId, ChangePasswordRequest request, String ipAddress) {
        User user = validateActivePartner(partnerUserId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            auditService.logEvent("PASSWORD_CHANGE_FAILED", user.getEmail(), "Incorrect current password entered", ipAddress);
            throw new BadCredentialsException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditService.logEvent("PASSWORD_CHANGE_SUCCESS", user.getEmail(), "Delivery partner successfully changed password", ipAddress);
    }
}
