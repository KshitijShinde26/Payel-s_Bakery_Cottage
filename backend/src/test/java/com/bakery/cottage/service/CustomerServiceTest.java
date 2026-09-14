package com.bakery.cottage.service;

import com.bakery.cottage.dto.DeliveryOtpResponseDTO;
import com.bakery.cottage.entity.Order;
import com.bakery.cottage.entity.OrderStatus;
import com.bakery.cottage.entity.PaymentStatus;
import com.bakery.cottage.exception.BusinessException;
import com.bakery.cottage.exception.ResourceNotFoundException;
import com.bakery.cottage.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CustomCakeRequestRepository customCakeRequestRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ProductService productService;

    @Mock
    private ShopkeeperService shopkeeperService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private CustomerService customerService;

    private Order customerOrder;

    @BeforeEach
    void setUp() {
        customerOrder = Order.builder()
                .id("order-cust-1")
                .orderNumber("PBC-5001")
                .userId("customer-user-1")
                .customerName("Alice Customer")
                .customerEmail("alice@example.com")
                .customerPhone("9876543210")
                .grandTotal(BigDecimal.valueOf(1200.00))
                .orderStatus(OrderStatus.OUT_FOR_DELIVERY)
                .paymentStatus(PaymentStatus.PAID)
                .deliveryOtp("654321")
                .deliveryOtpExpiresAt(LocalDateTime.now().plusMinutes(30))
                .deliveryOtpUsed(false)
                .deliveryOtpAttempts(0)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Customer can retrieve OTP for their own OUT_FOR_DELIVERY order")
    void testGetDeliveryHandoverOtpSuccess() {
        when(orderRepository.findByIdAndUserId("order-cust-1", "customer-user-1"))
                .thenReturn(Optional.of(customerOrder));

        DeliveryOtpResponseDTO response = customerService.getDeliveryHandoverOtp("customer-user-1", "order-cust-1");

        assertNotNull(response);
        assertEquals("654321", response.getDeliveryOtp());
        assertEquals("PBC-5001", response.getOrderNumber());
        assertFalse(response.isExpired());
        assertFalse(response.isUsed());
        assertEquals(0, response.getAttempts());
    }

    @Test
    @DisplayName("Customer B cannot access Customer A's delivery OTP (Strict ownership check)")
    void testCustomerOwnershipIsolation() {
        when(orderRepository.findByIdAndUserId("order-cust-1", "customer-user-2"))
                .thenReturn(Optional.empty());
        when(orderRepository.findByOrderNumberAndUserId("order-cust-1", "customer-user-2"))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            customerService.getDeliveryHandoverOtp("customer-user-2", "order-cust-1");
        });
    }

    @Test
    @DisplayName("OTP cannot be accessed before OUT_FOR_DELIVERY (e.g. when PREPARING or READY)")
    void testOtpNotAccessibleBeforeOutForDelivery() {
        customerOrder.setOrderStatus(OrderStatus.READY);
        when(orderRepository.findByIdAndUserId("order-cust-1", "customer-user-1"))
                .thenReturn(Optional.of(customerOrder));

        BusinessException ex = assertThrows(BusinessException.class, () -> {
            customerService.getDeliveryHandoverOtp("customer-user-1", "order-cust-1");
        });
        assertTrue(ex.getMessage().contains("Delivery OTP will be available when your order is out for delivery"));
    }

    @Test
    @DisplayName("Delivered order marks OTP as used and hides active code")
    void testDeliveredOrderHidesActiveOtp() {
        customerOrder.setOrderStatus(OrderStatus.DELIVERED);
        customerOrder.setDeliveryOtpUsed(true);
        when(orderRepository.findByIdAndUserId("order-cust-1", "customer-user-1"))
                .thenReturn(Optional.of(customerOrder));

        DeliveryOtpResponseDTO response = customerService.getDeliveryHandoverOtp("customer-user-1", "order-cust-1");

        assertNotNull(response);
        assertNull(response.getDeliveryOtp());
        assertTrue(response.isUsed());
    }

    @Test
    @DisplayName("Refreshing dashboard does not change the active OTP")
    void testRefreshDoesNotChangeOtp() {
        when(orderRepository.findByIdAndUserId("order-cust-1", "customer-user-1"))
                .thenReturn(Optional.of(customerOrder));

        DeliveryOtpResponseDTO firstCall = customerService.getDeliveryHandoverOtp("customer-user-1", "order-cust-1");
        DeliveryOtpResponseDTO secondCall = customerService.getDeliveryHandoverOtp("customer-user-1", "order-cust-1");

        assertEquals(firstCall.getDeliveryOtp(), secondCall.getDeliveryOtp());
        assertEquals("654321", secondCall.getDeliveryOtp());
    }

    @Test
    @DisplayName("Customer can regenerate OTP when OUT_FOR_DELIVERY")
    void testRegenerateDeliveryOtp() {
        when(orderRepository.findByIdAndUserId("order-cust-1", "customer-user-1"))
                .thenReturn(Optional.of(customerOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        DeliveryOtpResponseDTO regenerated = customerService.regenerateDeliveryOtp("customer-user-1", "order-cust-1", "127.0.0.1");

        assertNotNull(regenerated);
        assertNotNull(regenerated.getDeliveryOtp());
        assertEquals(6, regenerated.getDeliveryOtp().length());
        assertFalse(regenerated.isExpired());
        assertFalse(regenerated.isUsed());
        assertEquals(0, regenerated.getAttempts());
        verify(auditService, times(1)).logEvent(eq("DELIVERY_OTP_REGENERATED"), any(), any(), any());
    }
}
