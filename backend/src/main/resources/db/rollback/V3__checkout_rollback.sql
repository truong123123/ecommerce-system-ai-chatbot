BEGIN;

DROP TABLE IF EXISTS checkout_idempotency CASCADE;
DROP TABLE IF EXISTS voucher_usage CASCADE;
DROP TABLE IF EXISTS inventory_reservation CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS order_invoice_info CASCADE;
DROP TABLE IF EXISTS payment_method_config CASCADE;

ALTER TABLE flash_sale_item DROP CONSTRAINT IF EXISTS chk_fs_stock_limit;
ALTER TABLE flash_sale_item DROP COLUMN IF EXISTS reserved_quantity;

ALTER TABLE warehouses DROP COLUMN IF EXISTS is_regional_hub;
ALTER TABLE warehouses DROP COLUMN IF EXISTS region;

ALTER TABLE coupons DROP COLUMN IF EXISTS max_usage_per_user;
ALTER TABLE coupons DROP COLUMN IF EXISTS reserved_count;
ALTER TABLE coupons DROP COLUMN IF EXISTS is_active;
ALTER TABLE coupons DROP COLUMN IF EXISTS title;
ALTER TABLE coupons DROP COLUMN IF EXISTS description;

ALTER TABLE order_items DROP COLUMN IF EXISTS product_name_snapshot;
ALTER TABLE order_items DROP COLUMN IF EXISTS product_image_snapshot;
ALTER TABLE order_items DROP COLUMN IF EXISTS original_price;
ALTER TABLE order_items DROP COLUMN IF EXISTS sale_price;
ALTER TABLE order_items DROP COLUMN IF EXISTS flash_sale_item_id;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS uq_orders_order_code;
ALTER TABLE orders DROP COLUMN IF EXISTS order_code;
ALTER TABLE orders DROP COLUMN IF EXISTS receive_type;
ALTER TABLE orders DROP COLUMN IF EXISTS store_id;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_province;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_district;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_ward;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_street;
ALTER TABLE orders DROP COLUMN IF EXISTS customer_name;
ALTER TABLE orders DROP COLUMN IF EXISTS customer_phone;
ALTER TABLE orders DROP COLUMN IF EXISTS customer_email;
ALTER TABLE orders DROP COLUMN IF EXISTS need_invoice;
ALTER TABLE orders DROP COLUMN IF EXISTS payment_method;
ALTER TABLE orders DROP COLUMN IF EXISTS voucher_discount;
ALTER TABLE orders DROP COLUMN IF EXISTS expires_at;
ALTER TABLE orders DROP COLUMN IF EXISTS updated_at;

COMMIT;
