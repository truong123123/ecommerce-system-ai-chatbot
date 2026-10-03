-- 1. Insert root 'Điện thoại, Tablet'
INSERT INTO categories (name, slug, icon_url, sort_order, is_active)
VALUES ('Điện thoại, Tablet', 'phone-tablet', '📱', 1, true)
ON CONFLICT (slug) DO UPDATE SET icon_url = '📱', sort_order = 1;

-- 2. Insert intermediate con 'Điện thoại' under 'Điện thoại, Tablet'
INSERT INTO categories (parent_id, name, slug, icon_url, sort_order, is_active)
VALUES (
  (SELECT category_id FROM categories WHERE slug = 'phone-tablet' LIMIT 1),
  'Điện thoại', 'dien-thoai', '📱', 1, true
) ON CONFLICT (slug) DO UPDATE SET parent_id = (SELECT category_id FROM categories WHERE slug = 'phone-tablet' LIMIT 1);

-- 3. Insert intermediate con 'Máy tính bảng' under 'Điện thoại, Tablet'
INSERT INTO categories (parent_id, name, slug, icon_url, sort_order, is_active)
VALUES (
  (SELECT category_id FROM categories WHERE slug = 'phone-tablet' LIMIT 1),
  'Máy tính bảng', 'may-tinh-bang', '📱', 2, true
) ON CONFLICT (slug) DO UPDATE SET parent_id = (SELECT category_id FROM categories WHERE slug = 'phone-tablet' LIMIT 1);

-- Gắn iPhone (1) và Samsung Galaxy (6) vào dưới 'Điện thoại'
UPDATE categories 
SET parent_id = (SELECT category_id FROM categories WHERE slug = 'dien-thoai' LIMIT 1),
    sort_order = 1
WHERE category_id IN (1, 6);

-- Gắn iPad (3) vào dưới 'Máy tính bảng'
UPDATE categories 
SET parent_id = (SELECT category_id FROM categories WHERE slug = 'may-tinh-bang' LIMIT 1),
    sort_order = 2
WHERE category_id = 3;

-- Cập nhật Laptop (7) làm root
UPDATE categories 
SET name = 'Laptop', slug = 'laptop', icon_url = '💻', sort_order = 2, parent_id = NULL
WHERE category_id = 7;

-- Gắn MacBook (2) vào dưới 'Laptop' (7)
UPDATE categories 
SET parent_id = 7, sort_order = 1
WHERE category_id = 2;

-- Thêm các loại Laptop con khác
INSERT INTO categories (parent_id, name, slug, icon_url, sort_order, is_active)
VALUES 
  (7, 'Laptop Gaming', 'laptop-gaming', '🎮', 2, true),
  (7, 'Laptop Văn phòng', 'laptop-van-phong', '💼', 3, true)
ON CONFLICT (slug) DO NOTHING;

-- Tạo root 'Âm thanh, Mic thu âm'
INSERT INTO categories (name, slug, icon_url, sort_order, is_active)
VALUES ('Âm thanh, Mic thu âm', 'audio', '🎧', 3, true)
ON CONFLICT (slug) DO UPDATE SET icon_url = '🎧', sort_order = 3;

-- Gắn Âm thanh (12) vào dưới 'Âm thanh, Mic thu âm'
UPDATE categories 
SET parent_id = (SELECT category_id FROM categories WHERE slug = 'audio' LIMIT 1)
WHERE category_id = 12;

-- Thêm con 'Tai nghe', 'Loa Bluetooth'
INSERT INTO categories (parent_id, name, slug, icon_url, sort_order, is_active)
VALUES 
  ((SELECT category_id FROM categories WHERE slug = 'audio' LIMIT 1), 'Tai nghe', 'tai-nghe', '🎧', 1, true),
  ((SELECT category_id FROM categories WHERE slug = 'audio' LIMIT 1), 'Loa Bluetooth', 'loa-bluetooth', '🔊', 2, true)
ON CONFLICT (slug) DO NOTHING;

-- Tạo root 'Đồng hồ, Camera'
INSERT INTO categories (name, slug, icon_url, sort_order, is_active)
VALUES ('Đồng hồ, Camera', 'watch-camera', '⌚', 4, true)
ON CONFLICT (slug) DO UPDATE SET icon_url = '⌚', sort_order = 4;

-- Gắn Đồng hồ thông minh (11) và Apple Watch (4) vào dưới 'Đồng hồ, Camera'
UPDATE categories 
SET parent_id = (SELECT category_id FROM categories WHERE slug = 'watch-camera' LIMIT 1)
WHERE category_id IN (4, 11);

-- Cập nhật Phụ Kiện (5) làm root
UPDATE categories 
SET name = 'Phụ kiện', slug = 'accessories', icon_url = '🔌', sort_order = 5, parent_id = NULL
WHERE category_id = 5;

-- Gắn Phụ kiện máy tính (10) vào dưới 'Phụ kiện' (5)
UPDATE categories 
SET parent_id = 5
WHERE category_id = 10;

-- Thêm 'Cáp, củ sạc', 'Pin dự phòng'
INSERT INTO categories (parent_id, name, slug, icon_url, sort_order, is_active)
VALUES 
  (5, 'Cáp, củ sạc', 'cap-cu-sac', '⚡', 1, true),
  (5, 'Pin dự phòng', 'pin-du-phong', '🔋', 2, true)
ON CONFLICT (slug) DO NOTHING;

-- Tạo root 'PC, Màn hình, Máy in'
INSERT INTO categories (name, slug, icon_url, sort_order, is_active)
VALUES ('PC, Màn hình, Máy in', 'pc-monitor', '🖥️', 6, true)
ON CONFLICT (slug) DO UPDATE SET icon_url = '🖥️', sort_order = 6;

-- Gắn Màn hình máy tính (8) và PC (9) vào dưới 'PC, Màn hình, Máy in'
UPDATE categories 
SET parent_id = (SELECT category_id FROM categories WHERE slug = 'pc-monitor' LIMIT 1)
WHERE category_id IN (8, 9);

-- Tạo root 'Tivi, Điện máy'
INSERT INTO categories (name, slug, icon_url, sort_order, is_active)
VALUES ('Tivi, Điện máy', 'tv-appliances', '📺', 7, true)
ON CONFLICT (slug) DO UPDATE SET icon_url = '📺', sort_order = 7;

-- Thêm 'Tivi', 'Gia dụng thông minh' vào dưới 'Tivi, Điện máy'
INSERT INTO categories (parent_id, name, slug, icon_url, sort_order, is_active)
VALUES 
  ((SELECT category_id FROM categories WHERE slug = 'tv-appliances' LIMIT 1), 'Tivi', 'tivi', '📺', 1, true),
  ((SELECT category_id FROM categories WHERE slug = 'tv-appliances' LIMIT 1), 'Gia dụng thông minh', 'gia-dung', '🏠', 2, true)
ON CONFLICT (slug) DO NOTHING;

-- Cập nhật một số sản phẩm is_hot = true, is_new = true
UPDATE products SET is_hot = true, is_new = true WHERE product_id IN (1, 3, 4, 6, 11, 12, 17, 20);
UPDATE products SET is_hot = true WHERE product_id IN (2, 5, 7, 8, 13, 16);
