-- 1. BRANDS
INSERT INTO brands (name, country) VALUES
('Huawei', 'Trung Quốc'),
('Garmin', 'USA'),
('Amazfit', 'Trung Quốc'),
('Marshall', 'Anh'),
('Soundpeats', 'Trung Quốc')
ON CONFLICT (name) DO NOTHING;

-- 2. CATEGORIES
INSERT INTO categories (name, slug, is_active) VALUES
('Đồng hồ thông minh', 'dong-ho', TRUE),
('Âm thanh', 'am-thanh', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- 3. PRODUCTS
-- Watch 1: Apple Watch Series 10
INSERT INTO products (category_id, brand_id, supplier_id, name, slug, description, is_active)
VALUES (
    (SELECT category_id FROM categories WHERE slug = 'dong-ho'),
    (SELECT brand_id FROM brands WHERE name = 'Apple'),
    2,
    'Apple Watch Series 10 42mm (GPS) Viền Nhôm Dây Cao Su',
    'apple-watch-series-10-42mm',
    'Màn hình OLED góc rộng sáng hơn 40%, vỏ mỏng nhẹ nhất từng có, theo dõi chứng ngưng thở khi ngủ.',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80', TRUE, 1
FROM products WHERE slug = 'apple-watch-series-10-42mm'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, sku, attributes, cost_price, sale_price, is_active)
SELECT product_id, 'AW-S10-42-ALU', '{"case": "Nhôm 42mm", "strap": "Cao su đen", "connectivity": "GPS"}'::jsonb, 9500000, 11490000, TRUE
FROM products WHERE slug = 'apple-watch-series-10-42mm'
ON CONFLICT (sku) DO NOTHING;

-- Watch 2: Amazfit Active Max
INSERT INTO products (category_id, brand_id, supplier_id, name, slug, description, is_active)
VALUES (
    (SELECT category_id FROM categories WHERE slug = 'dong-ho'),
    (SELECT brand_id FROM brands WHERE name = 'Amazfit'),
    2,
    'Đồng hồ thông minh Amazfit Active Max',
    'amazfit-active-max',
    'Thời lượng pin 14 ngày vượt trội, màn hình AMOLED 1.75 inch, hỗ trợ hơn 120 chế độ thể thao.',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', TRUE, 1
FROM products WHERE slug = 'amazfit-active-max'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, sku, attributes, cost_price, sale_price, is_active)
SELECT product_id, 'AMAZFIT-ACTIVE-MAX', '{"color": "Đen Midnight", "battery": "14 ngày", "screen": "AMOLED 1.75"}'::jsonb, 2800000, 3590000, TRUE
FROM products WHERE slug = 'amazfit-active-max'
ON CONFLICT (sku) DO NOTHING;

-- Watch 3: Đồng hồ định vị trẻ em myAlo K74
INSERT INTO products (category_id, brand_id, supplier_id, name, slug, description, is_active)
VALUES (
    (SELECT category_id FROM categories WHERE slug = 'dong-ho'),
    (SELECT brand_id FROM brands WHERE name = 'Xiaomi'),
    2,
    'Đồng hồ định vị trẻ em myAlo K74',
    'dong-ho-dinh-vi-myalo-k74',
    'Định vị GPS chính xác 3 chế độ, gọi video HD 4G, nút khẩn cấp SOS và chống nước IP67 an toàn.',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80', TRUE, 1
FROM products WHERE slug = 'dong-ho-dinh-vi-myalo-k74'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, sku, attributes, cost_price, sale_price, is_active)
SELECT product_id, 'MYALO-K74-PINK', '{"color": "Hồng Phấn", "sim": "4G", "waterproof": "IP67"}'::jsonb, 1200000, 1590000, TRUE
FROM products WHERE slug = 'dong-ho-dinh-vi-myalo-k74'
ON CONFLICT (sku) DO NOTHING;

-- Audio 1: Sony WH-1000XM5
INSERT INTO products (category_id, brand_id, supplier_id, name, slug, description, is_active)
VALUES (
    (SELECT category_id FROM categories WHERE slug = 'am-thanh'),
    (SELECT brand_id FROM brands WHERE name = 'Sony'),
    2,
    'Tai nghe Bluetooth Sony WH-1000XM5',
    'sony-wh-1000xm5',
    'Đỉnh cao chống ồn chủ động với bộ xử lý V1 và QN1, thời lượng pin 30 giờ, micro thu âm chất lượng cao.',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80', TRUE, 1
FROM products WHERE slug = 'sony-wh-1000xm5'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, sku, attributes, cost_price, sale_price, is_active)
SELECT product_id, 'SONY-WH1000XM5-BLK', '{"color": "Đen Nhám", "battery": "30 giờ", "anc": "Active Noise Cancelling"}'::jsonb, 5500000, 6990000, TRUE
FROM products WHERE slug = 'sony-wh-1000xm5'
ON CONFLICT (sku) DO NOTHING;

-- Audio 2: Marshall Emberton II
INSERT INTO products (category_id, brand_id, supplier_id, name, slug, description, is_active)
VALUES (
    (SELECT category_id FROM categories WHERE slug = 'am-thanh'),
    (SELECT brand_id FROM brands WHERE name = 'Marshall'),
    2,
    'Loa Bluetooth Marshall Emberton II',
    'marshall-emberton-ii',
    'Âm thanh đa hướng True Stereophonic 360 độ, thời gian chơi nhạc hơn 30 giờ, chuẩn kháng bụi nước IP67.',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80', TRUE, 1
FROM products WHERE slug = 'marshall-emberton-ii'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, sku, attributes, cost_price, sale_price, is_active)
SELECT product_id, 'MARSHALL-EMBERTON-2', '{"color": "Black and Brass", "battery": "30+ giờ", "waterproof": "IP67"}'::jsonb, 2900000, 3690000, TRUE
FROM products WHERE slug = 'marshall-emberton-ii'
ON CONFLICT (sku) DO NOTHING;
