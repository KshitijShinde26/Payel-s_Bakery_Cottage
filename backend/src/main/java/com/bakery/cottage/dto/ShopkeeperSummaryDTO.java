package com.bakery.cottage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopkeeperSummaryDTO {
    private long totalProducts;
    private long availableProducts;
    private long totalOrders;
    private long pendingOrders;
    private long preparingOrders;
    private long readyOrders;
    private long outForDeliveryOrders;
    private long completedOrders;
    private long pendingPayments;
    private long pendingCustomCakes;
    private long totalCustomCakes;
    private long todayOrders;
}
