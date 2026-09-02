package com.bakery.cottage.repository;

import com.bakery.cottage.entity.CustomCakeRequestEntity;
import com.bakery.cottage.entity.CustomCakeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomCakeRequestRepository extends JpaRepository<CustomCakeRequestEntity, String> {

    List<CustomCakeRequestEntity> findAllByOrderByCreatedAtDesc();

    List<CustomCakeRequestEntity> findByStatusInOrderByCreatedAtDesc(List<CustomCakeStatus> statuses);

    List<CustomCakeRequestEntity> findByStatusOrderByCreatedAtDesc(CustomCakeStatus status);

    List<CustomCakeRequestEntity> findByUserIdOrderByCreatedAtDesc(String userId);
}
