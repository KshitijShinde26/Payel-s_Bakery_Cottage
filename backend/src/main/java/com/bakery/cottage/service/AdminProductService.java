package com.bakery.cottage.service;

import com.bakery.cottage.dto.AdminProductDTO;
import com.bakery.cottage.dto.CreateProductRequest;
import com.bakery.cottage.dto.UpdateProductRequest;
import com.bakery.cottage.entity.Product;
import com.bakery.cottage.exception.ResourceNotFoundException;
import com.bakery.cottage.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminProductService {

    private final ProductRepository productRepository;
    private final AuditService auditService;

    public AdminProductService(ProductRepository productRepository, AuditService auditService) {
        this.productRepository = productRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<AdminProductDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminProductDTO getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToDto(product);
    }

    @Transactional
    public AdminProductDTO createProduct(CreateProductRequest request, String adminEmail, String ipAddress) {
        Product product = Product.builder()
                .name(request.getName())
                .category(request.getCategory())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .imageUrl(request.getImageUrl())
                .eggless(request.isEggless())
                .available(request.isAvailable())
                .bestseller(request.isBestseller())
                .featured(request.isFeatured())
                .stockQuantity(request.getStockQuantity())
                .shelfLife(request.getShelfLife())
                .build();

        Product saved = productRepository.save(product);

        auditService.logEvent(
                "ADMIN_PRODUCT_CREATED",
                adminEmail,
                "Admin created new product: " + saved.getName() + " (ID: " + saved.getId() + ") with stock: " + saved.getStockQuantity(),
                ipAddress
        );

        return mapToDto(saved);
    }

    @Transactional
    public AdminProductDTO updateProduct(String id, UpdateProductRequest request, String adminEmail, String ipAddress) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setName(request.getName());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setDescription(request.getDescription());
        product.setShortDescription(request.getShortDescription());
        product.setImageUrl(request.getImageUrl());
        if (request.getEggless() != null) product.setEggless(request.getEggless());
        if (request.getAvailable() != null) product.setAvailable(request.getAvailable());
        if (request.getBestseller() != null) product.setBestseller(request.getBestseller());
        if (request.getFeatured() != null) product.setFeatured(request.getFeatured());
        if (request.getStockQuantity() != null) product.setStockQuantity(request.getStockQuantity());
        if (request.getShelfLife() != null) product.setShelfLife(request.getShelfLife());

        Product updated = productRepository.save(product);

        auditService.logEvent(
                "ADMIN_PRODUCT_UPDATED",
                adminEmail,
                "Admin updated product: " + updated.getName() + " (ID: " + updated.getId() + ") new stock: " + updated.getStockQuantity(),
                ipAddress
        );

        return mapToDto(updated);
    }

    @Transactional
    public void deleteProduct(String id, String adminEmail, String ipAddress) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        productRepository.delete(product);

        auditService.logEvent(
                "ADMIN_PRODUCT_DELETED",
                adminEmail,
                "Admin deleted product: " + product.getName() + " (ID: " + product.getId() + ")",
                ipAddress
        );
    }

    private AdminProductDTO mapToDto(Product product) {
        return AdminProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .category(product.getCategory())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .description(product.getDescription())
                .shortDescription(product.getShortDescription())
                .imageUrl(product.getImageUrl())
                .eggless(product.isEggless())
                .available(product.isAvailable())
                .bestseller(product.isBestseller())
                .featured(product.isFeatured())
                .stockQuantity(product.getStockQuantity())
                .shelfLife(product.getShelfLife())
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
