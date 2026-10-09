package com.store.controller;

import com.store.dto.coupon.CouponDto;
import com.store.dto.coupon.CreateCouponRequest;
import com.store.entity.Coupon;
import com.store.repository.CouponRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/coupons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AdminCouponController {

    private final CouponRepository couponRepository;

    private CouponDto toDto(Coupon c) {
        boolean isExpired = c.getEndsAt() != null && OffsetDateTime.now().isAfter(c.getEndsAt());
        return CouponDto.builder()
                .couponId(c.getCouponId())
                .code(c.getCode())
                .type(c.getType())
                .value(c.getValue())
                .minOrderValue(c.getMinOrderValue())
                .maxDiscount(c.getMaxDiscount())
                .usageLimit(c.getUsageLimit())
                .usedCount(c.getUsedCount())
                .reservedCount(c.getReservedCount())
                .maxUsagePerUser(c.getMaxUsagePerUser())
                .isActive(c.getIsActive())
                .title(c.getTitle())
                .description(c.getDescription())
                .startsAt(c.getStartsAt())
                .endsAt(c.getEndsAt())
                .categoryId(c.getCategoryId())
                .brandId(c.getBrandId())
                .productId(c.getProductId())
                .isExpired(isExpired)
                .build();
    }

    @GetMapping
    public ResponseEntity<List<CouponDto>> getAllCoupons() {
        List<Coupon> list = couponRepository.findAll();
        List<CouponDto> dtos = list.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCouponById(@PathVariable Integer id) {
        return couponRepository.findById(id)
                .map(c -> ResponseEntity.ok(toDto(c)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCoupon(@Valid @RequestBody CreateCouponRequest req) {
        if (couponRepository.findByCodeIgnoreCase(req.getCode().trim()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã giảm giá '" + req.getCode() + "' đã tồn tại!"));
        }

        if (req.getEndsAt().isBefore(req.getStartsAt())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thời gian kết thúc phải sau thời gian bắt đầu!"));
        }

        Coupon coupon = Coupon.builder()
                .code(req.getCode().trim().toUpperCase())
                .type(req.getType())
                .value(req.getValue())
                .minOrderValue(req.getMinOrderValue() != null ? req.getMinOrderValue() : BigDecimal.ZERO)
                .maxDiscount(req.getMaxDiscount())
                .usageLimit(req.getUsageLimit())
                .usedCount(0)
                .reservedCount(0)
                .maxUsagePerUser(req.getMaxUsagePerUser() != null ? req.getMaxUsagePerUser() : 1)
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .title(req.getTitle())
                .description(req.getDescription())
                .startsAt(req.getStartsAt())
                .endsAt(req.getEndsAt())
                .categoryId(req.getCategoryId())
                .brandId(req.getBrandId())
                .productId(req.getProductId())
                .build();

        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Integer id, @Valid @RequestBody CreateCouponRequest req) {
        return couponRepository.findById(id).map(coupon -> {
            // Check code collision with other coupons
            couponRepository.findByCodeIgnoreCase(req.getCode().trim()).ifPresent(existing -> {
                if (!existing.getCouponId().equals(id)) {
                    throw new IllegalArgumentException("Mã giảm giá '" + req.getCode() + "' đã được sử dụng bởi coupon khác!");
                }
            });

            if (req.getEndsAt().isBefore(req.getStartsAt())) {
                throw new IllegalArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu!");
            }

            coupon.setCode(req.getCode().trim().toUpperCase());
            coupon.setType(req.getType());
            coupon.setValue(req.getValue());
            coupon.setMinOrderValue(req.getMinOrderValue() != null ? req.getMinOrderValue() : BigDecimal.ZERO);
            coupon.setMaxDiscount(req.getMaxDiscount());
            coupon.setUsageLimit(req.getUsageLimit());
            if (req.getMaxUsagePerUser() != null) coupon.setMaxUsagePerUser(req.getMaxUsagePerUser());
            if (req.getIsActive() != null) coupon.setIsActive(req.getIsActive());
            coupon.setTitle(req.getTitle());
            coupon.setDescription(req.getDescription());
            coupon.setStartsAt(req.getStartsAt());
            coupon.setEndsAt(req.getEndsAt());
            coupon.setCategoryId(req.getCategoryId());
            coupon.setBrandId(req.getBrandId());
            coupon.setProductId(req.getProductId());

            Coupon updated = couponRepository.save(coupon);
            return ResponseEntity.ok(toDto(updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Integer id) {
        return couponRepository.findById(id).map(coupon -> {
            couponRepository.delete(coupon);
            return ResponseEntity.ok(Map.of("message", "Xóa mã giảm giá thành công!"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleStatus(@PathVariable Integer id) {
        return couponRepository.findById(id).map(coupon -> {
            coupon.setIsActive(!Boolean.TRUE.equals(coupon.getIsActive()));
            Coupon updated = couponRepository.save(coupon);
            return ResponseEntity.ok(toDto(updated));
        }).orElse(ResponseEntity.notFound().build());
    }
}
