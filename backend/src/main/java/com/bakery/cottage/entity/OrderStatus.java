package com.bakery.cottage.entity;

public enum OrderStatus {
    AWAITING_PAYMENT,
    PAYMENT_VERIFIED,
    CONFIRMED,
    PREPARING,
    READY,
    OUT_FOR_DELIVERY,
    DELIVERED,
    COMPLETED,
    CANCELLED
}
