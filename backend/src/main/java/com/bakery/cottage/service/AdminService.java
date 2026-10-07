package com.bakery.cottage.service;

import com.bakery.cottage.dto.*;
import com.bakery.cottage.entity.*;
import com.bakery.cottage.exception.ResourceNotFoundException;
import com.bakery.cottage.mapper.UserMapper;
import com.bakery.cottage.repository.AuditLogRepository;
import com.bakery.cottage.repository.CustomCakeRequestRepository;
import com.bakery.cottage.repository.OrderRepository;
import com.bakery.cottage.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final CustomCakeRequestRepository customCakeRequestRepository;
    private final AuditLogRepository auditLogRepository;
    private final ShopkeeperService shopkeeperService;
    private final AuditService auditService;
    private final UserMapper userMapper;

    public AdminService(
            UserRepository userRepository,
            OrderRepository orderRepository,
            CustomCakeRequestRepository customCakeRequestRepository,
            AuditLogRepository auditLogRepository,
            ShopkeeperService shopkeeperService,
            AuditService auditService,
            UserMapper userMapper) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.customCakeRequestRepository = customCakeRequestRepository;
        this.auditLogRepository = auditLogRepository;
        this.shopkeeperService = shopkeeperService;
        this.auditService = auditService;
        this.userMapper = userMapper;
    }

    @Transactional(readOnly = true)
    public AdminSummaryDTO getAdminSummary() {
        List<Order> allOrders = orderRepository.findAllByOrderByCreatedAtDesc();
        List<User> allUsers = userRepository.findAll().stream()
                .filter(u -> u.getDeletedAt() == null)
                .toList();
        List<CustomCakeRequestEntity> allCakes = customCakeRequestRepository.findAllByOrderByCreatedAtDesc();

        LocalDate today = LocalDate.now();
        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal todayRevenue = BigDecimal.ZERO;
        BigDecimal monthlyRevenue = BigDecimal.ZERO;

        long pendingOrders = 0;
        long preparingOrders = 0;
        long readyOrders = 0;
        long outForDeliveryOrders = 0;
        long completedOrders = 0;
        long cancelledOrders = 0;
        long pendingPayments = 0;

        for (Order order : allOrders) {
            BigDecimal orderTotal = order.getGrandTotal() != null ? order.getGrandTotal() : BigDecimal.ZERO;

            if (order.getOrderStatus() != OrderStatus.CANCELLED) {
                totalRevenue = totalRevenue.add(orderTotal);

                if (order.getCreatedAt() != null) {
                    LocalDate orderDate = order.getCreatedAt().toLocalDate();
                    if (orderDate.isEqual(today)) {
                        todayRevenue = todayRevenue.add(orderTotal);
                    }
                    if (orderDate.getMonthValue() == currentMonth && orderDate.getYear() == currentYear) {
                        monthlyRevenue = monthlyRevenue.add(orderTotal);
                    }
                }
            }

            if (order.getOrderStatus() == OrderStatus.AWAITING_PAYMENT || order.getOrderStatus() == OrderStatus.CONFIRMED) {
                pendingOrders++;
            } else if (order.getOrderStatus() == OrderStatus.PREPARING) {
                preparingOrders++;
            } else if (order.getOrderStatus() == OrderStatus.READY) {
                readyOrders++;
            } else if (order.getOrderStatus() == OrderStatus.OUT_FOR_DELIVERY) {
                outForDeliveryOrders++;
            } else if (order.getOrderStatus() == OrderStatus.DELIVERED || order.getOrderStatus() == OrderStatus.COMPLETED) {
                completedOrders++;
            } else if (order.getOrderStatus() == OrderStatus.CANCELLED) {
                cancelledOrders++;
            }

            if (order.getPaymentStatus() == PaymentStatus.PENDING) {
                pendingPayments++;
            }
        }

        long totalCustomers = allUsers.stream().filter(u -> u.getRole() == Role.CUSTOMER).count();
        long totalShopkeepers = allUsers.stream().filter(u -> u.getRole() == Role.SHOPKEEPER).count();
        long totalAdmins = allUsers.stream().filter(u -> u.getRole() == Role.ADMIN).count();

        long pendingCustomCakes = allCakes.stream()
                .filter(c -> c.getStatus() == CustomCakeStatus.PENDING_REVIEW || c.getStatus() == CustomCakeStatus.UNDER_REVIEW)
                .count();

        // 7-day sales breakdown
        List<DailySalesDTO> weeklySales = new ArrayList<>();
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("EEE");
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (int i = 6; i >= 0; i--) {
            LocalDate targetDate = today.minusDays(i);
            String dayName = targetDate.format(dayFormatter);
            String dateStr = targetDate.format(dateFormatter);

            BigDecimal dayAmount = BigDecimal.ZERO;
            long dayOrderCount = 0;

            for (Order o : allOrders) {
                if (o.getCreatedAt() != null && o.getCreatedAt().toLocalDate().isEqual(targetDate)) {
                    if (o.getOrderStatus() != OrderStatus.CANCELLED) {
                        dayAmount = dayAmount.add(o.getGrandTotal() != null ? o.getGrandTotal() : BigDecimal.ZERO);
                        dayOrderCount++;
                    }
                }
            }

            weeklySales.add(DailySalesDTO.builder()
                    .date(dateStr)
                    .day(dayName)
                    .amount(dayAmount)
                    .orderCount(dayOrderCount)
                    .build());
        }

        return AdminSummaryDTO.builder()
                .totalRevenue(totalRevenue)
                .todayRevenue(todayRevenue)
                .monthlyRevenue(monthlyRevenue)
                .totalOrders(allOrders.size())
                .pendingOrders(pendingOrders)
                .preparingOrders(preparingOrders)
                .readyOrders(readyOrders)
                .outForDeliveryOrders(outForDeliveryOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .pendingPayments(pendingPayments)
                .totalUsers(allUsers.size())
                .totalCustomers(totalCustomers)
                .totalShopkeepers(totalShopkeepers)
                .totalAdmins(totalAdmins)
                .pendingCustomCakes(pendingCustomCakes)
                .totalCustomCakes(allCakes.size())
                .weeklySales(weeklySales)
                .build();
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers(Role role, String search) {
        return userRepository.findAll().stream()
                .filter(u -> u.getDeletedAt() == null)
                .filter(u -> role == null || u.getRole() == role)
                .filter(u -> {
                    if (search == null || search.isBlank()) return true;
                    String q = search.toLowerCase().trim();
                    boolean matchName = u.getFullName() != null && u.getFullName().toLowerCase().contains(q);
                    boolean matchEmail = u.getEmail() != null && u.getEmail().toLowerCase().contains(q);
                    boolean matchPhone = u.getPhoneNumber() != null && u.getPhoneNumber().contains(q);
                    return matchName || matchEmail || matchPhone;
                })
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO updateUserStatus(String userId, boolean enabled, String adminEmail, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getEmail().equalsIgnoreCase(adminEmail) && !enabled) {
            throw new IllegalArgumentException("Administrators cannot disable their own active account.");
        }

        user.setEnabled(enabled);
        User saved = userRepository.save(user);

        auditService.logEvent("ADMIN_USER_STATUS_CHANGE", adminEmail,
                "Updated account status of user [" + user.getEmail() + "] to enabled=" + enabled, ipAddress);

        return userMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders(OrderStatus status) {
        return shopkeeperService.getActiveOrders(status);
    }

    @Transactional
    public OrderDTO updateOrderStatus(String orderId, UpdateOrderStatusRequest request, String adminEmail, String ipAddress) {
        OrderDTO updated = shopkeeperService.updateOrderStatus(orderId, request);
        auditService.logEvent("ADMIN_ORDER_STATUS_UPDATE", adminEmail,
                "Admin updated Order #" + updated.getOrderNumber() + " status to " + request.getStatus(), ipAddress);
        return updated;
    }

    @Transactional(readOnly = true)
    public List<CustomCakeRequestDTO> getAllCustomCakes(CustomCakeStatus status) {
        return shopkeeperService.getCustomCakeRequests(status);
    }

    @Transactional
    public CustomCakeRequestDTO reviewCustomCake(String id, ShopkeeperCustomCakeReviewRequest request, String adminEmail, String ipAddress) {
        CustomCakeRequestDTO reviewed = shopkeeperService.reviewCustomCakeRequest(id, request);
        auditService.logEvent("ADMIN_CUSTOM_CAKE_REVIEW", adminEmail,
                "Admin reviewed Custom Cake #" + id.substring(0, Math.min(id.length(), 8)) + " with status " + request.getStatus(), ipAddress);
        return reviewed;
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
