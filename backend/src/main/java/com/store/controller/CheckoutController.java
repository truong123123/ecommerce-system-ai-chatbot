package com.store.controller;

import com.store.dto.checkout.*;
import com.store.entity.Customer;
import com.store.repository.CustomerRepository;
import com.store.service.CheckoutService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/checkout")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class CheckoutController {

    private final CheckoutService checkoutService;
    private final CustomerRepository customerRepository;

    private Customer resolveCurrentCustomer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            return null;
        }
        return customerRepository.findByEmailIgnoreCase(auth.getName()).orElse(null);
    }

    @GetMapping("/preview")
    public ResponseEntity<?> preview(
            @RequestParam("variantIds") String variantIdsStr,
            @RequestParam(value = "quantities", required = false) String quantitiesStr
    ) {
        Customer customer = resolveCurrentCustomer();

        try {
            List<Long> variantIds = Arrays.stream(variantIdsStr.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Long::valueOf)
                    .collect(Collectors.toList());

            List<Integer> quantities = null;
            if (quantitiesStr != null && !quantitiesStr.trim().isEmpty()) {
                quantities = Arrays.stream(quantitiesStr.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(Integer::valueOf)
                        .collect(Collectors.toList());
            }

            CheckoutPreviewDto previewDto = checkoutService.preview(customer, variantIds, quantities);
            return ResponseEntity.ok(previewDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/calculate")
    public ResponseEntity<?> calculate(@Valid @RequestBody CheckoutCalculateRequest request) {
        Customer customer = resolveCurrentCustomer();
        try {
            CheckoutCalculateDto calculateDto = checkoutService.calculate(customer, request);
            return ResponseEntity.ok(calculateDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> submitCheckout(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody CheckoutSubmitRequest request,
            HttpServletRequest httpServletRequest
    ) {
        Customer customer = resolveCurrentCustomer();
        if (customer == null && request.getCustomerEmail() != null && !request.getCustomerEmail().trim().isEmpty()) {
            final String email = request.getCustomerEmail().trim().toLowerCase();
            customer = customerRepository.findByEmailIgnoreCase(email)
                    .orElseGet(() -> {
                        Customer guest = Customer.builder()
                                .fullName(request.getCustomerName() != null ? request.getCustomerName().trim() : "Khách hàng")
                                .email(email)
                                .phone(request.getCustomerPhone() != null ? request.getCustomerPhone().trim() : null)
                                .passwordHash("GUEST_NO_PASSWORD")
                                .isActive(true)
                                .loyaltyPoints(0)
                                .build();
                        return customerRepository.save(guest);
                    });
        }

        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập hoặc nhập thông tin email, số điện thoại để tiến hành đặt hàng."));
        }

        String clientIp = httpServletRequest.getRemoteAddr();
        try {
            CheckoutSubmitResponse response = checkoutService.submitCheckout(customer, idempotencyKey, request, clientIp);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
