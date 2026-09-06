package com.bakery.cottage.repository;

import com.bakery.cottage.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {

    List<Product> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

    List<Product> findAllByDeletedAtIsNull();

    Optional<Product> findByIdAndDeletedAtIsNull(String id);

    List<Product> findByCategoryIgnoreCaseAndDeletedAtIsNull(String category);

    List<Product> findByAvailableTrueAndDeletedAtIsNullOrderByCreatedAtDesc();

    List<Product> findByFeaturedTrueAndDeletedAtIsNull();

    List<Product> findByBestsellerTrueAndDeletedAtIsNull();

    long countByCategoryIgnoreCaseAndDeletedAtIsNull(String category);

    long countByAvailableTrueAndDeletedAtIsNull();

    long countByAvailableTrue();
}
