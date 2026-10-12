--
-- PostgreSQL database dump
--

\restrict MoqJqb4KYMSADnbYla5cQvPZmtLUSd9RRwTWeSdeBDyF6iq17b0rCDCr3aEsmi0

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: postgres
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public.banners DISABLE TRIGGER ALL;

INSERT INTO public.banners (id, bg_color, created_at, display_order, headline, image_url, is_active, primary_btn_link, primary_btn_text, secondary_btn_link, secondary_btn_text, sub_headline, text_color, title) VALUES (1, '#000000', '2026-09-29 11:34:02.513708', 1, 'Thiet ke Titan Dot Pha', '/images/banners/poster_iphone_duo.jpg', true, '/products/iphone-16-pro-max', 'Tim hieu them', '/products/iphone-16-pro-max', 'Mua ngay', 'Camera 48MP Fusion the he moi, chip A18 Pro manh me.', '#f5f5f7', 'iPhone 16 Series');
INSERT INTO public.banners (id, bg_color, created_at, display_order, headline, image_url, is_active, primary_btn_link, primary_btn_text, secondary_btn_link, secondary_btn_text, sub_headline, text_color, title) VALUES (2, '#0a0a0c', '2026-09-29 11:34:02.513708', 2, 'Bat Net Chuan Flagship', '/images/banners/poster_redmi_note17.jpg', true, '/products', 'Tim hieu them', '/products', 'Mua ngay', 'Man hinh 1.5K 120Hz sieu muot, sac nhanh 67W.', '#ffffff', 'Redmi Note 13 Pro 5G');
INSERT INTO public.banners (id, bg_color, created_at, display_order, headline, image_url, is_active, primary_btn_link, primary_btn_text, secondary_btn_link, secondary_btn_text, sub_headline, text_color, title) VALUES (4, '#141416', '2026-09-29 11:34:02.513708', 4, 'Dinh Cao Ben Bi', 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&q=80', true, '/products/apple-watch-ultra-2', 'Chi tiet', '/products/apple-watch-ultra-2', 'Mua ngay', 'Vo Titan 49mm chong nuoc 100m, pin 72 gio.', '#ffffff', 'Apple Watch Ultra 2');
INSERT INTO public.banners (id, bg_color, created_at, display_order, headline, image_url, is_active, primary_btn_link, primary_btn_text, secondary_btn_link, secondary_btn_text, sub_headline, text_color, title) VALUES (3, '#0b0b0f', '2026-09-29 11:34:02.513708', 0, 'Sieu Quai Vat Do Hoa', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', true, '/products/macbook-pro-16-m3-pro', 'Kham pha', '/products/macbook-pro-16-m3-pro', 'Dat hang', 'Man hinh Liquid Retina XDR 120Hz, pin 22 gio.', '#ffffff', 'MacBook Pro M3 Max');
INSERT INTO public.banners (id, bg_color, created_at, display_order, headline, image_url, is_active, primary_btn_link, primary_btn_text, secondary_btn_link, secondary_btn_text, sub_headline, text_color, title) VALUES (5, NULL, '2026-10-01 23:32:31.756055', 0, NULL, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80', true, '/products?keyword=laptop', NULL, NULL, NULL, NULL, NULL, 'Banner Laptop Mới');


ALTER TABLE public.banners ENABLE TRIGGER ALL;

--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.brands DISABLE TRIGGER ALL;

INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (1, 'Apple', 'USA', 'apple', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (2, 'Samsung', 'Hàn Quốc', 'samsung', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (3, 'Xiaomi', 'Trung Quốc', 'xiaomi', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (4, 'Sony', 'Nhật Bản', 'sony', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (5, 'Asus', 'Đài Loan', 'asus', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (6, 'HP', 'USA', 'hp', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (7, 'Lenovo', 'Trung Quốc', 'lenovo', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (8, 'MSI', 'Đài Loan', 'msi', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (10, 'Dell', 'USA', 'dell', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (11, 'LG', 'Hàn Quốc', 'lg', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (12, 'Gigabyte', 'Đài Loan', 'gigabyte', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (13, 'Huawei', 'Trung Quốc', 'huawei', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (14, 'Garmin', 'USA', 'garmin', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (15, 'Amazfit', 'Trung Quốc', 'amazfit', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (16, 'Marshall', 'Anh', 'marshall', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (17, 'Soundpeats', 'Trung Quốc', 'soundpeats', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (9, 'Acer', 'Đài Loan', 'acer', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 22:17:54.838745+07');


ALTER TABLE public.brands ENABLE TRIGGER ALL;

--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.categories DISABLE TRIGGER ALL;

INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (17, NULL, 'Điện thoại, Tablet', 'phone-tablet', true, 1, NULL, '📱', NULL, '2026-10-02 21:34:46.915962+07', '2026-10-02 21:34:46.915962+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (18, 17, 'Điện thoại', 'dien-thoai', true, 1, NULL, '📱', NULL, '2026-10-02 21:34:46.925297+07', '2026-10-02 21:34:46.925297+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (19, 17, 'Máy tính bảng', 'may-tinh-bang', true, 2, NULL, '📱', NULL, '2026-10-02 21:34:46.927726+07', '2026-10-02 21:34:46.927726+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (1, 18, 'iPhone', 'iphone', true, 1, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (6, 18, 'Samsung Galaxy', 'samsung-galaxy', true, 1, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (3, 19, 'iPad', 'ipad', true, 2, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (7, NULL, 'Laptop', 'laptop', true, 2, NULL, '💻', NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (2, 7, 'MacBook', 'macbook', true, 1, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (20, 7, 'Laptop Gaming', 'laptop-gaming', true, 2, NULL, '🎮', NULL, '2026-10-02 21:34:46.930735+07', '2026-10-02 21:34:46.930735+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (21, 7, 'Laptop Văn phòng', 'laptop-van-phong', true, 3, NULL, '💼', NULL, '2026-10-02 21:34:46.930735+07', '2026-10-02 21:34:46.930735+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (22, NULL, 'Âm thanh, Mic thu âm', 'audio', true, 3, NULL, '🎧', NULL, '2026-10-02 21:34:46.931383+07', '2026-10-02 21:34:46.931383+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (12, 22, 'Âm thanh', 'am-thanh', true, 0, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (23, 22, 'Tai nghe', 'tai-nghe', true, 1, NULL, '🎧', NULL, '2026-10-02 21:34:46.93198+07', '2026-10-02 21:34:46.93198+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (24, 22, 'Loa Bluetooth', 'loa-bluetooth', true, 2, NULL, '🔊', NULL, '2026-10-02 21:34:46.93198+07', '2026-10-02 21:34:46.93198+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (25, NULL, 'Đồng hồ, Camera', 'watch-camera', true, 4, NULL, '⌚', NULL, '2026-10-02 21:34:46.932478+07', '2026-10-02 21:34:46.932478+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (4, 25, 'Apple Watch', 'apple-watch', true, 0, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (11, 25, 'Đồng hồ thông minh', 'dong-ho', true, 0, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (5, NULL, 'Phụ kiện', 'accessories', true, 5, NULL, '🔌', NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (10, 5, 'Phụ kiện máy tính', 'phu-kien-may-tinh', true, 0, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (26, 5, 'Cáp, củ sạc', 'cap-cu-sac', true, 1, NULL, '⚡', NULL, '2026-10-02 21:34:46.933725+07', '2026-10-02 21:34:46.933725+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (27, 5, 'Pin dự phòng', 'pin-du-phong', true, 2, NULL, '🔋', NULL, '2026-10-02 21:34:46.933725+07', '2026-10-02 21:34:46.933725+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (28, NULL, 'PC, Màn hình, Máy in', 'pc-monitor', true, 6, NULL, '🖥️', NULL, '2026-10-02 21:34:46.934115+07', '2026-10-02 21:34:46.934115+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (8, 28, 'Màn hình máy tính', 'man-hinh', true, 0, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (9, 28, 'PC', 'pc', true, 0, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (29, NULL, 'Tivi, Điện máy', 'tv-appliances', true, 7, NULL, '📺', NULL, '2026-10-02 21:34:46.93471+07', '2026-10-02 21:34:46.93471+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (30, 29, 'Tivi', 'tivi', true, 1, NULL, '📺', NULL, '2026-10-02 21:34:46.934919+07', '2026-10-02 21:34:46.934919+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (31, 29, 'Gia dụng thông minh', 'gia-dung', true, 2, NULL, '🏠', NULL, '2026-10-02 21:34:46.934919+07', '2026-10-02 21:34:46.934919+07');


ALTER TABLE public.categories ENABLE TRIGGER ALL;

--
-- Data for Name: category_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.category_attributes DISABLE TRIGGER ALL;

INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (10, 7, 'chip_ai', 'Chip AI', 'text', NULL, 'Hiệu năng', NULL, true, false, 1);
INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (11, 7, 'cpu', 'Loại CPU', 'text', NULL, 'Hiệu năng', NULL, true, true, 2);
INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (12, 7, 'gpu', 'Loại card đồ họa', 'text', NULL, 'Hiệu năng', NULL, true, true, 3);
INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (13, 7, 'ram', 'Dung lượng RAM', 'text', NULL, 'Bộ nhớ', NULL, true, true, 4);
INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (14, 7, 'storage', 'Ổ cứng', 'text', NULL, 'Bộ nhớ', NULL, true, true, 5);
INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (15, 7, 'screen', 'Công nghệ màn hình', 'text', NULL, 'Màn hình', NULL, true, true, 6);
INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (16, 7, 'battery', 'Pin & Củ sạc', 'text', NULL, 'Pin', NULL, true, false, 7);
INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (17, 7, 'ports', 'Cổng giao tiếp', 'text', NULL, 'Kết nối', NULL, true, false, 8);
INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (18, 7, 'os', 'Hệ điều hành', 'text', NULL, 'Phần mềm', NULL, true, false, 9);


ALTER TABLE public.category_attributes ENABLE TRIGGER ALL;

--
-- Data for Name: series; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.series DISABLE TRIGGER ALL;

INSERT INTO public.series (series_id, brand_id, name, slug) VALUES (14, 6, 'HP Omnibook', 'hp-omnibook');
INSERT INTO public.series (series_id, brand_id, name, slug) VALUES (15, 6, 'HP Victus', 'hp-victus');
INSERT INTO public.series (series_id, brand_id, name, slug) VALUES (16, 6, 'HP Pavilion', 'hp-pavilion');
INSERT INTO public.series (series_id, brand_id, name, slug) VALUES (17, 1, 'iPhone 16 Series', 'iphone-16-series');
INSERT INTO public.series (series_id, brand_id, name, slug) VALUES (18, 1, 'iPhone 15 Series', 'iphone-15-series');
INSERT INTO public.series (series_id, brand_id, name, slug) VALUES (19, 1, 'MacBook Pro', 'macbook-pro');
INSERT INTO public.series (series_id, brand_id, name, slug) VALUES (20, 1, 'MacBook Air', 'macbook-air');
INSERT INTO public.series (series_id, brand_id, name, slug) VALUES (21, 1, 'Apple Watch Ultra', 'apple-watch-ultra');
INSERT INTO public.series (series_id, brand_id, name, slug) VALUES (22, 2, 'Galaxy S Series', 'galaxy-s-series');
INSERT INTO public.series (series_id, brand_id, name, slug) VALUES (23, 2, 'Galaxy Z Series', 'galaxy-z-series');
INSERT INTO public.series (series_id, brand_id, name, slug) VALUES (24, 5, 'ASUS VivoBook', 'asus-vivobook');
INSERT INTO public.series (series_id, brand_id, name, slug) VALUES (25, 5, 'ASUS TUF Gaming', 'asus-tuf-gaming');
INSERT INTO public.series (series_id, brand_id, name, slug) VALUES (26, 4, 'Sony 1000X Series', 'sony-1000x-series');


ALTER TABLE public.series ENABLE TRIGGER ALL;

--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.suppliers DISABLE TRIGGER ALL;

INSERT INTO public.suppliers (supplier_id, name, contact_name, phone, email, address) VALUES (1, 'FPT Synnex', 'Nguyễn Văn Minh', '02473006666', 'synnex@fpt.com.vn', 'Tòa nhà FPT, Cầu Giấy, Hà Nội');
INSERT INTO public.suppliers (supplier_id, name, contact_name, phone, email, address) VALUES (2, 'Digiworld Corporation', 'Trần Thị Thu', '02839290059', 'contact@digiworld.com.vn', '195 Điện Biên Phủ, Bình Thạnh, TP.HCM');
INSERT INTO public.suppliers (supplier_id, name, contact_name, phone, email, address) VALUES (3, 'PHTD Distribution', 'Lê Hoàng Long', '02838248888', 'info@phtd.com.vn', 'Quận 1, TP.HCM');


ALTER TABLE public.suppliers ENABLE TRIGGER ALL;

--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.products DISABLE TRIGGER ALL;

INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (10, 9, 1, 1, 'Apple Mac mini M6 12CPU 12GPU 16GB 256GB 2026', 'apple-mac-mini-m6-16-256', 'Thế hệ chip Apple M6 đột phá 12 nhân CPU, 12 nhân GPU, hỗ trợ Apple Intelligence.', true, '2026-09-27 18:43:44.6934+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (14, 7, 7, 1, 'Laptop Lenovo IdeaPad Slim 5 16IAH8', 'lenovo-ideapad-slim-5-16', 'Khung nhôm cao cấp, Core i5 thế hệ mới, màn hình 16 inch chuẩn màu sắc nét.', true, '2026-09-27 18:43:44.737036+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (15, 7, 8, 1, 'Laptop MSI Modern 15 B12MO-628VN', 'msi-modern-15-b12mo', 'Thiết kế thanh lịch cho dân văn phòng và sinh viên, trọng lượng siêu nhẹ 1.7kg.', true, '2026-09-27 18:43:44.738908+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (18, 11, 15, 2, 'Đồng hồ thông minh Amazfit Active Max', 'amazfit-active-max', 'Thời lượng pin 14 ngày vượt trội, màn hình AMOLED 1.75 inch, hỗ trợ hơn 120 chế độ thể thao.', true, '2026-09-27 18:48:22.22391+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (19, 11, 3, 2, 'Đồng hồ định vị trẻ em myAlo K74', 'dong-ho-dinh-vi-myalo-k74', 'Định vị GPS chính xác 3 chế độ, gọi video HD 4G, nút khẩn cấp SOS và chống nước IP67 an toàn.', true, '2026-09-27 18:48:22.225708+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (21, 12, 16, 2, 'Loa Bluetooth Marshall Emberton II', 'marshall-emberton-ii', 'Âm thanh đa hướng True Stereophonic 360 độ, thời gian chơi nhạc hơn 30 giờ, chuẩn kháng bụi nước IP67.', true, '2026-09-27 18:48:22.228549+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (9, 6, 2, 2, 'Samsung Galaxy S24 Ultra 5G', 'samsung-galaxy-s24-ultra', 'Quyền năng Galaxy AI, khung viền Titan, bút S Pen tích hợp và camera zoom AI 100x đỉnh cao.', false, '2026-09-22 10:28:12.860739+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (22, 1, 1, NULL, 'iPhone 16 Plus 128GB VN/A', 'iphone-16-plus-128gb', 'Màn hình 6.7 inch Dynamic Island, chip A18, pin cực trâu.', false, '2026-09-27 19:32:28.750713+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (23, 1, 1, NULL, 'iPhone 16 128GB VN/A', 'iphone-16-128gb', 'Chip A18 siêu mạnh, nút Camera Control thế hệ mới.', true, '2026-09-27 19:32:28.750713+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (6, 3, 1, 2, 'iPad Pro M4 11 inch', 'ipad-pro-m4-11-inch', 'Siêu phẩm máy tính bảng mỏng nhất từ trước đến nay của Apple, màn hình Ultra Retina XDR Tandem OLED đột phá.', true, '2026-09-22 10:28:12.860739+07', NULL, NULL, '{}', true, true, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (25, 6, 2, NULL, 'Samsung Galaxy Z Fold6 5G 256GB', 'samsung-galaxy-z-fold6', 'Thiết kế gập siêu mỏng nhẹ, Galaxy AI hỗ trợ đa nhiệm.', true, '2026-09-27 19:32:28.750713+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (12, 7, 5, 1, 'Laptop ASUS VivoBook 14 X1407CA-LY008W', 'asus-vivobook-14-x1407ca', 'Thiết kế mỏng nhẹ hiện đại, chip Core Ultra 5 U5-225H, 16GB RAM mượt mà đa nhiệm.', true, '2026-09-27 18:43:44.734136+07', NULL, NULL, '{}', true, true, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (17, 11, 1, 2, 'Apple Watch Series 10 42mm (GPS) Viền Nhôm Dây Cao Su', 'apple-watch-series-10-42mm', 'Màn hình OLED góc rộng sáng hơn 40%, vỏ mỏng nhẹ nhất từng có, theo dõi chứng ngưng thở khi ngủ.', true, '2026-09-27 18:48:22.198803+07', NULL, NULL, '{}', true, true, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (2, 1, 1, 1, 'iPhone 15', 'iphone-15', 'Dynamic Island thông minh, camera chính 48MP siêu rõ nét, cổng sạc USB-C tiện lợi.', true, '2026-09-22 10:28:12.860739+07', NULL, NULL, '{}', true, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (5, 2, 1, 1, 'MacBook Air 13 inch M3', 'macbook-air-13-m3', 'Thiết kế mỏng nhẹ đỉnh cao, thời lượng pin lên đến 18 giờ, vận hành êm ái không quạt tản nhiệt.', true, '2026-09-22 10:28:12.860739+07', NULL, NULL, '{}', true, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (7, 4, 1, 2, 'Apple Watch Ultra 2 GPS + Cellular 49mm', 'apple-watch-ultra-2', 'Vỏ Titan siêu bền bỉ, định vị GPS tần số kép chuẩn xác, pin 72 giờ ở chế độ nguồn điện thấp.', true, '2026-09-22 10:28:12.860739+07', NULL, NULL, '{}', true, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (8, 5, 1, 3, 'AirPods Pro (Thế hệ 2) MagSafe USB-C', 'airpods-pro-2-usbc', 'Chống ồn chủ động vượt trội, âm thanh thích ứng tự động điều chỉnh theo môi trường.', true, '2026-09-22 10:28:12.860739+07', NULL, NULL, '{}', true, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (13, 7, 8, 1, 'Laptop MSI Cyborg 15 A13UC-2082VN', 'msi-cyborg-15-a13uc', 'Laptop gaming phong cách cyberpunk, Intel Core i7-13620H cùng đồ họa RTX 3050 mạnh mẽ.', true, '2026-09-27 18:43:44.735654+07', NULL, NULL, '{}', true, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (16, 7, 5, 1, 'Laptop ASUS TUF Gaming F15 FX506HF', 'asus-tuf-gaming-f15', 'Độ bền chuẩn quân đội Mỹ MIL-STD-810H, bàn phím RGB, tản nhiệt tự làm sạch hiệu quả.', true, '2026-09-27 18:43:44.740457+07', NULL, NULL, '{}', true, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (1, 1, 1, 1, 'iPhone 15 Pro Max', 'iphone-15-pro-max', 'Thiết kế khung Titan chuẩn hàng không vũ trụ, chip A17 Pro đột phá, camera tiềm vọng quang học 5x sắc nét.', true, '2026-09-22 10:28:12.860739+07', NULL, NULL, '{}', true, true, '2026-10-02 22:36:08.926589+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (26, 18, 3, NULL, 'Xiaomi 14 Ultra 5G 512GB', 'xiaomi-14-ultra-512gb', 'Ống kính Leica cao cấp, cảm biến 1 inch, sạc nhanh 90W.', true, '2026-09-27 19:32:28.750713+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (27, 18, 3, NULL, 'Xiaomi Redmi Note 13 Pro 5G', 'xiaomi-redmi-note-13-pro', 'Camera 200MP chống rung OIS, pin 5100mAh sạc 67W.', true, '2026-09-27 19:32:28.750713+07', NULL, NULL, '{}', true, false, '2026-10-02 22:15:47.535112+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (29, 3, 1, NULL, 'iPad mini 7 A17 Pro 128GB', 'ipad-mini-7-a17-pro', 'Thiết kế nhỏ gọn 8.3 inch, chip A17 Pro hỗ trợ Apple Intelligence.', false, '2026-09-27 19:32:28.750713+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (30, 3, 2, NULL, 'Samsung Galaxy Tab S9 FE WiFi 128GB', 'samsung-galaxy-tab-s9-fe', 'Kèm bút S-Pen, kháng nước IP68, màn hình 90Hz mượt mà.', false, '2026-09-27 19:32:28.750713+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (24, 6, 2, NULL, 'Samsung Galaxy S25 Ultra 5G 256GB', 'samsung-galaxy-s25-ultra', 'Snapdragon 8 Elite, camera 200MP, bút S-Pen quyền năng.', true, '2026-09-27 19:32:28.750713+07', 22, 'SM-S938B/DS', '{"pen": "Tích hợp sẵn bút S-Pen quyền năng trong thân máy", "ram": "12 GB LPDDR5X", "chip": "Qualcomm Snapdragon 8 Elite for Galaxy (3nm)", "screen": "6.8 inch Dynamic AMOLED 2X, QHD+ (3120 x 1440), 120Hz, Corning Gorilla Armor", "battery": "5000 mAh, sạc nhanh 45W có dây, sạc không dây 15W", "storage": "256 GB UFS 4.0", "camera_rear": "200MP + 50MP + 50MP + 10MP, Zoom quang học 100x Space Zoom"}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (11, 7, 6, 1, 'Laptop HP Omnibook 5 AI 16-AF1048TU BZ7Q9PA', 'hp-omnibook-5-ai-16', 'Laptop AI thế hệ mới với chip Core Ultra 5 U5-225U, màn hình 16 inch WUXGA sắc nét.', true, '2026-09-27 18:43:44.731765+07', 14, '16-AF1048TU BZ709PA', '{"os": "Windows 11 Home Single Language bản quyền + Office Home & Student 2024", "cpu": "Intel Core Ultra 5 225H (14 nhân, 18 luồng, xung nhịp tối đa 4.90 GHz, 18MB Cache)", "gpu": "Intel Arc Graphics chuyên dụng hiệu năng cao", "ram": "16 GB LPDDR5X 7467 MHz Onboard siêu tốc độ", "ports": "1 x Thunderbolt 4 (Type-C 40Gbps), 1 x USB Type-C 10Gbps, 2 x USB Type-A 10Gbps, 1 x HDMI 2.1, 1 x 3.5mm", "screen": "16.0 inches WUXGA (1920 x 1200) chống chói 300 nits 100% sRGB tỉ lệ 16:10", "battery": "3 Cell Li-ion polymer (68 Whr), hỗ trợ sạc nhanh HP Fast Charge 65W qua Type-C", "chip_ai": "Intel AI Boost NPU lên tới 48 TOPS hỗ trợ xử lý tác vụ trí tuệ nhân tạo", "storage": "512 GB SSD M.2 PCIe Gen 4 NVMe tốc độ cao"}', true, true, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (3, 1, 1, 1, 'iPhone 16 Pro Max', 'iphone-16-pro-max', 'Thế hệ mới với Apple Intelligence, viền màn hình siêu mỏng và nút chụp Camera Control cảm ứng lực.', true, '2026-09-22 10:28:12.860739+07', 17, 'MYWU3VN/A', '{"ram": "8 GB", "chip": "Apple A18 Pro 6 nhân (2 nhân hiệu năng + 4 nhân tiết kiệm), tiến trình 3nm", "ports": "USB-C hỗ trợ USB 3 (tốc độ lên đến 10Gbps)", "screen": "6.9 inch Super Retina XDR OLED, Dynamic Island, ProMotion 120Hz, 2000 nits", "battery": "Xem video lên đến 33 giờ, sạc MagSafe 25W", "storage": "256 GB NVMe", "material": "Khung viền Titan chuẩn hàng không vũ trụ cấp 5", "camera_rear": "Chính 48MP Fusion + Góc siêu rộng 48MP + Tele 12MP zoom quang 5x", "camera_front": "12MP TrueDepth, tự động lấy nét PDAF"}', true, true, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (4, 2, 1, 1, 'MacBook Pro 16 inch M3 Pro', 'macbook-pro-16-m3-pro', 'Sức mạnh vượt bậc từ chip Apple M3 Pro, màn hình Liquid Retina XDR 120Hz siêu sáng.', true, '2026-09-22 10:28:12.860739+07', 19, 'MRW13SA/A', '{"ram": "18 GB Unified Memory", "chip": "Apple M3 Pro (12 CPU / 18 GPU), 16-core Neural Engine", "ports": "3 x Thunderbolt 4, HDMI, khe thẻ SDXC, jack 3.5mm", "screen": "16.2 inch Liquid Retina XDR (3456 x 2234), ProMotion 120Hz, 1600 nits", "battery": "Pin lên tới 22 giờ, sạc MagSafe 3 140W", "storage": "512 GB SSD siêu tốc"}', true, true, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (20, 12, 4, 2, 'Tai nghe Bluetooth Sony WH-1000XM5', 'sony-wh-1000xm5', 'Đỉnh cao chống ồn chủ động với bộ xử lý V1 và QN1, thời lượng pin 30 giờ, micro thu âm chất lượng cao.', true, '2026-09-27 18:48:22.227184+07', 26, 'WH1000XM5/BM', '{"anc": "Bộ xử lý tích hợp V1 kết hợp bộ xử lý chống ồn HD QN1 và 8 micro", "type": "Tai nghe chụp tai Over-ear không dây chống ồn", "codec": "SBC, AAC, LDAC (Hi-Res Audio Wireless)", "driver": "30 mm sợi carbon siêu nhẹ", "weight": "Khoảng 250 g", "battery": "Tối đa 30 giờ (bật chống ồn), 40 giờ (tắt chống ồn)", "charging": "Sạc nhanh 3 phút nghe được 3 giờ"}', true, true, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (999, 5, 4, NULL, 'NEW TEST PRODUCT - Tai nghe Sony Pro Wireless 2026', 'new-test-product', 'Sản phẩm thử nghiệm kiến trúc Database Source of Truth trực tiếp từ PostgreSQL sang Product Detail Page.', true, '2026-10-01 23:33:11.11017+07', NULL, 'SONY-TEST-2026', '{"chip": "Sony V2 Ultra Audio Processor", "weight": "250g", "battery": "35 giờ phát liên tục", "waterproof": "IPX4", "connectivity": "Bluetooth 5.4, LDAC"}', true, true, '2026-10-02 22:18:34.457893+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (28, 3, 1, NULL, 'iPad Air 6 M2 11 inch WiFi 128GB', 'ipad-air-6-m2-11-inch', 'Chip Apple M2 cực mạnh, màn hình Liquid Retina sắc nét.', false, '2026-09-27 19:32:28.750713+07', NULL, NULL, '{}', true, true, '2026-10-02 22:24:01.722269+07');


ALTER TABLE public.products ENABLE TRIGGER ALL;

--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.product_variants DISABLE TRIGGER ALL;

INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (1, 1, 'IP15PM-256-NAT', '{"color": "Titan Tự Nhiên", "storage": "256GB"}', 25500000.00, 29990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (3, 1, 'IP15PM-256-BLK', '{"color": "Titan Đen", "storage": "256GB"}', 25500000.00, 29990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (4, 2, 'IP15-128-BLU', '{"color": "Xanh Pastel", "storage": "128GB"}', 16000000.00, 19490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (6, 3, 'IP16PM-256-DES', '{"color": "Titan Sa Mạc", "storage": "256GB"}', 30000000.00, 34990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (7, 4, 'MBP16-M3P-18-512', '{"ram": "18GB", "color": "Đen Không Gian", "storage": "512GB"}', 52000000.00, 59990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (8, 5, 'MBA13-M3-8-256-MID', '{"ram": "8GB", "color": "Đêm Xanh Thẳm", "storage": "256GB"}', 23000000.00, 27490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (9, 6, 'IPAD-M4-11-256-SIL', '{"color": "Bạc", "storage": "256GB"}', 24000000.00, 28990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (10, 7, 'AWU2-49-ORANGE', '{"case": "Titan 49mm", "strap": "Dây Alpine Cam"}', 17000000.00, 21490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (11, 8, 'APP2-USBC-WHT', '{"color": "Trắng", "connector": "USB-C"}', 4500000.00, 5890000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (12, 9, 'S24U-256-GRY', '{"color": "Xám Titan", "storage": "256GB"}', 24000000.00, 28990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (13, 10, 'MAC-MINI-M6-16-256', '{"cpu": "Apple M6", "gpu": "12 nhân", "ram": "16GB", "ssd": "256GB"}', 21000000.00, 24990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (14, 11, 'HP-OMNI-5-AI-16', '{"cpu": "U5-225U", "gpu": "Intel Graphics", "ram": "16GB", "ssd": "512GB", "screen": "16 inch WUXGA"}', 22000000.00, 25990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (15, 12, 'ASUS-VIVO-14-U5', '{"cpu": "U5-225H", "gpu": "Intel Graphics", "ram": "16GB", "ssd": "512GB", "screen": "14 inch WUXGA"}', 19000000.00, 22190000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (16, 13, 'MSI-CYBORG-15-I7', '{"cpu": "i7-13620H", "gpu": "RTX 3050", "ram": "16GB", "ssd": "512GB", "screen": "15.6 inch FHD 144Hz"}', 24000000.00, 27990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (17, 14, 'LENOVO-SLIM-5-16', '{"cpu": "U5-115U", "gpu": "Intel Graphics", "ram": "16GB", "ssd": "512GB", "screen": "15.6 inch FHD"}', 15000000.00, 17990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (18, 15, 'MSI-MODERN-15-B12', '{"cpu": "CORE 5-120U", "gpu": "Intel Graphics", "ram": "16GB", "ssd": "512GB", "screen": "15.6 inch FHD"}', 12000000.00, 14490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (19, 16, 'ASUS-TUF-F15-RTX', '{"cpu": "R7-8845HS", "gpu": "RTX 3050", "ram": "16GB", "ssd": "512GB", "screen": "15.6 inch FHD 144Hz"}', 14000000.00, 16990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (20, 17, 'AW-S10-42-ALU', '{"case": "Nhôm 42mm", "strap": "Cao su đen", "connectivity": "GPS"}', 9500000.00, 11490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (21, 18, 'AMAZFIT-ACTIVE-MAX', '{"color": "Đen Midnight", "screen": "AMOLED 1.75", "battery": "14 ngày"}', 2800000.00, 3590000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (22, 19, 'MYALO-K74-PINK', '{"sim": "4G", "color": "Hồng Phấn", "waterproof": "IP67"}', 1200000.00, 1590000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (23, 20, 'SONY-WH1000XM5-BLK', '{"anc": "Active Noise Cancelling", "color": "Đen Nhám", "battery": "30 giờ"}', 5500000.00, 6990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (24, 21, 'MARSHALL-EMBERTON-2', '{"color": "Black and Brass", "battery": "30+ giờ", "waterproof": "IP67"}', 2900000.00, 16990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (2, 1, 'IP15PM-512-NAT', '{"color": "Titan Tự Nhiên", "storage": "512GB"}', 30500000.00, 29990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (5, 2, 'IP15-256-PNK', '{"color": "Hồng", "storage": "256GB"}', 19000000.00, 19490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (25, 22, 'SKU-IP16P-128', '{"color": "Xanh Mòng Két", "storage": "128GB"}', 23000000.00, 25490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (26, 23, 'SKU-IP16-128', '{"color": "Hồng", "storage": "128GB"}', 19000000.00, 21990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (27, 24, 'SKU-S25U-256', '{"color": "Titan Bạc", "storage": "256GB"}', 28000000.00, 31990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (28, 25, 'SKU-ZFOLD6-256', '{"color": "Xám Metal", "storage": "256GB"}', 36000000.00, 41990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (29, 26, 'SKU-MI14U-512', '{"color": "Đen Da", "storage": "512GB"}', 26000000.00, 29990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (30, 27, 'SKU-RN13P-128', '{"color": "Tím Cực Quang", "storage": "128GB"}', 6000000.00, 6990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (31, 28, 'SKU-IPADAIR6-128', '{"color": "Xanh Dương", "storage": "128GB"}', 14000000.00, 16490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (32, 29, 'SKU-IPADMINI7-128', '{"color": "Ánh Sao", "storage": "128GB"}', 12000000.00, 13990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (33, 30, 'SKU-TABS9FE-128', '{"color": "Xanh Mint", "storage": "128GB"}', 8000000.00, 9490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (9991, 999, 'TEST-SONY-BLK', '{"color": "Đen Huyền Bí", "capacity": "Bản Cao Cấp"}', 4000000.00, 5490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (9992, 999, 'TEST-SONY-SLV', '{"color": "Bạc Platinum", "capacity": "Bản Cao Cấp"}', 4000000.00, 5490000.00, true);


ALTER TABLE public.product_variants ENABLE TRIGGER ALL;

--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.warehouses DISABLE TRIGGER ALL;

INSERT INTO public.warehouses (warehouse_id, name, address, is_store, is_active, province, district, ward, phone, latitude, longitude, open_hours, is_regional_hub, region) VALUES (8, 'Chi nhánh Nguyễn Thái Học', '134 Nguyễn Thái Học, P. Phạm Ngũ Lão, Quận 1, TP. HCM', true, true, 'Hồ Chí Minh', 'Quận 1', 'P. Phạm Ngũ Lão', '02871000134', NULL, NULL, '08:00 - 22:00', false, NULL);
INSERT INTO public.warehouses (warehouse_id, name, address, is_store, is_active, province, district, ward, phone, latitude, longitude, open_hours, is_regional_hub, region) VALUES (9, 'Chi nhánh Trần Quang Khải', '55B Trần Quang Khải, P. Tân Định, Quận 1, TP. HCM', true, true, 'Hồ Chí Minh', 'Quận 1', 'P. Tân Định', '02871088552', NULL, NULL, '08:00 - 22:00', false, NULL);
INSERT INTO public.warehouses (warehouse_id, name, address, is_store, is_active, province, district, ward, phone, latitude, longitude, open_hours, is_regional_hub, region) VALUES (10, 'Chi nhánh Đường 3 Tháng 2', '300 Đường 3 Tháng 2, Phường 12, Quận 10, TP. HCM', true, true, 'Hồ Chí Minh', 'Quận 10', 'Phường 12', '02871083002', NULL, NULL, '08:00 - 21:30', false, NULL);
INSERT INTO public.warehouses (warehouse_id, name, address, is_store, is_active, province, district, ward, phone, latitude, longitude, open_hours, is_regional_hub, region) VALUES (11, 'Chi nhánh Thái Hà', '21 Thái Hà, P. Trung Liệt, Đống Đa, Hà Nội', true, true, 'Hà Nội', 'Đống Đa', 'P. Trung Liệt', '02471021212', NULL, NULL, '08:00 - 21:30', false, NULL);
INSERT INTO public.warehouses (warehouse_id, name, address, is_store, is_active, province, district, ward, phone, latitude, longitude, open_hours, is_regional_hub, region) VALUES (1, 'Kho Tổng Hà Nội', '126 Hồ Tùng Mậu, P. Mai Dịch, Cầu Giấy, Hà Nội', true, true, 'Hà Nội', 'Cầu Giấy', 'P. Mai Dịch', '02471012626', NULL, NULL, '08:00 - 21:30', true, 'NORTH');
INSERT INTO public.warehouses (warehouse_id, name, address, is_store, is_active, province, district, ward, phone, latitude, longitude, open_hours, is_regional_hub, region) VALUES (2, 'Kho Tổng TP.HCM', '219 - 229 Trần Hưng Đạo, P. Cô Giang, Quận 1, TP. HCM', true, true, 'Hồ Chí Minh', 'Quận 1', 'P. Cô Giang', '02871087317', NULL, NULL, '08:00 - 22:00', true, 'SOUTH');
INSERT INTO public.warehouses (warehouse_id, name, address, is_store, is_active, province, district, ward, phone, latitude, longitude, open_hours, is_regional_hub, region) VALUES (3, 'Kho Phân Phối Đà Nẵng', '177 Nguyễn Văn Linh, P. Nam Dương, Hải Châu, Đà Nẵng', true, true, 'Đà Nẵng', 'Hải Châu', 'P. Nam Dương', '02367101777', NULL, NULL, '08:00 - 21:30', true, 'CENTRAL');


ALTER TABLE public.warehouses ENABLE TRIGGER ALL;

--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.inventory DISABLE TRIGGER ALL;

INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 1, 45, 2, 10, '2026-09-22 10:28:12.896029+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 2, 45, 2, 10, '2026-09-22 10:28:12.896029+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 3, 45, 2, 10, '2026-09-22 10:28:12.896029+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 4, 45, 2, 10, '2026-09-22 10:28:12.896029+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 5, 45, 2, 10, '2026-09-22 10:28:12.896029+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 7, 45, 2, 10, '2026-09-22 10:28:12.896029+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 8, 45, 2, 10, '2026-09-22 10:28:12.896029+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 9, 45, 2, 10, '2026-09-22 10:28:12.896029+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 10, 45, 2, 10, '2026-09-22 10:28:12.896029+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 11, 45, 2, 10, '2026-09-22 10:28:12.896029+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 12, 45, 2, 10, '2026-09-22 10:28:12.896029+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 1, 30, 1, 10, '2026-09-22 10:28:12.899148+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 2, 30, 1, 10, '2026-09-22 10:28:12.899148+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 3, 30, 1, 10, '2026-09-22 10:28:12.899148+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 4, 30, 1, 10, '2026-09-22 10:28:12.899148+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 5, 30, 1, 10, '2026-09-22 10:28:12.899148+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 6, 30, 1, 10, '2026-09-22 10:28:12.899148+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 7, 30, 1, 10, '2026-09-22 10:28:12.899148+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 8, 30, 1, 10, '2026-09-22 10:28:12.899148+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 9, 30, 1, 10, '2026-09-22 10:28:12.899148+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 12, 30, 1, 10, '2026-09-22 10:28:12.899148+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 6, 5, 1, 10, '2026-09-22 10:28:12.896029+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 10, 4, 0, 10, '2026-09-22 10:28:12.899148+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 14, 5, 0, 2, '2026-10-01 22:41:45.037638+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 14, 5, 0, 2, '2026-10-01 22:41:45.037638+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 14, 5, 0, 2, '2026-10-01 22:41:45.037638+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 14, 5, 0, 2, '2026-10-01 22:41:45.037638+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 14, 5, 0, 2, '2026-10-01 22:41:45.037638+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 14, 5, 0, 2, '2026-10-01 22:41:45.037638+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 14, 5, 0, 2, '2026-10-01 22:41:45.037638+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 9991, 10, 0, 10, '2026-10-01 23:33:11.11017+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 1, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 1, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 1, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 1, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 3, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 3, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 3, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 3, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 3, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 4, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 4, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 4, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 4, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 4, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 6, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 6, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 6, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 6, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 6, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 7, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 7, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 7, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 7, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 7, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 8, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 8, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 8, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 8, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 8, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 9, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 9, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 9, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 9, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 9, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 10, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 10, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 10, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 10, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 10, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 11, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 11, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 11, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 11, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 12, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 12, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 12, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 12, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 12, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 13, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 13, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 13, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 13, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 13, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 13, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 13, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 15, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 15, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 15, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 15, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 15, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 15, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 15, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 16, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 16, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 16, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 16, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 16, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 16, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 16, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 17, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 17, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 17, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 17, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 17, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 17, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 17, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 18, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 1, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 11, 30, 1, 10, '2026-10-04 19:11:03.1957+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 11, 30, 0, 5, '2026-10-04 18:56:43.692685+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 18, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 18, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 18, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 18, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 18, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 18, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 19, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 19, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 19, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 19, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 19, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 19, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 19, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 20, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 20, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 20, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 20, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 20, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 20, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 20, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 21, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 21, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 21, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 21, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 21, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 21, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 21, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 22, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 22, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 22, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 22, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 22, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 22, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 22, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 23, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 23, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 23, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 23, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 23, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 23, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 23, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 24, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 24, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 24, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 24, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 24, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 24, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 24, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 2, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 2, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 2, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 2, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 2, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 5, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 5, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 5, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 5, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 5, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 25, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 25, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 25, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 25, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 25, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 25, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 25, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 26, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 26, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 26, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 26, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 26, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 26, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 26, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 27, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 27, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 27, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 27, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 27, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 27, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 27, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 28, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 28, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 28, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 28, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 28, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 28, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 28, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 29, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 29, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 29, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 29, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 29, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 29, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 29, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 30, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 30, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 30, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 30, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 30, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 30, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 30, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 31, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 31, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 31, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 31, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 31, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 31, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 31, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 32, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 32, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 32, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 32, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 32, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 32, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 32, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 33, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 33, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 33, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 33, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 33, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 33, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 33, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 9991, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 9991, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 9991, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 9991, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 9991, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 9991, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (8, 9992, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (9, 9992, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (10, 9992, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (11, 9992, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (1, 9992, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (2, 9992, 30, 0, 5, '2026-10-03 15:36:49.312944+07');
INSERT INTO public.inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at) VALUES (3, 9992, 30, 0, 5, '2026-10-03 15:36:49.312944+07');


ALTER TABLE public.inventory ENABLE TRIGGER ALL;

--
-- Data for Name: membership_tiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.membership_tiers DISABLE TRIGGER ALL;

INSERT INTO public.membership_tiers (tier_id, code, name, min_annual_spend, discount_percent, requires_verification, description) VALUES (3, 'SVIP', 'S-VIP', 50000000.00, 2.00, false, 'Uu dai khach hang VIP giam 2%');
INSERT INTO public.membership_tiers (tier_id, code, name, min_annual_spend, discount_percent, requires_verification, description) VALUES (1, 'TMEMBER', 'Tmember', 0.00, 1.00, false, 'Uu dai thanh vien Tmember giam 1%');
INSERT INTO public.membership_tiers (tier_id, code, name, min_annual_spend, discount_percent, requires_verification, description) VALUES (2, 'TSTUDENT', 'T-Student', 0.00, 3.00, true, 'Uu dai hoc sinh - sinh vien giam them 3%');


ALTER TABLE public.membership_tiers ENABLE TRIGGER ALL;

--
-- Data for Name: payment_method_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_method_config DISABLE TRIGGER ALL;

INSERT INTO public.payment_method_config (id, code, name, icon, description, is_active, sort_order, created_at) VALUES (2, 'BANK_QR', 'Chuyển khoản ngân hàng qua mã QR', 'qr_code', 'Quét mã VietQR thanh toán (Thủ kho xác nhận thủ công).', true, 2, '2026-10-03 15:18:53.174365+07');
INSERT INTO public.payment_method_config (id, code, name, icon, description, is_active, sort_order, created_at) VALUES (3, 'VNPAY', 'VNPAY', 'vnpay', 'Cổng thanh toán quốc dân VNPAY-QR, Thẻ ATM & Tài khoản ngân hàng.', true, 3, '2026-10-03 15:18:53.174365+07');
INSERT INTO public.payment_method_config (id, code, name, icon, description, is_active, sort_order, created_at) VALUES (4, 'MOMO', 'MoMo', 'momo', 'Nhập ưu đãi tại cổng, giảm thêm 2% tối đa 200.000đ', false, 4, '2026-10-03 15:18:53.174365+07');
INSERT INTO public.payment_method_config (id, code, name, icon, description, is_active, sort_order, created_at) VALUES (5, 'ONEPAY_CARD', 'Qua thẻ Visa/Master/JCB/Napas', 'credit_card', 'Nhập ưu đãi tại cổng, tối đa 500.000đ', false, 5, '2026-10-03 15:18:53.174365+07');
INSERT INTO public.payment_method_config (id, code, name, icon, description, is_active, sort_order, created_at) VALUES (1, 'STORE', 'Thanh toán tại cửa hàng', 'store', 'TruongNgStore se giu san pham va uu dai trong vong 24 gio ke tu thoi diem dat hang.', true, 1, '2026-10-03 15:18:53.174365+07');


ALTER TABLE public.payment_method_config ENABLE TRIGGER ALL;

--
-- Data for Name: payment_offers; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_offers DISABLE TRIGGER ALL;

INSERT INTO public.payment_offers (offer_id, title, description, payment_method, bank_name, discount_type, discount_value, max_discount, min_order_amount, image_url, sort_order, is_active, starts_at, ends_at) VALUES (4, 'Giảm đến 1.000.000đ khi thanh toán thẻ tín dụng HSBC', 'Áp dụng cho chủ thẻ tín dụng HSBC vào các ngày thứ 6, thứ 7', NULL, 'HSBC', 'fixed', 1000000.00, 1000000.00, 10000000.00, NULL, 1, true, '2026-09-21 22:41:45.037638+07', '2026-12-30 22:41:45.037638+07');
INSERT INTO public.payment_offers (offer_id, title, description, payment_method, bank_name, discount_type, discount_value, max_discount, min_order_amount, image_url, sort_order, is_active, starts_at, ends_at) VALUES (5, 'Giảm ngay 800.000đ khi thanh toán qua Kredivo', 'Áp dụng cho đơn hàng từ 8 triệu đồng, kỳ hạn 6 hoặc 12 tháng', NULL, 'Kredivo', 'fixed', 800000.00, 800000.00, 8000000.00, NULL, 2, true, '2026-09-21 22:41:45.037638+07', '2026-12-30 22:41:45.037638+07');
INSERT INTO public.payment_offers (offer_id, title, description, payment_method, bank_name, discount_type, discount_value, max_discount, min_order_amount, image_url, sort_order, is_active, starts_at, ends_at) VALUES (6, 'Giảm ngay 500.000đ khi quét mã VNPAY-QR', 'Nhập mã VNPAYHP500 tại bước thanh toán', NULL, 'VNPAY', 'fixed', 500000.00, 500000.00, 5000000.00, NULL, 3, true, '2026-09-21 22:41:45.037638+07', '2026-12-30 22:41:45.037638+07');


ALTER TABLE public.payment_offers ENABLE TRIGGER ALL;

--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.permissions DISABLE TRIGGER ALL;

INSERT INTO public.permissions (permission_code, description) VALUES ('order.view', 'Xem đơn hàng');
INSERT INTO public.permissions (permission_code, description) VALUES ('order.update', 'Cập nhật / xử lý đơn hàng');
INSERT INTO public.permissions (permission_code, description) VALUES ('product.manage', 'Thêm, sửa, ẩn sản phẩm');
INSERT INTO public.permissions (permission_code, description) VALUES ('inventory.manage', 'Quản lý tồn kho, xuất nhập kho');
INSERT INTO public.permissions (permission_code, description) VALUES ('purchase.manage', 'Tạo và nhận phiếu nhập hàng');
INSERT INTO public.permissions (permission_code, description) VALUES ('finance.view', 'Xem báo cáo tài chính');
INSERT INTO public.permissions (permission_code, description) VALUES ('expense.manage', 'Ghi nhận chi phí');
INSERT INTO public.permissions (permission_code, description) VALUES ('customer.support', 'Xử lý ticket hỗ trợ khách');
INSERT INTO public.permissions (permission_code, description) VALUES ('staff.manage', 'Quản lý nhân viên và phân quyền');
INSERT INTO public.permissions (permission_code, description) VALUES ('promotion.manage', 'Quản lý khuyến mãi, ưu đãi thanh toán, combo, bảo hành mở rộng');


ALTER TABLE public.permissions ENABLE TRIGGER ALL;

--
-- Data for Name: product_commitments; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.product_commitments DISABLE TRIGGER ALL;

INSERT INTO public.product_commitments (commitment_id, category_id, title, content, icon_url, sort_order, is_active) VALUES (5, NULL, 'Hàng mới 100%, chính hãng', 'Máy mới nguyên seal, đầy đủ phụ kiện từ nhà sản xuất. Bảo hành chính hãng 12 tháng tại các TTBH ủy quyền.', NULL, 1, true);
INSERT INTO public.product_commitments (commitment_id, category_id, title, content, icon_url, sort_order, is_active) VALUES (6, NULL, 'Bảo hành 1 đổi 1 trong 30 ngày', '1 Đổi 1 trong vòng 30 ngày nếu phát sinh bất kỳ lỗi phần cứng nào từ nhà sản xuất.', NULL, 2, true);
INSERT INTO public.product_commitments (commitment_id, category_id, title, content, icon_url, sort_order, is_active) VALUES (7, NULL, 'Bộ phụ kiện chuẩn theo hộp', 'Thân máy, củ sạc nhanh chính hãng, dây cáp sạc cao cấp bọc dù, sách hướng dẫn sử dụng.', NULL, 3, true);
INSERT INTO public.product_commitments (commitment_id, category_id, title, content, icon_url, sort_order, is_active) VALUES (8, NULL, 'Đã bao gồm VAT & Hóa đơn điện tử', 'Giá sản phẩm đã bao gồm thuế GTGT (VAT 10%). Hỗ trợ xuất hóa đơn điện tử VAT doanh nghiệp ngay trong ngày.', NULL, 4, true);


ALTER TABLE public.product_commitments ENABLE TRIGGER ALL;

--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.product_images DISABLE TRIGGER ALL;

INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (1, 1, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (2, 2, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (3, 3, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (4, 4, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (5, 5, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (6, 6, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (7, 7, 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (9, 9, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (10, 10, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (11, 11, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (12, 12, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (13, 13, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (14, 14, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (15, 15, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (16, 16, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (17, 17, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (18, 18, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (19, 19, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (20, 20, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (21, 21, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (22, 22, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (23, 23, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (24, 24, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (25, 25, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (26, 26, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (27, 27, '/images/products/phones/phone_poco_x8.jpg', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (28, 28, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (29, 29, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (30, 30, 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (31, 10, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (32, 11, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (33, 12, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (34, 13, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (35, 14, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (36, 15, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (37, 16, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (38, 22, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (39, 23, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (40, 24, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (41, 25, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (42, 26, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (43, 27, '/images/products/phones/phone_poco_x8.jpg', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (44, 28, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (45, 29, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (46, 30, 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&q=80', true, 1);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (47, 999, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', true, 0);
INSERT INTO public.product_images (image_id, product_id, url, is_primary, sort_order) VALUES (8, 8, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80', true, 1);


ALTER TABLE public.product_images ENABLE TRIGGER ALL;

--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.role_permissions DISABLE TRIGGER ALL;

INSERT INTO public.role_permissions (role, permission_code) VALUES ('sales', 'order.view');
INSERT INTO public.role_permissions (role, permission_code) VALUES ('sales', 'order.update');
INSERT INTO public.role_permissions (role, permission_code) VALUES ('sales', 'customer.support');
INSERT INTO public.role_permissions (role, permission_code) VALUES ('warehouse', 'order.view');
INSERT INTO public.role_permissions (role, permission_code) VALUES ('warehouse', 'inventory.manage');
INSERT INTO public.role_permissions (role, permission_code) VALUES ('warehouse', 'purchase.manage');
INSERT INTO public.role_permissions (role, permission_code) VALUES ('support', 'order.view');
INSERT INTO public.role_permissions (role, permission_code) VALUES ('support', 'customer.support');
INSERT INTO public.role_permissions (role, permission_code) VALUES ('accountant', 'order.view');
INSERT INTO public.role_permissions (role, permission_code) VALUES ('accountant', 'finance.view');
INSERT INTO public.role_permissions (role, permission_code) VALUES ('accountant', 'expense.manage');
INSERT INTO public.role_permissions (role, permission_code) VALUES ('sales', 'promotion.manage');


ALTER TABLE public.role_permissions ENABLE TRIGGER ALL;

--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.system_settings DISABLE TRIGGER ALL;

INSERT INTO public.system_settings (setting_key, value, description, updated_at) VALUES ('free_shipping_threshold', '300000', 'Ngưỡng miễn phí vận chuyển toàn quốc (VNĐ)', '2026-10-03 15:18:53.174365+07');
INSERT INTO public.system_settings (setting_key, value, description, updated_at) VALUES ('standard_shipping_fee', '30000', 'Phí vận chuyển tiêu chuẩn cho đơn dưới ngưỡng (VNĐ)', '2026-10-03 15:18:53.174365+07');
INSERT INTO public.system_settings (setting_key, value, description, updated_at) VALUES ('order_hold_hours_store', '24', 'Số giờ giữ hàng khi chọn thanh toán tại cửa hàng', '2026-10-03 15:18:53.174365+07');
INSERT INTO public.system_settings (setting_key, value, description, updated_at) VALUES ('order_payment_timeout_minutes_online', '15', 'Số phút chờ thanh toán online trước khi tự hủy đơn', '2026-10-03 15:18:53.174365+07');


ALTER TABLE public.system_settings ENABLE TRIGGER ALL;

--
-- Data for Name: warranty_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.warranty_plans DISABLE TRIGGER ALL;

INSERT INTO public.warranty_plans (plan_id, category_id, name, plan_type, duration_months, price, min_product_price, max_product_price, description, sort_order, is_active) VALUES (3, NULL, 'Gói bảo hành VIP 12 tháng 1 ĐỔI 1 toàn diện', 'swap', 12, 990000.00, 10000000.00, 50000000.00, '1 đổi 1 máy mới tương đương nếu có lỗi phần cứng từ NSX, bảo vệ rơi vỡ vào nước.', 1, true);
INSERT INTO public.warranty_plans (plan_id, category_id, name, plan_type, duration_months, price, min_product_price, max_product_price, description, sort_order, is_active) VALUES (4, NULL, 'Gói bảo hành VIP 24 tháng mở rộng linh kiện chính hãng', 'extended', 24, 1890000.00, 10000000.00, 50000000.00, 'Gia hạn thêm 1 năm bảo hành sau hạn của hãng, thay linh kiện chính hãng miễn phí 100%.', 2, true);


ALTER TABLE public.warranty_plans ENABLE TRIGGER ALL;

--
-- Name: banners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banners_id_seq', 5, true);


--
-- Name: brands_brand_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.brands_brand_id_seq', 25, true);


--
-- Name: categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_category_id_seq', 32, true);


--
-- Name: category_attributes_attr_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.category_attributes_attr_id_seq', 18, true);


--
-- Name: membership_tiers_tier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.membership_tiers_tier_id_seq', 3, true);


--
-- Name: payment_method_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_method_config_id_seq', 5, true);


--
-- Name: payment_offers_offer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_offers_offer_id_seq', 6, true);


--
-- Name: product_commitments_commitment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_commitments_commitment_id_seq', 8, true);


--
-- Name: product_images_image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_images_image_id_seq', 47, true);


--
-- Name: product_variants_variant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_variants_variant_id_seq', 49, true);


--
-- Name: products_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_product_id_seq', 30, true);


--
-- Name: series_series_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.series_series_id_seq', 26, true);


--
-- Name: suppliers_supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_supplier_id_seq', 3, true);


--
-- Name: warehouses_warehouse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.warehouses_warehouse_id_seq', 11, true);


--
-- Name: warranty_plans_plan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.warranty_plans_plan_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

\unrestrict MoqJqb4KYMSADnbYla5cQvPZmtLUSd9RRwTWeSdeBDyF6iq17b0rCDCr3aEsmi0

