-- ==============================================================================
-- ⚠️ CẢNH BÁO NGUY HIỂM / DANGER WARNING:
-- Script này thực thi các lệnh DELETE trực tiếp trên dữ liệu:
--   - Bảng order_status_history, order_items, orders, customers
-- Mục đích: Dọn dẹp tài khoản test (customer_id = 4 / admin@store.com) và đơn hàng test (order_id = 10)
-- 
-- NGUYÊN TẮC AN TOÀN:
-- 1. Script chạy bên trong TRANSACTION (BEGIN ... COMMIT).
-- 2. Chỉ chạy trong môi trường Local Development hoặc Staging Test.
-- 3. TUYỆT ĐỐI KHÔNG chạy trên Production mà chưa có bản backup cơ sở dữ liệu.
-- ==============================================================================

BEGIN;

-- 1. Xóa lịch sử trạng thái đơn hàng liên quan tới order_id = 10
WITH deleted_history AS (
    DELETE FROM order_status_history
    WHERE order_id = 10
    RETURNING *
)
SELECT 'order_status_history deleted' AS action, count(*) AS affected_rows FROM deleted_history;

-- 2. Xóa các mục order_items thuộc order_id = 10
WITH deleted_items AS (
    DELETE FROM order_items
    WHERE order_id = 10
    RETURNING *
)
SELECT 'order_items deleted' AS action, count(*) AS affected_rows FROM deleted_items;

-- 3. Xóa đơn hàng order_id = 10 của customer_id = 4
WITH deleted_order AS (
    DELETE FROM orders
    WHERE order_id = 10 AND customer_id = 4
    RETURNING *
)
SELECT 'orders deleted' AS action, count(*) AS affected_rows FROM deleted_order;

-- 4. Xóa tài khoản khách hàng tự sinh customer_id = 4 (admin@store.com)
WITH deleted_customer AS (
    DELETE FROM customers
    WHERE customer_id = 4 AND email = 'admin@store.com'
    RETURNING *
)
SELECT 'customers deleted' AS action, count(*) AS affected_rows FROM deleted_customer;

-- Kiểm tra xác nhận dữ liệu sau khi xóa trong transaction
SELECT 'remaining_customers' AS verify_table, count(*) AS count FROM customers WHERE customer_id = 4
UNION ALL
SELECT 'remaining_orders', count(*) FROM orders WHERE customer_id = 4
UNION ALL
SELECT 'remaining_order_items', count(*) FROM order_items WHERE order_id = 10;

-- COMMIT giao dịch
COMMIT;
