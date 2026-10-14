package com.store.chat.tool;

import com.store.dto.chat.ProductCardDto;
import com.store.entity.Customer;
import lombok.Getter;
import lombok.Setter;

import java.util.*;

@Getter
@Setter
public class ChatContext {

    private final Customer currentCustomer;
    private final Map<Long, ProductCardDto> collectedProducts = new LinkedHashMap<>();

    public ChatContext(Customer currentCustomer) {
        this.currentCustomer = currentCustomer;
    }

    public synchronized void addProduct(ProductCardDto product) {
        if (product != null && product.getId() != null) {
            collectedProducts.putIfAbsent(product.getId(), product);
        }
    }

    public synchronized void addProducts(Collection<ProductCardDto> products) {
        if (products != null) {
            for (ProductCardDto p : products) {
                addProduct(p);
            }
        }
    }

    public synchronized List<ProductCardDto> getCollectedProductsList() {
        return new ArrayList<>(collectedProducts.values());
    }

    public boolean isAuthenticated() {
        return currentCustomer != null;
    }
}
