package com.bakery.cottage.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "short_description", nullable = false, length = 500)
    private String shortDescription;

    @Column(nullable = false, length = 500)
    private String image;

    @Column(columnDefinition = "TEXT")
    private String gallery; // JSON Array of URLs

    @Column(name = "is_eggless", nullable = false)
    @Builder.Default
    private boolean eggless = true;

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private boolean available = true;

    @Column(name = "is_bestseller", nullable = false)
    @Builder.Default
    private boolean bestseller = false;

    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    private boolean featured = false;

    @Column(name = "shelf_life", length = 100)
    private String shelfLife;

    @Column(columnDefinition = "TEXT")
    private String allergens; // JSON Array of allergens

    @Column(columnDefinition = "TEXT")
    private String ingredients; // JSON Array of ingredients

    @Column(name = "weight_options", columnDefinition = "TEXT")
    private String weightOptions; // JSON Array of weight options

    @Column(name = "min_lead_time_hours", nullable = false)
    @Builder.Default
    private Integer minLeadTimeHours = 24;

    @Column(nullable = false)
    @Builder.Default
    private Double rating = 5.0;

    @Column(name = "review_count", nullable = false)
    @Builder.Default
    private Integer reviewCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null || id.isBlank()) {
            id = "prod-" + java.util.UUID.randomUUID().toString().substring(0, 8);
        }
    }
}
