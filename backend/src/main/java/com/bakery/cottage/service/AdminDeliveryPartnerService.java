package com.bakery.cottage.service;

import com.bakery.cottage.dto.*;
import com.bakery.cottage.entity.*;
import com.bakery.cottage.exception.BusinessException;
import com.bakery.cottage.exception.DuplicateResourceException;
import com.bakery.cottage.exception.ResourceNotFoundException;
import com.bakery.cottage.repository.DeliveryPartnerProfileRepository;
import com.bakery.cottage.repository.OrderRepository;
import com.bakery.cottage.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminDeliveryPartnerService {

    private final UserRepository userRepository;
    private final DeliveryPartnerProfileRepository profileRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final ShopkeeperService shopkeeperService;

    public AdminDeliveryPartnerService(
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

    @Transactional(readOnly = true)
    public List<DeliveryPartnerDTO> getAllDeliveryPartners() {
        List<User> partnerUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.DELIVERY_PARTNER && u.getDeletedAt() == null)
                .collect(Collectors.toList());

        List<DeliveryPartnerDTO> dtos = new ArrayList<>();
        for (User user : partnerUsers) {
            DeliveryPartnerProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
            long activeCount = orderRepository.countByDeliveryPartnerIdAndOrderStatusIn(
                    user.getId(),
                    List.of(OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY)
            );
            long completedCount = orderRepository.countByDeliveryPartnerIdAndOrderStatus(user.getId(), OrderStatus.DELIVERED);

            dtos.add(mapToPartnerDto(user, profile, activeCount, completedCount));
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public DeliveryPartnerDTO getDeliveryPartnerById(String id) {
        User user = userRepository.findById(id)
                .filter(u -> u.getRole() == Role.DELIVERY_PARTNER && u.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Partner not found with ID: " + id));

        DeliveryPartnerProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        long activeCount = orderRepository.countByDeliveryPartnerIdAndOrderStatusIn(
                user.getId(),
                List.of(OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY)
        );
        long completedCount = orderRepository.countByDeliveryPartnerIdAndOrderStatus(user.getId(), OrderStatus.DELIVERED);

        return mapToPartnerDto(user, profile, activeCount, completedCount);
    }

    public DeliveryPartnerDTO createDeliveryPartner(CreateDeliveryPartnerRequest request, String adminEmail, String ipAddress) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String normalizedPhone = request.getPhoneNumber().trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("An account with email " + normalizedEmail + " already exists");
        }
        if (userRepository.existsByPhoneNumber(normalizedPhone)) {
            throw new DuplicateResourceException("An account with phone number " + normalizedPhone + " already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(normalizedEmail)
                .phoneNumber(normalizedPhone)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.DELIVERY_PARTNER)
                .emailVerified(true)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        DeliveryPartnerProfile profile = DeliveryPartnerProfile.builder()
                .user(savedUser)
                .serviceArea(request.getServiceArea().trim())
                .vehicleType(request.getVehicleType() != null ? request.getVehicleType().trim() : null)
                .vehicleNumber(request.getVehicleNumber() != null ? request.getVehicleNumber().trim() : null)
                .emergencyContact(request.getEmergencyContact() != null ? request.getEmergencyContact().trim() : null)
                .status("ACTIVE")
                .build();

        DeliveryPartnerProfile savedProfile = profileRepository.save(profile);

        auditService.logEvent(
                "DELIVERY_PARTNER_CREATED",
                adminEmail,
                "Admin created delivery partner account [" + savedUser.getEmail() + "] covering area [" + savedProfile.getServiceArea() + "]",
                ipAddress
        );

        return mapToPartnerDto(savedUser, savedProfile, 0, 0);
    }

    public DeliveryPartnerDTO updateDeliveryPartner(String id, UpdateDeliveryPartnerRequest request, String adminEmail, String ipAddress) {
        User user = userRepository.findById(id)
                .filter(u -> u.getRole() == Role.DELIVERY_PARTNER && u.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Partner not found with ID: " + id));

        String normalizedPhone = request.getPhoneNumber().trim();
        if (!user.getPhoneNumber().equals(normalizedPhone) && userRepository.existsByPhoneNumber(normalizedPhone)) {
            throw new DuplicateResourceException("Phone number " + normalizedPhone + " is already in use");
        }

        user.setFullName(request.getFullName().trim());
        user.setPhoneNumber(normalizedPhone);
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }
        User savedUser = userRepository.save(user);

        DeliveryPartnerProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> DeliveryPartnerProfile.builder().user(savedUser).build());

        profile.setServiceArea(request.getServiceArea().trim());
        profile.setVehicleType(request.getVehicleType() != null ? request.getVehicleType().trim() : null);
        profile.setVehicleNumber(request.getVehicleNumber() != null ? request.getVehicleNumber().trim() : null);
        profile.setEmergencyContact(request.getEmergencyContact() != null ? request.getEmergencyContact().trim() : null);
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            profile.setStatus(request.getStatus().trim().toUpperCase());
        }
        DeliveryPartnerProfile savedProfile = profileRepository.save(profile);

        long activeCount = orderRepository.countByDeliveryPartnerIdAndOrderStatusIn(
                user.getId(),
                List.of(OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY)
        );
        long completedCount = orderRepository.countByDeliveryPartnerIdAndOrderStatus(user.getId(), OrderStatus.DELIVERED);

        auditService.logEvent(
                "DELIVERY_PARTNER_UPDATED",
                adminEmail,
                "Admin updated delivery partner details for [" + user.getEmail() + "]",
                ipAddress
        );

        return mapToPartnerDto(savedUser, savedProfile, activeCount, completedCount);
    }

    public DeliveryPartnerDTO updatePartnerStatus(String id, boolean enabled, String adminEmail, String ipAddress) {
        User user = userRepository.findById(id)
                .filter(u -> u.getRole() == Role.DELIVERY_PARTNER && u.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Partner not found with ID: " + id));

        user.setEnabled(enabled);
        User savedUser = userRepository.save(user);

        DeliveryPartnerProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        if (profile != null) {
            profile.setStatus(enabled ? "ACTIVE" : "INACTIVE");
            profile = profileRepository.save(profile);
        }

        long activeCount = orderRepository.countByDeliveryPartnerIdAndOrderStatusIn(
                user.getId(),
                List.of(OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY)
        );
        long completedCount = orderRepository.countByDeliveryPartnerIdAndOrderStatus(user.getId(), OrderStatus.DELIVERED);

        auditService.logEvent(
                "DELIVERY_PARTNER_STATUS_CHANGE",
                adminEmail,
                "Admin set delivery partner [" + user.getEmail() + "] enabled=" + enabled,
                ipAddress
        );

        return mapToPartnerDto(savedUser, profile, activeCount, completedCount);
    }

    public OrderDTO assignOrderToDeliveryPartner(String orderId, AssignDeliveryPartnerRequest request, String adminEmail, String ipAddress) {
        Order order = orderRepository.findById(orderId)
                .or(() -> orderRepository.findByOrderNumber(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (order.getOrderStatus() == OrderStatus.DELIVERED || order.getOrderStatus() == OrderStatus.COMPLETED || order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException("Cannot assign order with status: " + order.getOrderStatus());
        }

        User partnerUser = userRepository.findById(request.getDeliveryPartnerId())
                .filter(u -> u.getRole() == Role.DELIVERY_PARTNER && u.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found with ID: " + request.getDeliveryPartnerId()));

        if (!partnerUser.isEnabled()) {
            throw new BusinessException("Cannot assign order to a disabled delivery partner account.");
        }

        DeliveryPartnerProfile profile = profileRepository.findByUserId(partnerUser.getId()).orElse(null);
        if (profile != null && "INACTIVE".equalsIgnoreCase(profile.getStatus())) {
            throw new BusinessException("Cannot assign order to an inactive delivery partner.");
        }

        order.setDeliveryPartnerId(partnerUser.getId());
        order.setAssignedAt(LocalDateTime.now());
        if (request.getDeliveryNotes() != null && !request.getDeliveryNotes().isBlank()) {
            order.setDeliveryNotes(request.getDeliveryNotes().trim());
        }

        Order saved = orderRepository.save(order);

        auditService.logEvent(
                "ORDER_ASSIGNED_TO_DELIVERY_PARTNER",
                adminEmail,
                "Admin assigned Order #" + order.getOrderNumber() + " to delivery partner " + partnerUser.getFullName() + " (" + partnerUser.getEmail() + ")",
                ipAddress
        );

        return shopkeeperService.mapToOrderDto(saved);
    }

    @Transactional(readOnly = true)
    public AdminDeliveryAnalyticsDTO getDeliveryAnalytics() {
        List<User> partnerUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.DELIVERY_PARTNER && u.getDeletedAt() == null)
                .toList();

        long totalPartners = partnerUsers.size();
        long activePartners = partnerUsers.stream().filter(User::isEnabled).count();
        long inactivePartners = totalPartners - activePartners;

        List<Order> allOrders = orderRepository.findAll();

        long ordersAwaitingAssignment = allOrders.stream()
                .filter(o -> o.getDeliveryPartnerId() == null &&
                        (o.getOrderStatus() == OrderStatus.CONFIRMED ||
                         o.getOrderStatus() == OrderStatus.PREPARING ||
                         o.getOrderStatus() == OrderStatus.READY))
                .count();

        long ordersOutForDelivery = allOrders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.OUT_FOR_DELIVERY)
                .count();

        LocalDate today = LocalDate.now();
        long deliveriesCompletedToday = allOrders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.DELIVERED || o.getOrderStatus() == OrderStatus.COMPLETED)
                .filter(o -> (o.getDeliveredAt() != null && o.getDeliveredAt().toLocalDate().isEqual(today))
                        || (o.getDeliveredAt() == null && o.getUpdatedAt() != null && o.getUpdatedAt().toLocalDate().isEqual(today)))
                .count();

        long failedDeliveries = allOrders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.DELIVERY_FAILED)
                .count();

        return AdminDeliveryAnalyticsDTO.builder()
                .totalPartners(totalPartners)
                .activePartners(activePartners)
                .inactivePartners(inactivePartners)
                .ordersAwaitingAssignment(ordersAwaitingAssignment)
                .ordersOutForDelivery(ordersOutForDelivery)
                .deliveriesCompletedToday(deliveriesCompletedToday)
                .failedDeliveries(failedDeliveries)
                .build();
    }

    private DeliveryPartnerDTO mapToPartnerDto(User user, DeliveryPartnerProfile profile, long activeCount, long completedCount) {
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
                .status(profile != null ? profile.getStatus() : (user.isEnabled() ? "ACTIVE" : "INACTIVE"))
                .enabled(user.isEnabled())
                .avatarUrl(user.getAvatarUrl())
                .activeDeliveriesCount(activeCount)
                .completedDeliveriesCount(completedCount)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
