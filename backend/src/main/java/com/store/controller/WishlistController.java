package com.store.controller;

import com.store.dto.WishlistItemDto;
import com.store.service.WishlistService;
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
@RequestMapping("/wishlist")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class WishlistController {

    private final WishlistService wishlistService;

    private String getAuthenticatedEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            throw new SecurityException("Vui lòng đăng nhập để sử dụng tính năng danh sách yêu thích.");
        }
        return auth.getName();
    }

    @GetMapping
    public ResponseEntity<?> getWishlist() {
        try {
            String email = getAuthenticatedEmail();
            List<WishlistItemDto> items = wishlistService.getWishlist(email);
            return ResponseEntity.ok(items);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{productId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Long productId) {
        try {
            String email = getAuthenticatedEmail();
            WishlistItemDto item = wishlistService.addToWishlist(email, productId);
            return ResponseEntity.status(HttpStatus.CREATED).body(item);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long productId) {
        try {
            String email = getAuthenticatedEmail();
            wishlistService.removeFromWishlist(email, productId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm khỏi danh sách yêu thích.", "productId", productId));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<?> checkWishlist(@PathVariable Long productId) {
        try {
            String email = getAuthenticatedEmail();
            boolean isWishlisted = wishlistService.isWishlisted(email, productId);
            return ResponseEntity.ok(Map.of("isWishlisted", isWishlisted, "productId", productId));
        } catch (SecurityException e) {
            return ResponseEntity.ok(Map.of("isWishlisted", false, "productId", productId));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("isWishlisted", false, "productId", productId));
        }
    }
}
