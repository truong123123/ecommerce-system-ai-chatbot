package com.store.repository;

import com.store.entity.Order;
import com.store.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByOrderByOrderDateDesc();
    List<Order> findByCustomerCustomerIdOrderByOrderDateDesc(Long customerId);
    List<Order> findTop10ByOrderByOrderDateDesc();
    long countByStatus(OrderStatus status);
    long countByCustomerCustomerId(Long customerId);
    Optional<Order> findByOrderCode(String orderCode);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.orderId = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);
}
