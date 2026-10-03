package com.store.repository;

import com.store.entity.CustomerAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Long> {
    List<CustomerAddress> findByCustomerCustomerId(Long customerId);
    Optional<CustomerAddress> findByCustomerCustomerIdAndIsDefaultTrue(Long customerId);
}
