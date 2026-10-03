-- Thêm sản phẩm Điện thoại & Tablet vào PostgreSQL
INSERT INTO products (product_id, category_id, brand_id, name, slug, description, is_active, created_at)
VALUES
(22, 1, 1, 'iPhone 16 Plus 128GB VN/A', 'iphone-16-plus-128gb', 'Màn hình 6.7 inch Dynamic Island, chip A18, pin cực trâu.', true, NOW()),
(23, 1, 1, 'iPhone 16 128GB VN/A', 'iphone-16-128gb', 'Chip A18 siêu mạnh, nút Camera Control thế hệ mới.', true, NOW()),
(24, 6, 2, 'Samsung Galaxy S25 Ultra 5G 256GB', 'samsung-galaxy-s25-ultra', 'Snapdragon 8 Elite, camera 200MP, bút S-Pen quyền năng.', true, NOW()),
(25, 6, 2, 'Samsung Galaxy Z Fold6 5G 256GB', 'samsung-galaxy-z-fold6', 'Thiết kế gập siêu mỏng nhẹ, Galaxy AI hỗ trợ đa nhiệm.', true, NOW()),
(26, 18, 3, 'Xiaomi 14 Ultra 5G 512GB', 'xiaomi-14-ultra-512gb', 'Ống kính Leica cao cấp, cảm biến 1 inch, sạc nhanh 90W.', true, NOW()),
(27, 18, 3, 'Xiaomi Redmi Note 13 Pro 5G', 'xiaomi-redmi-note-13-pro', 'Camera 200MP chống rung OIS, pin 5100mAh sạc 67W.', true, NOW()),
(28, 3, 1, 'iPad Air 6 M2 11 inch WiFi 128GB', 'ipad-air-6-m2-11-inch', 'Chip Apple M2 cực mạnh, màn hình Liquid Retina sắc nét.', true, NOW()),
(29, 3, 1, 'iPad mini 7 A17 Pro 128GB', 'ipad-mini-7-a17-pro', 'Thiết kế nhỏ gọn 8.3 inch, chip A17 Pro hỗ trợ Apple Intelligence.', true, NOW()),
(30, 3, 2, 'Samsung Galaxy Tab S9 FE WiFi 128GB', 'samsung-galaxy-tab-s9-fe', 'Kèm bút S-Pen, kháng nước IP68, màn hình 90Hz mượt mà.', true, NOW())
ON CONFLICT (product_id) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  brand_id = EXCLUDED.brand_id;

-- Thêm ảnh tương ứng
INSERT INTO product_images (product_id, url, is_primary, sort_order)
VALUES
(22, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80', true, 1),
(23, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80', true, 1),
(24, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80', true, 1),
(25, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80', true, 1),
(26, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80', true, 1),
(27, '/images/products/phones/phone_poco_x8.jpg', true, 1),
(28, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80', true, 1),
(29, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&q=80', true, 1),
(30, 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&q=80', true, 1)
ON CONFLICT DO NOTHING;

-- Thêm biến thể và giá bán
INSERT INTO product_variants (product_id, sku, attributes, cost_price, sale_price, is_active)
VALUES
(22, 'SKU-IP16P-128', '{"color":"Xanh Mòng Két","storage":"128GB"}', 23000000, 25490000, true),
(23, 'SKU-IP16-128', '{"color":"Hồng","storage":"128GB"}', 19000000, 21990000, true),
(24, 'SKU-S25U-256', '{"color":"Titan Bạc","storage":"256GB"}', 28000000, 31990000, true),
(25, 'SKU-ZFOLD6-256', '{"color":"Xám Metal","storage":"256GB"}', 36000000, 41990000, true),
(26, 'SKU-MI14U-512', '{"color":"Đen Da","storage":"512GB"}', 26000000, 29990000, true),
(27, 'SKU-RN13P-128', '{"color":"Tím Cực Quang","storage":"128GB"}', 6000000, 6990000, true),
(28, 'SKU-IPADAIR6-128', '{"color":"Xanh Dương","storage":"128GB"}', 14000000, 16490000, true),
(29, 'SKU-IPADMINI7-128', '{"color":"Ánh Sao","storage":"128GB"}', 12000000, 13990000, true),
(30, 'SKU-TABS9FE-128', '{"color":"Xanh Mint","storage":"128GB"}', 8000000, 9490000, true)
ON CONFLICT (sku) DO UPDATE SET
  sale_price = EXCLUDED.sale_price;

SELECT setval('products_product_id_seq', (SELECT MAX(product_id) FROM products));
