package com.store.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getDashboardOverview() {
        Map<String, Object> response = new HashMap<>();

        // 1. Dữ liệu từ View v_dashboard_today
        Map<String, Object> todayStats = new HashMap<>();
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM v_dashboard_today LIMIT 1");
            if (!rows.isEmpty()) {
                todayStats = rows.get(0);
            }
        } catch (Exception e) {
            todayStats.put("error", e.getMessage());
        }
        response.put("today", todayStats);

        // 2. Dữ liệu từ View v_monthly_revenue
        List<Map<String, Object>> monthlyStats;
        try {
            monthlyStats = jdbcTemplate.queryForList(
                    "SELECT * FROM v_monthly_revenue ORDER BY month DESC LIMIT 6"
            );
        } catch (Exception e) {
            monthlyStats = List.of();
        }
        response.put("monthlyRevenue", monthlyStats);

        // 3. Đơn cần xử lý từ View v_pending_orders
        List<Map<String, Object>> pendingOrders;
        try {
            pendingOrders = jdbcTemplate.queryForList(
                    "SELECT * FROM v_pending_orders LIMIT 10"
            );
        } catch (Exception e) {
            pendingOrders = List.of();
        }
        response.put("pendingOrders", pendingOrders);

        // 4. Cảnh báo tồn kho từ View v_low_stock
        List<Map<String, Object>> lowStockItems;
        try {
            lowStockItems = jdbcTemplate.queryForList(
                    "SELECT * FROM v_low_stock LIMIT 10"
            );
        } catch (Exception e) {
            lowStockItems = List.of();
        }
        response.put("lowStockItems", lowStockItems);

        // 5. Danh sách 10 đơn hàng mới nhất
        List<Map<String, Object>> recentOrders;
        try {
            recentOrders = jdbcTemplate.queryForList(
                    "SELECT o.order_id, o.order_date, o.status, o.total_amount, o.channel, " +
                    "c.full_name AS customer_name, c.email AS customer_email " +
                    "FROM orders o " +
                    "JOIN customers c ON c.customer_id = o.customer_id " +
                    "ORDER BY o.order_date DESC LIMIT 10"
            );
        } catch (Exception e) {
            recentOrders = List.of();
        }
        response.put("recentOrders", recentOrders);

        return ResponseEntity.ok(response);
    }
}
