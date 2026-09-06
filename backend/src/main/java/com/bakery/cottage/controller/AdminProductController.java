package com.bakery.cottage.controller;

import com.bakery.cottage.dto.AdminProductDTO;
import com.bakery.cottage.dto.CreateProductRequest;
import com.bakery.cottage.dto.UpdateProductRequest;
import com.bakery.cottage.service.AdminProductService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/products")
@PreAuthorize("hasAnyRole('ADMIN') or hasAuthority('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminProductController {

    private final AdminProductService adminProductService;

    public AdminProductController(AdminProductService adminProductService) {
        this.adminProductService = adminProductService;
    }

    @GetMapping
    public ResponseEntity<List<AdminProductDTO>> getAllProducts() {
        return ResponseEntity.ok(adminProductService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminProductDTO> getProductById(@PathVariable("id") String id) {
        return ResponseEntity.ok(adminProductService.getProductById(id));
    }

    @PostMapping
    public ResponseEntity<AdminProductDTO> createProduct(
            @Valid @RequestBody CreateProductRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = (principal != null) ? principal.getName() : "admin@bakery.com";
        AdminProductDTO created = adminProductService.createProduct(
                request,
                adminEmail,
                servletRequest.getRemoteAddr()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminProductDTO> updateProduct(
            @PathVariable("id") String id,
            @Valid @RequestBody UpdateProductRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = (principal != null) ? principal.getName() : "admin@bakery.com";
        AdminProductDTO updated = adminProductService.updateProduct(
                id,
                request,
                adminEmail,
                servletRequest.getRemoteAddr()
        );
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteProduct(
            @PathVariable("id") String id,
            Principal principal,
            HttpServletRequest servletRequest) {
        String adminEmail = (principal != null) ? principal.getName() : "admin@bakery.com";
        adminProductService.deleteProduct(id, adminEmail, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Product successfully removed from catalogue."
        ));
    }
}
