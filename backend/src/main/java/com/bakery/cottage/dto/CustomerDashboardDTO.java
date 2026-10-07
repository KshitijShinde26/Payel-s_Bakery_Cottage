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
public class CustomerDashboardDTO {

    private String customerId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String avatarUrl;
    private String memberSince;

    private long totalOrdersCount;
    private long activeOrdersCount;
    private long completedOrdersCount;
    private long customCakesCount;
    private long pendingCustomCakesCount;
    private long pendingPaymentsCount;

    private List<OrderDTO> recentOrders;
    private List<CustomCakeRequestDTO> recentCustomCakes;
    private List<ProductDTO> featuredProducts;
    private List<ProductDTO> bestSellers;
}
