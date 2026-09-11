-- ==============================================================================
-- DATABASE SEED DATA FOR STOREKIT ENTERPRISE
-- ==============================================================================

INSERT INTO categories (id, name, slug, icon, description) VALUES
(1, 'iPhone', 'iphone', '📱', 'Điện thoại iPhone chính hãng VN/A'),
(2, 'MacBook', 'macbook', '💻', 'Laptop Apple MacBook M3 Series'),
(3, 'iPad', 'ipad', '📲', 'Máy tính bảng iPad Pro M4'),
(4, 'Apple Watch', 'apple-watch', '⌚', 'Đồng hồ Apple Watch Ultra 2'),
(5, 'AirPods', 'airpods', '🎧', 'Tai nghe AirPods Pro 2');

INSERT INTO products (sku, name, slug, category_id, brand, price, old_price, rating, reviews_count, is_featured, is_flash_sale, image_url, description) VALUES
('SK-IP15PM', 'iPhone 15 Pro Max 256GB VN/A', 'iphone-15-pro-max', 1, 'Apple', 29990000, 34990000, 4.9, 128, TRUE, FALSE, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80', 'Khung Titan, chip A17 Pro mạnh mẽ, camera zoom 5x.'),
('SK-MBP16', 'MacBook Pro 16 inch M3 Max 36GB', 'macbook-pro-16-m3-max', 2, 'Apple', 58990000, 64990000, 5.0, 42, TRUE, FALSE, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80', 'Laptop đồ họa chuyên nghiệp chip M3 Max.'),
('SK-AWU2', 'Apple Watch Ultra 2 49mm Titanium', 'apple-watch-ultra-2', 4, 'Apple', 19990000, 21990000, 4.9, 53, TRUE, FALSE, 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&q=80', 'Màn hình 3000 nits siêu sáng, độ bền thể thao cao cấp.'),
('SK-APP2', 'AirPods Pro (Thế hệ 2) USB-C', 'airpods-pro-2-usbc', 5, 'Apple', 5990000, 6990000, 4.9, 110, FALSE, TRUE, 'https://images.unsplash.com/photo-1609592424074-b90aa90ffc2e?w=600&q=80', 'Chống ồn chủ động gấp 2 lần, âm thanh vượt trội.'),
('SK-IPADM4', 'iPad Pro M4 13 inch OLED', 'ipad-pro-m4-13-inch', 3, 'Apple', 37990000, 41990000, 4.8, 35, TRUE, FALSE, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80', 'Màn hình Ultra Retina XDR kép chip M4 siêu mỏng.');
