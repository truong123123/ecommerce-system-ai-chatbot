package com.store.controller;

import com.store.entity.Customer;
import com.store.entity.Order;
import com.store.entity.OrderStatus;
import com.store.entity.Staff;
import com.store.repository.CustomerRepository;
import com.store.repository.OrderRepository;
import com.store.repository.StaffRepository;
import com.store.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class OrderController {

    private final OrderRepository orderRepository;
    private final CheckoutService checkoutService;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;

    private boolean isStaffUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN")
                        || a.getAuthority().equalsIgnoreCase("ROLE_SALES")
                        || a.getAuthority().equalsIgnoreCase("ROLE_WAREHOUSE")
                        || a.getAuthority().equalsIgnoreCase("ROLE_SUPPORT")
                        || a.getAuthority().equalsIgnoreCase("ROLE_MANAGER"));
    }

    private Optional<Customer> getAuthenticatedCustomer(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            return Optional.empty();
        }
        return customerRepository.findByEmailIgnoreCase(auth.getName());
    }

    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập để xem đơn hàng."));
        }

        // Nếu là Staff / Admin -> xem tất cả đơn hàng
        if (isStaffUser(auth)) {
            return ResponseEntity.ok(orderRepository.findAllByOrderByOrderDateDesc());
        }

        // Nếu là Customer -> CHỈ xem đơn hàng của chính mình (chống IDOR)
        Optional<Customer> customerOpt = getAuthenticatedCustomer(auth);
        if (customerOpt.isPresent()) {
            return ResponseEntity.ok(orderRepository.findByCustomerCustomerIdOrderByOrderDateDesc(customerOpt.get().getCustomerId()));
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Không có quyền truy cập danh sách đơn hàng."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập để xem thông tin đơn hàng."));
        }

        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy đơn hàng với mã ID: " + id));
        }

        Order order = orderOpt.get();

        // Nếu là Staff -> xem được mọi đơn hàng
        if (isStaffUser(auth)) {
            return ResponseEntity.ok(order);
        }

        // Nếu là Customer -> CHỐNG IDOR: chỉ cho phép xem nếu đơn hàng thuộc về chính mình
        Optional<Customer> customerOpt = getAuthenticatedCustomer(auth);
        if (customerOpt.isPresent() && order.getCustomer() != null
                && order.getCustomer().getCustomerId().equals(customerOpt.get().getCustomerId())) {
            return ResponseEntity.ok(order);
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Bạn không có quyền truy cập thông tin đơn hàng của người khác."));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập để thực hiện thao tác này."));
        }

        String statusStr = body.get("status");
        if (statusStr == null || statusStr.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu trạng thái status"));
        }

        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy đơn hàng với mã ID: " + id));
        }

        Order order = orderOpt.get();
        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(statusStr.toLowerCase().trim());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Trạng thái không hợp lệ: " + statusStr));
        }

        boolean isStaff = isStaffUser(auth);
        Optional<Customer> customerOpt = getAuthenticatedCustomer(auth);

        // Khách hàng chỉ được phép hủy đơn hàng của chính mình khi đơn đang ở trạng thái pending hoặc pending_payment
        if (!isStaff) {
            if (customerOpt.isEmpty() || order.getCustomer() == null
                    || !order.getCustomer().getCustomerId().equals(customerOpt.get().getCustomerId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Bạn không có quyền thay đổi trạng thái đơn hàng của người khác."));
            }

            if (newStatus != OrderStatus.cancelled) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Khách hàng chỉ có quyền yêu cầu hủy đơn hàng."));
            }

            if (order.getStatus() != OrderStatus.pending && order.getStatus() != OrderStatus.pending_payment) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Đơn hàng đang xử lý hoặc vận chuyển không thể tự hủy trực tiếp. Vui lòng liên hệ hỗ trợ."));
            }
        }

        order.setStatus(newStatus);
        orderRepository.save(order);

        // Nếu đơn bị hủy hoặc hoàn trả -> giải phóng giữ chỗ / hoàn lại suất Flash Sale
        if (newStatus == OrderStatus.cancelled || newStatus == OrderStatus.returned) {
            checkoutService.handleOrderCancellation(order.getOrderId());
        }

        return ResponseEntity.ok(order);
    }
}
