-- 1. BRANDS
INSERT INTO brands (name, country) VALUES
('HP', 'USA'),
('Lenovo', 'Trung Quốc'),
('MSI', 'Đài Loan'),
('Acer', 'Đài Loan'),
('Dell', 'USA'),
('LG', 'Hàn Quốc'),
('Gigabyte', 'Đài Loan')
ON CONFLICT (name) DO NOTHING;

-- 2. CATEGORIES
INSERT INTO categories (name, slug, is_active) VALUES
('Laptop', 'laptop', TRUE),
('Màn hình máy tính', 'man-hinh', TRUE),
('PC', 'pc', TRUE),
('Phụ kiện máy tính', 'phu-kien-may-tinh', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- 3. PRODUCTS
-- Product 1: Apple Mac mini M6
INSERT INTO products (category_id, brand_id, supplier_id, name, slug, description, is_active)
VALUES (
    (SELECT category_id FROM categories WHERE slug = 'pc'),
    (SELECT brand_id FROM brands WHERE name = 'Apple'),
    1,
    'Apple Mac mini M6 12CPU 12GPU 16GB 256GB 2026',
    'apple-mac-mini-m6-16-256',
    'Thế hệ chip Apple M6 đột phá 12 nhân CPU, 12 nhân GPU, hỗ trợ Apple Intelligence.',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&q=80', TRUE, 1
FROM products WHERE slug = 'apple-mac-mini-m6-16-256'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, sku, attributes, cost_price, sale_price, is_active)
SELECT product_id, 'MAC-MINI-M6-16-256', '{"cpu": "Apple M6", "gpu": "12 nhân", "ram": "16GB", "ssd": "256GB"}'::jsonb, 21000000, 24990000, TRUE
FROM products WHERE slug = 'apple-mac-mini-m6-16-256'
ON CONFLICT (sku) DO NOTHING;

-- Product 2: HP Omnibook 5 AI
INSERT INTO products (category_id, brand_id, supplier_id, name, slug, description, is_active)
VALUES (
    (SELECT category_id FROM categories WHERE slug = 'laptop'),
    (SELECT brand_id FROM brands WHERE name = 'HP'),
    1,
    'Laptop HP Omnibook 5 AI 16-AF1048TU BZ7Q9PA',
    'hp-omnibook-5-ai-16',
    'Laptop AI thế hệ mới với chip Core Ultra 5 U5-225U, màn hình 16 inch WUXGA sắc nét.',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80', TRUE, 1
FROM products WHERE slug = 'hp-omnibook-5-ai-16'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, sku, attributes, cost_price, sale_price, is_active)
SELECT product_id, 'HP-OMNI-5-AI-16', '{"cpu": "U5-225U", "gpu": "Intel Graphics", "ram": "16GB", "ssd": "512GB", "screen": "16 inch WUXGA"}'::jsonb, 22000000, 25990000, TRUE
FROM products WHERE slug = 'hp-omnibook-5-ai-16'
ON CONFLICT (sku) DO NOTHING;

-- Product 3: ASUS VivoBook 14
INSERT INTO products (category_id, brand_id, supplier_id, name, slug, description, is_active)
VALUES (
    (SELECT category_id FROM categories WHERE slug = 'laptop'),
    (SELECT brand_id FROM brands WHERE name = 'Asus'),
    1,
    'Laptop ASUS VivoBook 14 X1407CA-LY008W',
    'asus-vivobook-14-x1407ca',
    'Thiết kế mỏng nhẹ hiện đại, chip Core Ultra 5 U5-225H, 16GB RAM mượt mà đa nhiệm.',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80', TRUE, 1
FROM products WHERE slug = 'asus-vivobook-14-x1407ca'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, sku, attributes, cost_price, sale_price, is_active)
SELECT product_id, 'ASUS-VIVO-14-U5', '{"cpu": "U5-225H", "gpu": "Intel Graphics", "ram": "16GB", "ssd": "512GB", "screen": "14 inch WUXGA"}'::jsonb, 19000000, 22190000, TRUE
FROM products WHERE slug = 'asus-vivobook-14-x1407ca'
ON CONFLICT (sku) DO NOTHING;

-- Product 4: MSI Cyborg 15
INSERT INTO products (category_id, brand_id, supplier_id, name, slug, description, is_active)
VALUES (
    (SELECT category_id FROM categories WHERE slug = 'laptop'),
    (SELECT brand_id FROM brands WHERE name = 'MSI'),
    1,
    'Laptop MSI Cyborg 15 A13UC-2082VN',
    'msi-cyborg-15-a13uc',
    'Laptop gaming phong cách cyberpunk, Intel Core i7-13620H cùng đồ họa RTX 3050 mạnh mẽ.',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80', TRUE, 1
FROM products WHERE slug = 'msi-cyborg-15-a13uc'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, sku, attributes, cost_price, sale_price, is_active)
SELECT product_id, 'MSI-CYBORG-15-I7', '{"cpu": "i7-13620H", "gpu": "RTX 3050", "ram": "16GB", "ssd": "512GB", "screen": "15.6 inch FHD 144Hz"}'::jsonb, 24000000, 27990000, TRUE
FROM products WHERE slug = 'msi-cyborg-15-a13uc'
ON CONFLICT (sku) DO NOTHING;

-- Product 5: Lenovo IdeaPad Slim 5
INSERT INTO products (category_id, brand_id, supplier_id, name, slug, description, is_active)
VALUES (
    (SELECT category_id FROM categories WHERE slug = 'laptop'),
    (SELECT brand_id FROM brands WHERE name = 'Lenovo'),
    1,
    'Laptop Lenovo IdeaPad Slim 5 16IAH8',
    'lenovo-ideapad-slim-5-16',
    'Khung nhôm cao cấp, Core i5 thế hệ mới, màn hình 16 inch chuẩn màu sắc nét.',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80', TRUE, 1
FROM products WHERE slug = 'lenovo-ideapad-slim-5-16'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, sku, attributes, cost_price, sale_price, is_active)
SELECT product_id, 'LENOVO-SLIM-5-16', '{"cpu": "U5-115U", "gpu": "Intel Graphics", "ram": "16GB", "ssd": "512GB", "screen": "15.6 inch FHD"}'::jsonb, 15000000, 17990000, TRUE
FROM products WHERE slug = 'lenovo-ideapad-slim-5-16'
ON CONFLICT (sku) DO NOTHING;

-- Product 6: MSI Modern 15
INSERT INTO products (category_id, brand_id, supplier_id, name, slug, description, is_active)
VALUES (
    (SELECT category_id FROM categories WHERE slug = 'laptop'),
    (SELECT brand_id FROM brands WHERE name = 'MSI'),
    1,
    'Laptop MSI Modern 15 B12MO-628VN',
    'msi-modern-15-b12mo',
    'Thiết kế thanh lịch cho dân văn phòng và sinh viên, trọng lượng siêu nhẹ 1.7kg.',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80', TRUE, 1
FROM products WHERE slug = 'msi-modern-15-b12mo'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, sku, attributes, cost_price, sale_price, is_active)
SELECT product_id, 'MSI-MODERN-15-B12', '{"cpu": "CORE 5-120U", "gpu": "Intel Graphics", "ram": "16GB", "ssd": "512GB", "screen": "15.6 inch FHD"}'::jsonb, 12000000, 14490000, TRUE
FROM products WHERE slug = 'msi-modern-15-b12mo'
ON CONFLICT (sku) DO NOTHING;

-- Product 7: ASUS TUF Gaming F15
INSERT INTO products (category_id, brand_id, supplier_id, name, slug, description, is_active)
VALUES (
    (SELECT category_id FROM categories WHERE slug = 'laptop'),
    (SELECT brand_id FROM brands WHERE name = 'Asus'),
    1,
    'Laptop ASUS TUF Gaming F15 FX506HF',
    'asus-tuf-gaming-f15',
    'Độ bền chuẩn quân đội Mỹ MIL-STD-810H, bàn phím RGB, tản nhiệt tự làm sạch hiệu quả.',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80', TRUE, 1
FROM products WHERE slug = 'asus-tuf-gaming-f15'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, sku, attributes, cost_price, sale_price, is_active)
SELECT product_id, 'ASUS-TUF-F15-RTX', '{"cpu": "R7-8845HS", "gpu": "RTX 3050", "ram": "16GB", "ssd": "512GB", "screen": "15.6 inch FHD 144Hz"}'::jsonb, 14000000, 16990000, TRUE
FROM products WHERE slug = 'asus-tuf-gaming-f15'
ON CONFLICT (sku) DO NOTHING;
