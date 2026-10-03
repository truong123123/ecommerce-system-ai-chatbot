-- ====================================================================
-- PHẦN 1: CÁC LỆNH CHẠY NGOÀI TRANSACTION BLOCK (AUTO-COMMIT)
-- (PostgreSQL cấm chạy ALTER TYPE ... ADD VALUE bên trong transaction)
-- ====================================================================
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pending_payment';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'paid';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'expired';

-- ====================================================================
-- PHẦN 2: KHỐI ATOMIC TRANSACTION CHO TOÀN BỘ DDL VÀ DML CÒN LẠI
-- ====================================================================
BEGIN;

-- 1. Nâng cấp bảng orders và backfill an toàn
ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS order_code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS receive_type VARCHAR(20) NOT NULL DEFAULT 'STORE_PICKUP',
    ADD COLUMN IF NOT EXISTS store_id INTEGER REFERENCES warehouses(warehouse_id),
    ADD COLUMN IF NOT EXISTS shipping_province VARCHAR(100),
    ADD COLUMN IF NOT EXISTS shipping_district VARCHAR(100),
    ADD COLUMN IF NOT EXISTS shipping_ward VARCHAR(100),
    ADD COLUMN IF NOT EXISTS shipping_street VARCHAR(255),
    ADD COLUMN IF NOT EXISTS customer_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS customer_email VARCHAR(150),
    ADD COLUMN IF NOT EXISTS need_invoice BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) NOT NULL DEFAULT 'STORE',
    ADD COLUMN IF NOT EXISTS voucher_discount NUMERIC(14,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Backfill order_code cho đơn cũ trước khi đặt NOT NULL và UNIQUE
UPDATE orders 
SET order_code = 'ORD-' || TO_CHAR(order_date, 'YYYYMMDD') || '-' || LPAD(order_id::text, 6, '0')
WHERE order_code IS NULL;

ALTER TABLE orders ALTER COLUMN order_code SET NOT NULL;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_orders_order_code') THEN
        ALTER TABLE orders ADD CONSTRAINT uq_orders_order_code UNIQUE (order_code);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_status_expires ON orders(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_store ON orders(customer_id, receive_type, status);

-- 2. Bổ sung snapshot vào order_items
ALTER TABLE order_items 
    ADD COLUMN IF NOT EXISTS product_name_snapshot VARCHAR(255),
    ADD COLUMN IF NOT EXISTS product_image_snapshot VARCHAR(500),
    ADD COLUMN IF NOT EXISTS original_price NUMERIC(14,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS sale_price NUMERIC(14,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS flash_sale_item_id BIGINT REFERENCES flash_sale_item(item_id);

-- 3. Nâng cấp bảng warehouses với Regional Hubs
ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS is_regional_hub BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS region VARCHAR(20);

UPDATE warehouses SET is_regional_hub = true, region = 'NORTH' WHERE warehouse_id = 1;
UPDATE warehouses SET is_regional_hub = true, region = 'SOUTH' WHERE warehouse_id = 2;
UPDATE warehouses SET is_regional_hub = true, region = 'CENTRAL' WHERE warehouse_id = 3;

-- 4. Nâng cấp flash_sale_item
ALTER TABLE flash_sale_item 
    ADD COLUMN IF NOT EXISTS reserved_quantity INTEGER NOT NULL DEFAULT 0;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_fs_stock_limit') THEN
        ALTER TABLE flash_sale_item ADD CONSTRAINT chk_fs_stock_limit 
        CHECK (sold_count + reserved_quantity <= total_stock);
    END IF;
END $$;

-- 5. Bảng flash_sale_user_purchase (đảm bảo tồn tại)
CREATE TABLE IF NOT EXISTS flash_sale_user_purchase (
    purchase_id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES flash_sale_item(item_id) ON DELETE CASCADE,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    order_id BIGINT REFERENCES orders(order_id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fs_user_purchase ON flash_sale_user_purchase(item_id, customer_id);

-- 6. Nâng cấp bảng coupons
ALTER TABLE coupons 
    ADD COLUMN IF NOT EXISTS max_usage_per_user INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS reserved_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS title VARCHAR(150),
    ADD COLUMN IF NOT EXISTS description TEXT;

-- 7. Bảng thông tin xuất hóa đơn đỏ VAT cho công ty
CREATE TABLE IF NOT EXISTS order_invoice_info (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE REFERENCES orders(order_id) ON DELETE CASCADE,
    tax_code VARCHAR(50) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_address VARCHAR(255) NOT NULL,
    company_email VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Bảng giao dịch thanh toán (Payment Transactions)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    status VARCHAR(30) NOT NULL DEFAULT 'INITIATED',
    provider_txn_ref VARCHAR(100) UNIQUE NOT NULL,
    provider_transaction_no VARCHAR(100),
    request_payload TEXT,
    callback_payload TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_pay_tx_order ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_pay_tx_ref ON payment_transactions(provider_txn_ref);

-- 9. Bảng giữ tồn kho (Inventory Reservation)
CREATE TABLE IF NOT EXISTS inventory_reservation (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    variant_id BIGINT NOT NULL REFERENCES product_variants(variant_id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id),
    flash_sale_item_id BIGINT REFERENCES flash_sale_item(item_id),
    quantity INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'RESERVED',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inv_res_order_status ON inventory_reservation(order_id, status);
CREATE INDEX IF NOT EXISTS idx_inv_res_expires ON inventory_reservation(status, expires_at);

-- 10. Bảng ghi nhận giữ/tiêu thụ voucher
CREATE TABLE IF NOT EXISTS voucher_usage (
    id BIGSERIAL PRIMARY KEY,
    coupon_id INTEGER NOT NULL REFERENCES coupons(coupon_id),
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id),
    order_id BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    discount_amount NUMERIC(14,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'RESERVED',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_voucher_order UNIQUE (coupon_id, order_id)
);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_user ON voucher_usage(coupon_id, customer_id, status);

-- 11. Bảng Idempotency
CREATE TABLE IF NOT EXISTS checkout_idempotency (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id),
    idempotency_key VARCHAR(64) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    order_id BIGINT REFERENCES orders(order_id),
    response_snapshot TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PROCESSING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_user_idempotency UNIQUE (customer_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON checkout_idempotency(expires_at);

-- 12. Bảng cấu hình phương thức thanh toán
CREATE TABLE IF NOT EXISTS payment_method_config (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(255),
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO payment_method_config (code, name, icon, description, sort_order, is_active)
VALUES
('STORE', 'Thanh toán tại cửa hàng', 'store', 'CellphoneS sẽ giữ sản phẩm và ưu đãi trong vòng 24 giờ kể từ thời điểm đặt hàng.', 1, true),
('BANK_QR', 'Chuyển khoản ngân hàng qua mã QR', 'qr_code', 'Quét mã VietQR thanh toán (Thủ kho xác nhận thủ công).', 2, true),
('VNPAY', 'VNPAY', 'vnpay', 'Cổng thanh toán quốc dân VNPAY-QR, Thẻ ATM & Tài khoản ngân hàng.', 3, true),
('MOMO', 'MoMo', 'momo', 'Nhập ưu đãi tại cổng, giảm thêm 2% tối đa 200.000đ', 4, false),
('ONEPAY_CARD', 'Qua thẻ Visa/Master/JCB/Napas', 'credit_card', 'Nhập ưu đãi tại cổng, tối đa 500.000đ', 5, false)
ON CONFLICT (code) DO NOTHING;

-- 13. Cấu hình hệ thống (ngưỡng freeship)
INSERT INTO system_settings (setting_key, value, description, updated_at)
VALUES 
('free_shipping_threshold', '300000', 'Ngưỡng miễn phí vận chuyển toàn quốc (VNĐ)', NOW()),
('standard_shipping_fee', '30000', 'Phí vận chuyển tiêu chuẩn cho đơn dưới ngưỡng (VNĐ)', NOW()),
('order_hold_hours_store', '24', 'Số giờ giữ hàng khi chọn thanh toán tại cửa hàng', NOW()),
('order_payment_timeout_minutes_online', '15', 'Số phút chờ thanh toán online trước khi tự hủy đơn', NOW())
ON CONFLICT (setting_key) DO UPDATE SET value = EXCLUDED.value;

COMMIT;
