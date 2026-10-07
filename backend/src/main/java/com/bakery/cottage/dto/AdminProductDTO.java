package com.bakery.cottage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProductDTO {
    private String id;
    private String name;
    private String category;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String description;
    private String shortDescription;
    private String imageUrl;
    private boolean eggless;
    private boolean available;
    private boolean bestseller;
    private boolean featured;
    private int stockQuantity;
    private String shelfLife;
    private double rating;
    private int reviewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
