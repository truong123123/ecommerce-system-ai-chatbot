-- ==============================================================================
-- SEED DATA ĐẦY ĐỦ CHO HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ (PostgreSQL)
-- ==============================================================================

-- 1. BRANDS
INSERT INTO brands (name, country) VALUES
('Apple', 'USA'),
('Samsung', 'Hàn Quốc'),
('Xiaomi', 'Trung Quốc'),
('Sony', 'Nhật Bản'),
('Asus', 'Đài Loan')
ON CONFLICT (name) DO NOTHING;

-- 2. CATEGORIES
INSERT INTO categories (name, slug, is_active) VALUES
('iPhone', 'iphone', TRUE),
('MacBook', 'macbook', TRUE),
('iPad', 'ipad', TRUE),
('Apple Watch', 'apple-watch', TRUE),
('Phụ Kiện & Âm Thanh', 'phu-kien', TRUE),
('Samsung Galaxy', 'samsung-galaxy', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- 3. SUPPLIERS
INSERT INTO suppliers (name, contact_name, phone, email, address) VALUES
('FPT Synnex', 'Nguyễn Văn Minh', '02473006666', 'synnex@fpt.com.vn', 'Tòa nhà FPT, Cầu Giấy, Hà Nội'),
('Digiworld Corporation', 'Trần Thị Thu', '02839290059', 'contact@digiworld.com.vn', '195 Điện Biên Phủ, Bình Thạnh, TP.HCM'),
('PHTD Distribution', 'Lê Hoàng Long', '02838248888', 'info@phtd.com.vn', 'Quận 1, TP.HCM')
ON CONFLICT DO NOTHING;

-- 4. WAREHOUSES
INSERT INTO warehouses (name, address) VALUES
('Kho Tổng Hà Nội', 'Khu công nghiệp Đài Tư, Long Biên, Hà Nội'),
('Kho Tổng TP.HCM', 'Khu chế xuất Tân Thuận, Quận 7, TP.HCM'),
('Kho Phân Phối Đà Nẵng', 'Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng')
ON CONFLICT DO NOTHING;

-- 5. PRODUCTS
INSERT INTO products (category_id, brand_id, supplier_id, name, slug, description, is_active) VALUES
-- iPhone
((SELECT category_id FROM categories WHERE slug = 'iphone'), (SELECT brand_id FROM brands WHERE name = 'Apple'), 1, 'iPhone 15 Pro Max', 'iphone-15-pro-max', 'Thiết kế khung Titan chuẩn hàng không vũ trụ, chip A17 Pro đột phá, camera tiềm vọng quang học 5x sắc nét.', TRUE),
((SELECT category_id FROM categories WHERE slug = 'iphone'), (SELECT brand_id FROM brands WHERE name = 'Apple'), 1, 'iPhone 15', 'iphone-15', 'Dynamic Island thông minh, camera chính 48MP siêu rõ nét, cổng sạc USB-C tiện lợi.', TRUE),
((SELECT category_id FROM categories WHERE slug = 'iphone'), (SELECT brand_id FROM brands WHERE name = 'Apple'), 1, 'iPhone 16 Pro Max', 'iphone-16-pro-max', 'Thế hệ mới với Apple Intelligence, viền màn hình siêu mỏng và nút chụp Camera Control cảm ứng lực.', TRUE),

-- MacBook
((SELECT category_id FROM categories WHERE slug = 'macbook'), (SELECT brand_id FROM brands WHERE name = 'Apple'), 1, 'MacBook Pro 16 inch M3 Pro', 'macbook-pro-16-m3-pro', 'Sức mạnh vượt bậc từ chip Apple M3 Pro, màn hình Liquid Retina XDR 120Hz siêu sáng.', TRUE),
((SELECT category_id FROM categories WHERE slug = 'macbook'), (SELECT brand_id FROM brands WHERE name = 'Apple'), 1, 'MacBook Air 13 inch M3', 'macbook-air-13-m3', 'Thiết kế mỏng nhẹ đỉnh cao, thời lượng pin lên đến 18 giờ, vận hành êm ái không quạt tản nhiệt.', TRUE),

-- iPad
((SELECT category_id FROM categories WHERE slug = 'ipad'), (SELECT brand_id FROM brands WHERE name = 'Apple'), 2, 'iPad Pro M4 11 inch', 'ipad-pro-m4-11-inch', 'Siêu phẩm máy tính bảng mỏng nhất từ trước đến nay của Apple, màn hình Ultra Retina XDR Tandem OLED đột phá.', TRUE),

-- Apple Watch
((SELECT category_id FROM categories WHERE slug = 'apple-watch'), (SELECT brand_id FROM brands WHERE name = 'Apple'), 2, 'Apple Watch Ultra 2 GPS + Cellular 49mm', 'apple-watch-ultra-2', 'Vỏ Titan siêu bền bỉ, định vị GPS tần số kép chuẩn xác, pin 72 giờ ở chế độ nguồn điện thấp.', TRUE),

-- Phụ kiện
((SELECT category_id FROM categories WHERE slug = 'phu-kien'), (SELECT brand_id FROM brands WHERE name = 'Apple'), 3, 'AirPods Pro (Thế hệ 2) MagSafe USB-C', 'airpods-pro-2-usbc', 'Chống ồn chủ động vượt trội, âm thanh thích ứng tự động điều chỉnh theo môi trường.', TRUE),

-- Samsung
((SELECT category_id FROM categories WHERE slug = 'samsung-galaxy'), (SELECT brand_id FROM brands WHERE name = 'Samsung'), 2, 'Samsung Galaxy S24 Ultra 5G', 'samsung-galaxy-s24-ultra', 'Quyền năng Galaxy AI, khung viền Titan, bút S Pen tích hợp và camera zoom AI 100x đỉnh cao.', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- 6. PRODUCT VARIANTS (SKU)
INSERT INTO product_variants (product_id, sku, attributes, cost_price, sale_price, is_active) VALUES
-- iPhone 15 Pro Max
((SELECT product_id FROM products WHERE slug = 'iphone-15-pro-max'), 'IP15PM-256-NAT', '{"color": "Titan Tự Nhiên", "storage": "256GB"}', 25500000, 29990000, TRUE),
((SELECT product_id FROM products WHERE slug = 'iphone-15-pro-max'), 'IP15PM-512-NAT', '{"color": "Titan Tự Nhiên", "storage": "512GB"}', 30500000, 35990000, TRUE),
((SELECT product_id FROM products WHERE slug = 'iphone-15-pro-max'), 'IP15PM-256-BLK', '{"color": "Titan Đen", "storage": "256GB"}', 25500000, 29990000, TRUE),

-- iPhone 15
((SELECT product_id FROM products WHERE slug = 'iphone-15'), 'IP15-128-BLU', '{"color": "Xanh Pastel", "storage": "128GB"}', 16000000, 19490000, TRUE),
((SELECT product_id FROM products WHERE slug = 'iphone-15'), 'IP15-256-PNK', '{"color": "Hồng", "storage": "256GB"}', 19000000, 22490000, TRUE),

-- iPhone 16 Pro Max
((SELECT product_id FROM products WHERE slug = 'iphone-16-pro-max'), 'IP16PM-256-DES', '{"color": "Titan Sa Mạc", "storage": "256GB"}', 30000000, 34990000, TRUE),

-- MacBook Pro 16
((SELECT product_id FROM products WHERE slug = 'macbook-pro-16-m3-pro'), 'MBP16-M3P-18-512', '{"color": "Đen Không Gian", "ram": "18GB", "storage": "512GB"}', 52000000, 59990000, TRUE),

-- MacBook Air 13
((SELECT product_id FROM products WHERE slug = 'macbook-air-13-m3'), 'MBA13-M3-8-256-MID', '{"color": "Đêm Xanh Thẳm", "ram": "8GB", "storage": "256GB"}', 23000000, 27490000, TRUE),

-- iPad Pro M4
((SELECT product_id FROM products WHERE slug = 'ipad-pro-m4-11-inch'), 'IPAD-M4-11-256-SIL', '{"color": "Bạc", "storage": "256GB"}', 24000000, 28990000, TRUE),

-- Apple Watch Ultra 2
((SELECT product_id FROM products WHERE slug = 'apple-watch-ultra-2'), 'AWU2-49-ORANGE', '{"strap": "Dây Alpine Cam", "case": "Titan 49mm"}', 17000000, 21490000, TRUE),

-- AirPods Pro 2
((SELECT product_id FROM products WHERE slug = 'airpods-pro-2-usbc'), 'APP2-USBC-WHT', '{"color": "Trắng", "connector": "USB-C"}', 4500000, 5890000, TRUE),

-- Galaxy S24 Ultra
((SELECT product_id FROM products WHERE slug = 'samsung-galaxy-s24-ultra'), 'S24U-256-GRY', '{"color": "Xám Titan", "storage": "256GB"}', 24000000, 28990000, TRUE)
ON CONFLICT (sku) DO NOTHING;

-- 7. PRODUCT IMAGES
INSERT INTO product_images (product_id, url, is_primary, sort_order) VALUES
((SELECT product_id FROM products WHERE slug = 'iphone-15-pro-max'), 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80', TRUE, 1),
((SELECT product_id FROM products WHERE slug = 'iphone-15'), 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80', TRUE, 1),
((SELECT product_id FROM products WHERE slug = 'iphone-16-pro-max'), 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80', TRUE, 1),
((SELECT product_id FROM products WHERE slug = 'macbook-pro-16-m3-pro'), 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', TRUE, 1),
((SELECT product_id FROM products WHERE slug = 'macbook-air-13-m3'), 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80', TRUE, 1),
((SELECT product_id FROM products WHERE slug = 'ipad-pro-m4-11-inch'), 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80', TRUE, 1),
((SELECT product_id FROM products WHERE slug = 'apple-watch-ultra-2'), 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&q=80', TRUE, 1),
((SELECT product_id FROM products WHERE slug = 'airpods-pro-2-usbc'), 'https://images.unsplash.com/photo-1609592424074-b90aa90ffc2e?w=800&q=80', TRUE, 1),
((SELECT product_id FROM products WHERE slug = 'samsung-galaxy-s24-ultra'), 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80', TRUE, 1)
ON CONFLICT DO NOTHING;

-- 8. INVENTORY (Kho 1: Hà Nội, Kho 2: TP.HCM)
INSERT INTO inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level)
SELECT 1, variant_id, 45, 2, 10 FROM product_variants
ON CONFLICT (warehouse_id, variant_id) DO NOTHING;

INSERT INTO inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level)
SELECT 2, variant_id, 30, 1, 10 FROM product_variants
ON CONFLICT (warehouse_id, variant_id) DO NOTHING;

-- Tạo 2 mặt hàng sắp hết để kiểm tra view v_low_stock
UPDATE inventory SET quantity = 5, reserved_qty = 1 WHERE variant_id = (SELECT variant_id FROM product_variants WHERE sku = 'IP16PM-256-DES') AND warehouse_id = 1;
UPDATE inventory SET quantity = 4, reserved_qty = 0 WHERE variant_id = (SELECT variant_id FROM product_variants WHERE sku = 'AWU2-49-ORANGE') AND warehouse_id = 2;

-- 9. COUPONS
INSERT INTO coupons (code, type, value, min_order_value, max_discount, usage_limit, starts_at, ends_at) VALUES
('CHAOMUNG50K', 'fixed', 50000, 500000, 50000, 1000, NOW() - INTERVAL '10 days', NOW() + INTERVAL '30 days'),
('APPLE500K', 'fixed', 500000, 10000000, 500000, 200, NOW() - INTERVAL '5 days', NOW() + INTERVAL '20 days'),
('VIPDISCOUNT10', 'percent', 10, 5000000, 2000000, 100, NOW() - INTERVAL '1 days', NOW() + INTERVAL '60 days')
ON CONFLICT (code) DO NOTHING;

-- 10. CUSTOMER ADDRESS (Địa chỉ mẫu)
INSERT INTO customer_addresses (customer_id, receiver_name, receiver_phone, province, district, ward, street_address, is_default)
SELECT 1, 'Nguyễn Khách Hàng', '0901234567', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', '123 Lê Lợi', TRUE
WHERE EXISTS (SELECT 1 FROM customers WHERE customer_id = 1)
ON CONFLICT DO NOTHING;

-- 11. ORDERS & ORDER ITEMS (Tạo đơn mẫu để các View báo cáo tính toán doanh thu)
DO $$
DECLARE
    v_cust_id BIGINT;
    v_staff_id INT;
    v_addr_id BIGINT;
    v_var1 BIGINT;
    v_var2 BIGINT;
    v_var3 BIGINT;
    v_o1 BIGINT;
    v_o2 BIGINT;
    v_o3 BIGINT;
    v_o4 BIGINT;
BEGIN
    SELECT customer_id INTO v_cust_id FROM customers LIMIT 1;
    SELECT staff_id INTO v_staff_id FROM staff WHERE role = 'admin' LIMIT 1;
    SELECT address_id INTO v_addr_id FROM customer_addresses LIMIT 1;
    SELECT variant_id INTO v_var1 FROM product_variants WHERE sku = 'IP15PM-256-NAT';
    SELECT variant_id INTO v_var2 FROM product_variants WHERE sku = 'APP2-USBC-WHT';
    SELECT variant_id INTO v_var3 FROM product_variants WHERE sku = 'MBA13-M3-8-256-MID';

    IF v_cust_id IS NOT NULL AND v_var1 IS NOT NULL AND (SELECT COUNT(*) FROM orders) = 0 THEN
        -- Đơn 1: Đã hoàn tất hôm nay (doanh thu hiển thị trên Dashboard)
        INSERT INTO orders (customer_id, address_id, staff_id, order_date, status, subtotal, discount_amount, shipping_fee, total_amount, channel, note)
        VALUES (v_cust_id, v_addr_id, v_staff_id, NOW(), 'completed', 29990000, 0, 0, 29990000, 'web', 'Giao hỏa tốc trong 2h')
        RETURNING order_id INTO v_o1;

        INSERT INTO order_items (order_id, variant_id, quantity, unit_price, unit_cost)
        VALUES (v_o1, v_var1, 1, 29990000, 25500000);

        INSERT INTO payments (order_id, method, status, amount, transaction_ref, paid_at)
        VALUES (v_o1, 'vnpay', 'paid', 29990000, 'VNPAY_TXN_001', NOW());

        -- Đơn 2: Đã hoàn tất trong tháng (thêm doanh thu tháng)
        INSERT INTO orders (customer_id, address_id, staff_id, order_date, status, subtotal, discount_amount, shipping_fee, total_amount, channel, note)
        VALUES (v_cust_id, v_addr_id, v_staff_id, NOW() - INTERVAL '3 days', 'completed', 33380000, 500000, 0, 32880000, 'web', 'Đóng gói cẩn thận')
        RETURNING order_id INTO v_o2;

        INSERT INTO order_items (order_id, variant_id, quantity, unit_price, unit_cost)
        VALUES (v_o2, v_var3, 1, 27490000, 23000000),
               (v_o2, v_var2, 1, 5890000, 4500000);

        INSERT INTO payments (order_id, method, status, amount, transaction_ref, paid_at)
        VALUES (v_o2, 'credit_card', 'paid', 32880000, 'VISA_TXN_002', NOW() - INTERVAL '3 days');

        -- Đơn 3: Đang chờ xử lý (hiển thị trên mục Cần xử lý v_pending_orders)
        INSERT INTO orders (customer_id, address_id, staff_id, order_date, status, subtotal, discount_amount, shipping_fee, total_amount, channel, note)
        VALUES (v_cust_id, v_addr_id, NULL, NOW() - INTERVAL '4 hours', 'pending', 5890000, 0, 30000, 5920000, 'web', 'Khách hẹn gọi trước khi giao')
        RETURNING order_id INTO v_o3;

        INSERT INTO order_items (order_id, variant_id, quantity, unit_price, unit_cost)
        VALUES (v_o3, v_var2, 1, 5890000, 4500000);

        INSERT INTO payments (order_id, method, status, amount, paid_at)
        VALUES (v_o3, 'cod', 'unpaid', 5920000, NULL);

        -- Đơn 4: Đang đóng gói
        INSERT INTO orders (customer_id, address_id, staff_id, order_date, status, subtotal, discount_amount, shipping_fee, total_amount, channel, note)
        VALUES (v_cust_id, v_addr_id, v_staff_id, NOW() - INTERVAL '1 day', 'processing', 29990000, 0, 0, 29990000, 'web', 'Xuất kho Hà Nội')
        RETURNING order_id INTO v_o4;

        INSERT INTO order_items (order_id, variant_id, quantity, unit_price, unit_cost)
        VALUES (v_o4, v_var1, 1, 29990000, 25500000);

        INSERT INTO payments (order_id, method, status, amount, transaction_ref, paid_at)
        VALUES (v_o4, 'bank_transfer', 'paid', 29990000, 'BIDV_TXN_004', NOW() - INTERVAL '1 day');
    END IF;
END $$;
