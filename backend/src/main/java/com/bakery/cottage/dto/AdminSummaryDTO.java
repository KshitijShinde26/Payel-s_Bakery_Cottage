package com.bakery.cottage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSummaryDTO {
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private BigDecimal monthlyRevenue;
    private long totalOrders;
    private long pendingOrders;
    private long preparingOrders;
    private long readyOrders;
    private long outForDeliveryOrders;
    private long completedOrders;
    private long cancelledOrders;
    private long pendingPayments;
    private long totalUsers;
    private long totalCustomers;
    private long totalShopkeepers;
    private long totalAdmins;
    private long pendingCustomCakes;
    private long totalCustomCakes;
    private List<DailySalesDTO> weeklySales;
}
