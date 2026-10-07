package com.bakery.cottage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerPaymentRequest {

    @NotBlank(message = "Order ID is required")
    private String orderId;

    @NotNull(message = "Payment amount is required")
    private BigDecimal amount;

    @NotBlank(message = "Payment method is required (e.g. UPI_QR)")
    private String paymentMethod;

    @NotBlank(message = "Transaction Reference / UTR Number is required")
    private String transactionRef;

    private String receiptImageUrl;
}
