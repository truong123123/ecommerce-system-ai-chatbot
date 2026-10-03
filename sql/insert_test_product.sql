-- Test inserting NEW TEST PRODUCT for Phase 8 Dynamic Verification
BEGIN;

INSERT INTO products (product_id, category_id, brand_id, name, slug, description, model_code, specs, is_active)
VALUES (
    999,
    5,
    4,
    'NEW TEST PRODUCT - Tai nghe Sony Pro Wireless 2026',
    'new-test-product',
    'Sản phẩm thử nghiệm kiến trúc Database Source of Truth trực tiếp từ PostgreSQL sang Product Detail Page.',
    'SONY-TEST-2026',
    '{"chip": "Sony V2 Ultra Audio Processor", "battery": "35 giờ phát liên tục", "connectivity": "Bluetooth 5.4, LDAC", "waterproof": "IPX4", "weight": "250g"}'::jsonb,
    true
)
ON CONFLICT (product_id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    specs = EXCLUDED.specs;

-- Insert Variants
INSERT INTO product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active)
VALUES 
(
    9991,
    999,
    'TEST-SONY-BLK',
    '{"color": "Đen Huyền Bí", "capacity": "Bản Cao Cấp"}'::jsonb,
    4000000,
    5490000,
    true
),
(
    9992,
    999,
    'TEST-SONY-SLV',
    '{"color": "Bạc Platinum", "capacity": "Bản Cao Cấp"}'::jsonb,
    4000000,
    5490000,
    true
)
ON CONFLICT (variant_id) DO UPDATE SET
    sale_price = EXCLUDED.sale_price,
    attributes = EXCLUDED.attributes;

-- Insert Primary Image
INSERT INTO product_images (product_id, url, is_primary, sort_order)
VALUES (
    999,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    true,
    0
);

-- Insert Inventory: 10 units in Kho Tổng TP.HCM (warehouse_id = 2)
INSERT INTO inventory (warehouse_id, variant_id, quantity, reserved_qty)
VALUES (2, 9991, 10, 0)
ON CONFLICT (warehouse_id, variant_id) DO UPDATE SET
    quantity = EXCLUDED.quantity;

COMMIT;
