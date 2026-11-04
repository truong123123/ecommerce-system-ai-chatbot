package com.store.controller;

import com.store.dto.admin.AdminCustomerDto;
import com.store.entity.Customer;
import com.store.repository.CustomerRepository;
import com.store.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<List<AdminCustomerDto>> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();
        List<AdminCustomerDto> dtos = customers.stream().map(c -> {
            long totalOrders = orderRepository.countByCustomerCustomerId(c.getCustomerId());
            return AdminCustomerDto.builder()
                    .customerId(c.getCustomerId())
                    .fullName(c.getFullName())
                    .email(c.getEmail())
                    .phone(c.getPhone())
                    .gender(c.getGender())
                    .birthDate(c.getBirthDate())
                    .loyaltyPoints(c.getLoyaltyPoints() != null ? c.getLoyaltyPoints() : 0)
                    .isActive(c.getIsActive() != null ? c.getIsActive() : true)
                    .createdAt(c.getCreatedAt())
                    .totalOrders(totalOrders)
                    .build();
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleCustomerStatus(@PathVariable Long id) {
        Optional<Customer> customerOpt = customerRepository.findById(id);
        if (customerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy khách hàng với ID: " + id));
        }

        Customer customer = customerOpt.get();
        boolean newStatus = !(customer.getIsActive() != null && customer.getIsActive());
        customer.setIsActive(newStatus);
        customerRepository.save(customer);

        return ResponseEntity.ok(Map.of(
                "message", newStatus ? "Đã mở khóa tài khoản khách hàng thành công" : "Đã khóa tài khoản khách hàng",
                "customerId", customer.getCustomerId(),
                "isActive", newStatus
        ));
    }
}

