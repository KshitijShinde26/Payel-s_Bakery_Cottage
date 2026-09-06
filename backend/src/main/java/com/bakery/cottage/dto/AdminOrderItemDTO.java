package com.bakery.cottage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminOrderItemDTO {
    private String id;
    private String productId;
    private String productName;
    private String productImage;
    private String category;
    private String weightOption;
    private BigDecimal unitPrice;
    private int quantity;
    private BigDecimal subtotal;
}
