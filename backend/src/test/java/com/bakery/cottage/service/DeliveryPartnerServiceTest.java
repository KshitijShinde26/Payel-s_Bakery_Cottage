package com.bakery.cottage.service;

import com.bakery.cottage.dto.*;
import com.bakery.cottage.entity.*;
import com.bakery.cottage.exception.BusinessException;
import com.bakery.cottage.exception.ResourceNotFoundException;
import com.bakery.cottage.repository.DeliveryPartnerProfileRepository;
import com.bakery.cottage.repository.OrderRepository;
import com.bakery.cottage.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeliveryPartnerServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DeliveryPartnerProfileRepository profileRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditService auditService;

    @Mock
    private ShopkeeperService shopkeeperService;

    @InjectMocks
    private DeliveryPartnerService deliveryPartnerService;

    private User partnerUser;
    private DeliveryPartnerProfile partnerProfile;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        partnerUser = User.builder()
                .id("partner-user-1")
                .fullName("Rajesh Delivery")
                .email("rajesh.delivery@bakerycottage.com")
                .phoneNumber("9876543210")
                .password("encoded_pass")
                .role(Role.DELIVERY_PARTNER)
                .emailVerified(true)
                .enabled(true)
                .build();

        partnerProfile = DeliveryPartnerProfile.builder()
                .id("profile-1")
                .user(partnerUser)
                .serviceArea("South Mumbai")
                .vehicleType("Motorcycle")
                .vehicleNumber("MH-01-AB-1234")
                .status("ACTIVE")
                .build();

        testOrder = Order.builder()
                .id("order-1")
                .orderNumber("PBC-1001")
                .customerName("John Doe")
                .customerPhone("9876500000")
                .grandTotal(BigDecimal.valueOf(850.00))
                .orderStatus(OrderStatus.READY)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod("CASH_ON_DELIVERY")
                .deliveryPartnerId("partner-user-1")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Dashboard Summary aggregates real database stats with zero fake data")
    void testGetDashboardSummary() {
        when(userRepository.findById("partner-user-1")).thenReturn(Optional.of(partnerUser));
        when(profileRepository.findByUserId("partner-user-1")).thenReturn(Optional.of(partnerProfile));
        when(orderRepository.findByDeliveryPartnerIdOrderByCreatedAtDesc("partner-user-1")).thenReturn(List.of(testOrder));
        when(shopkeeperService.mapToOrderDto(any(Order.class))).thenReturn(OrderDTO.builder().id("order-1").orderNumber("PBC-1001").build());

        DeliveryPartnerDashboardSummaryDTO summary = deliveryPartnerService.getDashboardSummary("partner-user-1");

        assertNotNull(summary);
        assertEquals(1, summary.getAssignedDeliveries());
        assertEquals(1, summary.getPickupsPending());
        assertEquals(0, summary.getOutForDelivery());
        assertEquals(0, summary.getDeliveredToday());
        assertEquals(0, summary.getFailedDeliveries());
        assertEquals(1, summary.getTodayOrders().size());
        assertEquals("Rajesh Delivery", summary.getPartnerProfile().getFullName());
    }

    @Test
    @DisplayName("Partner can only access orders assigned to their own ID (Server-Side Isolation)")
    void testOwnershipIsolation() {
        when(userRepository.findById("partner-user-1")).thenReturn(Optional.of(partnerUser));
        when(profileRepository.findByUserId("partner-user-1")).thenReturn(Optional.of(partnerProfile));

        Order otherPartnerOrder = Order.builder()
                .id("order-2")
                .deliveryPartnerId("other-partner-99")
                .orderStatus(OrderStatus.READY)
                .build();

        when(orderRepository.findById("order-2")).thenReturn(Optional.of(otherPartnerOrder));

        assertThrows(ResourceNotFoundException.class, () -> {
            deliveryPartnerService.getOrderById("partner-user-1", "order-2");
        });
    }

    @Test
    @DisplayName("startDelivery generates 6-digit OTP and moves order to OUT_FOR_DELIVERY")
    void testStartDeliverySuccess() {
        when(userRepository.findById("partner-user-1")).thenReturn(Optional.of(partnerUser));
        when(profileRepository.findByUserId("partner-user-1")).thenReturn(Optional.of(partnerProfile));
        when(orderRepository.findById("order-1")).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
        when(shopkeeperService.mapToOrderDto(any(Order.class))).thenReturn(OrderDTO.builder()
                .id("order-1")
                .orderStatus(OrderStatus.OUT_FOR_DELIVERY)
                .build());

        OrderDTO result = deliveryPartnerService.startDelivery("partner-user-1", "order-1", "127.0.0.1");

        assertNotNull(result);
        assertEquals(OrderStatus.OUT_FOR_DELIVERY, testOrder.getOrderStatus());
        assertNotNull(testOrder.getDeliveryOtp());
        assertEquals(6, testOrder.getDeliveryOtp().length());
        assertNotNull(testOrder.getOutForDeliveryAt());
    }

    @Test
    @DisplayName("confirmDelivery validates OTP and marks order DELIVERED with timestamp")
    void testConfirmDeliverySuccess() {
        testOrder.setOrderStatus(OrderStatus.OUT_FOR_DELIVERY);
        testOrder.setDeliveryOtp("123456");
        testOrder.setDeliveryOtpExpiresAt(LocalDateTime.now().plusMinutes(30));
        testOrder.setDeliveryOtpUsed(false);
        testOrder.setDeliveryOtpAttempts(0);

        when(userRepository.findById("partner-user-1")).thenReturn(Optional.of(partnerUser));
        when(profileRepository.findByUserId("partner-user-1")).thenReturn(Optional.of(partnerProfile));
        when(orderRepository.findById("order-1")).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
        when(shopkeeperService.mapToOrderDto(any(Order.class))).thenReturn(OrderDTO.builder()
                .id("order-1")
                .orderStatus(OrderStatus.DELIVERED)
                .build());

        OrderDTO result = deliveryPartnerService.confirmDelivery("partner-user-1", "order-1", "123456", "127.0.0.1");

        assertNotNull(result);
        assertEquals(OrderStatus.DELIVERED, testOrder.getOrderStatus());
        assertTrue(testOrder.isDeliveryOtpUsed());
        assertEquals(PaymentStatus.PAID, testOrder.getPaymentStatus()); // COD auto paid
        assertNotNull(testOrder.getDeliveredAt());
    }

    @Test
    @DisplayName("confirmDelivery rejects incorrect OTP and increments attempt count")
    void testConfirmDeliveryWrongOtp() {
        testOrder.setOrderStatus(OrderStatus.OUT_FOR_DELIVERY);
        testOrder.setDeliveryOtp("123456");
        testOrder.setDeliveryOtpExpiresAt(LocalDateTime.now().plusMinutes(30));
        testOrder.setDeliveryOtpUsed(false);
        testOrder.setDeliveryOtpAttempts(0);

        when(userRepository.findById("partner-user-1")).thenReturn(Optional.of(partnerUser));
        when(profileRepository.findByUserId("partner-user-1")).thenReturn(Optional.of(partnerProfile));
        when(orderRepository.findById("order-1")).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        assertThrows(IllegalArgumentException.class, () -> {
            deliveryPartnerService.confirmDelivery("partner-user-1", "order-1", "999999", "127.0.0.1");
        });
        assertEquals(1, testOrder.getDeliveryOtpAttempts());
    }

    @Test
    @DisplayName("confirmDelivery blocks when max OTP attempts exceeded")
    void testConfirmDeliveryMaxAttemptsExceeded() {
        testOrder.setOrderStatus(OrderStatus.OUT_FOR_DELIVERY);
        testOrder.setDeliveryOtp("123456");
        testOrder.setDeliveryOtpAttempts(5);

        when(userRepository.findById("partner-user-1")).thenReturn(Optional.of(partnerUser));
        when(profileRepository.findByUserId("partner-user-1")).thenReturn(Optional.of(partnerProfile));
        when(orderRepository.findById("order-1")).thenReturn(Optional.of(testOrder));

        BusinessException ex = assertThrows(BusinessException.class, () -> {
            deliveryPartnerService.confirmDelivery("partner-user-1", "order-1", "123456", "127.0.0.1");
        });
        assertTrue(ex.getMessage().contains("Maximum delivery OTP verification attempts exceeded"));
    }

    @Test
    @DisplayName("confirmDelivery rejects expired OTP")
    void testConfirmDeliveryExpiredOtp() {
        testOrder.setOrderStatus(OrderStatus.OUT_FOR_DELIVERY);
        testOrder.setDeliveryOtp("123456");
        testOrder.setDeliveryOtpExpiresAt(LocalDateTime.now().minusMinutes(5)); // expired

        when(userRepository.findById("partner-user-1")).thenReturn(Optional.of(partnerUser));
        when(profileRepository.findByUserId("partner-user-1")).thenReturn(Optional.of(partnerProfile));
        when(orderRepository.findById("order-1")).thenReturn(Optional.of(testOrder));

        BusinessException ex = assertThrows(BusinessException.class, () -> {
            deliveryPartnerService.confirmDelivery("partner-user-1", "order-1", "123456", "127.0.0.1");
        });
        assertTrue(ex.getMessage().contains("Delivery OTP has expired"));
    }

    @Test
    @DisplayName("confirmDelivery prevents used OTP from being reused")
    void testConfirmDeliveryUsedOtp() {
        testOrder.setOrderStatus(OrderStatus.OUT_FOR_DELIVERY);
        testOrder.setDeliveryOtp("123456");
        testOrder.setDeliveryOtpUsed(true);

        when(userRepository.findById("partner-user-1")).thenReturn(Optional.of(partnerUser));
        when(profileRepository.findByUserId("partner-user-1")).thenReturn(Optional.of(partnerProfile));
        when(orderRepository.findById("order-1")).thenReturn(Optional.of(testOrder));

        BusinessException ex = assertThrows(BusinessException.class, () -> {
            deliveryPartnerService.confirmDelivery("partner-user-1", "order-1", "123456", "127.0.0.1");
        });
        assertTrue(ex.getMessage().contains("Delivery OTP has already been used"));
    }

    @Test
    @DisplayName("reportDeliveryFailure marks order as DELIVERY_FAILED with reason")
    void testReportDeliveryFailure() {
        testOrder.setOrderStatus(OrderStatus.OUT_FOR_DELIVERY);

        when(userRepository.findById("partner-user-1")).thenReturn(Optional.of(partnerUser));
        when(profileRepository.findByUserId("partner-user-1")).thenReturn(Optional.of(partnerProfile));
        when(orderRepository.findById("order-1")).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
        when(shopkeeperService.mapToOrderDto(any(Order.class))).thenReturn(OrderDTO.builder()
                .id("order-1")
                .orderStatus(OrderStatus.DELIVERY_FAILED)
                .build());

        OrderDTO result = deliveryPartnerService.reportDeliveryFailure(
                "partner-user-1", "order-1", "Customer unavailable", "Called 3 times", "127.0.0.1"
        );

        assertNotNull(result);
        assertEquals(OrderStatus.DELIVERY_FAILED, testOrder.getOrderStatus());
        assertEquals("Customer unavailable", testOrder.getDeliveryFailureReason());
        assertEquals("Called 3 times", testOrder.getDeliveryNotes());
    }

    @Test
    @DisplayName("Disabled partner account is rejected from performing actions")
    void testDisabledPartnerBlocked() {
        partnerUser.setEnabled(false);
        when(userRepository.findById("partner-user-1")).thenReturn(Optional.of(partnerUser));

        assertThrows(BusinessException.class, () -> {
            deliveryPartnerService.getDashboardSummary("partner-user-1");
        });
    }

    @Test
    @DisplayName("changePassword validates current password before updating")
    void testChangePassword() {
        when(userRepository.findById("partner-user-1")).thenReturn(Optional.of(partnerUser));
        when(profileRepository.findByUserId("partner-user-1")).thenReturn(Optional.of(partnerProfile));
        when(passwordEncoder.matches("wrong_pass", "encoded_pass")).thenReturn(false);
        when(passwordEncoder.matches("old_pass", "encoded_pass")).thenReturn(true);
        when(passwordEncoder.encode("new_pass123")).thenReturn("new_encoded_pass");

        ChangePasswordRequest badReq = new ChangePasswordRequest("wrong_pass", "new_pass123");
        assertThrows(BadCredentialsException.class, () -> {
            deliveryPartnerService.changePassword("partner-user-1", badReq, "127.0.0.1");
        });

        ChangePasswordRequest validReq = new ChangePasswordRequest("old_pass", "new_pass123");
        deliveryPartnerService.changePassword("partner-user-1", validReq, "127.0.0.1");
        assertEquals("new_encoded_pass", partnerUser.getPassword());
    }
}
