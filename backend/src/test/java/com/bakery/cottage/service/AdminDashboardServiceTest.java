package com.bakery.cottage.service;

import com.bakery.cottage.dto.DashboardStatsDTO;
import com.bakery.cottage.entity.Role;
import com.bakery.cottage.repository.OrderRepository;
import com.bakery.cottage.repository.PaymentRepository;
import com.bakery.cottage.repository.ProductRepository;
import com.bakery.cottage.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminDashboardServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private ProductRepository productRepository;

    @InjectMocks
    private AdminDashboardService adminDashboardService;

    @Test
    void getDashboardStats_CalculatesLiveMetricsCorrectly() {
        when(userRepository.countByRoleAndDeletedAtIsNull(Role.CUSTOMER)).thenReturn(25L);
        when(userRepository.countByRoleAndEnabledTrueAndDeletedAtIsNull(Role.SHOPKEEPER)).thenReturn(3L);
        when(orderRepository.count()).thenReturn(50L);
        when(orderRepository.countByOrderStatusIn(anyList())).thenReturn(8L);
        when(paymentRepository.countByStatus("VERIFICATION_REQUIRED")).thenReturn(2L);
        when(productRepository.countByAvailableTrue()).thenReturn(15L);
        when(orderRepository.sumGrandTotalByPaymentStatusAndCreatedAtBetween(eq(com.bakery.cottage.entity.PaymentStatus.PAID), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(BigDecimal.valueOf(14850.00));

        DashboardStatsDTO stats = adminDashboardService.getDashboardStats();

        assertNotNull(stats);
        assertEquals(25L, stats.getRegisteredCustomers());
        assertEquals(3L, stats.getActiveShopkeepers());
        assertEquals(50L, stats.getTotalOrders());
        assertEquals(8L, stats.getPendingOrders());
        assertEquals(2L, stats.getPendingPaymentVerifications());
        assertEquals(15L, stats.getAvailableProducts());
        assertEquals(14850.00, stats.getTodayRevenue());
        assertNotNull(stats.getWeeklyRevenue());
        assertEquals(7, stats.getWeeklyRevenue().size());
    }
}
