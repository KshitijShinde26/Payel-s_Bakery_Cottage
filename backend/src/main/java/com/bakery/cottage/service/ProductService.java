package com.bakery.cottage.service;

import com.bakery.cottage.dto.CategoryDTO;
import com.bakery.cottage.dto.ProductDTO;
import com.bakery.cottage.dto.ProductRequest;
import com.bakery.cottage.entity.Product;
import com.bakery.cottage.exception.ResourceNotFoundException;
import com.bakery.cottage.repository.ProductRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    public ProductService(ProductRepository productRepository, AuditService auditService, ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getProducts(
            String category,
            String search,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean isEggless,
            Boolean isAvailable,
            String sortBy) {

        List<Product> products = productRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc();

        return products.stream()
                .filter(p -> {
                    if (category == null || category.isBlank() || category.equalsIgnoreCase("All")) {
                        return true;
                    }
                    return p.getCategory() != null && p.getCategory().equalsIgnoreCase(category.trim());
                })
                .filter(p -> {
                    if (search == null || search.isBlank()) {
                        return true;
                    }
                    String q = search.toLowerCase().trim();
                    boolean matchName = p.getName() != null && p.getName().toLowerCase().contains(q);
                    boolean matchCategory = p.getCategory() != null && p.getCategory().toLowerCase().contains(q);
                    boolean matchDesc = p.getDescription() != null && p.getDescription().toLowerCase().contains(q);
                    boolean matchShortDesc = p.getShortDescription() != null && p.getShortDescription().toLowerCase().contains(q);
                    return matchName || matchCategory || matchDesc || matchShortDesc;
                })
                .filter(p -> minPrice == null || (p.getPrice() != null && p.getPrice().compareTo(minPrice) >= 0))
                .filter(p -> maxPrice == null || (p.getPrice() != null && p.getPrice().compareTo(maxPrice) <= 0))
                .filter(p -> isEggless == null || p.isEggless() == isEggless)
                .filter(p -> isAvailable == null || p.isAvailable() == isAvailable)
                .sorted((a, b) -> {
                    if ("price-asc".equalsIgnoreCase(sortBy)) {
                        return a.getPrice().compareTo(b.getPrice());
                    } else if ("price-desc".equalsIgnoreCase(sortBy)) {
                        return b.getPrice().compareTo(a.getPrice());
                    } else if ("newest".equalsIgnoreCase(sortBy)) {
                        return b.getCreatedAt().compareTo(a.getCreatedAt());
                    } else {
                        // default: popular (review count / rating)
                        int rComp = Integer.compare(b.getReviewCount(), a.getReviewCount());
                        return rComp != 0 ? rComp : b.getRating().compareTo(a.getRating());
                    }
                })
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDTO getProductById(String id) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToDto(product);
    }

    @Transactional
    public ProductDTO createProduct(ProductRequest request, String adminEmail, String ipAddress) {
        Product product = Product.builder()
                .name(request.getName().trim())
                .category(request.getCategory().trim())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .description(request.getDescription().trim())
                .shortDescription(request.getShortDescription() != null && !request.getShortDescription().isBlank()
                        ? request.getShortDescription().trim()
                        : request.getDescription().substring(0, Math.min(request.getDescription().length(), 120)))
                .image(request.getImage())
                .gallery(toJsonString(request.getGallery()))
                .eggless(request.getIsEggless() != null ? request.getIsEggless() : true)
                .available(request.getIsAvailable() != null ? request.getIsAvailable() : true)
                .bestseller(request.getIsBestseller() != null ? request.getIsBestseller() : false)
                .featured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .shelfLife(request.getShelfLife())
                .allergens(toJsonString(request.getAllergens()))
                .ingredients(toJsonString(request.getIngredients()))
                .weightOptions(toJsonString(request.getWeightOptions() != null ? request.getWeightOptions() : List.of("500g", "1kg", "1.5kg")))
                .minLeadTimeHours(request.getMinLeadTimeHours() != null ? request.getMinLeadTimeHours() : 24)
                .rating(5.0)
                .reviewCount(0)
                .build();

        Product saved = productRepository.save(product);

        auditService.logEvent("ADMIN_CREATE_PRODUCT", adminEmail,
                "Created product [" + saved.getName() + "] in category [" + saved.getCategory() + "]", ipAddress);

        return mapToDto(saved);
    }

    @Transactional
    public ProductDTO updateProduct(String id, ProductRequest request, String adminEmail, String ipAddress) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setName(request.getName().trim());
        product.setCategory(request.getCategory().trim());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setDescription(request.getDescription().trim());
        if (request.getShortDescription() != null && !request.getShortDescription().isBlank()) {
            product.setShortDescription(request.getShortDescription().trim());
        }
        if (request.getImage() != null && !request.getImage().isBlank()) {
            product.setImage(request.getImage());
        }
        if (request.getGallery() != null) {
            product.setGallery(toJsonString(request.getGallery()));
        }
        if (request.getIsEggless() != null) {
            product.setEggless(request.getIsEggless());
        }
        if (request.getIsAvailable() != null) {
            product.setAvailable(request.getIsAvailable());
        }
        if (request.getIsBestseller() != null) {
            product.setBestseller(request.getIsBestseller());
        }
        if (request.getIsFeatured() != null) {
            product.setFeatured(request.getIsFeatured());
        }
        if (request.getShelfLife() != null) {
            product.setShelfLife(request.getShelfLife());
        }
        if (request.getAllergens() != null) {
            product.setAllergens(toJsonString(request.getAllergens()));
        }
        if (request.getIngredients() != null) {
            product.setIngredients(toJsonString(request.getIngredients()));
        }
        if (request.getWeightOptions() != null) {
            product.setWeightOptions(toJsonString(request.getWeightOptions()));
        }
        if (request.getMinLeadTimeHours() != null) {
            product.setMinLeadTimeHours(request.getMinLeadTimeHours());
        }

        Product updated = productRepository.save(product);

        auditService.logEvent("ADMIN_UPDATE_PRODUCT", adminEmail,
                "Updated product [" + updated.getName() + "] (ID: " + updated.getId() + ")", ipAddress);

        return mapToDto(updated);
    }

    @Transactional
    public ProductDTO toggleAvailability(String id, Boolean available, String adminEmail, String ipAddress) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        boolean newStatus = (available != null) ? available : !product.isAvailable();
        product.setAvailable(newStatus);
        Product saved = productRepository.save(product);

        auditService.logEvent("ADMIN_TOGGLE_PRODUCT_AVAILABILITY", adminEmail,
                "Changed availability of product [" + saved.getName() + "] to " + newStatus, ipAddress);

        return mapToDto(saved);
    }

    @Transactional
    public void deleteProduct(String id, String adminEmail, String ipAddress) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // Soft delete: keep historical order integrity
        product.setDeletedAt(LocalDateTime.now());
        product.setAvailable(false);
        productRepository.save(product);

        auditService.logEvent("ADMIN_DELETE_PRODUCT", adminEmail,
                "Soft-deleted product [" + product.getName() + "] (ID: " + product.getId() + ")", ipAddress);
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> getCategories() {
        List<CategoryDTO> baseCategories = List.of(
                CategoryDTO.builder().id("cat-cakes").name("Cakes").slug("Cakes")
                        .description("Freshly baked 100% eggless celebration cakes, chocolate ganache, fruit cakes, and signature sponges.")
                        .image("/images/Product_1.jpeg").itemCount(0).build(),
                CategoryDTO.builder().id("cat-custom").name("Customized Cakes").slug("Customized Cakes")
                        .description("Bespoke celebration bakes tailored to your themes, messages, tiers, and flavor choices.")
                        .image("/images/Product_10.jpeg").itemCount(0).build(),
                CategoryDTO.builder().id("cat-pastries").name("Pastries").slug("Pastries")
                        .description("Individual pastry slices, chocolate truffle brownies, and fruity layered delicacies.")
                        .image("/images/Product_8.jpeg").itemCount(0).build(),
                CategoryDTO.builder().id("cat-cupcakes").name("Cupcakes").slug("Cupcakes")
                        .description("Moist single-serve cupcakes topped with floral buttercream rosettes and molten lava cores.")
                        .image("/images/Product_16.jpeg").itemCount(0).build(),
                CategoryDTO.builder().id("cat-cookies").name("Cookies").slug("Cookies")
                        .description("Handcrafted golden butter cookies, cardamom biscuits, and tea-time crunchies.")
                        .image("/images/Product_14.jpeg").itemCount(0).build(),
                CategoryDTO.builder().id("cat-breads").name("Breads").slug("Breads")
                        .description("Slow-fermented artisan sourdough breads, herb focaccia, and fresh cottage loaves.")
                        .image("/images/Product_15.jpeg").itemCount(0).build()
        );

        return baseCategories.stream().map(cat -> {
            long count = productRepository.countByCategoryIgnoreCaseAndDeletedAtIsNull(cat.getName());
            return CategoryDTO.builder()
                    .id(cat.getId())
                    .name(cat.getName())
                    .slug(cat.getSlug())
                    .description(cat.getDescription())
                    .image(cat.getImage())
                    .itemCount(count)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndDeletedAtIsNull().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getBestSellers() {
        return productRepository.findByBestsellerTrueAndDeletedAtIsNull().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ProductDTO mapToDto(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .category(product.getCategory())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .description(product.getDescription())
                .shortDescription(product.getShortDescription())
                .image(product.getImage())
                .gallery(fromJsonString(product.getGallery()))
                .isEggless(product.isEggless())
                .isAvailable(product.isAvailable())
                .isBestseller(product.isBestseller())
                .isFeatured(product.isFeatured())
                .shelfLife(product.getShelfLife())
                .allergens(fromJsonString(product.getAllergens()))
                .ingredients(fromJsonString(product.getIngredients()))
                .weightOptions(fromJsonString(product.getWeightOptions()))
                .minLeadTimeHours(product.getMinLeadTimeHours())
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .build();
    }

    private String toJsonString(List<String> list) {
        if (list == null || list.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            logger.warn("Failed to serialize list to JSON: {}", e.getMessage());
            return null;
        }
    }

    private List<String> fromJsonString(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            logger.warn("Failed to deserialize JSON to list: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
