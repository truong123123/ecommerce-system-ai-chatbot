-- ====================================================================
-- FLYWAY MIGRATION V4: FLASH SALE THEO PHONG CÁCH CELLPHONES
-- Bảng flash_sale_slots, flash_sale_slot_products, flash_sale_purchases
-- Hoàn toàn dựa trên sản phẩm thật trong bảng products
-- ====================================================================

-- 1. BẢNG KHUNG GIỜ FLASH SALE (flash_sale_slots)
CREATE TABLE IF NOT EXISTS flash_sale_slots (
    id BIGSERIAL PRIMARY KEY,
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fs_slots_time ON flash_sale_slots(start_at, end_at, is_active);

-- 2. BẢNG SẢN PHẨM THEO TỪNG SLOT (flash_sale_slot_products)
CREATE TABLE IF NOT EXISTS flash_sale_slot_products (
    id BIGSERIAL PRIMARY KEY,
    slot_id BIGINT NOT NULL REFERENCES flash_sale_slots(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    sale_price BIGINT NOT NULL,
    original_price BIGINT NOT NULL,
    quota INT NOT NULL,
    sold INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_slot_product UNIQUE (slot_id, product_id),
    CONSTRAINT chk_sold_quota CHECK (sold <= quota)
);

CREATE INDEX IF NOT EXISTS idx_fs_slot_products_slot ON flash_sale_slot_products(slot_id, sort_order ASC);

-- 3. BẢNG GHI NHẬN LƯỢT MUA FLASH SALE (flash_sale_purchases)
CREATE TABLE IF NOT EXISTS flash_sale_purchases (
    id BIGSERIAL PRIMARY KEY,
    slot_id BIGINT NOT NULL REFERENCES flash_sale_slots(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    order_id BIGINT REFERENCES orders(order_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_slot_product_phone UNIQUE (slot_id, product_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_fs_purchases_lookup ON flash_sale_purchases(slot_id, product_id, phone);

-- ====================================================================
-- SEED DỮ LIỆU THẬT DỰA TRÊN SẢN PHẨM ĐANG CÓ TRONG BẢNG products
-- Ngày: 03/10/2026 và 04/10/2026
-- Slot LIVE, UPCOMING, ENDED
-- ====================================================================

-- Xóa dữ liệu cũ của bảng mới nếu có để nạp lại sạch
DELETE FROM flash_sale_purchases;
DELETE FROM flash_sale_slot_products;
DELETE FROM flash_sale_slots;

-- Slot 1: 09:00 - 11:00 03/10/2026 (ENDED)
INSERT INTO flash_sale_slots (id, start_at, end_at, is_active)
VALUES (1, '2026-10-03 09:00:00+07', '2026-10-03 11:00:00+07', true);

-- Slot 2: 12:00 - 14:00 03/10/2026 (ENDED)
INSERT INTO flash_sale_slots (id, start_at, end_at, is_active)
VALUES (2, '2026-10-03 12:00:00+07', '2026-10-03 14:00:00+07', true);

-- Slot 3: 18:00 - 21:00 03/10/2026 (LIVE HIỆN TẠI - Local time ~19:30 03/10/2026)
INSERT INTO flash_sale_slots (id, start_at, end_at, is_active)
VALUES (3, '2026-10-03 18:00:00+07', '2026-10-03 21:00:00+07', true);

-- Slot 4: 21:00 - 23:00 03/10/2026 (UPCOMING TỐI NAY)
INSERT INTO flash_sale_slots (id, start_at, end_at, is_active)
VALUES (4, '2026-10-03 21:00:00+07', '2026-10-03 23:00:00+07', true);

-- Slot 5: 09:00 - 11:00 04/10/2026 (UPCOMING NGÀY MAI)
INSERT INTO flash_sale_slots (id, start_at, end_at, is_active)
VALUES (5, '2026-10-04 09:00:00+07', '2026-10-04 11:00:00+07', true);

-- Slot 6: 20:00 - 22:00 04/10/2026 (UPCOMING NGÀY MAI - Slot trống test Empty State)
INSERT INTO flash_sale_slots (id, start_at, end_at, is_active)
VALUES (6, '2026-10-04 20:00:00+07', '2026-10-04 22:00:00+07', true);

SELECT setval('flash_sale_slots_id_seq', (SELECT MAX(id) FROM flash_sale_slots));

-- SẢN PHẨM THẬT CHO TỪNG SLOT:
-- Product IDs có thật trong database:
-- 1: iPhone 15 Pro Max
-- 2: iPhone 15
-- 3: iPhone 16 Pro Max
-- 4: MacBook Pro 16 inch M3 Pro
-- 5: MacBook Air 13 inch M3
-- 6: iPad Pro M4 11 inch
-- 7: Apple Watch Ultra 2 GPS + Cellular 49mm
-- 8: AirPods Pro (Thế hệ 2) MagSafe USB-C
-- 9: Samsung Galaxy S24 Ultra 5G
-- 10: Apple Mac mini M6
-- 14: Laptop Lenovo IdeaPad Slim 5 16IAH8
-- 15: Laptop MSI Modern 15 B12MO-628VN
-- 16: Laptop ASUS TUF Gaming F15 FX506HF
-- 17: Apple Watch Series 10 42mm
-- 20: Tai nghe Bluetooth Sony WH-1000XM5
-- 21: Loa Bluetooth Marshall Emberton II

-- Slot 1 (Ended 09-11h 03/10):
INSERT INTO flash_sale_slot_products (slot_id, product_id, sale_price, original_price, quota, sold, sort_order)
VALUES
(1, 14, 14990000, 17990000, 15, 15, 1),
(1, 15, 10990000, 13490000, 20, 20, 2),
(1, 16, 16490000, 19990000, 10, 10, 3);

-- Slot 2 (Ended 12-14h 03/10):
INSERT INTO flash_sale_slot_products (slot_id, product_id, sale_price, original_price, quota, sold, sort_order)
VALUES
(2, 6, 21990000, 24990000, 10, 8, 1),
(2, 7, 19490000, 21990000, 12, 12, 2),
(2, 21, 3190000, 3990000, 25, 20, 3);

-- Slot 3 (LIVE 18-21h 03/10 - Có 6 sản phẩm phong phú):
INSERT INTO flash_sale_slot_products (slot_id, product_id, sale_price, original_price, quota, sold, sort_order)
VALUES
(3, 1, 28490000, 32990000, 20, 3, 1),
(3, 8, 4890000, 5990000, 30, 7, 2),
(3, 5, 23490000, 27990000, 15, 4, 3),
(3, 9, 25990000, 31990000, 10, 2, 4),
(3, 20, 6290000, 8490000, 25, 5, 5),
(3, 4, 49990000, 54990000, 8, 1, 6);

-- Slot 4 (UPCOMING 21-23h 03/10):
INSERT INTO flash_sale_slot_products (slot_id, product_id, sale_price, original_price, quota, sold, sort_order)
VALUES
(4, 3, 31990000, 34990000, 25, 0, 1),
(4, 2, 17990000, 21990000, 20, 0, 2),
(4, 17, 9890000, 11490000, 15, 0, 3),
(4, 10, 14990000, 17990000, 10, 0, 4);

-- Slot 5 (UPCOMING 09-11h 04/10):
-- Chú ý: Cùng product 1 (iPhone 15 Pro Max) nhưng ở slot 5 có sale_price (27.990.000) và quota (10) riêng biệt!
INSERT INTO flash_sale_slot_products (slot_id, product_id, sale_price, original_price, quota, sold, sort_order)
VALUES
(5, 1, 27990000, 32990000, 10, 0, 1),
(5, 5, 22990000, 27990000, 10, 0, 2),
(5, 8, 4790000, 5990000, 20, 0, 3);

-- Slot 6 (20-22h 04/10): ĐỂ TRỐNG KHÔNG CÓ PRODUCT để test EMPTY STATE!
