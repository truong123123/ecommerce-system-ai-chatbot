package com.store.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemId implements Serializable {

    @Column(name = "cart_id")
    private Long cartId;

    @Column(name = "variant_id")
    private Long variantId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CartItemId that = (CartItemId) o;
        return Objects.equals(cartId, that.cartId) && Objects.equals(variantId, that.variantId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(cartId, variantId);
    }
}
