package com.store.chat.tool;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.entity.Customer;
import com.store.entity.Order;
import com.store.entity.OrderItem;
import com.store.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class GetOrderStatusTool implements ChatTool {

    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;

    @Override
    public String getName() {
        return "get_order_status";
    }

    @Override
    public String getDescription() {
        return "Tra cứu thông tin và tiến độ xử lý đơn hàng theo mã đơn hàng hoặc ID đơn hàng. Chỉ áp dụng cho khách hàng đã đăng nhập và chỉ tra cứu được đơn hàng của chính mình.";
    }

    @Override
    public Map<String, Object> getParameterSchema() {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "OBJECT");

        Map<String, Object> properties = new LinkedHashMap<>();
        Map<String, Object> orderIdProp = new LinkedHashMap<>();
        orderIdProp.put("type", "STRING");
        orderIdProp.put("description", "Mã đơn hàng (ví dụ: ORD-2026-001) hoặc mã số ID đơn hàng");
        properties.put("orderId", orderIdProp);

        schema.put("properties", properties);
        schema.put("required", List.of("orderId"));
        return schema;
    }

    @Override
    public ToolExecutionResult execute(Map<String, Object> args, ChatContext ctx) {
        // 1. Kiểm tra trạng thái xác thực
        if (!ctx.isAuthenticated() || ctx.getCurrentCustomer() == null) {
            return ToolExecutionResult.of("{\"error\": \"Bạn cần đăng nhập tài khoản để tra cứu thông tin đơn hàng.\"}");
        }

        if (args == null || !args.containsKey("orderId") || args.get("orderId") == null) {
            return ToolExecutionResult.of("{\"error\": \"Vui lòng cung cấp mã đơn hàng cần tra cứu.\"}");
        }

        String input = String.valueOf(args.get("orderId")).trim();
        if (input.isEmpty() || input.length() > 50) {
            return ToolExecutionResult.of("{\"error\": \"Mã đơn hàng không hợp lệ.\"}");
        }

        Customer currentCustomer = ctx.getCurrentCustomer();
        Optional<Order> orderOpt = Optional.empty();

        // 2. Tra cứu theo mã orderCode hoặc ID số
        if (input.toUpperCase().startsWith("ORD") || input.contains("-")) {
            orderOpt = orderRepository.findByOrderCode(input);
        } else {
            try {
                Long numericId = Long.parseLong(input);
                orderOpt = orderRepository.findById(numericId);
            } catch (NumberFormatException e) {
                orderOpt = orderRepository.findByOrderCode(input);
            }
        }

        // 3. Bảo vệ quyền riêng tư: Nếu không tìm thấy hoặc đơn hàng thuộc khách hàng khác
        if (orderOpt.isEmpty()) {
            return ToolExecutionResult.of("{\"error\": \"Không tìm thấy đơn hàng tương ứng trong hệ thống của bạn.\"}");
        }

        Order order = orderOpt.get();
        if (order.getCustomer() == null || !order.getCustomer().getCustomerId().equals(currentCustomer.getCustomerId())) {
            // Không tiết lộ đơn của người khác
            log.warn("Cảnh báo bảo mật: Khách hàng id={} cố gắng tra cứu đơn hàng id={} thuộc về khách hàng id={}",
                    currentCustomer.getCustomerId(), order.getOrderId(),
                    order.getCustomer() != null ? order.getCustomer().getCustomerId() : "null");
            return ToolExecutionResult.of("{\"error\": \"Không tìm thấy đơn hàng tương ứng trong hệ thống của bạn.\"}");
        }

        // 4. Trả kết quả tóm tắt an toàn (KHÔNG lộ địa chỉ chi tiết, SĐT hay ghi chú nhạy cảm)
        List<Map<String, Object>> itemSummaries = new ArrayList<>();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                String name = item.getProductNameSnapshot();
                if (name == null && item.getVariant() != null && item.getVariant().getProduct() != null) {
                    name = item.getVariant().getProduct().getName();
                }

                Map<String, Object> itemMap = new LinkedHashMap<>();
                itemMap.put("productName", name != null ? name : "Sản phẩm công nghệ");
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("unitPrice", item.getUnitPrice());
                itemMap.put("lineTotal", item.getLineTotal() != null
                        ? item.getLineTotal()
                        : item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                itemSummaries.add(itemMap);
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("orderCode", order.getOrderCode());
        response.put("status", order.getStatus() != null ? order.getStatus().name() : "pending");
        response.put("orderDate", order.getOrderDate() != null ? order.getOrderDate().toString() : "");
        response.put("totalAmount", order.getTotalAmount());
        response.put("paymentMethod", order.getPaymentMethod());
        response.put("receiveType", order.getReceiveType());
        response.put("items", itemSummaries);

        try {
            return ToolExecutionResult.of(objectMapper.writeValueAsString(response));
        } catch (Exception e) {
            log.error("Lỗi serialize get_order_status: {}", e.getMessage());
            return ToolExecutionResult.of("{\"error\": \"Không thể tra cứu chi tiết đơn hàng lúc này\"}");
        }
    }
}
