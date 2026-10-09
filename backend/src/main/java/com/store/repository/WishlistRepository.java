package com.store.repository;

import com.store.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByCustomerCustomerIdOrderByCreatedAtDesc(Long customerId);
    boolean existsByCustomerCustomerIdAndProductProductId(Long customerId, Long productId);
    Optional<WishlistItem> findByCustomerCustomerIdAndProductProductId(Long customerId, Long productId);
    void deleteByCustomerCustomerIdAndProductProductId(Long customerId, Long productId);
    int countByCustomerCustomerId(Long customerId);
}
