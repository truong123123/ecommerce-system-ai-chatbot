INSERT INTO banners (title, headline, sub_headline, image_url, primary_btn_link, is_active, display_order, created_at) VALUES 
('Laptop Gaming & AI Sieu Dinh', 'Suc Manh Vuot Bac', 'Bao hanh 2 nam doi moi 30 ngay', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80', '/products?keyword=laptop', true, 1, NOW()),
('MacBook & Mac mini M6 / M5', 'Nho Ma Can Het', 'Thiet ke tinh gon hieu nang vo song', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80', '/products?keyword=mac', true, 2, NOW()),
('Apple Watch & Galaxy Watch', 'Theo Doi Suc Khoe Toan Dien', 'Do dien tam do SpO2 chinh xac', 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&q=80', '/products?keyword=watch', true, 3, NOW()),
('Tai Nghe & Loa Bluetooth Chinh Hang', 'Am Thanh Song Dong', 'Khu on chu dong ANC dinh cao', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80', '/products?keyword=audio', true, 4, NOW())
ON CONFLICT DO NOTHING;
