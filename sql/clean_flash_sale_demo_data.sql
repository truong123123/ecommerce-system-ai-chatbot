-- ====================================================================
-- SCRIPT DỌN DẸP DỮ LIỆU DEMO FLASH SALE (CHƯA TỰ ĐỘNG CHẠY)
-- Người dùng duyệt nội dung trước khi quyết định thực thi trên PostgreSQL
-- ====================================================================

BEGIN;

-- 1. Xóa các lượt mua thử nghiệm trong bảng demo flash_sale_purchases
DELETE FROM flash_sale_purchases;

-- 2. Xóa 19 sản phẩm demo trong bảng flash_sale_slot_products
DELETE FROM flash_sale_slot_products WHERE slot_id IN (1, 2, 3, 4, 5, 6);

-- 3. Xóa 6 khung giờ demo trong bảng flash_sale_slots
DELETE FROM flash_sale_slots WHERE id IN (1, 2, 3, 4, 5, 6);

-- Lưu ý: Dữ liệu thật của chiến dịch trong các bảng:
-- - flash_sale_campaign
-- - flash_sale_time_slot
-- - flash_sale_item
-- được GIỮ NGUYÊN và quản lý trực tiếp qua Admin (/admin/flash-sale).

COMMIT;
