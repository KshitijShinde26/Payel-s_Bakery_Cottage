package com.bakery.cottage.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Price is required")
    @Min(value = 1, message = "Price must be at least 1")
    private BigDecimal price;

    private BigDecimal originalPrice;

    @NotBlank(message = "Description is required")
    private String description;

    private String shortDescription;

    @NotBlank(message = "Image URL is required")
    private String image;

    private List<String> gallery;

    private Boolean isEggless;

    private Boolean isAvailable;

    private Boolean isBestseller;

    private Boolean isFeatured;

    private String shelfLife;

    private List<String> allergens;

    private List<String> ingredients;

    private List<String> weightOptions;

    private Integer minLeadTimeHours;
}
