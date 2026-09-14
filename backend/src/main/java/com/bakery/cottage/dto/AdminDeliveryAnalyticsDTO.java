package com.bakery.cottage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDeliveryAnalyticsDTO {
    private long totalPartners;
    private long activePartners;
    private long inactivePartners;
    private long ordersAwaitingAssignment;
    private long ordersOutForDelivery;
    private long deliveriesCompletedToday;
    private long failedDeliveries;
}
