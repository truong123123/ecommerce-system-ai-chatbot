-- =====================================================================
-- DỮ LIỆU MẪU (SEED DATA) CHO CATALOG MỞ RỘNG VÀ KHUYẾN MÃI
-- Chạy trên database LNT_Doantotnghiep sau khi chạy ecommerce_patch_catalog_promo.sql
-- =====================================================================
BEGIN;

-- 1. THÊM DÒNG SẢN PHẨM (SERIES)
INSERT INTO series (brand_id, name, slug) VALUES
 (6, 'HP Omnibook', 'hp-omnibook'),
 (6, 'HP Victus', 'hp-victus'),
 (6, 'HP Pavilion', 'hp-pavilion'),
 (1, 'iPhone 16 Series', 'iphone-16-series'),
 (1, 'iPhone 15 Series', 'iphone-15-series'),
 (1, 'MacBook Pro', 'macbook-pro'),
 (1, 'MacBook Air', 'macbook-air'),
 (1, 'Apple Watch Ultra', 'apple-watch-ultra'),
 (2, 'Galaxy S Series', 'galaxy-s-series'),
 (2, 'Galaxy Z Series', 'galaxy-z-series'),
 (5, 'ASUS VivoBook', 'asus-vivobook'),
 (5, 'ASUS TUF Gaming', 'asus-tuf-gaming'),
 (4, 'Sony 1000X Series', 'sony-1000x-series')
ON CONFLICT (brand_id, slug) DO NOTHING;

-- 2. CẬP NHẬT SẢN PHẨM: MODEL_CODE, SERIES_ID, SPECS JSONB
-- Sản phẩm 11: Laptop HP Omnibook 5 AI 16-AF1048TU BZ7Q9PA
UPDATE products
SET series_id = (SELECT series_id FROM series WHERE slug = 'hp-omnibook' LIMIT 1),
    model_code = '16-AF1048TU BZ709PA',
    specs = '{
      "chip_ai": "Intel AI Boost NPU lên tới 48 TOPS hỗ trợ xử lý tác vụ trí tuệ nhân tạo",
      "gpu": "Intel Arc Graphics chuyên dụng hiệu năng cao",
      "ram": "16 GB LPDDR5X 7467 MHz Onboard siêu tốc độ",
      "storage": "512 GB SSD M.2 PCIe Gen 4 NVMe tốc độ cao",
      "screen": "16.0 inches WUXGA (1920 x 1200) chống chói 300 nits 100% sRGB tỉ lệ 16:10",
      "os": "Windows 11 Home Single Language bản quyền + Office Home & Student 2024",
      "cpu": "Intel Core Ultra 5 225H (14 nhân, 18 luồng, xung nhịp tối đa 4.90 GHz, 18MB Cache)",
      "battery": "3 Cell Li-ion polymer (68 Whr), hỗ trợ sạc nhanh HP Fast Charge 65W qua Type-C",
      "ports": "1 x Thunderbolt 4 (Type-C 40Gbps), 1 x USB Type-C 10Gbps, 2 x USB Type-A 10Gbps, 1 x HDMI 2.1, 1 x 3.5mm"
    }'::jsonb
WHERE slug = 'hp-omnibook-5-ai-16' OR product_id = 11;

-- Sản phẩm 3: iPhone 16 Pro Max
UPDATE products
SET series_id = (SELECT series_id FROM series WHERE slug = 'iphone-16-series' LIMIT 1),
    model_code = 'MYWU3VN/A',
    specs = '{
      "chip": "Apple A18 Pro 6 nhân (2 nhân hiệu năng + 4 nhân tiết kiệm), tiến trình 3nm",
      "screen": "6.9 inch Super Retina XDR OLED, Dynamic Island, ProMotion 120Hz, 2000 nits",
      "camera_rear": "Chính 48MP Fusion + Góc siêu rộng 48MP + Tele 12MP zoom quang 5x",
      "camera_front": "12MP TrueDepth, tự động lấy nét PDAF",
      "ram": "8 GB",
      "storage": "256 GB NVMe",
      "battery": "Xem video lên đến 33 giờ, sạc MagSafe 25W",
      "ports": "USB-C hỗ trợ USB 3 (tốc độ lên đến 10Gbps)",
      "material": "Khung viền Titan chuẩn hàng không vũ trụ cấp 5"
    }'::jsonb
WHERE slug = 'iphone-16-pro-max' OR product_id = 3;

-- Sản phẩm 24: Samsung Galaxy S25 Ultra 5G 256GB
UPDATE products
SET series_id = (SELECT series_id FROM series WHERE slug = 'galaxy-s-series' LIMIT 1),
    model_code = 'SM-S938B/DS',
    specs = '{
      "chip": "Qualcomm Snapdragon 8 Elite for Galaxy (3nm)",
      "screen": "6.8 inch Dynamic AMOLED 2X, QHD+ (3120 x 1440), 120Hz, Corning Gorilla Armor",
      "camera_rear": "200MP + 50MP + 50MP + 10MP, Zoom quang học 100x Space Zoom",
      "ram": "12 GB LPDDR5X",
      "storage": "256 GB UFS 4.0",
      "battery": "5000 mAh, sạc nhanh 45W có dây, sạc không dây 15W",
      "pen": "Tích hợp sẵn bút S-Pen quyền năng trong thân máy"
    }'::jsonb
WHERE slug = 'samsung-galaxy-s25-ultra' OR product_id = 24;

-- Sản phẩm 4: MacBook Pro 16 inch M3 Pro
UPDATE products
SET series_id = (SELECT series_id FROM series WHERE slug = 'macbook-pro' LIMIT 1),
    model_code = 'MRW13SA/A',
    specs = '{
      "chip": "Apple M3 Pro (12 CPU / 18 GPU), 16-core Neural Engine",
      "screen": "16.2 inch Liquid Retina XDR (3456 x 2234), ProMotion 120Hz, 1600 nits",
      "ram": "18 GB Unified Memory",
      "storage": "512 GB SSD siêu tốc",
      "battery": "Pin lên tới 22 giờ, sạc MagSafe 3 140W",
      "ports": "3 x Thunderbolt 4, HDMI, khe thẻ SDXC, jack 3.5mm"
    }'::jsonb
WHERE slug = 'macbook-pro-16-m3-pro' OR product_id = 4;

-- Sản phẩm 20: Tai nghe Bluetooth Sony WH-1000XM5
UPDATE products
SET series_id = (SELECT series_id FROM series WHERE slug = 'sony-1000x-series' LIMIT 1),
    model_code = 'WH1000XM5/BM',
    specs = '{
      "type": "Tai nghe chụp tai Over-ear không dây chống ồn",
      "anc": "Bộ xử lý tích hợp V1 kết hợp bộ xử lý chống ồn HD QN1 và 8 micro",
      "driver": "30 mm sợi carbon siêu nhẹ",
      "battery": "Tối đa 30 giờ (bật chống ồn), 40 giờ (tắt chống ồn)",
      "charging": "Sạc nhanh 3 phút nghe được 3 giờ",
      "codec": "SBC, AAC, LDAC (Hi-Res Audio Wireless)",
      "weight": "Khoảng 250 g"
    }'::jsonb
WHERE slug = 'sony-wh-1000xm5' OR product_id = 20;

-- 3. THUỘC TÍNH DANH MỤC CHO LAPTOP (category_id = 7)
INSERT INTO category_attributes (category_id, key, label, data_type, group_name, sort_order, is_spec, is_filter) VALUES
 (7, 'chip_ai', 'Chip AI', 'text', 'Hiệu năng', 1, true, false),
 (7, 'cpu', 'Loại CPU', 'text', 'Hiệu năng', 2, true, true),
 (7, 'gpu', 'Loại card đồ họa', 'text', 'Hiệu năng', 3, true, true),
 (7, 'ram', 'Dung lượng RAM', 'text', 'Bộ nhớ', 4, true, true),
 (7, 'storage', 'Ổ cứng', 'text', 'Bộ nhớ', 5, true, true),
 (7, 'screen', 'Công nghệ màn hình', 'text', 'Màn hình', 6, true, true),
 (7, 'battery', 'Pin & Củ sạc', 'text', 'Pin', 7, true, false),
 (7, 'ports', 'Cổng giao tiếp', 'text', 'Kết nối', 8, true, false),
 (7, 'os', 'Hệ điều hành', 'text', 'Phần mềm', 9, true, false)
ON CONFLICT (category_id, key) DO UPDATE
SET label = EXCLUDED.label, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order;

-- 4. CAM KẾT SẢN PHẨM (Dùng chung cho toàn hệ thống: category_id = NULL)
DELETE FROM product_commitments WHERE category_id IS NULL;
INSERT INTO product_commitments (category_id, title, content, sort_order, is_active) VALUES
 (NULL, 'Hàng mới 100%, chính hãng', 'Máy mới nguyên seal, đầy đủ phụ kiện từ nhà sản xuất. Bảo hành chính hãng 12 tháng tại các TTBH ủy quyền.', 1, true),
 (NULL, 'Bảo hành 1 đổi 1 trong 30 ngày', '1 Đổi 1 trong vòng 30 ngày nếu phát sinh bất kỳ lỗi phần cứng nào từ nhà sản xuất.', 2, true),
 (NULL, 'Bộ phụ kiện chuẩn theo hộp', 'Thân máy, củ sạc nhanh chính hãng, dây cáp sạc cao cấp bọc dù, sách hướng dẫn sử dụng.', 3, true),
 (NULL, 'Đã bao gồm VAT & Hóa đơn điện tử', 'Giá sản phẩm đã bao gồm thuế GTGT (VAT 10%). Hỗ trợ xuất hóa đơn điện tử VAT doanh nghiệp ngay trong ngày.', 4, true);

-- 5. CẬP NHẬT VÀ THÊM CHI NHÁNH CỬA HÀNG (WAREHOUSES)
UPDATE warehouses
SET is_store = true, is_active = true,
    province = 'Hà Nội', district = 'Cầu Giấy', ward = 'P. Mai Dịch',
    address = '126 Hồ Tùng Mậu, P. Mai Dịch, Cầu Giấy, Hà Nội',
    phone = '02471012626', open_hours = '08:00 - 21:30'
WHERE warehouse_id = 1;

UPDATE warehouses
SET is_store = true, is_active = true,
    province = 'Hồ Chí Minh', district = 'Quận 1', ward = 'P. Cô Giang',
    address = '219 - 229 Trần Hưng Đạo, P. Cô Giang, Quận 1, TP. HCM',
    phone = '02871087317', open_hours = '08:00 - 22:00'
WHERE warehouse_id = 2;

UPDATE warehouses
SET is_store = true, is_active = true,
    province = 'Đà Nẵng', district = 'Hải Châu', ward = 'P. Nam Dương',
    address = '177 Nguyễn Văn Linh, P. Nam Dương, Hải Châu, Đà Nẵng',
    phone = '02367101777', open_hours = '08:00 - 21:30'
WHERE warehouse_id = 3;

INSERT INTO warehouses (name, address, province, district, ward, phone, is_store, is_active, open_hours) VALUES
 ('Chi nhánh Nguyễn Thái Học', '134 Nguyễn Thái Học, P. Phạm Ngũ Lão, Quận 1, TP. HCM', 'Hồ Chí Minh', 'Quận 1', 'P. Phạm Ngũ Lão', '02871000134', true, true, '08:00 - 22:00'),
 ('Chi nhánh Trần Quang Khải', '55B Trần Quang Khải, P. Tân Định, Quận 1, TP. HCM', 'Hồ Chí Minh', 'Quận 1', 'P. Tân Định', '02871088552', true, true, '08:00 - 22:00'),
 ('Chi nhánh Đường 3 Tháng 2', '300 Đường 3 Tháng 2, Phường 12, Quận 10, TP. HCM', 'Hồ Chí Minh', 'Quận 10', 'Phường 12', '02871083002', true, true, '08:00 - 21:30'),
 ('Chi nhánh Thái Hà', '21 Thái Hà, P. Trung Liệt, Đống Đa, Hà Nội', 'Hà Nội', 'Đống Đa', 'P. Trung Liệt', '02471021212', true, true, '08:00 - 21:30')
ON CONFLICT DO NOTHING;

-- 6. TỒN KHO CHO BIẾN THỂ 14 (HP Omnibook) TẠI CÁC CỬA HÀNG
INSERT INTO inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level)
SELECT w.warehouse_id, 14, 5, 0, 2
FROM warehouses w
WHERE w.is_store = true
ON CONFLICT (warehouse_id, variant_id) DO UPDATE SET quantity = 5;

-- 7. ƯU ĐÃI THANH TOÁN (PAYMENT_OFFERS)
DELETE FROM payment_offers;
INSERT INTO payment_offers (title, description, bank_name, discount_type, discount_value, max_discount, min_order_amount, sort_order, is_active, starts_at, ends_at) VALUES
 ('Giảm đến 1.000.000đ khi thanh toán thẻ tín dụng HSBC', 'Áp dụng cho chủ thẻ tín dụng HSBC vào các ngày thứ 6, thứ 7', 'HSBC', 'fixed', 1000000, 1000000, 10000000, 1, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days'),
 ('Giảm ngay 800.000đ khi thanh toán qua Kredivo', 'Áp dụng cho đơn hàng từ 8 triệu đồng, kỳ hạn 6 hoặc 12 tháng', 'Kredivo', 'fixed', 800000, 800000, 8000000, 2, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days'),
 ('Giảm ngay 500.000đ khi quét mã VNPAY-QR', 'Nhập mã VNPAYHP500 tại bước thanh toán', 'VNPAY', 'fixed', 500000, 500000, 5000000, 3, true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days');

-- 8. GÓI BẢO HÀNH MỞ RỘNG (WARRANTY_PLANS)
DELETE FROM warranty_plans;
INSERT INTO warranty_plans (category_id, name, plan_type, duration_months, price, min_product_price, max_product_price, description, sort_order, is_active) VALUES
 (NULL, 'Gói bảo hành VIP 12 tháng 1 ĐỔI 1 toàn diện', 'swap', 12, 990000, 10000000, 50000000, '1 đổi 1 máy mới tương đương nếu có lỗi phần cứng từ NSX, bảo vệ rơi vỡ vào nước.', 1, true),
 (NULL, 'Gói bảo hành VIP 24 tháng mở rộng linh kiện chính hãng', 'extended', 24, 1890000, 10000000, 50000000, 'Gia hạn thêm 1 năm bảo hành sau hạn của hãng, thay linh kiện chính hãng miễn phí 100%.', 2, true);

-- 9. KHUYẾN MÃI TỰ ĐỘNG (PROMOTIONS)
DELETE FROM promotions;
INSERT INTO promotions (name, description, kind, discount_type, discount_value, max_discount, gift_text, priority, is_active, starts_at, ends_at) VALUES
 ('Giảm mãi 1.000.000đ khi thanh toán qua thẻ tín dụng đối tác', 'Ưu đãi liên kết với thẻ tín dụng HSBC, Techcombank, VIB', 'discount', 'fixed', 1000000, 1000000, NULL, 10, true, NOW() - INTERVAL '5 days', NOW() + INTERVAL '60 days'),
 ('Trả góp 0% lãi suất, 0đ phụ phí kỳ hạn đến 12 tháng', 'Áp dụng qua thẻ tín dụng và đối tác tài chính', 'service', NULL, NULL, NULL, 'Gói trả góp 0%', 9, true, NOW() - INTERVAL '5 days', NOW() + INTERVAL '60 days'),
 ('Nâng cấp bản quyền Windows 11 Pro chỉ từ 1.690.000đ', 'Tiết kiệm 2.300.000đ khi nâng cấp hệ điều hành', 'service', NULL, NULL, NULL, 'Nâng cấp Windows 11 Pro', 8, true, NOW() - INTERVAL '5 days', NOW() + INTERVAL '60 days'),
 ('Ưu đãi S-Student / S-Teacher giảm thêm đến 1.000.000đ', 'Tặng balo laptop trị giá 600.000đ cho học sinh, sinh viên, giáo viên', 'discount', 'percent', 5, 1000000, 'Balo laptop cao cấp', 7, true, NOW() - INTERVAL '5 days', NOW() + INTERVAL '60 days'),
 ('Tặng bộ quà ứng dụng AI trị giá 8 triệu đồng', 'Gói phần mềm đồ họa và văn phòng AI bản quyền 1 năm', 'gift', NULL, NULL, NULL, 'Gói phần mềm AI 1 năm', 6, true, NOW() - INTERVAL '5 days', NOW() + INTERVAL '60 days');

-- Gán khuyến mãi cho category Laptop (category_id = 7)
INSERT INTO promotion_targets (promotion_id, category_id)
SELECT promotion_id, 7 FROM promotions;

-- 10. ĐÁNH GIÁ MẪU CHO SẢN PHẨM 11 (HP Omnibook)
INSERT INTO customers (customer_id, full_name, email, password_hash)
VALUES (2, 'Trần Hải Đăng', 'dang.tran@store.com', '$2a$10$abcdef1234567890abcdef1234567890abcdef12345678901234')
ON CONFLICT (customer_id) DO NOTHING;

INSERT INTO reviews (product_id, customer_id, rating, comment, created_at) VALUES
 (11, 1, 5, 'Máy rất nhẹ và sang trọng, chip Intel Core Ultra 5 thế hệ mới chạy cực kỳ mượt mà, render đồ họa AI trên Adobe Photoshop siêu nhanh. Màn hình 16 inch viền mỏng làm việc văn phòng rất sướng mắt!', NOW() - INTERVAL '2 days'),
 (11, 2, 5, 'Pin rất trâu dùng từ sáng đến chiều vẫn còn hơn 30%. Bản quyền Office 2024 đi kèm kích hoạt nhanh chóng. Rất hài lòng với dịch vụ giao hàng 2h của shop.', NOW() - INTERVAL '5 days')
ON CONFLICT (product_id, customer_id) DO NOTHING;

COMMIT;
