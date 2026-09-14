package com.bakery.cottage.repository;

import com.bakery.cottage.entity.DeliveryPartnerProfile;
import com.bakery.cottage.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryPartnerProfileRepository extends JpaRepository<DeliveryPartnerProfile, String> {
    Optional<DeliveryPartnerProfile> findByUserId(String userId);
    Optional<DeliveryPartnerProfile> findByUser(User user);
    List<DeliveryPartnerProfile> findByUserIdIn(List<String> userIds);
    List<DeliveryPartnerProfile> findAllByStatus(String status);
}
