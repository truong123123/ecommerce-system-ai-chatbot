package com.store.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.dto.checkout.*;
import com.store.entity.*;
import com.store.payment.VNPayService;
import com.store.repository.*;
import com.store.service.CheckoutService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckoutServiceImpl implements CheckoutService {

    private final OrderRepository orderRepository;
    private final CustomerAddressRepository customerAddressRepository;
    private final ProductVariantRepository productVariantRepository;
    private final InventoryRepository inventoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final FlashSaleItemRepository flashSaleItemRepository;
    private final FlashSaleUserPurchaseRepository flashSaleUserPurchaseRepository;
    private final CouponRepository couponRepository;
    private final VoucherUsageRepository voucherUsageRepository;
    private final InventoryReservationRepository inventoryReservationRepository;
    private final OrderInvoiceInfoRepository orderInvoiceInfoRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final CheckoutIdempotencyRepository checkoutIdempotencyRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final VNPayService vnPayService;
    private final EntityManager entityManager;
    private final ObjectMapper objectMapper;

    private static final BigDecimal DEFAULT_FREE_SHIPPING_THRESHOLD = new BigDecimal("300000");
    private static final BigDecimal DEFAULT_SHIPPING_FEE = new BigDecimal("30000");

    private BigDecimal getFreeShippingThreshold() {
        return systemSettingRepository.findBySettingKey("free_shipping_threshold")
                .map(s -> new BigDecimal(s.getValue()))
                .orElse(DEFAULT_FREE_SHIPPING_THRESHOLD);
    }

    private BigDecimal getStandardShippingFee() {
        return systemSettingRepository.findBySettingKey("standard_shipping_fee")
                .map(s -> new BigDecimal(s.getValue()))
                .orElse(DEFAULT_SHIPPING_FEE);
    }

    private String calculateSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Lỗi tính hash SHA-256", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CheckoutPreviewDto preview(Customer customer, List<Long> variantIds, List<Integer> quantities) {
        if (variantIds == null || variantIds.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn ít nhất một sản phẩm.");
        }

        // 1. Thông tin khách hàng
        CheckoutPreviewDto.CustomerInfo customerInfo = null;
        CheckoutPreviewDto.AddressPreview addressPreview = null;
        if (customer != null) {
            String tier = "S-NULL";
            if (customer.getLoyaltyPoints() != null && customer.getLoyaltyPoints() > 500) {
                tier = "S-Student";
            }

            customerInfo = CheckoutPreviewDto.CustomerInfo.builder()
                    .customerId(customer.getCustomerId())
                    .fullName(customer.getFullName())
                    .email(customer.getEmail())
                    .phone(customer.getPhone())
                    .membershipTier(tier)
                    .loyaltyPoints(customer.getLoyaltyPoints())
                    .build();

            // 2. Địa chỉ mặc định
            Optional<CustomerAddress> defaultAddr = customerAddressRepository.findByCustomerCustomerIdAndIsDefaultTrue(customer.getCustomerId());
            if (defaultAddr.isPresent()) {
                CustomerAddress a = defaultAddr.get();
                addressPreview = CheckoutPreviewDto.AddressPreview.builder()
                        .addressId(a.getAddressId())
                        .receiverName(a.getReceiverName())
                        .receiverPhone(a.getReceiverPhone())
                        .province(a.getProvince())
                        .district(a.getDistrict())
                        .ward(a.getWard())
                        .streetAddress(a.getStreetAddress())
                        .build();
            }
        }

        // 3. Danh sách sản phẩm
        List<CheckoutPreviewDto.ItemPreview> itemPreviews = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal directDiscount = BigDecimal.ZERO;

        for (int i = 0; i < variantIds.size(); i++) {
            Long vId = variantIds.get(i);
            int qty = (quantities != null && quantities.size() > i && quantities.get(i) != null) ? quantities.get(i) : 1;

            ProductVariant variant = productVariantRepository.findWithProductAndImagesById(vId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy biến thể sản phẩm #" + vId));

            Product product = variant.getProduct();
            BigDecimal salePrice = variant.getSalePrice() != null ? variant.getSalePrice() : BigDecimal.ZERO;
            BigDecimal originalPrice = salePrice.multiply(new BigDecimal("1.15")).setScale(0, RoundingMode.HALF_UP);

            // Kiểm tra xem có trong Flash Sale đang active không
            boolean isFlashSale = false;
            Optional<FlashSaleItem> fsOpt = flashSaleItemRepository.findActiveFlashSaleItemByProductId(product.getProductId());
            if (fsOpt.isPresent()) {
                FlashSaleItem fsi = fsOpt.get();
                if ((fsi.getTotalStock() - fsi.getSoldCount() - fsi.getReservedQuantity()) >= qty) {
                    salePrice = fsi.getSalePrice();
                    originalPrice = fsi.getOriginalPrice();
                    isFlashSale = true;
                }
            }

            BigDecimal discountPerItem = originalPrice.subtract(salePrice).max(BigDecimal.ZERO);
            BigDecimal lineTotal = salePrice.multiply(BigDecimal.valueOf(qty));

            Integer availableStock = inventoryRepository.getAvailableStockByVariantId(vId);
            boolean inStock = availableStock != null && availableStock >= qty;

            String imageUrl = (product.getImages() != null && !product.getImages().isEmpty())
                    ? product.getImages().get(0).getUrl()
                    : "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400";

            itemPreviews.add(CheckoutPreviewDto.ItemPreview.builder()
                    .variantId(vId)
                    .productId(product.getProductId())
                    .name(product.getName() + " (" + variant.getSku() + ")")
                    .sku(variant.getSku())
                    .imageUrl(imageUrl)
                    .quantity(qty)
                    .salePrice(salePrice)
                    .originalPrice(originalPrice)
                    .discountAmount(discountPerItem)
                    .lineTotal(lineTotal)
                    .inStock(inStock)
                    .isFlashSale(isFlashSale)
                    .build());

            if (inStock) {
                subtotal = subtotal.add(lineTotal);
                directDiscount = directDiscount.add(discountPerItem.multiply(BigDecimal.valueOf(qty)));
            }
        }

        BigDecimal threshold = getFreeShippingThreshold();
        BigDecimal stdFee = getStandardShippingFee();
        boolean isFreeShipping = subtotal.compareTo(threshold) >= 0;
        BigDecimal shippingFee = isFreeShipping || subtotal.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO : stdFee;
        BigDecimal totalAmount = subtotal.add(shippingFee);

        CheckoutPreviewDto.PricingSummary pricing = CheckoutPreviewDto.PricingSummary.builder()
                .totalItems(itemPreviews.size())
                .subtotal(subtotal)
                .directDiscount(directDiscount)
                .voucherDiscount(BigDecimal.ZERO)
                .shippingFee(shippingFee)
                .totalAmount(totalAmount)
                .totalSavings(directDiscount)
                .isFreeShipping(isFreeShipping)
                .build();

        return CheckoutPreviewDto.builder()
                .customer(customerInfo)
                .items(itemPreviews)
                .pricing(pricing)
                .defaultAddress(addressPreview)
                .freeShippingThreshold(threshold)
                .standardShippingFee(stdFee)
                .idempotencyKey(UUID.randomUUID().toString())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CheckoutCalculateDto calculate(Customer customer, CheckoutCalculateRequest request) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal directDiscount = BigDecimal.ZERO;
        int totalItems = 0;

        for (CheckoutCalculateRequest.ItemRequest item : request.getItems()) {
            ProductVariant variant = productVariantRepository.findWithProductAndImagesById(item.getVariantId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy biến thể #" + item.getVariantId()));

            int qty = item.getQuantity() != null && item.getQuantity() > 0 ? item.getQuantity() : 1;
            totalItems += qty;

            BigDecimal salePrice = variant.getSalePrice() != null ? variant.getSalePrice() : BigDecimal.ZERO;
            BigDecimal originalPrice = salePrice.multiply(new BigDecimal("1.15")).setScale(0, RoundingMode.HALF_UP);

            // Flash Sale check
            Optional<FlashSaleItem> fsOpt = flashSaleItemRepository.findActiveFlashSaleItemByProductId(variant.getProduct().getProductId());
            if (fsOpt.isPresent()) {
                FlashSaleItem fsi = fsOpt.get();
                if ((fsi.getTotalStock() - fsi.getSoldCount() - fsi.getReservedQuantity()) >= qty) {
                    salePrice = fsi.getSalePrice();
                    originalPrice = fsi.getOriginalPrice();
                }
            }

            BigDecimal discountPerItem = originalPrice.subtract(salePrice).max(BigDecimal.ZERO);
            BigDecimal lineTotal = salePrice.multiply(BigDecimal.valueOf(qty));

            subtotal = subtotal.add(lineTotal);
            directDiscount = directDiscount.add(discountPerItem.multiply(BigDecimal.valueOf(qty)));
        }

        // Voucher discount
        BigDecimal voucherDiscount = BigDecimal.ZERO;
        CheckoutCalculateDto.AppliedVoucher appliedVoucher = null;

        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCase(request.getCouponCode().trim());
            if (couponOpt.isPresent()) {
                Coupon coupon = couponOpt.get();
                OffsetDateTime now = OffsetDateTime.now();

                boolean isTimeValid = (coupon.getStartsAt() == null || now.isAfter(coupon.getStartsAt()))
                        && (coupon.getEndsAt() == null || now.isBefore(coupon.getEndsAt()));
                boolean isUsageValid = (coupon.getUsageLimit() == null || (coupon.getUsedCount() + coupon.getReservedCount()) < coupon.getUsageLimit());
                boolean isMinOrderValid = (coupon.getMinOrderValue() == null || subtotal.compareTo(coupon.getMinOrderValue()) >= 0);

                if (isTimeValid && isUsageValid && isMinOrderValid) {
                    if (coupon.getType() == DiscountType.fixed) {
                        voucherDiscount = coupon.getValue().min(subtotal);
                    } else if (coupon.getType() == DiscountType.percent) {
                        BigDecimal pct = coupon.getValue().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
                        voucherDiscount = subtotal.multiply(pct).setScale(0, RoundingMode.HALF_UP);
                        if (coupon.getMaxDiscount() != null) {
                            voucherDiscount = voucherDiscount.min(coupon.getMaxDiscount());
                        }
                    }
                    appliedVoucher = CheckoutCalculateDto.AppliedVoucher.builder()
                            .code(coupon.getCode())
                            .discount(voucherDiscount)
                            .description("Đã áp dụng mã " + coupon.getCode())
                            .build();
                }
            }
        }

        // Phí vận chuyển
        BigDecimal threshold = getFreeShippingThreshold();
        boolean isStorePickup = "STORE_PICKUP".equalsIgnoreCase(request.getReceiveType());
        boolean isFreeShipping = isStorePickup || subtotal.compareTo(threshold) >= 0;
        BigDecimal shippingFee = isFreeShipping || subtotal.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO : getStandardShippingFee();

        BigDecimal totalAmount = subtotal.subtract(voucherDiscount).add(shippingFee).max(BigDecimal.ZERO);
        BigDecimal totalSavings = directDiscount.add(voucherDiscount);

        return CheckoutCalculateDto.builder()
                .totalItems(totalItems)
                .subtotal(subtotal)
                .directDiscount(directDiscount)
                .voucherDiscount(voucherDiscount)
                .shippingFee(shippingFee)
                .totalAmount(totalAmount)
                .totalSavings(totalSavings)
                .isFreeShipping(isFreeShipping)
                .freeShippingThreshold(threshold)
                .appliedVoucher(appliedVoucher)
                .build();
    }

    @Override
    @Transactional
    public CheckoutSubmitResponse submitCheckout(Customer customer, String idempotencyKey, CheckoutSubmitRequest request, String ipAddress) {
        if (idempotencyKey == null || idempotencyKey.trim().isEmpty()) {
            idempotencyKey = UUID.randomUUID().toString();
        }
        idempotencyKey = idempotencyKey.trim();

        // 1. Idempotency Check: Compute SHA-256 hash of request payload
        String requestJson;
        try {
            requestJson = objectMapper.writeValueAsString(request);
        } catch (Exception e) {
            requestJson = request.toString();
        }
        String requestHash = calculateSha256(requestJson);
        OffsetDateTime idempotencyExpires = OffsetDateTime.now().plusHours(24);

        int inserted = checkoutIdempotencyRepository.insertOnConflictDoNothing(
                customer.getCustomerId(),
                idempotencyKey,
                requestHash,
                idempotencyExpires
        );

        if (inserted == 0) {
            // Key already exists! Check status and hash
            CheckoutIdempotency existing = checkoutIdempotencyRepository
                    .findByCustomerCustomerIdAndIdempotencyKey(customer.getCustomerId(), idempotencyKey)
                    .orElse(null);

            if (existing != null) {
                if (!existing.getRequestHash().equals(requestHash)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Idempotency-Key đã được sử dụng cho một đơn hàng khác.");
                }
                if ("PROCESSING".equals(existing.getStatus())) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Đơn hàng đang được xử lý, vui lòng không nhấn nhiều lần.");
                }
                if ("COMPLETED".equals(existing.getStatus()) && existing.getResponseSnapshot() != null) {
                    try {
                        return objectMapper.readValue(existing.getResponseSnapshot(), CheckoutSubmitResponse.class);
                    } catch (Exception e) {
                        log.warn("Lỗi đọc response_snapshot của idempotency, tiến hành xử lý lại", e);
                    }
                }
            }
        }

        // 2. PostgreSQL Advisory Lock on Customer ID to serialize concurrent requests from this user
        entityManager.createNativeQuery("SELECT pg_advisory_xact_lock(:cId)")
                .setParameter("cId", customer.getCustomerId())
                .getSingleResult();

        // 3. Giới hạn tối đa 3 đơn STORE đang giữ hàng (CONFIRMED) của user
        boolean isStorePickup = "STORE_PICKUP".equalsIgnoreCase(request.getReceiveType());
        if (isStorePickup) {
            Number activeStoreOrders = (Number) entityManager.createNativeQuery(
                    "SELECT COUNT(*) FROM orders WHERE customer_id = :cId AND receive_type = 'STORE_PICKUP' AND status = 'confirmed'")
                    .setParameter("cId", customer.getCustomerId())
                    .getSingleResult();

            if (activeStoreOrders != null && activeStoreOrders.intValue() >= 3) {
                throw new IllegalStateException("Quý khách đang có 3 đơn hàng chờ nhận tại cửa hàng. Vui lòng nhận máy hoặc hủy bớt trước khi tạo thêm đơn mới.");
            }
        }

        // 4. Deadlock Prevention: Sắp xếp các item theo variantId ASC
        List<CheckoutSubmitRequest.ItemRequest> sortedItems = new ArrayList<>(request.getItems());
        sortedItems.sort(Comparator.comparing(CheckoutSubmitRequest.ItemRequest::getVariantId));

        // 5. Xác định kho xuất hàng
        Integer targetWarehouseId = null;
        if (isStorePickup) {
            if (request.getStoreId() == null) {
                throw new IllegalArgumentException("Vui lòng chọn cửa hàng để nhận máy.");
            }
            targetWarehouseId = request.getStoreId();
        } else {
            // HOME_DELIVERY: Thuật toán định tuyến kho
            String province = request.getShippingAddress() != null ? request.getShippingAddress().getProvince() : null;
            targetWarehouseId = determineWarehouseForDelivery(sortedItems, province);
        }

        // 6. Reserve Tồn kho & Flash Sale
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal directDiscount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        List<InventoryReservation> reservations = new ArrayList<>();

        for (CheckoutSubmitRequest.ItemRequest item : sortedItems) {
            ProductVariant variant = productVariantRepository.findWithProductAndImagesById(item.getVariantId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm #" + item.getVariantId()));

            int qty = item.getQuantity() != null && item.getQuantity() > 0 ? item.getQuantity() : 1;
            Product product = variant.getProduct();

            BigDecimal salePrice = variant.getSalePrice() != null ? variant.getSalePrice() : BigDecimal.ZERO;
            BigDecimal originalPrice = salePrice.multiply(new BigDecimal("1.15")).setScale(0, RoundingMode.HALF_UP);

            Long flashSaleItemId = null;
            Optional<FlashSaleItem> fsOpt = flashSaleItemRepository.findActiveFlashSaleItemByProductId(product.getProductId());
            if (fsOpt.isPresent()) {
                FlashSaleItem fsi = fsOpt.get();
                // Kiểm tra giới hạn max_quantity_per_user
                int reservedByUser = inventoryReservationRepository.getReservedQuantityForUserAndFlashSaleItem(fsi.getId(), customer.getCustomerId());
                Number purchasedByUser = (Number) entityManager.createNativeQuery(
                        "SELECT COALESCE(SUM(quantity), 0) FROM flash_sale_user_purchase WHERE item_id = :itemId AND customer_id = :cId")
                        .setParameter("itemId", fsi.getId())
                        .setParameter("cId", customer.getCustomerId())
                        .getSingleResult();

                int totalCountForUser = (purchasedByUser != null ? purchasedByUser.intValue() : 0) + reservedByUser + qty;
                int maxAllowed = fsi.getMaxQuantityPerUser() != null ? fsi.getMaxQuantityPerUser() : 1;

                if (totalCountForUser <= maxAllowed) {
                    // Atomic reserve flash sale item
                    int fsUpdated = flashSaleItemRepository.atomicReserveQuantity(fsi.getId(), qty);
                    if (fsUpdated > 0) {
                        flashSaleItemId = fsi.getId();
                        salePrice = fsi.getSalePrice();
                        originalPrice = fsi.getOriginalPrice();
                    }
                }
            }

            // Atomic reserve kho
            int invUpdated = inventoryRepository.atomicReserveStock(variant.getVariantId(), targetWarehouseId, qty);
            if (invUpdated == 0) {
                // Hết hàng tại kho
                String storeName = warehouseRepository.findById(targetWarehouseId).map(Warehouse::getName).orElse("Kho xuất");
                throw new IllegalStateException("Sản phẩm '" + product.getName() + "' không đủ số lượng tồn tại " + storeName);
            }

            BigDecimal discountPerItem = originalPrice.subtract(salePrice).max(BigDecimal.ZERO);
            BigDecimal lineTotal = salePrice.multiply(BigDecimal.valueOf(qty));

            subtotal = subtotal.add(lineTotal);
            directDiscount = directDiscount.add(discountPerItem.multiply(BigDecimal.valueOf(qty)));

            String imageUrl = (product.getImages() != null && !product.getImages().isEmpty())
                    ? product.getImages().get(0).getUrl()
                    : "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400";

            OrderItem oi = OrderItem.builder()
                    .variant(variant)
                    .quantity(qty)
                    .unitPrice(salePrice)
                    .unitCost(variant.getCostPrice() != null ? variant.getCostPrice() : BigDecimal.ZERO)
                    .productNameSnapshot(product.getName() + " (" + variant.getSku() + ")")
                    .productImageSnapshot(imageUrl)
                    .originalPrice(originalPrice)
                    .salePrice(salePrice)
                    .flashSaleItemId(flashSaleItemId)
                    .build();

            orderItems.add(oi);
        }

        // 7. Lock Coupon (PESSIMISTIC_WRITE) và Reserve Voucher
        BigDecimal voucherDiscount = BigDecimal.ZERO;
        Coupon lockedCoupon = null;

        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCaseWithLock(request.getCouponCode().trim());
            if (couponOpt.isPresent()) {
                Coupon c = couponOpt.get();
                OffsetDateTime now = OffsetDateTime.now();

                boolean isTimeValid = (c.getStartsAt() == null || now.isAfter(c.getStartsAt()))
                        && (c.getEndsAt() == null || now.isBefore(c.getEndsAt()));
                boolean isUsageValid = (c.getUsageLimit() == null || (c.getUsedCount() + c.getReservedCount()) < c.getUsageLimit());
                boolean isMinOrderValid = (c.getMinOrderValue() == null || subtotal.compareTo(c.getMinOrderValue()) >= 0);

                long userUsageCount = voucherUsageRepository.countUsageByCouponAndCustomer(c.getCouponId(), customer.getCustomerId());
                int maxPerUser = c.getMaxUsagePerUser() != null ? c.getMaxUsagePerUser() : 1;

                if (isTimeValid && isUsageValid && isMinOrderValid && userUsageCount < maxPerUser) {
                    lockedCoupon = c;
                    if (c.getType() == DiscountType.fixed) {
                        voucherDiscount = c.getValue().min(subtotal);
                    } else if (c.getType() == DiscountType.percent) {
                        BigDecimal pct = c.getValue().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
                        voucherDiscount = subtotal.multiply(pct).setScale(0, RoundingMode.HALF_UP);
                        if (c.getMaxDiscount() != null) {
                            voucherDiscount = voucherDiscount.min(c.getMaxDiscount());
                        }
                    }
                    c.setReservedCount(c.getReservedCount() + 1);
                    couponRepository.save(c);
                } else {
                    throw new IllegalStateException("Mã giảm giá không hợp lệ, đã hết lượt hoặc chưa đạt giá trị đơn tối thiểu.");
                }
            }
        }

        // 8. Tính phí vận chuyển & tổng tiền
        BigDecimal threshold = getFreeShippingThreshold();
        boolean isFreeShipping = isStorePickup || subtotal.compareTo(threshold) >= 0;
        BigDecimal shippingFee = isFreeShipping || subtotal.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO : getStandardShippingFee();
        BigDecimal totalAmount = subtotal.subtract(voucherDiscount).add(shippingFee).max(BigDecimal.ZERO);

        // 9. Sinh mã đơn hàng và thời gian hết hạn
        String dateStr = OffsetDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomStr = String.format("%04d", new Random().nextInt(10000));
        String orderCode = "ORD-" + dateStr + "-" + randomStr;

        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime expiresAt = isStorePickup ? now.plusHours(24) : now.plusMinutes(15);
        OrderStatus initialStatus = isStorePickup ? OrderStatus.confirmed : OrderStatus.pending_payment;

        // 10. Tạo đơn hàng (Order)
        Warehouse chosenWarehouse = warehouseRepository.findById(targetWarehouseId).orElse(null);

        Order order = Order.builder()
                .orderCode(orderCode)
                .customer(customer)
                .orderDate(now)
                .status(initialStatus)
                .receiveType(isStorePickup ? "STORE_PICKUP" : "HOME_DELIVERY")
                .storeId(isStorePickup ? targetWarehouseId : null)
                .shippingProvince(request.getShippingAddress() != null ? request.getShippingAddress().getProvince() : (chosenWarehouse != null ? chosenWarehouse.getProvince() : null))
                .shippingDistrict(request.getShippingAddress() != null ? request.getShippingAddress().getDistrict() : (chosenWarehouse != null ? chosenWarehouse.getDistrict() : null))
                .shippingWard(request.getShippingAddress() != null ? request.getShippingAddress().getWard() : null)
                .shippingStreet(request.getShippingAddress() != null ? request.getShippingAddress().getStreet() : (chosenWarehouse != null ? chosenWarehouse.getAddress() : null))
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .customerEmail(request.getCustomerEmail())
                .needInvoice(request.isNeedInvoice())
                .paymentMethod(request.getPaymentMethod())
                .subtotal(subtotal)
                .discountAmount(directDiscount)
                .voucherDiscount(voucherDiscount)
                .shippingFee(shippingFee)
                .totalAmount(totalAmount)
                .note(request.getNote())
                .channel("web")
                .expiresAt(expiresAt)
                .updatedAt(now)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Lưu OrderItems
        for (OrderItem oi : orderItems) {
            oi.setOrder(savedOrder);
        }
        savedOrder.setItems(orderItems);
        orderRepository.save(savedOrder);

        // Lưu InventoryReservation
        for (OrderItem oi : orderItems) {
            InventoryReservation res = InventoryReservation.builder()
                    .order(savedOrder)
                    .variant(oi.getVariant())
                    .warehouse(chosenWarehouse)
                    .flashSaleItemId(oi.getFlashSaleItemId())
                    .quantity(oi.getQuantity())
                    .status("RESERVED")
                    .expiresAt(expiresAt)
                    .build();
            inventoryReservationRepository.save(res);
        }

        // Lưu VoucherUsage
        if (lockedCoupon != null) {
            VoucherUsage vu = VoucherUsage.builder()
                    .coupon(lockedCoupon)
                    .customer(customer)
                    .order(savedOrder)
                    .discountAmount(voucherDiscount)
                    .status("RESERVED")
                    .expiresAt(expiresAt)
                    .build();
            voucherUsageRepository.save(vu);
        }

        // Lưu Hóa đơn công ty nếu có
        if (request.isNeedInvoice() && request.getInvoiceInfo() != null) {
            OrderInvoiceInfo inv = OrderInvoiceInfo.builder()
                    .order(savedOrder)
                    .taxCode(request.getInvoiceInfo().getTaxCode())
                    .companyName(request.getInvoiceInfo().getCompanyName())
                    .companyAddress(request.getInvoiceInfo().getCompanyAddress())
                    .companyEmail(request.getInvoiceInfo().getCompanyEmail())
                    .build();
            orderInvoiceInfoRepository.save(inv);
        }

        // Lưu PaymentTransaction
        String provider = request.getPaymentMethod();
        String providerTxnRef;
        if ("STORE".equalsIgnoreCase(provider)) {
            providerTxnRef = "STORE_" + orderCode + "_" + System.currentTimeMillis() + "_" + String.format("%04X", new Random().nextInt(0xFFFF));
        } else {
            providerTxnRef = "VNP_" + orderCode + "_1_" + System.currentTimeMillis();
        }

        PaymentTransaction txn = PaymentTransaction.builder()
                .order(savedOrder)
                .paymentMethod(request.getPaymentMethod())
                .provider(provider)
                .amount(totalAmount)
                .currency("VND")
                .status("INITIATED")
                .providerTxnRef(providerTxnRef)
                .requestPayload(requestJson)
                .expiredAt(expiresAt)
                .build();
        paymentTransactionRepository.save(txn);

        // Xóa các sản phẩm đã mua khỏi giỏ hàng
        try {
            Optional<Cart> cartOpt = cartRepository.findByCustomerCustomerId(customer.getCustomerId());
            if (cartOpt.isPresent()) {
                Cart cart = cartOpt.get();
                for (CheckoutSubmitRequest.ItemRequest item : sortedItems) {
                    cartItemRepository.deleteByIdCartIdAndIdVariantId(cart.getCartId(), item.getVariantId());
                }
            }
        } catch (Exception e) {
            log.warn("Không thể xóa sản phẩm khỏi giỏ hàng sau khi checkout:", e);
        }

        // Sinh payment URL nếu là VNPAY
        String paymentUrl = null;
        if ("VNPAY".equalsIgnoreCase(provider)) {
            paymentUrl = vnPayService.createPaymentUrl(providerTxnRef, totalAmount.longValue(), ipAddress != null ? ipAddress : "127.0.0.1");
        }

        CheckoutSubmitResponse response = CheckoutSubmitResponse.builder()
                .orderId(savedOrder.getOrderId())
                .orderCode(savedOrder.getOrderCode())
                .status(savedOrder.getStatus().name())
                .totalAmount(savedOrder.getTotalAmount())
                .paymentMethod(savedOrder.getPaymentMethod())
                .paymentUrl(paymentUrl)
                .qrPayload(null)
                .expiresAt(savedOrder.getExpiresAt())
                .message(isStorePickup ? "Đặt giữ hàng tại cửa hàng thành công!" : "Khởi tạo đơn hàng thành công, vui lòng thanh toán.")
                .build();

        // Cập nhật Idempotency record sang COMPLETED
        try {
            String respJson = objectMapper.writeValueAsString(response);
            CheckoutIdempotency idemp = checkoutIdempotencyRepository
                    .findByCustomerCustomerIdAndIdempotencyKey(customer.getCustomerId(), idempotencyKey)
                    .orElse(null);
            if (idemp != null) {
                idemp.setOrderId(savedOrder.getOrderId());
                idemp.setStatus("COMPLETED");
                idemp.setResponseSnapshot(respJson);
                checkoutIdempotencyRepository.save(idemp);
            }
        } catch (Exception e) {
            log.warn("Lỗi lưu snapshot idempotency:", e);
        }

        log.info("Khách hàng {} tạo đơn {} thành công. Mã đơn: {}, Tổng tiền: {}",
                customer.getEmail(), savedOrder.getOrderId(), savedOrder.getOrderCode(), savedOrder.getTotalAmount());

        return response;
    }

    private Integer determineWarehouseForDelivery(List<CheckoutSubmitRequest.ItemRequest> items, String province) {
        List<Warehouse> activeWarehouses = warehouseRepository.findAll().stream()
                .filter(w -> Boolean.TRUE.equals(w.getIsActive()))
                .collect(Collectors.toList());

        // TẦNG 1: Cùng tỉnh/thành
        if (province != null && !province.trim().isEmpty()) {
            String pQuery = province.trim().toLowerCase();
            for (Warehouse w : activeWarehouses) {
                if (w.getProvince() != null && w.getProvince().toLowerCase().contains(pQuery)) {
                    if (isWarehouseHasStockForAll(w.getWarehouseId(), items)) {
                        return w.getWarehouseId();
                    }
                }
            }
        }

        // TẦNG 2: Kho tổng vùng (Regional Hub)
        String region = mapProvinceToRegion(province);
        for (Warehouse w : activeWarehouses) {
            if (Boolean.TRUE.equals(w.getIsRegionalHub()) && region.equalsIgnoreCase(w.getRegion())) {
                if (isWarehouseHasStockForAll(w.getWarehouseId(), items)) {
                    return w.getWarehouseId();
                }
            }
        }

        // TẦNG 3: Kho bất kỳ có đủ hàng
        for (Warehouse w : activeWarehouses) {
            if (isWarehouseHasStockForAll(w.getWarehouseId(), items)) {
                return w.getWarehouseId();
            }
        }

        // Mặc định kho tổng 1 nếu không xác định được
        return activeWarehouses.isEmpty() ? 1 : activeWarehouses.get(0).getWarehouseId();
    }

    private boolean isWarehouseHasStockForAll(Integer warehouseId, List<CheckoutSubmitRequest.ItemRequest> items) {
        for (CheckoutSubmitRequest.ItemRequest item : items) {
            Optional<Integer> stockOpt = inventoryRepository.getAvailableStockByVariantIdAndWarehouseId(item.getVariantId(), warehouseId);
            int available = stockOpt.orElse(0);
            if (available < (item.getQuantity() != null ? item.getQuantity() : 1)) {
                return false;
            }
        }
        return true;
    }

    private String mapProvinceToRegion(String province) {
        if (province == null) return "SOUTH";
        String p = province.toLowerCase();
        if (p.contains("hà nội") || p.contains("hải phòng") || p.contains("bắc ninh") || p.contains("thái nguyên")) {
            return "NORTH";
        }
        if (p.contains("đà nẵng") || p.contains("huế") || p.contains("quảng nam") || p.contains("khánh hòa")) {
            return "CENTRAL";
        }
        return "SOUTH";
    }

    @Override
    @Transactional
    public boolean handlePaymentSuccess(String providerTxnRef, String gatewayTxnNo, String callbackPayload) {
        PaymentTransaction txn = paymentTransactionRepository.findByProviderTxnRef(providerTxnRef).orElse(null);
        if (txn == null) {
            log.warn("Không tìm thấy giao dịch thanh toán với provider_txn_ref = {}", providerTxnRef);
            return false;
        }

        if ("SUCCESS".equalsIgnoreCase(txn.getStatus())) {
            log.info("Giao dịch {} đã được xác nhận thành công trước đó (Idempotent)", providerTxnRef);
            return true;
        }

        Order order = txn.getOrder();
        OffsetDateTime now = OffsetDateTime.now();

        // Kiểm tra xem đơn hàng có bị EXPIRED do IPN đến trễ không
        if (order.getStatus() == OrderStatus.expired) {
            log.warn("Đơn hàng #{} đã hết hạn (EXPIRED), IPN đến trễ! Đang thử re-reserve tồn kho...", order.getOrderId());
            boolean reReserved = attemptReReserve(order);
            if (!reReserved) {
                txn.setStatus("REFUND_PENDING");
                txn.setCallbackPayload(callbackPayload);
                paymentTransactionRepository.save(txn);
                log.error("Re-reserve thất bại do hết hàng. Chuyển giao dịch sang REFUND_PENDING để kế toán hoàn tiền.");
                return true;
            }
        }

        // Cập nhật PaymentTransaction sang SUCCESS
        txn.setStatus("SUCCESS");
        txn.setProviderTransactionNo(gatewayTxnNo);
        txn.setCallbackPayload(callbackPayload);
        txn.setPaidAt(now);
        paymentTransactionRepository.save(txn);

        // Cập nhật Order sang PAID
        order.setStatus(OrderStatus.paid);
        order.setUpdatedAt(now);
        orderRepository.save(order);

        // Consume Tồn kho
        List<InventoryReservation> reservations = inventoryReservationRepository.findByOrderOrderIdAndStatus(order.getOrderId(), "RESERVED");
        for (InventoryReservation res : reservations) {
            inventoryRepository.atomicConsumeStock(res.getVariant().getVariantId(), res.getWarehouse().getWarehouseId(), res.getQuantity());
            res.setStatus("CONSUMED");
            res.setUpdatedAt(now);
            inventoryReservationRepository.save(res);

            // Consume Flash Sale nếu có
            if (res.getFlashSaleItemId() != null) {
                flashSaleItemRepository.atomicConsumeQuantity(res.getFlashSaleItemId(), res.getQuantity());
                FlashSaleItem fsItem = flashSaleItemRepository.findById(res.getFlashSaleItemId()).orElse(null);
                FlashSaleUserPurchase fsup = FlashSaleUserPurchase.builder()
                        .item(fsItem)
                        .customer(order.getCustomer())
                        .order(order)
                        .quantity(res.getQuantity())
                        .purchasedAt(now)
                        .build();
                flashSaleUserPurchaseRepository.save(fsup);
            }
        }

        // Consume Voucher
        Optional<VoucherUsage> vuOpt = voucherUsageRepository.findByCouponCouponIdAndOrderOrderId(order.getCouponId(), order.getOrderId());
        if (vuOpt.isPresent()) {
            VoucherUsage vu = vuOpt.get();
            if ("RESERVED".equals(vu.getStatus())) {
                vu.setStatus("CONSUMED");
                voucherUsageRepository.save(vu);

                Coupon c = vu.getCoupon();
                c.setUsedCount(c.getUsedCount() + 1);
                c.setReservedCount(Math.max(0, c.getReservedCount() - 1));
                couponRepository.save(c);
            }
        }

        log.info("Đơn hàng #{} đã chuyển sang trạng thái PAID và consume toàn bộ tồn kho thành công.", order.getOrderId());
        return true;
    }

    private boolean attemptReReserve(Order order) {
        List<OrderItem> items = order.getItems();
        for (OrderItem oi : items) {
            Integer warehouseId = order.getStoreId() != null ? order.getStoreId() : 1;
            int updated = inventoryRepository.atomicReserveStock(oi.getVariant().getVariantId(), warehouseId, oi.getQuantity());
            if (updated == 0) {
                return false;
            }
        }
        return true;
    }

    @Override
    @Transactional
    public void cleanupExpiredOrders() {
        OffsetDateTime now = OffsetDateTime.now();
        List<InventoryReservation> expiredReservations = inventoryReservationRepository.findByStatusAndExpiresAtBefore("RESERVED", now);

        Set<Long> processedOrders = new HashSet<>();

        for (InventoryReservation res : expiredReservations) {
            // Hoàn tồn kho
            inventoryRepository.atomicReleaseStock(res.getVariant().getVariantId(), res.getWarehouse().getWarehouseId(), res.getQuantity());
            res.setStatus("EXPIRED");
            res.setUpdatedAt(now);
            inventoryReservationRepository.save(res);

            // Hoàn Flash Sale nếu có
            if (res.getFlashSaleItemId() != null) {
                flashSaleItemRepository.atomicReleaseQuantity(res.getFlashSaleItemId(), res.getQuantity());
            }

            if (res.getOrder() != null) {
                Long orderId = res.getOrder().getOrderId();
                if (!processedOrders.contains(orderId)) {
                    processedOrders.add(orderId);
                    orderRepository.findById(orderId).ifPresent(order -> {
                        if (order.getStatus() == OrderStatus.pending_payment || order.getStatus() == OrderStatus.confirmed) {
                            order.setStatus(OrderStatus.expired);
                            order.setUpdatedAt(now);
                            orderRepository.save(order);
                        }
                    });
                }
            }
        }

        // Hoàn Voucher hết hạn
        List<VoucherUsage> expiredVouchers = voucherUsageRepository.findByStatusAndExpiresAtBefore("RESERVED", now);
        for (VoucherUsage vu : expiredVouchers) {
            vu.setStatus("RELEASED");
            voucherUsageRepository.save(vu);

            Coupon c = vu.getCoupon();
            c.setReservedCount(Math.max(0, c.getReservedCount() - 1));
            couponRepository.save(c);
        }

        // Dọn Idempotency hết hạn
        checkoutIdempotencyRepository.deleteExpiredRecords(now);
    }
}
