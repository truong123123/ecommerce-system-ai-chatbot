package com.store.service;

import com.store.dto.WishlistItemDto;

import java.util.List;

public interface WishlistService {
    List<WishlistItemDto> getWishlist(String customerEmail);
    WishlistItemDto addToWishlist(String customerEmail, Long productId);
    void removeFromWishlist(String customerEmail, Long productId);
    boolean isWishlisted(String customerEmail, Long productId);
}
