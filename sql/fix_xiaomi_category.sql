-- Chuyển các sản phẩm điện thoại Xiaomi sang đúng danh mục 'Điện thoại' (slug = 'dien-thoai')
UPDATE products
SET category_id = (SELECT category_id FROM categories WHERE slug = 'dien-thoai' LIMIT 1)
WHERE brand_id = (SELECT brand_id FROM brands WHERE slug = 'xiaomi' LIMIT 1)
  AND category_id = (SELECT category_id FROM categories WHERE slug = 'iphone' LIMIT 1);
