--
-- PostgreSQL database dump
--


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
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: -
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public.banners DISABLE TRIGGER ALL;

INSERT INTO public.banners (id, bg_color, created_at, display_order, headline, image_url, is_active, primary_btn_link, primary_btn_text, secondary_btn_link, secondary_btn_text, sub_headline, text_color, title) VALUES (1, '#000000', '2026-09-29 11:34:02.513708', 1, 'Thiet ke Titan Dot Pha', '/images/banners/poster_iphone_duo.jpg', true, '/products/iphone-16-pro-max', 'Tim hieu them', '/products/iphone-16-pro-max', 'Mua ngay', 'Camera 48MP Fusion the he moi, chip A18 Pro manh me.', '#f5f5f7', 'iPhone 16 Series');
INSERT INTO public.banners (id, bg_color, created_at, display_order, headline, image_url, is_active, primary_btn_link, primary_btn_text, secondary_btn_link, secondary_btn_text, sub_headline, text_color, title) VALUES (2, '#0a0a0c', '2026-09-29 11:34:02.513708', 2, 'Bat Net Chuan Flagship', '/images/banners/poster_redmi_note17.jpg', true, '/products', 'Tim hieu them', '/products', 'Mua ngay', 'Man hinh 1.5K 120Hz sieu muot, sac nhanh 67W.', '#ffffff', 'Redmi Note 13 Pro 5G');
INSERT INTO public.banners (id, bg_color, created_at, display_order, headline, image_url, is_active, primary_btn_link, primary_btn_text, secondary_btn_link, secondary_btn_text, sub_headline, text_color, title) VALUES (4, '#141416', '2026-09-29 11:34:02.513708', 4, 'Dinh Cao Ben Bi', 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&q=80', true, '/products/apple-watch-ultra-2', 'Chi tiet', '/products/apple-watch-ultra-2', 'Mua ngay', 'Vo Titan 49mm chong nuoc 100m, pin 72 gio.', '#ffffff', 'Apple Watch Ultra 2');
INSERT INTO public.banners (id, bg_color, created_at, display_order, headline, image_url, is_active, primary_btn_link, primary_btn_text, secondary_btn_link, secondary_btn_text, sub_headline, text_color, title) VALUES (3, '#0b0b0f', '2026-09-29 11:34:02.513708', 0, 'Sieu Quai Vat Do Hoa', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', true, '/products/macbook-pro-16-m3-pro', 'Kham pha', '/products/macbook-pro-16-m3-pro', 'Dat hang', 'Man hinh Liquid Retina XDR 120Hz, pin 22 gio.', '#ffffff', 'MacBook Pro M3 Max');
INSERT INTO public.banners (id, bg_color, created_at, display_order, headline, image_url, is_active, primary_btn_link, primary_btn_text, secondary_btn_link, secondary_btn_text, sub_headline, text_color, title) VALUES (5, NULL, '2026-10-01 23:32:31.756055', 0, NULL, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80', true, '/products?keyword=laptop', NULL, NULL, NULL, NULL, NULL, 'Banner Laptop Má»›i');


ALTER TABLE public.banners ENABLE TRIGGER ALL;

--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.brands DISABLE TRIGGER ALL;

INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (1, 'Apple', 'USA', 'apple', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (2, 'Samsung', 'HĂ n Quá»‘c', 'samsung', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (3, 'Xiaomi', 'Trung Quá»‘c', 'xiaomi', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (4, 'Sony', 'Nháº­t Báº£n', 'sony', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (5, 'Asus', 'ÄĂ i Loan', 'asus', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (6, 'HP', 'USA', 'hp', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (7, 'Lenovo', 'Trung Quá»‘c', 'lenovo', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (8, 'MSI', 'ÄĂ i Loan', 'msi', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (10, 'Dell', 'USA', 'dell', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (11, 'LG', 'HĂ n Quá»‘c', 'lg', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (12, 'Gigabyte', 'ÄĂ i Loan', 'gigabyte', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (13, 'Huawei', 'Trung Quá»‘c', 'huawei', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (14, 'Garmin', 'USA', 'garmin', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (15, 'Amazfit', 'Trung Quá»‘c', 'amazfit', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (16, 'Marshall', 'Anh', 'marshall', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (17, 'Soundpeats', 'Trung Quá»‘c', 'soundpeats', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.brands (brand_id, name, country, slug, logo_url, description, sort_order, is_active, created_at, updated_at) VALUES (9, 'Acer', 'ÄĂ i Loan', 'acer', NULL, NULL, 0, true, '2026-10-02 21:34:13.087113+07', '2026-10-02 22:17:54.838745+07');


ALTER TABLE public.brands ENABLE TRIGGER ALL;

--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.categories DISABLE TRIGGER ALL;

INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (17, NULL, 'Äiá»‡n thoáº¡i, Tablet', 'phone-tablet', true, 1, NULL, 'đŸ“±', NULL, '2026-10-02 21:34:46.915962+07', '2026-10-02 21:34:46.915962+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (18, 17, 'Äiá»‡n thoáº¡i', 'dien-thoai', true, 1, NULL, 'đŸ“±', NULL, '2026-10-02 21:34:46.925297+07', '2026-10-02 21:34:46.925297+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (19, 17, 'MĂ¡y tĂ­nh báº£ng', 'may-tinh-bang', true, 2, NULL, 'đŸ“±', NULL, '2026-10-02 21:34:46.927726+07', '2026-10-02 21:34:46.927726+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (1, 18, 'iPhone', 'iphone', true, 1, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (6, 18, 'Samsung Galaxy', 'samsung-galaxy', true, 1, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (3, 19, 'iPad', 'ipad', true, 2, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (7, NULL, 'Laptop', 'laptop', true, 2, NULL, 'đŸ’»', NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (2, 7, 'MacBook', 'macbook', true, 1, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (20, 7, 'Laptop Gaming', 'laptop-gaming', true, 2, NULL, 'đŸ®', NULL, '2026-10-02 21:34:46.930735+07', '2026-10-02 21:34:46.930735+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (21, 7, 'Laptop VÄƒn phĂ²ng', 'laptop-van-phong', true, 3, NULL, 'đŸ’¼', NULL, '2026-10-02 21:34:46.930735+07', '2026-10-02 21:34:46.930735+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (22, NULL, 'Ă‚m thanh, Mic thu Ă¢m', 'audio', true, 3, NULL, 'đŸ§', NULL, '2026-10-02 21:34:46.931383+07', '2026-10-02 21:34:46.931383+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (12, 22, 'Ă‚m thanh', 'am-thanh', true, 0, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (23, 22, 'Tai nghe', 'tai-nghe', true, 1, NULL, 'đŸ§', NULL, '2026-10-02 21:34:46.93198+07', '2026-10-02 21:34:46.93198+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (24, 22, 'Loa Bluetooth', 'loa-bluetooth', true, 2, NULL, 'đŸ”', NULL, '2026-10-02 21:34:46.93198+07', '2026-10-02 21:34:46.93198+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (25, NULL, 'Äá»“ng há»“, Camera', 'watch-camera', true, 4, NULL, 'âŒ', NULL, '2026-10-02 21:34:46.932478+07', '2026-10-02 21:34:46.932478+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (4, 25, 'Apple Watch', 'apple-watch', true, 0, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (11, 25, 'Äá»“ng há»“ thĂ´ng minh', 'dong-ho', true, 0, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (5, NULL, 'Phá»¥ kiá»‡n', 'accessories', true, 5, NULL, 'đŸ”Œ', NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (10, 5, 'Phá»¥ kiá»‡n mĂ¡y tĂ­nh', 'phu-kien-may-tinh', true, 0, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (26, 5, 'CĂ¡p, cá»§ sáº¡c', 'cap-cu-sac', true, 1, NULL, 'â¡', NULL, '2026-10-02 21:34:46.933725+07', '2026-10-02 21:34:46.933725+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (27, 5, 'Pin dá»± phĂ²ng', 'pin-du-phong', true, 2, NULL, 'đŸ”‹', NULL, '2026-10-02 21:34:46.933725+07', '2026-10-02 21:34:46.933725+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (28, NULL, 'PC, MĂ n hĂ¬nh, MĂ¡y in', 'pc-monitor', true, 6, NULL, 'đŸ–¥ï¸', NULL, '2026-10-02 21:34:46.934115+07', '2026-10-02 21:34:46.934115+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (8, 28, 'MĂ n hĂ¬nh mĂ¡y tĂ­nh', 'man-hinh', true, 0, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (9, 28, 'PC', 'pc', true, 0, NULL, NULL, NULL, '2026-10-02 21:34:13.087113+07', '2026-10-02 21:34:13.087113+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (29, NULL, 'Tivi, Äiá»‡n mĂ¡y', 'tv-appliances', true, 7, NULL, 'đŸ“º', NULL, '2026-10-02 21:34:46.93471+07', '2026-10-02 21:34:46.93471+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (30, 29, 'Tivi', 'tivi', true, 1, NULL, 'đŸ“º', NULL, '2026-10-02 21:34:46.934919+07', '2026-10-02 21:34:46.934919+07');
INSERT INTO public.categories (category_id, parent_id, name, slug, is_active, sort_order, image_url, icon_url, description, created_at, updated_at) VALUES (31, 29, 'Gia dá»¥ng thĂ´ng minh', 'gia-dung', true, 2, NULL, 'đŸ ', NULL, '2026-10-02 21:34:46.934919+07', '2026-10-02 21:34:46.934919+07');


ALTER TABLE public.categories ENABLE TRIGGER ALL;

--
-- Data for Name: category_attributes; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.category_attributes DISABLE TRIGGER ALL;

INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (10, 7, 'chip_ai', 'Chip AI', 'text', NULL, 'Hiá»‡u nÄƒng', NULL, true, false, 1);
INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (11, 7, 'cpu', 'Loáº¡i CPU', 'text', NULL, 'Hiá»‡u nÄƒng', NULL, true, true, 2);
INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (12, 7, 'gpu', 'Loáº¡i card Ä‘á»“ há»a', 'text', NULL, 'Hiá»‡u nÄƒng', NULL, true, true, 3);
INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (13, 7, 'ram', 'Dung lÆ°á»£ng RAM', 'text', NULL, 'Bá»™ nhá»›', NULL, true, true, 4);
INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (14, 7, 'storage', 'á»” cá»©ng', 'text', NULL, 'Bá»™ nhá»›', NULL, true, true, 5);
INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (15, 7, 'screen', 'CĂ´ng nghá»‡ mĂ n hĂ¬nh', 'text', NULL, 'MĂ n hĂ¬nh', NULL, true, true, 6);
INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (16, 7, 'battery', 'Pin & Cá»§ sáº¡c', 'text', NULL, 'Pin', NULL, true, false, 7);
INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (17, 7, 'ports', 'Cá»•ng giao tiáº¿p', 'text', NULL, 'Káº¿t ná»‘i', NULL, true, false, 8);
INSERT INTO public.category_attributes (attr_id, category_id, key, label, data_type, unit, group_name, options, is_spec, is_filter, sort_order) VALUES (18, 7, 'os', 'Há»‡ Ä‘iá»u hĂ nh', 'text', NULL, 'Pháº§n má»m', NULL, true, false, 9);


ALTER TABLE public.category_attributes ENABLE TRIGGER ALL;

--
-- Data for Name: series; Type: TABLE DATA; Schema: public; Owner: -
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
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.suppliers DISABLE TRIGGER ALL;

INSERT INTO public.suppliers (supplier_id, name, contact_name, phone, email, address) VALUES (1, 'FPT Synnex', 'Nguyá»…n VÄƒn Minh', '02473006666', 'synnex@fpt.com.vn', 'TĂ²a nhĂ  FPT, Cáº§u Giáº¥y, HĂ  Ná»™i');
INSERT INTO public.suppliers (supplier_id, name, contact_name, phone, email, address) VALUES (2, 'Digiworld Corporation', 'Tráº§n Thá»‹ Thu', '02839290059', 'contact@digiworld.com.vn', '195 Äiá»‡n BiĂªn Phá»§, BĂ¬nh Tháº¡nh, TP.HCM');
INSERT INTO public.suppliers (supplier_id, name, contact_name, phone, email, address) VALUES (3, 'PHTD Distribution', 'LĂª HoĂ ng Long', '02838248888', 'info@phtd.com.vn', 'Quáº­n 1, TP.HCM');


ALTER TABLE public.suppliers ENABLE TRIGGER ALL;

--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.products DISABLE TRIGGER ALL;

INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (10, 9, 1, 1, 'Apple Mac mini M6 12CPU 12GPU 16GB 256GB 2026', 'apple-mac-mini-m6-16-256', 'Tháº¿ há»‡ chip Apple M6 Ä‘á»™t phĂ¡ 12 nhĂ¢n CPU, 12 nhĂ¢n GPU, há»— trá»£ Apple Intelligence.', true, '2026-09-27 18:43:44.6934+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (14, 7, 7, 1, 'Laptop Lenovo IdeaPad Slim 5 16IAH8', 'lenovo-ideapad-slim-5-16', 'Khung nhĂ´m cao cáº¥p, Core i5 tháº¿ há»‡ má»›i, mĂ n hĂ¬nh 16 inch chuáº©n mĂ u sáº¯c nĂ©t.', true, '2026-09-27 18:43:44.737036+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (15, 7, 8, 1, 'Laptop MSI Modern 15 B12MO-628VN', 'msi-modern-15-b12mo', 'Thiáº¿t káº¿ thanh lá»‹ch cho dĂ¢n vÄƒn phĂ²ng vĂ  sinh viĂªn, trá»ng lÆ°á»£ng siĂªu nháº¹ 1.7kg.', true, '2026-09-27 18:43:44.738908+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (18, 11, 15, 2, 'Äá»“ng há»“ thĂ´ng minh Amazfit Active Max', 'amazfit-active-max', 'Thá»i lÆ°á»£ng pin 14 ngĂ y vÆ°á»£t trá»™i, mĂ n hĂ¬nh AMOLED 1.75 inch, há»— trá»£ hÆ¡n 120 cháº¿ Ä‘á»™ thá»ƒ thao.', true, '2026-09-27 18:48:22.22391+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (19, 11, 3, 2, 'Äá»“ng há»“ Ä‘á»‹nh vá»‹ tráº» em myAlo K74', 'dong-ho-dinh-vi-myalo-k74', 'Äá»‹nh vá»‹ GPS chĂ­nh xĂ¡c 3 cháº¿ Ä‘á»™, gá»i video HD 4G, nĂºt kháº©n cáº¥p SOS vĂ  chá»‘ng nÆ°á»›c IP67 an toĂ n.', true, '2026-09-27 18:48:22.225708+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (21, 12, 16, 2, 'Loa Bluetooth Marshall Emberton II', 'marshall-emberton-ii', 'Ă‚m thanh Ä‘a hÆ°á»›ng True Stereophonic 360 Ä‘á»™, thá»i gian chÆ¡i nháº¡c hÆ¡n 30 giá», chuáº©n khĂ¡ng bá»¥i nÆ°á»›c IP67.', true, '2026-09-27 18:48:22.228549+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (9, 6, 2, 2, 'Samsung Galaxy S24 Ultra 5G', 'samsung-galaxy-s24-ultra', 'Quyá»n nÄƒng Galaxy AI, khung viá»n Titan, bĂºt S Pen tĂ­ch há»£p vĂ  camera zoom AI 100x Ä‘á»‰nh cao.', false, '2026-09-22 10:28:12.860739+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (22, 1, 1, NULL, 'iPhone 16 Plus 128GB VN/A', 'iphone-16-plus-128gb', 'MĂ n hĂ¬nh 6.7 inch Dynamic Island, chip A18, pin cá»±c trĂ¢u.', false, '2026-09-27 19:32:28.750713+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (23, 1, 1, NULL, 'iPhone 16 128GB VN/A', 'iphone-16-128gb', 'Chip A18 siĂªu máº¡nh, nĂºt Camera Control tháº¿ há»‡ má»›i.', true, '2026-09-27 19:32:28.750713+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (6, 3, 1, 2, 'iPad Pro M4 11 inch', 'ipad-pro-m4-11-inch', 'SiĂªu pháº©m mĂ¡y tĂ­nh báº£ng má»ng nháº¥t tá»« trÆ°á»›c Ä‘áº¿n nay cá»§a Apple, mĂ n hĂ¬nh Ultra Retina XDR Tandem OLED Ä‘á»™t phĂ¡.', true, '2026-09-22 10:28:12.860739+07', NULL, NULL, '{}', true, true, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (25, 6, 2, NULL, 'Samsung Galaxy Z Fold6 5G 256GB', 'samsung-galaxy-z-fold6', 'Thiáº¿t káº¿ gáº­p siĂªu má»ng nháº¹, Galaxy AI há»— trá»£ Ä‘a nhiá»‡m.', true, '2026-09-27 19:32:28.750713+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (12, 7, 5, 1, 'Laptop ASUS VivoBook 14 X1407CA-LY008W', 'asus-vivobook-14-x1407ca', 'Thiáº¿t káº¿ má»ng nháº¹ hiá»‡n Ä‘áº¡i, chip Core Ultra 5 U5-225H, 16GB RAM mÆ°á»£t mĂ  Ä‘a nhiá»‡m.', true, '2026-09-27 18:43:44.734136+07', NULL, NULL, '{}', true, true, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (17, 11, 1, 2, 'Apple Watch Series 10 42mm (GPS) Viá»n NhĂ´m DĂ¢y Cao Su', 'apple-watch-series-10-42mm', 'MĂ n hĂ¬nh OLED gĂ³c rá»™ng sĂ¡ng hÆ¡n 40%, vá» má»ng nháº¹ nháº¥t tá»«ng cĂ³, theo dĂµi chá»©ng ngÆ°ng thá»Ÿ khi ngá»§.', true, '2026-09-27 18:48:22.198803+07', NULL, NULL, '{}', true, true, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (2, 1, 1, 1, 'iPhone 15', 'iphone-15', 'Dynamic Island thĂ´ng minh, camera chĂ­nh 48MP siĂªu rĂµ nĂ©t, cá»•ng sáº¡c USB-C tiá»‡n lá»£i.', true, '2026-09-22 10:28:12.860739+07', NULL, NULL, '{}', true, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (5, 2, 1, 1, 'MacBook Air 13 inch M3', 'macbook-air-13-m3', 'Thiáº¿t káº¿ má»ng nháº¹ Ä‘á»‰nh cao, thá»i lÆ°á»£ng pin lĂªn Ä‘áº¿n 18 giá», váº­n hĂ nh Ăªm Ă¡i khĂ´ng quáº¡t táº£n nhiá»‡t.', true, '2026-09-22 10:28:12.860739+07', NULL, NULL, '{}', true, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (7, 4, 1, 2, 'Apple Watch Ultra 2 GPS + Cellular 49mm', 'apple-watch-ultra-2', 'Vá» Titan siĂªu bá»n bá»‰, Ä‘á»‹nh vá»‹ GPS táº§n sá»‘ kĂ©p chuáº©n xĂ¡c, pin 72 giá» á»Ÿ cháº¿ Ä‘á»™ nguá»“n Ä‘iá»‡n tháº¥p.', true, '2026-09-22 10:28:12.860739+07', NULL, NULL, '{}', true, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (8, 5, 1, 3, 'AirPods Pro (Tháº¿ há»‡ 2) MagSafe USB-C', 'airpods-pro-2-usbc', 'Chá»‘ng á»“n chá»§ Ä‘á»™ng vÆ°á»£t trá»™i, Ă¢m thanh thĂ­ch á»©ng tá»± Ä‘á»™ng Ä‘iá»u chá»‰nh theo mĂ´i trÆ°á»ng.', true, '2026-09-22 10:28:12.860739+07', NULL, NULL, '{}', true, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (13, 7, 8, 1, 'Laptop MSI Cyborg 15 A13UC-2082VN', 'msi-cyborg-15-a13uc', 'Laptop gaming phong cĂ¡ch cyberpunk, Intel Core i7-13620H cĂ¹ng Ä‘á»“ há»a RTX 3050 máº¡nh máº½.', true, '2026-09-27 18:43:44.735654+07', NULL, NULL, '{}', true, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (16, 7, 5, 1, 'Laptop ASUS TUF Gaming F15 FX506HF', 'asus-tuf-gaming-f15', 'Äá»™ bá»n chuáº©n quĂ¢n Ä‘á»™i Má»¹ MIL-STD-810H, bĂ n phĂ­m RGB, táº£n nhiá»‡t tá»± lĂ m sáº¡ch hiá»‡u quáº£.', true, '2026-09-27 18:43:44.740457+07', NULL, NULL, '{}', true, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (1, 1, 1, 1, 'iPhone 15 Pro Max', 'iphone-15-pro-max', 'Thiáº¿t káº¿ khung Titan chuáº©n hĂ ng khĂ´ng vÅ© trá»¥, chip A17 Pro Ä‘á»™t phĂ¡, camera tiá»m vá»ng quang há»c 5x sáº¯c nĂ©t.', true, '2026-09-22 10:28:12.860739+07', NULL, NULL, '{}', true, true, '2026-10-02 22:36:08.926589+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (26, 18, 3, NULL, 'Xiaomi 14 Ultra 5G 512GB', 'xiaomi-14-ultra-512gb', 'á»ng kĂ­nh Leica cao cáº¥p, cáº£m biáº¿n 1 inch, sáº¡c nhanh 90W.', true, '2026-09-27 19:32:28.750713+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (27, 18, 3, NULL, 'Xiaomi Redmi Note 13 Pro 5G', 'xiaomi-redmi-note-13-pro', 'Camera 200MP chá»‘ng rung OIS, pin 5100mAh sáº¡c 67W.', true, '2026-09-27 19:32:28.750713+07', NULL, NULL, '{}', true, false, '2026-10-02 22:15:47.535112+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (29, 3, 1, NULL, 'iPad mini 7 A17 Pro 128GB', 'ipad-mini-7-a17-pro', 'Thiáº¿t káº¿ nhá» gá»n 8.3 inch, chip A17 Pro há»— trá»£ Apple Intelligence.', false, '2026-09-27 19:32:28.750713+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (30, 3, 2, NULL, 'Samsung Galaxy Tab S9 FE WiFi 128GB', 'samsung-galaxy-tab-s9-fe', 'KĂ¨m bĂºt S-Pen, khĂ¡ng nÆ°á»›c IP68, mĂ n hĂ¬nh 90Hz mÆ°á»£t mĂ .', false, '2026-09-27 19:32:28.750713+07', NULL, NULL, '{}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (24, 6, 2, NULL, 'Samsung Galaxy S25 Ultra 5G 256GB', 'samsung-galaxy-s25-ultra', 'Snapdragon 8 Elite, camera 200MP, bĂºt S-Pen quyá»n nÄƒng.', true, '2026-09-27 19:32:28.750713+07', 22, 'SM-S938B/DS', '{"pen": "TĂ­ch há»£p sáºµn bĂºt S-Pen quyá»n nÄƒng trong thĂ¢n mĂ¡y", "ram": "12 GB LPDDR5X", "chip": "Qualcomm Snapdragon 8 Elite for Galaxy (3nm)", "screen": "6.8 inch Dynamic AMOLED 2X, QHD+ (3120 x 1440), 120Hz, Corning Gorilla Armor", "battery": "5000 mAh, sáº¡c nhanh 45W cĂ³ dĂ¢y, sáº¡c khĂ´ng dĂ¢y 15W", "storage": "256 GB UFS 4.0", "camera_rear": "200MP + 50MP + 50MP + 10MP, Zoom quang há»c 100x Space Zoom"}', false, false, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (11, 7, 6, 1, 'Laptop HP Omnibook 5 AI 16-AF1048TU BZ7Q9PA', 'hp-omnibook-5-ai-16', 'Laptop AI tháº¿ há»‡ má»›i vá»›i chip Core Ultra 5 U5-225U, mĂ n hĂ¬nh 16 inch WUXGA sáº¯c nĂ©t.', true, '2026-09-27 18:43:44.731765+07', 14, '16-AF1048TU BZ709PA', '{"os": "Windows 11 Home Single Language báº£n quyá»n + Office Home & Student 2024", "cpu": "Intel Core Ultra 5 225H (14 nhĂ¢n, 18 luá»“ng, xung nhá»‹p tá»‘i Ä‘a 4.90 GHz, 18MB Cache)", "gpu": "Intel Arc Graphics chuyĂªn dá»¥ng hiá»‡u nÄƒng cao", "ram": "16 GB LPDDR5X 7467 MHz Onboard siĂªu tá»‘c Ä‘á»™", "ports": "1 x Thunderbolt 4 (Type-C 40Gbps), 1 x USB Type-C 10Gbps, 2 x USB Type-A 10Gbps, 1 x HDMI 2.1, 1 x 3.5mm", "screen": "16.0 inches WUXGA (1920 x 1200) chá»‘ng chĂ³i 300 nits 100% sRGB tá»‰ lá»‡ 16:10", "battery": "3 Cell Li-ion polymer (68 Whr), há»— trá»£ sáº¡c nhanh HP Fast Charge 65W qua Type-C", "chip_ai": "Intel AI Boost NPU lĂªn tá»›i 48 TOPS há»— trá»£ xá»­ lĂ½ tĂ¡c vá»¥ trĂ­ tuá»‡ nhĂ¢n táº¡o", "storage": "512 GB SSD M.2 PCIe Gen 4 NVMe tá»‘c Ä‘á»™ cao"}', true, true, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (3, 1, 1, 1, 'iPhone 16 Pro Max', 'iphone-16-pro-max', 'Tháº¿ há»‡ má»›i vá»›i Apple Intelligence, viá»n mĂ n hĂ¬nh siĂªu má»ng vĂ  nĂºt chá»¥p Camera Control cáº£m á»©ng lá»±c.', true, '2026-09-22 10:28:12.860739+07', 17, 'MYWU3VN/A', '{"ram": "8 GB", "chip": "Apple A18 Pro 6 nhĂ¢n (2 nhĂ¢n hiá»‡u nÄƒng + 4 nhĂ¢n tiáº¿t kiá»‡m), tiáº¿n trĂ¬nh 3nm", "ports": "USB-C há»— trá»£ USB 3 (tá»‘c Ä‘á»™ lĂªn Ä‘áº¿n 10Gbps)", "screen": "6.9 inch Super Retina XDR OLED, Dynamic Island, ProMotion 120Hz, 2000 nits", "battery": "Xem video lĂªn Ä‘áº¿n 33 giá», sáº¡c MagSafe 25W", "storage": "256 GB NVMe", "material": "Khung viá»n Titan chuáº©n hĂ ng khĂ´ng vÅ© trá»¥ cáº¥p 5", "camera_rear": "ChĂ­nh 48MP Fusion + GĂ³c siĂªu rá»™ng 48MP + Tele 12MP zoom quang 5x", "camera_front": "12MP TrueDepth, tá»± Ä‘á»™ng láº¥y nĂ©t PDAF"}', true, true, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (4, 2, 1, 1, 'MacBook Pro 16 inch M3 Pro', 'macbook-pro-16-m3-pro', 'Sá»©c máº¡nh vÆ°á»£t báº­c tá»« chip Apple M3 Pro, mĂ n hĂ¬nh Liquid Retina XDR 120Hz siĂªu sĂ¡ng.', true, '2026-09-22 10:28:12.860739+07', 19, 'MRW13SA/A', '{"ram": "18 GB Unified Memory", "chip": "Apple M3 Pro (12 CPU / 18 GPU), 16-core Neural Engine", "ports": "3 x Thunderbolt 4, HDMI, khe tháº» SDXC, jack 3.5mm", "screen": "16.2 inch Liquid Retina XDR (3456 x 2234), ProMotion 120Hz, 1600 nits", "battery": "Pin lĂªn tá»›i 22 giá», sáº¡c MagSafe 3 140W", "storage": "512 GB SSD siĂªu tá»‘c"}', true, true, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (20, 12, 4, 2, 'Tai nghe Bluetooth Sony WH-1000XM5', 'sony-wh-1000xm5', 'Äá»‰nh cao chá»‘ng á»“n chá»§ Ä‘á»™ng vá»›i bá»™ xá»­ lĂ½ V1 vĂ  QN1, thá»i lÆ°á»£ng pin 30 giá», micro thu Ă¢m cháº¥t lÆ°á»£ng cao.', true, '2026-09-27 18:48:22.227184+07', 26, 'WH1000XM5/BM', '{"anc": "Bá»™ xá»­ lĂ½ tĂ­ch há»£p V1 káº¿t há»£p bá»™ xá»­ lĂ½ chá»‘ng á»“n HD QN1 vĂ  8 micro", "type": "Tai nghe chá»¥p tai Over-ear khĂ´ng dĂ¢y chá»‘ng á»“n", "codec": "SBC, AAC, LDAC (Hi-Res Audio Wireless)", "driver": "30 mm sá»£i carbon siĂªu nháº¹", "weight": "Khoáº£ng 250 g", "battery": "Tá»‘i Ä‘a 30 giá» (báº­t chá»‘ng á»“n), 40 giá» (táº¯t chá»‘ng á»“n)", "charging": "Sáº¡c nhanh 3 phĂºt nghe Ä‘Æ°á»£c 3 giá»"}', true, true, '2026-10-02 21:34:13.087113+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (999, 5, 4, NULL, 'NEW TEST PRODUCT - Tai nghe Sony Pro Wireless 2026', 'new-test-product', 'Sáº£n pháº©m thá»­ nghiá»‡m kiáº¿n trĂºc Database Source of Truth trá»±c tiáº¿p tá»« PostgreSQL sang Product Detail Page.', true, '2026-10-01 23:33:11.11017+07', NULL, 'SONY-TEST-2026', '{"chip": "Sony V2 Ultra Audio Processor", "weight": "250g", "battery": "35 giá» phĂ¡t liĂªn tá»¥c", "waterproof": "IPX4", "connectivity": "Bluetooth 5.4, LDAC"}', true, true, '2026-10-02 22:18:34.457893+07');
INSERT INTO public.products (product_id, category_id, brand_id, supplier_id, name, slug, description, is_active, created_at, series_id, model_code, specs, is_hot, is_new, updated_at) VALUES (28, 3, 1, NULL, 'iPad Air 6 M2 11 inch WiFi 128GB', 'ipad-air-6-m2-11-inch', 'Chip Apple M2 cá»±c máº¡nh, mĂ n hĂ¬nh Liquid Retina sáº¯c nĂ©t.', false, '2026-09-27 19:32:28.750713+07', NULL, NULL, '{}', true, true, '2026-10-02 22:24:01.722269+07');


ALTER TABLE public.products ENABLE TRIGGER ALL;

--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.product_variants DISABLE TRIGGER ALL;

INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (1, 1, 'IP15PM-256-NAT', '{"color": "Titan Tá»± NhiĂªn", "storage": "256GB"}', 25500000.00, 29990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (3, 1, 'IP15PM-256-BLK', '{"color": "Titan Äen", "storage": "256GB"}', 25500000.00, 29990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (4, 2, 'IP15-128-BLU', '{"color": "Xanh Pastel", "storage": "128GB"}', 16000000.00, 19490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (6, 3, 'IP16PM-256-DES', '{"color": "Titan Sa Máº¡c", "storage": "256GB"}', 30000000.00, 34990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (7, 4, 'MBP16-M3P-18-512', '{"ram": "18GB", "color": "Äen KhĂ´ng Gian", "storage": "512GB"}', 52000000.00, 59990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (8, 5, 'MBA13-M3-8-256-MID', '{"ram": "8GB", "color": "ÄĂªm Xanh Tháº³m", "storage": "256GB"}', 23000000.00, 27490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (9, 6, 'IPAD-M4-11-256-SIL', '{"color": "Báº¡c", "storage": "256GB"}', 24000000.00, 28990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (10, 7, 'AWU2-49-ORANGE', '{"case": "Titan 49mm", "strap": "DĂ¢y Alpine Cam"}', 17000000.00, 21490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (11, 8, 'APP2-USBC-WHT', '{"color": "Tráº¯ng", "connector": "USB-C"}', 4500000.00, 5890000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (12, 9, 'S24U-256-GRY', '{"color": "XĂ¡m Titan", "storage": "256GB"}', 24000000.00, 28990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (13, 10, 'MAC-MINI-M6-16-256', '{"cpu": "Apple M6", "gpu": "12 nhĂ¢n", "ram": "16GB", "ssd": "256GB"}', 21000000.00, 24990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (14, 11, 'HP-OMNI-5-AI-16', '{"cpu": "U5-225U", "gpu": "Intel Graphics", "ram": "16GB", "ssd": "512GB", "screen": "16 inch WUXGA"}', 22000000.00, 25990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (15, 12, 'ASUS-VIVO-14-U5', '{"cpu": "U5-225H", "gpu": "Intel Graphics", "ram": "16GB", "ssd": "512GB", "screen": "14 inch WUXGA"}', 19000000.00, 22190000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (16, 13, 'MSI-CYBORG-15-I7', '{"cpu": "i7-13620H", "gpu": "RTX 3050", "ram": "16GB", "ssd": "512GB", "screen": "15.6 inch FHD 144Hz"}', 24000000.00, 27990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (17, 14, 'LENOVO-SLIM-5-16', '{"cpu": "U5-115U", "gpu": "Intel Graphics", "ram": "16GB", "ssd": "512GB", "screen": "15.6 inch FHD"}', 15000000.00, 17990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (18, 15, 'MSI-MODERN-15-B12', '{"cpu": "CORE 5-120U", "gpu": "Intel Graphics", "ram": "16GB", "ssd": "512GB", "screen": "15.6 inch FHD"}', 12000000.00, 14490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (19, 16, 'ASUS-TUF-F15-RTX', '{"cpu": "R7-8845HS", "gpu": "RTX 3050", "ram": "16GB", "ssd": "512GB", "screen": "15.6 inch FHD 144Hz"}', 14000000.00, 16990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (20, 17, 'AW-S10-42-ALU', '{"case": "NhĂ´m 42mm", "strap": "Cao su Ä‘en", "connectivity": "GPS"}', 9500000.00, 11490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (21, 18, 'AMAZFIT-ACTIVE-MAX', '{"color": "Äen Midnight", "screen": "AMOLED 1.75", "battery": "14 ngĂ y"}', 2800000.00, 3590000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (22, 19, 'MYALO-K74-PINK', '{"sim": "4G", "color": "Há»“ng Pháº¥n", "waterproof": "IP67"}', 1200000.00, 1590000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (23, 20, 'SONY-WH1000XM5-BLK', '{"anc": "Active Noise Cancelling", "color": "Äen NhĂ¡m", "battery": "30 giá»"}', 5500000.00, 6990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (24, 21, 'MARSHALL-EMBERTON-2', '{"color": "Black and Brass", "battery": "30+ giá»", "waterproof": "IP67"}', 2900000.00, 16990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (2, 1, 'IP15PM-512-NAT', '{"color": "Titan Tá»± NhiĂªn", "storage": "512GB"}', 30500000.00, 29990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (5, 2, 'IP15-256-PNK', '{"color": "Há»“ng", "storage": "256GB"}', 19000000.00, 19490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (25, 22, 'SKU-IP16P-128', '{"color": "Xanh MĂ²ng KĂ©t", "storage": "128GB"}', 23000000.00, 25490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (26, 23, 'SKU-IP16-128', '{"color": "Há»“ng", "storage": "128GB"}', 19000000.00, 21990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (27, 24, 'SKU-S25U-256', '{"color": "Titan Báº¡c", "storage": "256GB"}', 28000000.00, 31990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (28, 25, 'SKU-ZFOLD6-256', '{"color": "XĂ¡m Metal", "storage": "256GB"}', 36000000.00, 41990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (29, 26, 'SKU-MI14U-512', '{"color": "Äen Da", "storage": "512GB"}', 26000000.00, 29990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (30, 27, 'SKU-RN13P-128', '{"color": "TĂ­m Cá»±c Quang", "storage": "128GB"}', 6000000.00, 6990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (31, 28, 'SKU-IPADAIR6-128', '{"color": "Xanh DÆ°Æ¡ng", "storage": "128GB"}', 14000000.00, 16490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (32, 29, 'SKU-IPADMINI7-128', '{"color": "Ănh Sao", "storage": "128GB"}', 12000000.00, 13990000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (33, 30, 'SKU-TABS9FE-128', '{"color": "Xanh Mint", "storage": "128GB"}', 8000000.00, 9490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (9991, 999, 'TEST-SONY-BLK', '{"color": "Äen Huyá»n BĂ­", "capacity": "Báº£n Cao Cáº¥p"}', 4000000.00, 5490000.00, true);
INSERT INTO public.product_variants (variant_id, product_id, sku, attributes, cost_price, sale_price, is_active) VALUES (9992, 999, 'TEST-SONY-SLV', '{"color": "Báº¡c Platinum", "capacity": "Báº£n Cao Cáº¥p"}', 4000000.00, 5490000.00, true);


ALTER TABLE public.product_variants ENABLE TRIGGER ALL;

--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.warehouses DISABLE TRIGGER ALL;

INSERT INTO public.warehouses (warehouse_id, name, address, is_store, is_active, province, district, ward, phone, latitude, longitude, open_hours, is_regional_hub, region) VALUES (8, 'Chi nhĂ¡nh Nguyá»…n ThĂ¡i Há»c', '134 Nguyá»…n ThĂ¡i Há»c, P. Pháº¡m NgÅ© LĂ£o, Quáº­n 1, TP. HCM', true, true, 'Há»“ ChĂ­ Minh', 'Quáº­n 1', 'P. Pháº¡m NgÅ© LĂ£o', '02871000134', NULL, NULL, '08:00 - 22:00', false, NULL);
INSERT INTO public.warehouses (warehouse_id, name, address, is_store, is_active, province, district, ward, phone, latitude, longitude, open_hours, is_regional_hub, region) VALUES (9, 'Chi nhĂ¡nh Tráº§n Quang Kháº£i', '55B Tráº§n Quang Kháº£i, P. TĂ¢n Äá»‹nh, Quáº­n 1, TP. HCM', true, true, 'Há»“ ChĂ­ Minh', 'Quáº­n 1', 'P. TĂ¢n Äá»‹nh', '02871088552', NULL, NULL, '08:00 - 22:00', false, NULL);
INSERT INTO public.warehouses (warehouse_id, name, address, is_store, is_active, province, district, ward, phone, latitude, longitude, open_hours, is_regional_hub, region) VALUES (10, 'Chi nhĂ¡nh ÄÆ°á»ng 3 ThĂ¡ng 2', '300 ÄÆ°á»ng 3 ThĂ¡ng 2, PhÆ°á»ng 12, Quáº­n 10, TP. HCM', true, true, 'Há»“ ChĂ­ Minh', 'Quáº­n 10', 'PhÆ°á»ng 12', '02871083002', NULL, NULL, '08:00 - 21:30', false, NULL);
INSERT INTO public.warehouses (warehouse_id, name, address, is_store, is_active, province, district, ward, phone, latitude, longitude, open_hours, is_regional_hub, region) VALUES (11, 'Chi nhĂ¡nh ThĂ¡i HĂ ', '21 ThĂ¡i HĂ , P. Trung Liá»‡t, Äá»‘ng Äa, HĂ  Ná»™i', true, true, 'HĂ  Ná»™i', 'Äá»‘ng Äa', 'P. Trung Liá»‡t', '02471021212', NULL, NULL, '08:00 - 21:30', false, NULL);
INSERT INTO public.warehouses (warehouse_id, name, address, is_store, is_active, province, district, ward, phone, latitude, longitude, open_hours, is_regional_hub, region) VALUES (1, 'Kho Tá»•ng HĂ  Ná»™i', '126 Há»“ TĂ¹ng Máº­u, P. Mai Dá»‹ch, Cáº§u Giáº¥y, HĂ  Ná»™i', true, true, 'HĂ  Ná»™i', 'Cáº§u Giáº¥y', 'P. Mai Dá»‹ch', '02471012626', NULL, NULL, '08:00 - 21:30', true, 'NORTH');
INSERT INTO public.warehouses (warehouse_id, name, address, is_store, is_active, province, district, ward, phone, latitude, longitude, open_hours, is_regional_hub, region) VALUES (2, 'Kho Tá»•ng TP.HCM', '219 - 229 Tráº§n HÆ°ng Äáº¡o, P. CĂ´ Giang, Quáº­n 1, TP. HCM', true, true, 'Há»“ ChĂ­ Minh', 'Quáº­n 1', 'P. CĂ´ Giang', '02871087317', NULL, NULL, '08:00 - 22:00', true, 'SOUTH');
INSERT INTO public.warehouses (warehouse_id, name, address, is_store, is_active, province, district, ward, phone, latitude, longitude, open_hours, is_regional_hub, region) VALUES (3, 'Kho PhĂ¢n Phá»‘i ÄĂ  Náºµng', '177 Nguyá»…n VÄƒn Linh, P. Nam DÆ°Æ¡ng, Háº£i ChĂ¢u, ÄĂ  Náºµng', true, true, 'ÄĂ  Náºµng', 'Háº£i ChĂ¢u', 'P. Nam DÆ°Æ¡ng', '02367101777', NULL, NULL, '08:00 - 21:30', true, 'CENTRAL');


ALTER TABLE public.warehouses ENABLE TRIGGER ALL;

--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: -
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
-- Data for Name: membership_tiers; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.membership_tiers DISABLE TRIGGER ALL;

INSERT INTO public.membership_tiers (tier_id, code, name, min_annual_spend, discount_percent, requires_verification, description) VALUES (3, 'SVIP', 'S-VIP', 50000000.00, 2.00, false, 'Uu dai khach hang VIP giam 2%');
INSERT INTO public.membership_tiers (tier_id, code, name, min_annual_spend, discount_percent, requires_verification, description) VALUES (1, 'TMEMBER', 'Tmember', 0.00, 1.00, false, 'Uu dai thanh vien Tmember giam 1%');
INSERT INTO public.membership_tiers (tier_id, code, name, min_annual_spend, discount_percent, requires_verification, description) VALUES (2, 'TSTUDENT', 'T-Student', 0.00, 3.00, true, 'Uu dai hoc sinh - sinh vien giam them 3%');


ALTER TABLE public.membership_tiers ENABLE TRIGGER ALL;

--
-- Data for Name: payment_method_config; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.payment_method_config DISABLE TRIGGER ALL;

INSERT INTO public.payment_method_config (id, code, name, icon, description, is_active, sort_order, created_at) VALUES (2, 'BANK_QR', 'Chuyá»ƒn khoáº£n ngĂ¢n hĂ ng qua mĂ£ QR', 'qr_code', 'QuĂ©t mĂ£ VietQR thanh toĂ¡n (Thá»§ kho xĂ¡c nháº­n thá»§ cĂ´ng).', true, 2, '2026-10-03 15:18:53.174365+07');
INSERT INTO public.payment_method_config (id, code, name, icon, description, is_active, sort_order, created_at) VALUES (3, 'VNPAY', 'VNPAY', 'vnpay', 'Cá»•ng thanh toĂ¡n quá»‘c dĂ¢n VNPAY-QR, Tháº» ATM & TĂ i khoáº£n ngĂ¢n hĂ ng.', true, 3, '2026-10-03 15:18:53.174365+07');
INSERT INTO public.payment_method_config (id, code, name, icon, description, is_active, sort_order, created_at) VALUES (4, 'MOMO', 'MoMo', 'momo', 'Nháº­p Æ°u Ä‘Ă£i táº¡i cá»•ng, giáº£m thĂªm 2% tá»‘i Ä‘a 200.000Ä‘', false, 4, '2026-10-03 15:18:53.174365+07');
INSERT INTO public.payment_method_config (id, code, name, icon, description, is_active, sort_order, created_at) VALUES (5, 'ONEPAY_CARD', 'Qua tháº» Visa/Master/JCB/Napas', 'credit_card', 'Nháº­p Æ°u Ä‘Ă£i táº¡i cá»•ng, tá»‘i Ä‘a 500.000Ä‘', false, 5, '2026-10-03 15:18:53.174365+07');
INSERT INTO public.payment_method_config (id, code, name, icon, description, is_active, sort_order, created_at) VALUES (1, 'STORE', 'Thanh toĂ¡n táº¡i cá»­a hĂ ng', 'store', 'TruongNgStore se giu san pham va uu dai trong vong 24 gio ke tu thoi diem dat hang.', true, 1, '2026-10-03 15:18:53.174365+07');


ALTER TABLE public.payment_method_config ENABLE TRIGGER ALL;

--
-- Data for Name: payment_offers; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.payment_offers DISABLE TRIGGER ALL;

INSERT INTO public.payment_offers (offer_id, title, description, payment_method, bank_name, discount_type, discount_value, max_discount, min_order_amount, image_url, sort_order, is_active, starts_at, ends_at) VALUES (4, 'Giáº£m Ä‘áº¿n 1.000.000Ä‘ khi thanh toĂ¡n tháº» tĂ­n dá»¥ng HSBC', 'Ăp dá»¥ng cho chá»§ tháº» tĂ­n dá»¥ng HSBC vĂ o cĂ¡c ngĂ y thá»© 6, thá»© 7', NULL, 'HSBC', 'fixed', 1000000.00, 1000000.00, 10000000.00, NULL, 1, true, '2026-09-21 22:41:45.037638+07', '2026-12-30 22:41:45.037638+07');
INSERT INTO public.payment_offers (offer_id, title, description, payment_method, bank_name, discount_type, discount_value, max_discount, min_order_amount, image_url, sort_order, is_active, starts_at, ends_at) VALUES (5, 'Giáº£m ngay 800.000Ä‘ khi thanh toĂ¡n qua Kredivo', 'Ăp dá»¥ng cho Ä‘Æ¡n hĂ ng tá»« 8 triá»‡u Ä‘á»“ng, ká»³ háº¡n 6 hoáº·c 12 thĂ¡ng', NULL, 'Kredivo', 'fixed', 800000.00, 800000.00, 8000000.00, NULL, 2, true, '2026-09-21 22:41:45.037638+07', '2026-12-30 22:41:45.037638+07');
INSERT INTO public.payment_offers (offer_id, title, description, payment_method, bank_name, discount_type, discount_value, max_discount, min_order_amount, image_url, sort_order, is_active, starts_at, ends_at) VALUES (6, 'Giáº£m ngay 500.000Ä‘ khi quĂ©t mĂ£ VNPAY-QR', 'Nháº­p mĂ£ VNPAYHP500 táº¡i bÆ°á»›c thanh toĂ¡n', NULL, 'VNPAY', 'fixed', 500000.00, 500000.00, 5000000.00, NULL, 3, true, '2026-09-21 22:41:45.037638+07', '2026-12-30 22:41:45.037638+07');


ALTER TABLE public.payment_offers ENABLE TRIGGER ALL;

--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.permissions DISABLE TRIGGER ALL;

INSERT INTO public.permissions (permission_code, description) VALUES ('order.view', 'Xem Ä‘Æ¡n hĂ ng');
INSERT INTO public.permissions (permission_code, description) VALUES ('order.update', 'Cáº­p nháº­t / xá»­ lĂ½ Ä‘Æ¡n hĂ ng');
INSERT INTO public.permissions (permission_code, description) VALUES ('product.manage', 'ThĂªm, sá»­a, áº©n sáº£n pháº©m');
INSERT INTO public.permissions (permission_code, description) VALUES ('inventory.manage', 'Quáº£n lĂ½ tá»“n kho, xuáº¥t nháº­p kho');
INSERT INTO public.permissions (permission_code, description) VALUES ('purchase.manage', 'Táº¡o vĂ  nháº­n phiáº¿u nháº­p hĂ ng');
INSERT INTO public.permissions (permission_code, description) VALUES ('finance.view', 'Xem bĂ¡o cĂ¡o tĂ i chĂ­nh');
INSERT INTO public.permissions (permission_code, description) VALUES ('expense.manage', 'Ghi nháº­n chi phĂ­');
INSERT INTO public.permissions (permission_code, description) VALUES ('customer.support', 'Xá»­ lĂ½ ticket há»— trá»£ khĂ¡ch');
INSERT INTO public.permissions (permission_code, description) VALUES ('staff.manage', 'Quáº£n lĂ½ nhĂ¢n viĂªn vĂ  phĂ¢n quyá»n');
INSERT INTO public.permissions (permission_code, description) VALUES ('promotion.manage', 'Quáº£n lĂ½ khuyáº¿n mĂ£i, Æ°u Ä‘Ă£i thanh toĂ¡n, combo, báº£o hĂ nh má»Ÿ rá»™ng');


ALTER TABLE public.permissions ENABLE TRIGGER ALL;

--
-- Data for Name: product_commitments; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.product_commitments DISABLE TRIGGER ALL;

INSERT INTO public.product_commitments (commitment_id, category_id, title, content, icon_url, sort_order, is_active) VALUES (5, NULL, 'HĂ ng má»›i 100%, chĂ­nh hĂ£ng', 'MĂ¡y má»›i nguyĂªn seal, Ä‘áº§y Ä‘á»§ phá»¥ kiá»‡n tá»« nhĂ  sáº£n xuáº¥t. Báº£o hĂ nh chĂ­nh hĂ£ng 12 thĂ¡ng táº¡i cĂ¡c TTBH á»§y quyá»n.', NULL, 1, true);
INSERT INTO public.product_commitments (commitment_id, category_id, title, content, icon_url, sort_order, is_active) VALUES (6, NULL, 'Báº£o hĂ nh 1 Ä‘á»•i 1 trong 30 ngĂ y', '1 Äá»•i 1 trong vĂ²ng 30 ngĂ y náº¿u phĂ¡t sinh báº¥t ká»³ lá»—i pháº§n cá»©ng nĂ o tá»« nhĂ  sáº£n xuáº¥t.', NULL, 2, true);
INSERT INTO public.product_commitments (commitment_id, category_id, title, content, icon_url, sort_order, is_active) VALUES (7, NULL, 'Bá»™ phá»¥ kiá»‡n chuáº©n theo há»™p', 'ThĂ¢n mĂ¡y, cá»§ sáº¡c nhanh chĂ­nh hĂ£ng, dĂ¢y cĂ¡p sáº¡c cao cáº¥p bá»c dĂ¹, sĂ¡ch hÆ°á»›ng dáº«n sá»­ dá»¥ng.', NULL, 3, true);
INSERT INTO public.product_commitments (commitment_id, category_id, title, content, icon_url, sort_order, is_active) VALUES (8, NULL, 'ÄĂ£ bao gá»“m VAT & HĂ³a Ä‘Æ¡n Ä‘iá»‡n tá»­', 'GiĂ¡ sáº£n pháº©m Ä‘Ă£ bao gá»“m thuáº¿ GTGT (VAT 10%). Há»— trá»£ xuáº¥t hĂ³a Ä‘Æ¡n Ä‘iá»‡n tá»­ VAT doanh nghiá»‡p ngay trong ngĂ y.', NULL, 4, true);


ALTER TABLE public.product_commitments ENABLE TRIGGER ALL;

--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: -
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
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
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
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.system_settings DISABLE TRIGGER ALL;

INSERT INTO public.system_settings (setting_key, value, description, updated_at) VALUES ('free_shipping_threshold', '300000', 'NgÆ°á»¡ng miá»…n phĂ­ váº­n chuyá»ƒn toĂ n quá»‘c (VNÄ)', '2026-10-03 15:18:53.174365+07');
INSERT INTO public.system_settings (setting_key, value, description, updated_at) VALUES ('standard_shipping_fee', '30000', 'PhĂ­ váº­n chuyá»ƒn tiĂªu chuáº©n cho Ä‘Æ¡n dÆ°á»›i ngÆ°á»¡ng (VNÄ)', '2026-10-03 15:18:53.174365+07');
INSERT INTO public.system_settings (setting_key, value, description, updated_at) VALUES ('order_hold_hours_store', '24', 'Sá»‘ giá» giá»¯ hĂ ng khi chá»n thanh toĂ¡n táº¡i cá»­a hĂ ng', '2026-10-03 15:18:53.174365+07');
INSERT INTO public.system_settings (setting_key, value, description, updated_at) VALUES ('order_payment_timeout_minutes_online', '15', 'Sá»‘ phĂºt chá» thanh toĂ¡n online trÆ°á»›c khi tá»± há»§y Ä‘Æ¡n', '2026-10-03 15:18:53.174365+07');


ALTER TABLE public.system_settings ENABLE TRIGGER ALL;

--
-- Data for Name: warranty_plans; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.warranty_plans DISABLE TRIGGER ALL;

INSERT INTO public.warranty_plans (plan_id, category_id, name, plan_type, duration_months, price, min_product_price, max_product_price, description, sort_order, is_active) VALUES (3, NULL, 'GĂ³i báº£o hĂ nh VIP 12 thĂ¡ng 1 Äá»”I 1 toĂ n diá»‡n', 'swap', 12, 990000.00, 10000000.00, 50000000.00, '1 Ä‘á»•i 1 mĂ¡y má»›i tÆ°Æ¡ng Ä‘Æ°Æ¡ng náº¿u cĂ³ lá»—i pháº§n cá»©ng tá»« NSX, báº£o vá»‡ rÆ¡i vá»¡ vĂ o nÆ°á»›c.', 1, true);
INSERT INTO public.warranty_plans (plan_id, category_id, name, plan_type, duration_months, price, min_product_price, max_product_price, description, sort_order, is_active) VALUES (4, NULL, 'GĂ³i báº£o hĂ nh VIP 24 thĂ¡ng má»Ÿ rá»™ng linh kiá»‡n chĂ­nh hĂ£ng', 'extended', 24, 1890000.00, 10000000.00, 50000000.00, 'Gia háº¡n thĂªm 1 nÄƒm báº£o hĂ nh sau háº¡n cá»§a hĂ£ng, thay linh kiá»‡n chĂ­nh hĂ£ng miá»…n phĂ­ 100%.', 2, true);


ALTER TABLE public.warranty_plans ENABLE TRIGGER ALL;

--
-- Name: banners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.banners_id_seq', 5, true);


--
-- Name: brands_brand_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.brands_brand_id_seq', 25, true);


--
-- Name: categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_category_id_seq', 32, true);


--
-- Name: category_attributes_attr_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.category_attributes_attr_id_seq', 18, true);


--
-- Name: membership_tiers_tier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.membership_tiers_tier_id_seq', 3, true);


--
-- Name: payment_method_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_method_config_id_seq', 5, true);


--
-- Name: payment_offers_offer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_offers_offer_id_seq', 6, true);


--
-- Name: product_commitments_commitment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_commitments_commitment_id_seq', 8, true);


--
-- Name: product_images_image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_images_image_id_seq', 47, true);


--
-- Name: product_variants_variant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_variants_variant_id_seq', 49, true);


--
-- Name: products_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_product_id_seq', 30, true);


--
-- Name: series_series_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.series_series_id_seq', 26, true);


--
-- Name: suppliers_supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.suppliers_supplier_id_seq', 3, true);


--
-- Name: warehouses_warehouse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.warehouses_warehouse_id_seq', 11, true);


--
-- Name: warranty_plans_plan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.warranty_plans_plan_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--


