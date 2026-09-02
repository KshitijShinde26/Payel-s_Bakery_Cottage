package com.bakery.cottage.controller;

import com.bakery.cottage.dto.CategoryDTO;
import com.bakery.cottage.dto.ProductDTO;
import com.bakery.cottage.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/products")
@Tag(name = "Product Catalog", description = "Public endpoints for exploring bakery catalogue and categories")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "Get active products with optional category, search, price, and sorting filters")
    public ResponseEntity<List<ProductDTO>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean isEggless,
            @RequestParam(required = false) Boolean isAvailable,
            @RequestParam(required = false) String sortBy) {

        List<ProductDTO> products = productService.getProducts(category, search, minPrice, maxPrice, isEggless, isAvailable, sortBy);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed information for a specific product by ID")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get all bakery categories with live item counts")
    public ResponseEntity<List<CategoryDTO>> getCategories() {
        return ResponseEntity.ok(productService.getCategories());
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured bakery showcase products")
    public ResponseEntity<List<ProductDTO>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/bestsellers")
    @Operation(summary = "Get customer favourite bestseller products")
    public ResponseEntity<List<ProductDTO>> getBestSellers() {
        return ResponseEntity.ok(productService.getBestSellers());
    }
}
