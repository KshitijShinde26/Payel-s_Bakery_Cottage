package com.bakery.cottage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {
    private String id;
    private String name;
    private String category;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String description;
    private String shortDescription;
    private String image;
    private List<String> gallery;
    private boolean isEggless;
    private boolean isAvailable;
    private boolean isBestseller;
    private boolean isFeatured;
    private String shelfLife;
    private List<String> allergens;
    private List<String> ingredients;
    private List<String> weightOptions;
    private Integer minLeadTimeHours;
    private Double rating;
    private Integer reviewCount;
}
