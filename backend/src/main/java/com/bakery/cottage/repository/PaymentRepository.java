package com.bakery.cottage.repository;

import com.bakery.cottage.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    long countByStatus(String status);
    List<Payment> findByStatusOrderByCreatedAtDesc(String status);
    List<Payment> findTop10ByOrderByCreatedAtDesc();
}
