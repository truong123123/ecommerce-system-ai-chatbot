package com.store.repository;

import com.store.entity.CartItem;
import com.store.entity.CartItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, CartItemId> {
    List<CartItem> findByIdCartId(Long cartId);
    Optional<CartItem> findByIdCartIdAndIdVariantId(Long cartId, Long variantId);
    void deleteByIdCartIdAndIdVariantId(Long cartId, Long variantId);
    void deleteByIdCartId(Long cartId);
}
