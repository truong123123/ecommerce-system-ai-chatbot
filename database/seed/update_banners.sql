TRUNCATE TABLE banners RESTART IDENTITY;

INSERT INTO banners (title, headline, sub_headline, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, bg_color, text_color, display_order, is_active, created_at)
VALUES 
('iPhone 16 Series', 'Thiet ke Titan Dot Pha', 'Camera 48MP Fusion the he moi, chip A18 Pro manh me.', '/images/banners/poster_iphone_duo.jpg', 'Tim hieu them', '/products/iphone-16-pro-max', 'Mua ngay', '/products/iphone-16-pro-max', '#000000', '#f5f5f7', 1, true, NOW()),
('Redmi Note 13 Pro 5G', 'Bat Net Chuan Flagship', 'Man hinh 1.5K 120Hz sieu muot, sac nhanh 67W.', '/images/banners/poster_redmi_note17.jpg', 'Tim hieu them', '/products', 'Mua ngay', '/products', '#0a0a0c', '#ffffff', 2, true, NOW()),
('MacBook Pro M3 Max', 'Sieu Quai Vat Do Hoa', 'Man hinh Liquid Retina XDR 120Hz, pin 22 gio.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', 'Kham pha', '/products/macbook-pro-16-m3-pro', 'Dat hang', '/products/macbook-pro-16-m3-pro', '#0b0b0f', '#ffffff', 3, true, NOW()),
('Apple Watch Ultra 2', 'Dinh Cao Ben Bi', 'Vo Titan 49mm chong nuoc 100m, pin 72 gio.', 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&q=80', 'Chi tiet', '/products/apple-watch-ultra-2', 'Mua ngay', '/products/apple-watch-ultra-2', '#141416', '#ffffff', 4, true, NOW());
