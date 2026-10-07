package com.bakery.cottage.repository;

import com.bakery.cottage.entity.Order;
import com.bakery.cottage.entity.OrderStatus;
import com.bakery.cottage.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByOrderStatusInOrderByCreatedAtDesc(List<OrderStatus> statuses);

    List<Order> findByOrderStatusOrderByCreatedAtDesc(OrderStatus status);

    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<Order> findByOrderNumber(String orderNumber);

    Optional<Order> findByIdAndUserId(String id, String userId);

    Optional<Order> findByOrderNumberAndUserId(String orderNumber, String userId);

    long countByUserId(String userId);

    long countByUserIdAndOrderStatusIn(String userId, List<OrderStatus> statuses);

    long countByUserIdAndOrderStatus(String userId, OrderStatus status);

    long countByOrderStatusIn(List<OrderStatus> statuses);

    List<Order> findByDeliveryPartnerIdOrderByCreatedAtDesc(String deliveryPartnerId);

    List<Order> findByDeliveryPartnerIdAndOrderStatusOrderByCreatedAtDesc(String deliveryPartnerId, OrderStatus status);

    long countByDeliveryPartnerId(String deliveryPartnerId);

    long countByDeliveryPartnerIdAndOrderStatus(String deliveryPartnerId, OrderStatus status);

    long countByDeliveryPartnerIdAndOrderStatusIn(String deliveryPartnerId, List<OrderStatus> statuses);

    long countByOrderStatus(OrderStatus status);

    Optional<Order> findByIdAndDeliveryPartnerId(String id, String deliveryPartnerId);

    @Query("SELECT COALESCE(SUM(o.grandTotal), 0) FROM Order o WHERE o.paymentStatus = :paymentStatus AND o.createdAt BETWEEN :start AND :end")
    BigDecimal sumGrandTotalByPaymentStatusAndCreatedAtBetween(
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
