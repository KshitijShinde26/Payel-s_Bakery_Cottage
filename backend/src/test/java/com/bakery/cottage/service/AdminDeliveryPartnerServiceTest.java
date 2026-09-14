package com.bakery.cottage.service;

import com.bakery.cottage.dto.*;
import com.bakery.cottage.entity.*;
import com.bakery.cottage.exception.BusinessException;
import com.bakery.cottage.exception.DuplicateResourceException;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminDeliveryPartnerServiceTest {

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
    private AdminDeliveryPartnerService adminDeliveryPartnerService;

    private User partnerUser;
    private DeliveryPartnerProfile partnerProfile;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        partnerUser = User.builder()
                .id("partner-user-1")
                .fullName("Amit Delivery")
                .email("amit@bakerycottage.com")
                .phoneNumber("9123456780")
                .password("encoded_pass")
                .role(Role.DELIVERY_PARTNER)
                .emailVerified(true)
                .enabled(true)
                .build();

        partnerProfile = DeliveryPartnerProfile.builder()
                .id("profile-1")
                .user(partnerUser)
                .serviceArea("North Zone")
                .status("ACTIVE")
                .build();

        testOrder = Order.builder()
                .id("order-1")
                .orderNumber("PBC-5001")
                .orderStatus(OrderStatus.READY)
                .build();
    }

    @Test
    @DisplayName("Admin creates delivery partner with BCrypt hashed password")
    void testCreateDeliveryPartner() {
        CreateDeliveryPartnerRequest req = CreateDeliveryPartnerRequest.builder()
                .fullName("Amit Delivery")
                .email("amit@bakerycottage.com")
                .phoneNumber("9123456780")
                .password("tempPass@123")
                .serviceArea("North Zone")
                .vehicleType("Scooter")
                .vehicleNumber("MH-02-XY-9876")
                .build();

        when(userRepository.existsByEmail("amit@bakerycottage.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("9123456780")).thenReturn(false);
        when(passwordEncoder.encode("tempPass@123")).thenReturn("bcrypt_hash");
        when(userRepository.save(any(User.class))).thenReturn(partnerUser);
        when(profileRepository.save(any(DeliveryPartnerProfile.class))).thenReturn(partnerProfile);

        DeliveryPartnerDTO dto = adminDeliveryPartnerService.createDeliveryPartner(req, "admin@bakerycottage.com", "127.0.0.1");

        assertNotNull(dto);
        assertEquals("Amit Delivery", dto.getFullName());
        assertEquals("amit@bakerycottage.com", dto.getEmail());
        verify(passwordEncoder).encode("tempPass@123");
        verify(auditService).logEvent(eq("DELIVERY_PARTNER_CREATED"), eq("admin@bakerycottage.com"), anyString(), eq("127.0.0.1"));
    }

    @Test
    @DisplayName("Duplicate email throws DuplicateResourceException")
    void testCreateDuplicateEmailFails() {
        CreateDeliveryPartnerRequest req = CreateDeliveryPartnerRequest.builder()
                .fullName("Amit Delivery")
                .email("amit@bakerycottage.com")
                .phoneNumber("9123456780")
                .password("tempPass@123")
                .serviceArea("North Zone")
                .build();

        when(userRepository.existsByEmail("amit@bakerycottage.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> {
            adminDeliveryPartnerService.createDeliveryPartner(req, "admin@bakerycottage.com", "127.0.0.1");
        });
    }

    @Test
    @DisplayName("Admin assigns order to active delivery partner successfully")
    void testAssignOrderSuccess() {
        when(orderRepository.findById("order-1")).thenReturn(Optional.of(testOrder));
        when(userRepository.findById("partner-user-1")).thenReturn(Optional.of(partnerUser));
        when(profileRepository.findByUserId("partner-user-1")).thenReturn(Optional.of(partnerProfile));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
        when(shopkeeperService.mapToOrderDto(any(Order.class))).thenReturn(OrderDTO.builder()
                .id("order-1")
                .deliveryPartnerId("partner-user-1")
                .build());

        AssignDeliveryPartnerRequest req = AssignDeliveryPartnerRequest.builder()
                .deliveryPartnerId("partner-user-1")
                .deliveryNotes("Handle delicate custom cake with care")
                .build();

        OrderDTO result = adminDeliveryPartnerService.assignOrderToDeliveryPartner("order-1", req, "admin@bakerycottage.com", "127.0.0.1");

        assertNotNull(result);
        assertEquals("partner-user-1", testOrder.getDeliveryPartnerId());
        assertEquals("Handle delicate custom cake with care", testOrder.getDeliveryNotes());
        assertNotNull(testOrder.getAssignedAt());
        verify(auditService).logEvent(eq("ORDER_ASSIGNED_TO_DELIVERY_PARTNER"), eq("admin@bakerycottage.com"), anyString(), eq("127.0.0.1"));
    }

    @Test
    @DisplayName("Admin cannot assign order to disabled partner")
    void testAssignToDisabledPartnerFails() {
        partnerUser.setEnabled(false);
        when(orderRepository.findById("order-1")).thenReturn(Optional.of(testOrder));
        when(userRepository.findById("partner-user-1")).thenReturn(Optional.of(partnerUser));

        AssignDeliveryPartnerRequest req = AssignDeliveryPartnerRequest.builder()
                .deliveryPartnerId("partner-user-1")
                .build();

        assertThrows(BusinessException.class, () -> {
            adminDeliveryPartnerService.assignOrderToDeliveryPartner("order-1", req, "admin@bakerycottage.com", "127.0.0.1");
        });
    }

    @Test
    @DisplayName("Analytics calculates real operational metrics")
    void testGetDeliveryAnalytics() {
        when(userRepository.findAll()).thenReturn(List.of(partnerUser));
        when(orderRepository.findAll()).thenReturn(List.of(testOrder));

        AdminDeliveryAnalyticsDTO analytics = adminDeliveryPartnerService.getDeliveryAnalytics();

        assertNotNull(analytics);
        assertEquals(1, analytics.getTotalPartners());
        assertEquals(1, analytics.getActivePartners());
        assertEquals(0, analytics.getInactivePartners());
        assertEquals(1, analytics.getOrdersAwaitingAssignment()); // testOrder has no partner and status is READY
        assertEquals(0, analytics.getOrdersOutForDelivery());
        assertEquals(0, analytics.getDeliveriesCompletedToday());
    }
}
