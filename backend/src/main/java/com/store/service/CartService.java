package com.store.service;

import com.store.dto.cart.*;
import com.store.entity.Customer;
import com.store.entity.Order;

import java.util.List;

public interface CartService {
    CartDto getCart(Customer customer, List<Long> selectedVariantIds, String couponCode);
    CartDto addToCart(Customer customer, AddToCartRequest request);
    CartDto updateItemQuantity(Customer customer, Long variantId, Integer quantity);
    CartDto removeItem(Customer customer, Long variantId);
    CartDto clearCart(Customer customer);
    CartDto applyCoupon(Customer customer, ApplyCouponRequest request);
    Order checkout(Customer customer, CheckoutRequest request);
}
