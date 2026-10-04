package com.store.controller;

import com.store.entity.Order;
import com.store.entity.OrderStatus;
import com.store.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderController {

    private final OrderRepository orderRepository;
    private final com.store.service.CheckoutService checkoutService;

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAllByOrderByOrderDateDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String statusStr = body.get("status");
        if (statusStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu trạng thái status"));
        }

        return orderRepository.findById(id).map(order -> {
            try {
                OrderStatus newStatus = OrderStatus.valueOf(statusStr.toLowerCase());
                order.setStatus(newStatus);
                orderRepository.save(order);

                // Nếu đơn bị hủy hoặc hoàn trả -> giải phóng giữ chỗ / hoàn lại suất Flash Sale
                if (newStatus == OrderStatus.cancelled || newStatus == OrderStatus.returned) {
                    checkoutService.handleOrderCancellation(order.getOrderId());
                }

                return ResponseEntity.ok(order);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Trạng thái không hợp lệ: " + statusStr));
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}
