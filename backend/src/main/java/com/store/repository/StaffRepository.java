package com.store.repository;

import com.store.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Integer> {
    Optional<Staff> findByEmailIgnoreCase(String email);
    Optional<Staff> findByEmailIgnoreCaseAndIsActiveTrue(String email);
    boolean existsByEmailIgnoreCase(String email);
}
