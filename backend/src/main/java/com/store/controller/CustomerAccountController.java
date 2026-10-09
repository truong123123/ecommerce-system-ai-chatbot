package com.store.controller;

import com.store.dto.account.*;
import com.store.service.CustomerAccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/account")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class CustomerAccountController {

    private final CustomerAccountService accountService;

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            throw new SecurityException("Vui lòng đăng nhập để tiếp tục.");
        }
        return auth.getName();
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            String email = getCurrentUserEmail();
            return ResponseEntity.ok(accountService.getProfile(email));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        try {
            String email = getCurrentUserEmail();
            return ResponseEntity.ok(accountService.updateProfile(email, request));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            String email = getCurrentUserEmail();
            accountService.changePassword(email, request);
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công."));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Lỗi xử lý đổi mật khẩu."));
        }
    }

    @GetMapping("/addresses")
    public ResponseEntity<?> getAddresses() {
        try {
            String email = getCurrentUserEmail();
            return ResponseEntity.ok(accountService.getAddresses(email));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/addresses")
    public ResponseEntity<?> addAddress(@Valid @RequestBody CreateAddressRequest request) {
        try {
            String email = getCurrentUserEmail();
            return ResponseEntity.status(HttpStatus.CREATED).body(accountService.addAddress(email, request));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable Long id, @Valid @RequestBody CreateAddressRequest request) {
        try {
            String email = getCurrentUserEmail();
            return ResponseEntity.ok(accountService.updateAddress(email, id, request));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id) {
        try {
            String email = getCurrentUserEmail();
            accountService.deleteAddress(email, id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa địa chỉ thành công."));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/addresses/{id}/default")
    public ResponseEntity<?> setDefaultAddress(@PathVariable Long id) {
        try {
            String email = getCurrentUserEmail();
            return ResponseEntity.ok(accountService.setDefaultAddress(email, id));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(@RequestParam(value = "status", required = false) String status) {
        try {
            String email = getCurrentUserEmail();
            return ResponseEntity.ok(accountService.getOrders(email, status));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderDetail(@PathVariable Long id) {
        try {
            String email = getCurrentUserEmail();
            return ResponseEntity.ok(accountService.getOrderDetail(email, id));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }
}
