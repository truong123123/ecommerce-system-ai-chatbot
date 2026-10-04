package com.store.service.impl;

import com.store.dto.cart.*;
import com.store.entity.*;
import com.store.repository.*;
import com.store.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;
    private final FlashSaleItemRepository flashSaleItemRepository;
    private final FlashSaleUserPurchaseRepository flashSaleUserPurchaseRepository;
    private final InventoryReservationRepository inventoryReservationRepository;

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("300000");
    private static final BigDecimal DEFAULT_SHIPPING_FEE = new BigDecimal("30000");

    @Transactional
    public Cart getOrCreateCart(Customer customer) {
        return cartRepository.findByCustomerCustomerId(customer.getCustomerId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .customer(customer)
                            .createdAt(OffsetDateTime.now())
                            .updatedAt(OffsetDateTime.now())
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public CartDto getCart(Customer customer, List<Long> selectedVariantIds, String couponCode) {
        Cart cart = getOrCreateCart(customer);
        List<CartItem> cartItems = cartItemRepository.findByIdCartId(cart.getCartId());

        List<CartItemDto> itemDtos = new ArrayList<>();
        Set<Long> selectedSet = selectedVariantIds != null ? new HashSet<>(selectedVariantIds) : null;

        for (CartItem ci : cartItems) {
            ProductVariant variant = ci.getVariant();
            Product product = variant.getProduct();

            Integer availableStock = inventoryRepository.getAvailableStockByVariantId(variant.getVariantId());
            if (availableStock == null) availableStock = 0;

            boolean inStock = availableStock > 0 
                    && Boolean.TRUE.equals(product.getIsActive()) 
                    && Boolean.TRUE.equals(variant.getIsActive());

            // Nếu hết hàng thì không bao giờ được chọn
            boolean isSelected;
            if (!inStock) {
                isSelected = false;
            } else if (selectedSet == null) {
                // Mặc định chọn tất cả sản phẩm còn hàng
                isSelected = true;
            } else {
                isSelected = selectedSet.contains(variant.getVariantId());
            }

            BigDecimal salePrice = variant.getSalePrice() != null ? variant.getSalePrice() : BigDecimal.ZERO;
            BigDecimal originalPrice = salePrice.multiply(new BigDecimal("1.12")).setScale(0, RoundingMode.HALF_UP);

            // Quy tắc: Giá hiển thị ở giỏ hàng do BACKEND quyết định: nếu sản phẩm thuộc slot đang ACTIVE và còn suất thì áp giá Flash Sale, ngược lại dùng giá thường.
            // Giới hạn: Mỗi SĐT/tài khoản chỉ mua tối đa 1 sản phẩm cùng loại trong Flash Sale.
            Optional<FlashSaleItem> fsOpt = flashSaleItemRepository.findActiveFlashSaleItemByProductId(product.getProductId());
            if (fsOpt.isPresent()) {
                FlashSaleItem fsi = fsOpt.get();
                int remaining = (fsi.getTotalStock() != null ? fsi.getTotalStock() : 0)
                        - (fsi.getSoldCount() != null ? fsi.getSoldCount() : 0)
                        - (fsi.getReservedQuantity() != null ? fsi.getReservedQuantity() : 0);

                boolean userAlreadyBought = false;
                if (customer != null) {
                    int bought = flashSaleUserPurchaseRepository.countPurchasedByCustomerOrPhone(
                            fsi.getId(), product.getProductId(), customer.getCustomerId(), customer.getPhone());
                    int reserved = inventoryReservationRepository.getReservedQuantityForUserOrPhoneAndFlashSaleItem(
                            fsi.getId(), customer.getCustomerId(), customer.getPhone());
                    if (bought > 0 || reserved > 0) {
                        userAlreadyBought = true;
                    }
                }

                if (remaining >= ci.getQuantity() && !userAlreadyBought && ci.getQuantity() <= 1) {
                    salePrice = fsi.getSalePrice();
                    if (fsi.getOriginalPrice() != null && fsi.getOriginalPrice().compareTo(BigDecimal.ZERO) > 0) {
                        originalPrice = fsi.getOriginalPrice();
                    }
                }
            }

            BigDecimal discountAmount = originalPrice.subtract(salePrice);
            if (discountAmount.compareTo(BigDecimal.ZERO) < 0) {
                discountAmount = BigDecimal.ZERO;
            }

            String imageUrl = "";
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                imageUrl = product.getImages().get(0).getUrl();
            }

            BigDecimal lineTotal = salePrice.multiply(BigDecimal.valueOf(ci.getQuantity()));

            CartItemDto itemDto = CartItemDto.builder()
                    .cartItemId(variant.getVariantId())
                    .variantId(variant.getVariantId())
                    .productId(product.getProductId())
                    .name(product.getName())
                    .sku(variant.getSku())
                    .slug(product.getSlug())
                    .imageUrl(imageUrl)
                    .attributes(variant.getAttributes())
                    .price(salePrice)
                    .originalPrice(originalPrice)
                    .discountAmount(discountAmount)
                    .quantity(ci.getQuantity())
                    .stockQuantity(availableStock)
                    .inStock(inStock)
                    .isSelected(isSelected)
                    .lineTotal(lineTotal)
                    .build();

            itemDtos.add(itemDto);
        }

        // Tính toán tóm tắt đơn hàng dựa trên các item ĐƯỢC CHỌN VÀ CÒN HÀNG
        List<CartItemDto> selectedItems = itemDtos.stream()
                .filter(i -> Boolean.TRUE.equals(i.getIsSelected()) && Boolean.TRUE.equals(i.getInStock()))
                .collect(Collectors.toList());

        BigDecimal subtotal = selectedItems.stream()
                .map(CartItemDto::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal directDiscount = selectedItems.stream()
                .map(i -> i.getDiscountAmount().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Áp dụng Coupon nếu có
        CartDto.CouponInfo couponInfo = null;
        BigDecimal couponDiscount = BigDecimal.ZERO;

        if (couponCode != null && !couponCode.trim().isEmpty() && subtotal.compareTo(BigDecimal.ZERO) > 0) {
            Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCase(couponCode.trim());
            if (couponOpt.isPresent()) {
                Coupon coupon = couponOpt.get();
                OffsetDateTime now = OffsetDateTime.now();

                boolean isDateValid = (coupon.getStartsAt() == null || now.isAfter(coupon.getStartsAt()))
                        && (coupon.getEndsAt() == null || now.isBefore(coupon.getEndsAt()));
                boolean isUsageValid = coupon.getUsageLimit() == null || coupon.getUsedCount() < coupon.getUsageLimit();
                boolean isOrderValueValid = coupon.getMinOrderValue() == null 
                        || subtotal.compareTo(coupon.getMinOrderValue()) >= 0;

                if (isDateValid && isUsageValid && isOrderValueValid) {
                    if (coupon.getType() == DiscountType.fixed) {
                        couponDiscount = coupon.getValue().min(subtotal);
                    } else if (coupon.getType() == DiscountType.percent) {
                        BigDecimal pct = coupon.getValue().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
                        couponDiscount = subtotal.multiply(pct).setScale(0, RoundingMode.HALF_UP);
                        if (coupon.getMaxDiscount() != null) {
                            couponDiscount = couponDiscount.min(coupon.getMaxDiscount());
                        }
                    }

                    couponInfo = CartDto.CouponInfo.builder()
                            .code(coupon.getCode())
                            .discount(couponDiscount)
                            .type(coupon.getType().name())
                            .value(coupon.getValue())
                            .minOrderValue(coupon.getMinOrderValue())
                            .description("Đã áp dụng mã " + coupon.getCode())
                            .build();
                }
            }
        }

        BigDecimal shippingFee = BigDecimal.ZERO;
        if (selectedItems.isEmpty() || subtotal.compareTo(BigDecimal.ZERO) == 0) {
            shippingFee = BigDecimal.ZERO;
        } else if (subtotal.compareTo(FREE_SHIPPING_THRESHOLD) < 0) {
            shippingFee = DEFAULT_SHIPPING_FEE;
        }

        BigDecimal total = subtotal.subtract(couponDiscount).add(shippingFee);
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
        }

        BigDecimal totalSavings = directDiscount.add(couponDiscount);

        CartDto.CartSummary summary = CartDto.CartSummary.builder()
                .totalItems(itemDtos.size())
                .selectedItemsCount(selectedItems.size())
                .subtotal(subtotal)
                .directDiscount(directDiscount)
                .couponDiscount(couponDiscount)
                .shippingFee(shippingFee)
                .total(total)
                .totalSavings(totalSavings)
                .build();

        return CartDto.builder()
                .cartId(cart.getCartId())
                .items(itemDtos)
                .appliedCoupon(couponInfo)
                .summary(summary)
                .build();
    }

    @Override
    @Transactional
    public CartDto addToCart(Customer customer, AddToCartRequest request) {
        Cart cart = getOrCreateCart(customer);

        ProductVariant variant;
        if (request.getVariantId() != null) {
            variant = productVariantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new IllegalArgumentException("Biến thể sản phẩm không tồn tại: " + request.getVariantId()));
        } else if (request.getProductId() != null) {
            List<ProductVariant> variants = productVariantRepository.findByProductProductId(request.getProductId());
            if (variants.isEmpty()) {
                throw new IllegalArgumentException("Sản phẩm chưa có biến thể: " + request.getProductId());
            }
            variant = variants.get(0);
        } else {
            throw new IllegalArgumentException("Vui lòng cung cấp variantId hoặc productId");
        }

        // Kiểm tra tồn kho
        Integer availableStock = inventoryRepository.getAvailableStockByVariantId(variant.getVariantId());
        if (availableStock == null || availableStock <= 0) {
            throw new IllegalStateException("Sản phẩm '" + variant.getProduct().getName() + "' hiện đã hết hàng trong kho.");
        }

        int requestedQty = request.getQuantity() != null && request.getQuantity() > 0 ? request.getQuantity() : 1;

        Optional<CartItem> existingOpt = cartItemRepository.findByIdCartIdAndIdVariantId(cart.getCartId(), variant.getVariantId());
        if (existingOpt.isPresent()) {
            CartItem existing = existingOpt.get();
            int newQty = existing.getQuantity() + requestedQty;
            if (newQty > availableStock) {
                newQty = availableStock;
            }
            existing.setQuantity(newQty);
            cartItemRepository.save(existing);
        } else {
            int initialQty = Math.min(requestedQty, availableStock);
            CartItem newItem = CartItem.builder()
                    .id(new CartItemId(cart.getCartId(), variant.getVariantId()))
                    .cart(cart)
                    .variant(variant)
                    .quantity(initialQty)
                    .build();
            cartItemRepository.save(newItem);
        }

        return getCart(customer, null, null);
    }

    @Override
    @Transactional
    public CartDto updateItemQuantity(Customer customer, Long variantId, Integer quantity) {
        Cart cart = getOrCreateCart(customer);

        if (quantity == null || quantity <= 0) {
            cartItemRepository.deleteByIdCartIdAndIdVariantId(cart.getCartId(), variantId);
            return getCart(customer, null, null);
        }

        Integer availableStock = inventoryRepository.getAvailableStockByVariantId(variantId);
        if (availableStock == null || availableStock <= 0) {
            throw new IllegalStateException("Sản phẩm hiện đã hết hàng.");
        }

        if (quantity > availableStock) {
            throw new IllegalArgumentException("Số lượng yêu cầu (" + quantity + ") vượt quá số lượng còn lại trong kho (" + availableStock + ").");
        }

        CartItem item = cartItemRepository.findByIdCartIdAndIdVariantId(cart.getCartId(), variantId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không có trong giỏ hàng."));

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        return getCart(customer, null, null);
    }

    @Override
    @Transactional
    public CartDto removeItem(Customer customer, Long variantId) {
        Cart cart = getOrCreateCart(customer);
        cartItemRepository.deleteByIdCartIdAndIdVariantId(cart.getCartId(), variantId);
        return getCart(customer, null, null);
    }

    @Override
    @Transactional
    public CartDto clearCart(Customer customer) {
        Cart cart = getOrCreateCart(customer);
        cartItemRepository.deleteByIdCartId(cart.getCartId());
        return getCart(customer, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public CartDto applyCoupon(Customer customer, ApplyCouponRequest request) {
        return getCart(customer, request.getSelectedVariantIds(), request.getCouponCode());
    }

    @Override
    @Transactional
    public Order checkout(Customer customer, CheckoutRequest request) {
        if (request.getSelectedVariantIds() == null || request.getSelectedVariantIds().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
        }

        Cart cart = getOrCreateCart(customer);
        List<CartItem> cartItems = cartItemRepository.findByIdCartId(cart.getCartId());

        Set<Long> selectedIds = new HashSet<>(request.getSelectedVariantIds());
        List<CartItem> selectedCartItems = cartItems.stream()
                .filter(ci -> selectedIds.contains(ci.getVariant().getVariantId()))
                .collect(Collectors.toList());

        if (selectedCartItems.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy các sản phẩm đã chọn trong giỏ hàng.");
        }

        // Tính giá chuẩn từ server và kiểm tra tồn kho
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem ci : selectedCartItems) {
            ProductVariant variant = ci.getVariant();
            Integer stock = inventoryRepository.getAvailableStockByVariantId(variant.getVariantId());
            if (stock == null || stock < ci.getQuantity()) {
                throw new IllegalStateException("Sản phẩm '" + variant.getProduct().getName() + "' không đủ số lượng trong kho.");
            }

            BigDecimal unitPrice = variant.getSalePrice() != null ? variant.getSalePrice() : BigDecimal.ZERO;
            BigDecimal unitCost = variant.getCostPrice() != null ? variant.getCostPrice() : BigDecimal.ZERO;

            OrderItem oi = OrderItem.builder()
                    .variant(variant)
                    .quantity(ci.getQuantity())
                    .unitPrice(unitPrice)
                    .unitCost(unitCost)
                    .build();

            orderItems.add(oi);
            subtotal = subtotal.add(unitPrice.multiply(BigDecimal.valueOf(ci.getQuantity())));
        }

        // Kiểm tra và áp dụng coupon nếu có
        BigDecimal discountAmount = BigDecimal.ZERO;
        Integer couponId = null;

        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCase(request.getCouponCode().trim());
            if (couponOpt.isPresent()) {
                Coupon coupon = couponOpt.get();
                OffsetDateTime now = OffsetDateTime.now();
                if ((coupon.getStartsAt() == null || now.isAfter(coupon.getStartsAt()))
                        && (coupon.getEndsAt() == null || now.isBefore(coupon.getEndsAt()))
                        && (coupon.getMinOrderValue() == null || subtotal.compareTo(coupon.getMinOrderValue()) >= 0)) {
                    
                    couponId = coupon.getCouponId();
                    if (coupon.getType() == DiscountType.fixed) {
                        discountAmount = coupon.getValue().min(subtotal);
                    } else if (coupon.getType() == DiscountType.percent) {
                        BigDecimal pct = coupon.getValue().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
                        discountAmount = subtotal.multiply(pct).setScale(0, RoundingMode.HALF_UP);
                        if (coupon.getMaxDiscount() != null) {
                            discountAmount = discountAmount.min(coupon.getMaxDiscount());
                        }
                    }
                    coupon.setUsedCount(coupon.getUsedCount() + 1);
                    couponRepository.save(coupon);
                }
            }
        }

        BigDecimal shippingFee = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : DEFAULT_SHIPPING_FEE;
        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(shippingFee);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) totalAmount = BigDecimal.ZERO;

        Order order = Order.builder()
                .customer(customer)
                .addressId(request.getAddressId())
                .couponId(couponId)
                .orderDate(OffsetDateTime.now())
                .status(OrderStatus.pending)
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .shippingFee(shippingFee)
                .totalAmount(totalAmount)
                .note(request.getNote() != null ? request.getNote() : "Đặt hàng qua Website")
                .channel("web")
                .build();

        Order savedOrder = orderRepository.save(order);

        for (OrderItem oi : orderItems) {
            oi.setOrder(savedOrder);
        }
        savedOrder.setItems(orderItems);
        orderRepository.save(savedOrder);

        // Xóa các sản phẩm đã đặt mua khỏi giỏ hàng
        for (CartItem ci : selectedCartItems) {
            cartItemRepository.deleteByIdCartIdAndIdVariantId(cart.getCartId(), ci.getVariant().getVariantId());
        }

        log.info("Khách hàng {} đã tạo đơn hàng #{} thành công. Tổng tiền: {}", customer.getEmail(), savedOrder.getOrderId(), savedOrder.getTotalAmount());
        return savedOrder;
    }
}
