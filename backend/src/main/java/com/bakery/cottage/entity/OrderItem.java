package com.bakery.cottage.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    @Column(name = "product_id", nullable = false, length = 50)
    private String productId;

    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @Column(name = "product_image", length = 500)
    private String productImage;

    @Column(length = 100)
    private String category;

    @Column(name = "weight_option", length = 50)
    private String weightOption;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }
}
