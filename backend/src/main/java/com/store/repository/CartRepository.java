package com.store.repository;

import com.store.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByCustomerCustomerId(Long customerId);
    Optional<Cart> findByCustomerEmailIgnoreCase(String email);
}
