package com.bakery.cottage.repository;

import com.bakery.cottage.entity.Order;
import com.bakery.cottage.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByOrderStatusInOrderByCreatedAtDesc(List<OrderStatus> statuses);

    List<Order> findByOrderStatusOrderByCreatedAtDesc(OrderStatus status);

    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<Order> findByOrderNumber(String orderNumber);
}
