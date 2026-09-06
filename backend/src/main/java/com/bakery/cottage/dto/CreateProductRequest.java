package com.bakery.cottage.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
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
public class CreateProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price cannot be negative")
    private BigDecimal price;

    private BigDecimal originalPrice;

    private String description;

    private String shortDescription;

    private String imageUrl;

    @Builder.Default
    private boolean eggless = true;

    @Builder.Default
    private boolean available = true;

    @Builder.Default
    private boolean bestseller = false;

    @Builder.Default
    private boolean featured = false;

    @Min(value = 0, message = "Stock quantity cannot be negative")
    @Builder.Default
    private int stockQuantity = 20;

    private String shelfLife;
}
