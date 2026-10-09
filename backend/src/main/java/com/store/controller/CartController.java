package com.store.controller;

import com.store.dto.cart.*;
import com.store.entity.Customer;
import com.store.entity.Order;
import com.store.repository.CustomerRepository;
import com.store.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class CartController {

    private final CartService cartService;
    private final CustomerRepository customerRepository;

    private Customer resolveCurrentCustomer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            return null;
        }
        String email = auth.getName();
        return customerRepository.findByEmailIgnoreCase(email).orElse(null);
    }

    @GetMapping
    public ResponseEntity<?> getCart(
            @RequestParam(value = "selectedVariantIds", required = false) String selectedVariantIdsParam,
            @RequestParam(value = "couponCode", required = false) String couponCode
    ) {
        Customer customer = resolveCurrentCustomer();
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập để truy cập giỏ hàng."));
        }
        List<Long> selectedVariantIds = null;
        if (selectedVariantIdsParam != null) {
            String trimmed = selectedVariantIdsParam.trim();
            if (trimmed.isEmpty() || "none".equalsIgnoreCase(trimmed) || "empty".equalsIgnoreCase(trimmed)) {
                selectedVariantIds = java.util.Collections.emptyList();
            } else {
                try {
                    selectedVariantIds = java.util.Arrays.stream(trimmed.split(","))
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .map(Long::parseLong)
                            .toList();
                } catch (Exception e) {
                    log.warn("Lỗi parse selectedVariantIds: {}", selectedVariantIdsParam);
                }
            }
        }
        CartDto cartDto = cartService.getCart(customer, selectedVariantIds, couponCode);
        return ResponseEntity.ok(cartDto);
    }

    @PostMapping("/items")
    public ResponseEntity<?> addToCart(@Valid @RequestBody AddToCartRequest request) {
        Customer customer = resolveCurrentCustomer();
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập để thêm vào giỏ hàng."));
        }
        try {
            CartDto cartDto = cartService.addToCart(customer, request);
            return ResponseEntity.ok(cartDto);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/items/{variantId}")
    public ResponseEntity<?> updateQuantity(
            @PathVariable Long variantId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        Customer customer = resolveCurrentCustomer();
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập để cập nhật giỏ hàng."));
        }
        try {
            CartDto cartDto = cartService.updateItemQuantity(customer, variantId, request.getQuantity());
            return ResponseEntity.ok(cartDto);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/items/{variantId}")
    public ResponseEntity<?> removeItem(@PathVariable Long variantId) {
        Customer customer = resolveCurrentCustomer();
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập."));
        }
        CartDto cartDto = cartService.removeItem(customer, variantId);
        return ResponseEntity.ok(cartDto);
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart() {
        Customer customer = resolveCurrentCustomer();
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập."));
        }
        CartDto cartDto = cartService.clearCart(customer);
        return ResponseEntity.ok(cartDto);
    }

    @PostMapping("/apply-coupon")
    public ResponseEntity<?> applyCoupon(@Valid @RequestBody ApplyCouponRequest request) {
        Customer customer = resolveCurrentCustomer();
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập để áp dụng mã giảm giá."));
        }
        CartDto cartDto = cartService.applyCoupon(customer, request);
        return ResponseEntity.ok(cartDto);
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@Valid @RequestBody CheckoutRequest request) {
        Customer customer = resolveCurrentCustomer();
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập để tiến hành thanh toán."));
        }
        try {
            Order order = cartService.checkout(customer, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Đặt hàng thành công!",
                    "orderId", order.getOrderId(),
                    "totalAmount", order.getTotalAmount(),
                    "status", order.getStatus().name()
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
