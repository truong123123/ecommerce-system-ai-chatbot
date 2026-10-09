package com.store.controller;

import com.store.entity.Coupon;
import com.store.entity.Customer;
import com.store.entity.DiscountType;
import com.store.repository.CouponRepository;
import com.store.repository.CustomerRepository;
import com.store.repository.VoucherUsageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/vouchers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class VoucherController {

    private final CouponRepository couponRepository;
    private final CustomerRepository customerRepository;
    private final VoucherUsageRepository voucherUsageRepository;

    private Customer resolveCurrentCustomer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            return null;
        }
        return customerRepository.findByEmailIgnoreCase(auth.getName()).orElse(null);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Map<String, Object>>> getAvailableVouchers(
            @RequestParam(value = "subtotal", required = false) BigDecimal subtotal,
            @RequestParam(value = "minOrder", required = false) BigDecimal minOrder
    ) {
        Customer customer = resolveCurrentCustomer();
        List<Coupon> activeCoupons = couponRepository.findByIsActiveTrue();
        OffsetDateTime now = OffsetDateTime.now();
        BigDecimal currentSubtotal = subtotal != null ? subtotal : (minOrder != null ? minOrder : BigDecimal.ZERO);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Coupon c : activeCoupons) {
            boolean isTimeValid = (c.getStartsAt() == null || now.isAfter(c.getStartsAt()))
                    && (c.getEndsAt() == null || now.isBefore(c.getEndsAt()));
            boolean isUsageValid = (c.getUsageLimit() == null || (c.getUsedCount() + c.getReservedCount()) < c.getUsageLimit());

            long userUsage = customer != null ? voucherUsageRepository.countUsageByCouponAndCustomer(c.getCouponId(), customer.getCustomerId()) : 0;
            boolean isUserValid = userUsage < (c.getMaxUsagePerUser() != null ? c.getMaxUsagePerUser() : 1);
            boolean isEligible = isTimeValid && isUsageValid && isUserValid && (c.getMinOrderValue() == null || currentSubtotal.compareTo(c.getMinOrderValue()) >= 0);

            Map<String, Object> map = new HashMap<>();
            map.put("couponId", c.getCouponId());
            map.put("code", c.getCode());
            map.put("title", c.getTitle() != null ? c.getTitle() : c.getCode());
            map.put("description", c.getDescription() != null ? c.getDescription() : "Giảm giá đặc biệt");
            String typeStr = c.getType() != null ? c.getType().name() : "fixed";
            map.put("type", typeStr);
            map.put("discountType", typeStr);
            map.put("value", c.getValue());
            map.put("discountValue", c.getValue());
            map.put("minOrderValue", c.getMinOrderValue());
            map.put("minOrderAmount", c.getMinOrderValue());
            map.put("maxDiscount", c.getMaxDiscount());
            map.put("isEligible", isEligible);
            map.put("isValid", isEligible);
            map.put("startDate", c.getStartsAt() != null ? c.getStartsAt().toString() : null);
            map.put("endDate", c.getEndsAt() != null ? c.getEndsAt().toString() : null);
            map.put("categoryId", c.getCategoryId());
            map.put("brandId", c.getBrandId());
            map.put("productId", c.getProductId());

            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateVoucher(@RequestBody Map<String, Object> body) {
        String code = (String) body.get("code");
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập mã giảm giá."));
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        if (body.get("subtotal") != null) {
            subtotal = new BigDecimal(body.get("subtotal").toString());
        } else if (body.get("orderAmount") != null) {
            subtotal = new BigDecimal(body.get("orderAmount").toString());
        }

        Optional<Coupon> opt = couponRepository.findByCodeIgnoreCase(code.trim());
        if (opt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã giảm giá không tồn tại."));
        }

        Coupon c = opt.get();
        if (Boolean.FALSE.equals(c.getIsActive())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã giảm giá đang bị khóa hoặc ngừng hoạt động."));
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (c.getStartsAt() != null && now.isBefore(c.getStartsAt())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã giảm giá chưa đến thời gian áp dụng."));
        }
        if (c.getEndsAt() != null && now.isAfter(c.getEndsAt())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã giảm giá đã hết hạn."));
        }
        if (c.getUsageLimit() != null && (c.getUsedCount() + c.getReservedCount()) >= c.getUsageLimit()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã giảm giá đã hết lượt sử dụng."));
        }
        if (c.getMinOrderValue() != null && subtotal.compareTo(c.getMinOrderValue()) < 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Đơn hàng chưa đạt giá trị tối thiểu " + c.getMinOrderValue() + "đ"));
        }

        Customer customer = resolveCurrentCustomer();
        if (customer != null) {
            long count = voucherUsageRepository.countUsageByCouponAndCustomer(c.getCouponId(), customer.getCustomerId());
            if (count >= (c.getMaxUsagePerUser() != null ? c.getMaxUsagePerUser() : 1)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Bạn đã hết lượt sử dụng mã giảm giá này."));
            }
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (c.getType() == DiscountType.fixed) {
            discount = c.getValue().min(subtotal);
        } else {
            BigDecimal pct = c.getValue().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
            discount = subtotal.multiply(pct).setScale(0, RoundingMode.HALF_UP);
            if (c.getMaxDiscount() != null) {
                discount = discount.min(c.getMaxDiscount());
            }
        }

        return ResponseEntity.ok(Map.of(
                "valid", true,
                "code", c.getCode(),
                "discount", discount,
                "discountType", c.getType().name(),
                "description", c.getDescription() != null ? c.getDescription() : "Áp dụng thành công"
        ));
    }
}
