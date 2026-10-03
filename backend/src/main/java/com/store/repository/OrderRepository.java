package com.store.repository;

import com.store.entity.Order;
import com.store.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByOrderByOrderDateDesc();
    List<Order> findByCustomerCustomerIdOrderByOrderDateDesc(Long customerId);
    List<Order> findTop10ByOrderByOrderDateDesc();
    long countByStatus(OrderStatus status);
}
