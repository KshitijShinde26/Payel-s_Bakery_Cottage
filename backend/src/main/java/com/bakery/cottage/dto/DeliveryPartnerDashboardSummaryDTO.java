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
public class DeliveryPartnerDashboardSummaryDTO {
    private long assignedDeliveries;
    private long pickupsPending;
    private long outForDelivery;
    private long deliveredToday;
    private long failedDeliveries;
    private List<OrderDTO> todayOrders;
    private DeliveryPartnerDTO partnerProfile;
}
