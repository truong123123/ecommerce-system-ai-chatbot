package com.store.service.impl;

import com.store.dto.WishlistItemDto;
import com.store.entity.*;
import com.store.repository.*;
import com.store.service.WishlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    private Customer resolveCustomer(String email) {
        return customerRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin khách hàng."));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemDto> getWishlist(String customerEmail) {
        Customer customer = resolveCustomer(customerEmail);
        List<WishlistItem> items = wishlistRepository.findByCustomerCustomerIdOrderByCreatedAtDesc(customer.getCustomerId());

        return items.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WishlistItemDto addToWishlist(String customerEmail, Long productId) {
        Customer customer = resolveCustomer(customerEmail);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm với ID: " + productId));

        Optional<WishlistItem> existing = wishlistRepository.findByCustomerCustomerIdAndProductProductId(
                customer.getCustomerId(), product.getProductId()
        );

        if (existing.isPresent()) {
            return mapToDto(existing.get());
        }

        WishlistItem item = WishlistItem.builder()
                .customer(customer)
                .product(product)
                .build();

        item = wishlistRepository.save(item);
        return mapToDto(item);
    }

    @Override
    @Transactional
    public void removeFromWishlist(String customerEmail, Long productId) {
        Customer customer = resolveCustomer(customerEmail);
        wishlistRepository.deleteByCustomerCustomerIdAndProductProductId(customer.getCustomerId(), productId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isWishlisted(String customerEmail, Long productId) {
        Customer customer = resolveCustomer(customerEmail);
        return wishlistRepository.existsByCustomerCustomerIdAndProductProductId(customer.getCustomerId(), productId);
    }

    private WishlistItemDto mapToDto(WishlistItem item) {
        Product p = item.getProduct();

        String primaryImg = null;
        if (p.getImages() != null && !p.getImages().isEmpty()) {
            primaryImg = p.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .map(ProductImage::getUrl)
                    .findFirst()
                    .orElse(p.getImages().get(0).getUrl());
        }

        BigDecimal minPrice = BigDecimal.ZERO;
        BigDecimal maxPrice = BigDecimal.ZERO;
        BigDecimal oldPrice = null;
        boolean inStock = false;

        if (p.getVariants() != null && !p.getVariants().isEmpty()) {
            for (ProductVariant v : p.getVariants()) {
                if (v.getSalePrice() != null) {
                    if (minPrice.compareTo(BigDecimal.ZERO) == 0 || v.getSalePrice().compareTo(minPrice) < 0) {
                        minPrice = v.getSalePrice();
                        oldPrice = v.getCostPrice();
                    }
                    if (v.getSalePrice().compareTo(maxPrice) > 0) {
                        maxPrice = v.getSalePrice();
                    }
                }
                Integer avail = inventoryRepository.getAvailableStockByVariantId(v.getVariantId());
                if (avail != null && avail > 0) {
                    inStock = true;
                }
            }
        }

        return WishlistItemDto.builder()
                .id(item.getWishlistItemId())
                .productId(p.getProductId())
                .name(p.getName())
                .slug(p.getSlug())
                .primaryImage(primaryImg)
                .price(minPrice)
                .maxPrice(maxPrice)
                .oldPrice(oldPrice)
                .isActive(p.getIsActive())
                .inStock(inStock)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : "")
                .brandName(p.getBrand() != null ? p.getBrand().getName() : "")
                .addedAt(item.getCreatedAt())
                .build();
    }
}
