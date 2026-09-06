package com.bakery.cottage.service;

import com.bakery.cottage.dto.AdminProductDTO;
import com.bakery.cottage.dto.CreateProductRequest;
import com.bakery.cottage.dto.UpdateProductRequest;
import com.bakery.cottage.entity.Product;
import com.bakery.cottage.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminProductServiceTest {

    @Mock private ProductRepository productRepository;
    @Mock private AuditService auditService;

    @InjectMocks
    private AdminProductService adminProductService;

    @Test
    void createProduct_SavesAndReturnsDTO() {
        CreateProductRequest req = CreateProductRequest.builder()
                .name("Red Velvet Cake")
                .category("Cakes")
                .price(BigDecimal.valueOf(850.00))
                .stockQuantity(15)
                .build();

        Product saved = Product.builder()
                .id("prod-1")
                .name("Red Velvet Cake")
                .category("Cakes")
                .price(BigDecimal.valueOf(850.00))
                .stockQuantity(15)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(productRepository.save(any(Product.class))).thenReturn(saved);

        AdminProductDTO result = adminProductService.createProduct(req, "admin@bakery.com", "127.0.0.1");

        assertNotNull(result);
        assertEquals("Red Velvet Cake", result.getName());
        assertEquals(15, result.getStockQuantity());
        verify(auditService).logEvent(eq("ADMIN_PRODUCT_CREATED"), anyString(), anyString(), anyString());
    }

    @Test
    void updateProduct_UpdatesFieldsAndReturnsDTO() {
        Product existing = Product.builder()
                .id("prod-1")
                .name("Red Velvet Cake")
                .category("Cakes")
                .price(BigDecimal.valueOf(850.00))
                .stockQuantity(15)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        UpdateProductRequest updateReq = UpdateProductRequest.builder()
                .name("Updated Cake")
                .category("Cakes")
                .price(BigDecimal.valueOf(900.00))
                .stockQuantity(25)
                .build();

        when(productRepository.findById("prod-1")).thenReturn(Optional.of(existing));
        when(productRepository.save(any(Product.class))).thenReturn(existing);

        AdminProductDTO result = adminProductService.updateProduct("prod-1", updateReq, "admin@bakery.com", "127.0.0.1");

        assertNotNull(result);
        assertEquals(25, result.getStockQuantity());
        verify(auditService).logEvent(eq("ADMIN_PRODUCT_UPDATED"), anyString(), anyString(), anyString());
    }
}
