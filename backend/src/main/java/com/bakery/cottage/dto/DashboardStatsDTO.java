package com.bakery.cottage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private double todayRevenue;
    private double monthlyRevenue;
    private long totalOrders;
    private long pendingOrders;
    private long pendingPaymentVerifications;
    private long registeredCustomers;
    private long activeShopkeepers;
    private long activeCoupons;
    private long availableProducts;
    private double revenueGrowthPercentage;
    private List<DailyRevenueDTO> weeklyRevenue;
}
