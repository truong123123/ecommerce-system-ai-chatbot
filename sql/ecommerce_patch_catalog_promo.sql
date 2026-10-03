-- =====================================================================
-- BẢN VÁ: CATALOG MỞ RỘNG + KHUYẾN MÃI  (PostgreSQL 14+)
-- Chạy SAU file ecommerce_fulldatabase.sql. Chạy trong 1 transaction:
-- lỗi ở đâu thì rollback hết, không bị dở dang.
-- =====================================================================
BEGIN;

-- ####################  PHẦN A: CATALOG  ####################

-- =====================================================================
-- A1. DANH MỤC: chặn xóa cha khi còn con, chặn vòng lặp cây
-- =====================================================================
ALTER TABLE categories DROP CONSTRAINT categories_parent_id_fkey;
ALTER TABLE categories
    ADD CONSTRAINT categories_parent_id_fkey
    FOREIGN KEY (parent_id) REFERENCES categories(category_id) ON DELETE RESTRICT;

ALTER TABLE categories ADD COLUMN sort_order INT NOT NULL DEFAULT 0;
CREATE INDEX idx_categories_parent ON categories(parent_id);

CREATE OR REPLACE FUNCTION check_category_cycle() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NULL THEN
        RETURN NEW;
    END IF;
    IF NEW.parent_id = NEW.category_id THEN
        RAISE EXCEPTION 'Danh mục không thể là cha của chính nó';
    END IF;
    -- đi ngược từ cha lên gốc; nếu gặp lại chính mình tức là tạo vòng lặp
    IF EXISTS (
        WITH RECURSIVE anc AS (
            SELECT category_id, parent_id FROM categories WHERE category_id = NEW.parent_id
            UNION
            SELECT c.category_id, c.parent_id
            FROM categories c JOIN anc a ON c.category_id = a.parent_id
        )
        SELECT 1 FROM anc WHERE category_id = NEW.category_id
    ) THEN
        RAISE EXCEPTION 'Danh mục cha này tạo thành vòng lặp trong cây';
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_categories_no_cycle
BEFORE INSERT OR UPDATE OF parent_id ON categories
FOR EACH ROW EXECUTE FUNCTION check_category_cycle();

-- Đường đi từ gốc đến danh mục (dùng cho breadcrumb): pos = 1 là gốc
CREATE OR REPLACE FUNCTION category_path(p_category_id INT)
RETURNS TABLE (pos INT, cat_id INT, name VARCHAR, slug VARCHAR) AS $$
    WITH RECURSIVE up AS (
        SELECT c.category_id, c.parent_id, c.name, c.slug, 0 AS depth
        FROM categories c WHERE c.category_id = p_category_id
        UNION ALL
        SELECT c.category_id, c.parent_id, c.name, c.slug, up.depth + 1
        FROM categories c JOIN up ON c.category_id = up.parent_id
    )
    SELECT (ROW_NUMBER() OVER (ORDER BY depth DESC))::INT, category_id, name, slug
    FROM up ORDER BY depth DESC;
$$ LANGUAGE sql STABLE;

-- Danh mục này và toàn bộ con cháu (dùng để liệt kê sản phẩm theo nhánh)
CREATE OR REPLACE FUNCTION category_descendants(p_category_id INT)
RETURNS TABLE (cat_id INT) AS $$
    WITH RECURSIVE sub AS (
        SELECT category_id FROM categories WHERE category_id = p_category_id
        UNION ALL
        SELECT c.category_id FROM categories c JOIN sub s ON c.parent_id = s.category_id
    )
    SELECT category_id FROM sub;
$$ LANGUAGE sql STABLE;

-- =====================================================================
-- A2. THƯƠNG HIỆU: thêm slug  |  DÒNG SẢN PHẨM (series)
-- =====================================================================
ALTER TABLE brands ADD COLUMN slug VARCHAR(150);
UPDATE brands SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;
ALTER TABLE brands ALTER COLUMN slug SET NOT NULL;
ALTER TABLE brands ADD CONSTRAINT uq_brands_slug UNIQUE (slug);

-- Ví dụ: Samsung -> Galaxy A Series, Galaxy S Series
CREATE TABLE series (
    series_id  SERIAL PRIMARY KEY,
    brand_id   INT NOT NULL REFERENCES brands(brand_id) ON DELETE RESTRICT,
    name       VARCHAR(120) NOT NULL,
    slug       VARCHAR(150) NOT NULL,
    UNIQUE (brand_id, slug)
);

-- =====================================================================
-- A3. SẢN PHẨM: gắn dòng, mã model, thông số kỹ thuật
-- =====================================================================
ALTER TABLE products
    ADD COLUMN series_id   INT REFERENCES series(series_id) ON DELETE SET NULL,
    ADD COLUMN model_code  VARCHAR(120),                  -- ví dụ 'US-225U/16GB/512GB PCIE'
    ADD COLUMN specs       JSONB NOT NULL DEFAULT '{}';   -- ví dụ {"chip":"Intel Core 5 225U","ram_gb":16}

CREATE INDEX idx_products_cat_brand    ON products(category_id, brand_id) WHERE is_active;
CREATE INDEX idx_products_brand_series ON products(brand_id, series_id);
CREATE INDEX idx_products_specs        ON products USING GIN (specs);

-- Breadcrumb đầy đủ của một sản phẩm: các cấp danh mục > hãng > dòng
-- Dùng: SELECT * FROM product_breadcrumb('laptop-hp-omnibook-5-ai-16');
CREATE OR REPLACE FUNCTION product_breadcrumb(p_slug VARCHAR)
RETURNS TABLE (pos INT, kind TEXT, name VARCHAR, slug VARCHAR) AS $$
    SELECT cp.pos, 'category'::TEXT, cp.name, cp.slug
    FROM products p, LATERAL category_path(p.category_id) cp
    WHERE p.slug = p_slug
    UNION ALL
    SELECT 1000, 'brand'::TEXT, b.name, b.slug
    FROM products p JOIN brands b ON b.brand_id = p.brand_id
    WHERE p.slug = p_slug
    UNION ALL
    SELECT 1001, 'series'::TEXT, s.name, s.slug
    FROM products p JOIN series s ON s.series_id = p.series_id
    WHERE p.slug = p_slug
    ORDER BY 1;
$$ LANGUAGE sql STABLE;

-- =====================================================================
-- A4. THUỘC TÍNH THEO DANH MỤC (bảng thông số + bộ lọc bên trái)
-- Mỗi loại hàng khai báo thuộc tính của mình: tivi có inch, máy lạnh có BTU...
-- Danh mục con kế thừa thuộc tính của danh mục cha.
-- =====================================================================
CREATE TABLE category_attributes (
    attr_id      SERIAL PRIMARY KEY,
    category_id  INT NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    key          VARCHAR(60)  NOT NULL,                 -- khóa trong products.specs: 'chip', 'ram_gb'
    label        VARCHAR(100) NOT NULL,                 -- nhãn hiển thị: 'Chip', 'Dung lượng RAM'
    data_type    VARCHAR(10)  NOT NULL DEFAULT 'text' CHECK (data_type IN ('text','number','bool')),
    unit         VARCHAR(20),                           -- 'GB', 'inch', 'BTU'
    group_name   VARCHAR(100),                          -- nhóm dòng trong bảng thông số: 'Hiệu năng', 'Màn hình'
    options      JSONB,                                 -- danh sách giá trị cho bộ lọc, nếu cố định
    is_spec      BOOLEAN NOT NULL DEFAULT TRUE,         -- hiện trong bảng thông số kỹ thuật
    is_filter    BOOLEAN NOT NULL DEFAULT FALSE,        -- hiện trong bộ lọc
    sort_order   INT NOT NULL DEFAULT 0,
    UNIQUE (category_id, key)
);

-- Thuộc tính áp dụng cho một danh mục (gồm cả của danh mục cha)
-- Dùng: SELECT * FROM category_attributes_for(5) WHERE is_filter;
CREATE OR REPLACE FUNCTION category_attributes_for(p_category_id INT)
RETURNS SETOF category_attributes AS $$
    SELECT ca.*
    FROM category_attributes ca
    JOIN category_path(p_category_id) cp ON cp.cat_id = ca.category_id
    ORDER BY ca.sort_order, ca.attr_id;
$$ LANGUAGE sql STABLE;

-- =====================================================================
-- A5. NỘI DUNG DÙNG CHUNG: CAM KẾT SẢN PHẨM
-- Hiện ở khối "Cam kết sản phẩm". category_id NULL = áp cho mọi sản phẩm.
-- =====================================================================
CREATE TABLE product_commitments (
    commitment_id  SERIAL PRIMARY KEY,
    category_id    INT REFERENCES categories(category_id) ON DELETE CASCADE,
    title          VARCHAR(150) NOT NULL,
    content        TEXT NOT NULL,
    icon_url       VARCHAR(500),
    sort_order     INT NOT NULL DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE
);

-- =====================================================================
-- A6. CỬA HÀNG / CHI NHÁNH ("Xem chi nhánh có hàng")
-- Dùng luôn bảng warehouses: một kho có thể đồng thời là cửa hàng.
-- =====================================================================
ALTER TABLE warehouses
    ADD COLUMN is_store    BOOLEAN NOT NULL DEFAULT FALSE,   -- TRUE = cửa hàng khách đến mua được
    ADD COLUMN is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN province    VARCHAR(100),
    ADD COLUMN district    VARCHAR(100),
    ADD COLUMN ward        VARCHAR(100),
    ADD COLUMN phone       VARCHAR(20),
    ADD COLUMN latitude    NUMERIC(9,6),
    ADD COLUMN longitude   NUMERIC(9,6),
    ADD COLUMN open_hours  VARCHAR(100);

CREATE INDEX idx_warehouses_store_area ON warehouses(province, district) WHERE is_store AND is_active;
CREATE INDEX idx_inventory_variant     ON inventory(variant_id);

-- Cửa hàng còn hàng theo từng biến thể
-- Dùng: SELECT * FROM v_store_availability WHERE variant_id = 1 AND province = 'Hồ Chí Minh';
CREATE VIEW v_store_availability AS
SELECT w.warehouse_id, w.name AS store_name, w.address, w.province, w.district, w.ward,
       w.phone, w.latitude, w.longitude, w.open_hours,
       i.variant_id, (i.quantity - i.reserved_qty) AS available_qty
FROM warehouses w
JOIN inventory i ON i.warehouse_id = w.warehouse_id
WHERE w.is_store AND w.is_active AND (i.quantity - i.reserved_qty) > 0;


-- ####################  PHẦN B: KHUYẾN MÃI & ƯU ĐÃI  ####################

-- =====================================================================
-- B1. HẠNG THÀNH VIÊN (Smember, HSSV, giáo viên...)
-- =====================================================================
CREATE TABLE membership_tiers (
    tier_id               SERIAL PRIMARY KEY,
    code                  VARCHAR(30) NOT NULL UNIQUE,      -- 'MEMBER','SSTUDENT'
    name                  VARCHAR(100) NOT NULL,
    min_annual_spend      NUMERIC(14,2) NOT NULL DEFAULT 0, -- chi tiêu tối thiểu để đạt hạng
    discount_percent      NUMERIC(5,2)  NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
    requires_verification BOOLEAN NOT NULL DEFAULT FALSE,   -- HSSV, giáo viên cần xác minh
    description           TEXT
);

ALTER TABLE customers
    ADD COLUMN tier_id INT REFERENCES membership_tiers(tier_id) ON DELETE SET NULL;

-- =====================================================================
-- B2. KHUYẾN MÃI HIỂN THỊ TRÊN TRANG SẢN PHẨM
-- (khác bảng coupons: coupons là mã khách phải nhập, còn đây tự áp dụng)
-- =====================================================================
CREATE TYPE promotion_kind AS ENUM ('discount','gift','service');

CREATE TABLE promotions (
    promotion_id      SERIAL PRIMARY KEY,
    name              VARCHAR(200) NOT NULL,                -- 'Giảm ngay 1 triệu khi thanh toán qua HSBC'
    description       TEXT,
    kind              promotion_kind NOT NULL DEFAULT 'discount',
    discount_type     discount_type,                        -- dùng cho kind = 'discount'
    discount_value    NUMERIC(14,2),
    max_discount      NUMERIC(14,2),                        -- trần giảm khi giảm theo %
    gift_text         VARCHAR(255),                         -- quà tặng / dịch vụ kèm: 'Nâng cấp Windows 11 Pro'
    required_tier_id  INT REFERENCES membership_tiers(tier_id),  -- NULL = ai cũng được
    priority          INT NOT NULL DEFAULT 0,               -- số lớn hiển thị trước
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at         TIMESTAMPTZ NOT NULL,
    ends_at           TIMESTAMPTZ NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (ends_at > starts_at),
    CHECK (kind <> 'discount' OR (discount_type IS NOT NULL AND discount_value > 0)),
    CHECK (discount_type IS DISTINCT FROM 'percent' OR discount_value IS NULL OR discount_value <= 100)
);
CREATE INDEX idx_promotions_active ON promotions(starts_at, ends_at) WHERE is_active;

-- Khuyến mãi áp cho cái gì. Mỗi dòng là MỘT trong các dạng:
--   chỉ variant_id | chỉ product_id | category_id và/hoặc brand_id
-- (category + brand cùng lúc = "điện thoại Samsung"; category tự bao gồm danh mục con)
CREATE TABLE promotion_targets (
    target_id     SERIAL PRIMARY KEY,
    promotion_id  INT NOT NULL REFERENCES promotions(promotion_id) ON DELETE CASCADE,
    variant_id    BIGINT REFERENCES product_variants(variant_id) ON DELETE CASCADE,
    product_id    BIGINT REFERENCES products(product_id) ON DELETE CASCADE,
    category_id   INT    REFERENCES categories(category_id) ON DELETE CASCADE,
    brand_id      INT    REFERENCES brands(brand_id) ON DELETE CASCADE,
    CHECK (
        (num_nonnulls(variant_id, product_id) = 1 AND category_id IS NULL AND brand_id IS NULL)
        OR
        (variant_id IS NULL AND product_id IS NULL AND num_nonnulls(category_id, brand_id) >= 1)
    )
);
CREATE INDEX idx_promo_targets_promo    ON promotion_targets(promotion_id);
CREATE INDEX idx_promo_targets_variant  ON promotion_targets(variant_id)  WHERE variant_id  IS NOT NULL;
CREATE INDEX idx_promo_targets_product  ON promotion_targets(product_id)  WHERE product_id  IS NOT NULL;
CREATE INDEX idx_promo_targets_category ON promotion_targets(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX idx_promo_targets_brand    ON promotion_targets(brand_id)    WHERE brand_id    IS NOT NULL;

-- Các khuyến mãi đang hiệu lực của một biến thể, kèm số tiền giảm
-- p_tier_id: hạng thành viên của khách (NULL nếu chưa đăng nhập)
-- Dùng: SELECT * FROM variant_promotions(1, NULL);
CREATE OR REPLACE FUNCTION variant_promotions(
    p_variant_id BIGINT,
    p_tier_id    INT DEFAULT NULL,
    p_at         TIMESTAMPTZ DEFAULT NOW()
) RETURNS TABLE (
    promotion_id    INT,
    name            VARCHAR,
    description     TEXT,
    kind            promotion_kind,
    discount_amount NUMERIC,
    gift_text       VARCHAR,
    priority        INT,
    ends_at         TIMESTAMPTZ
) AS $$
    WITH v AS (
        SELECT pv.variant_id, pv.product_id, pv.sale_price, p.category_id, p.brand_id
        FROM product_variants pv
        JOIN products p ON p.product_id = pv.product_id
        WHERE pv.variant_id = p_variant_id
    ),
    anc AS (   -- danh mục của sản phẩm và mọi danh mục cha
        SELECT cp.cat_id FROM v, LATERAL category_path(v.category_id) cp
    )
    SELECT pr.promotion_id, pr.name, pr.description, pr.kind,
           CASE
               WHEN pr.kind <> 'discount' THEN 0::NUMERIC
               WHEN pr.discount_type = 'percent'
                   THEN LEAST(ROUND(v.sale_price * pr.discount_value / 100),
                              COALESCE(pr.max_discount, v.sale_price))
               ELSE LEAST(pr.discount_value, v.sale_price)
           END AS discount_amount,
           pr.gift_text, pr.priority, pr.ends_at
    FROM v
    JOIN promotions pr
      ON pr.is_active
     AND p_at >= pr.starts_at AND p_at < pr.ends_at
     AND (pr.required_tier_id IS NULL OR pr.required_tier_id = p_tier_id)
    WHERE EXISTS (
        SELECT 1 FROM promotion_targets t
        WHERE t.promotion_id = pr.promotion_id
          AND (
                t.variant_id = v.variant_id
             OR t.product_id = v.product_id
             OR (t.variant_id IS NULL AND t.product_id IS NULL
                 AND (t.category_id IS NULL OR t.category_id IN (SELECT cat_id FROM anc))
                 AND (t.brand_id    IS NULL OR t.brand_id = v.brand_id))
          )
    )
    ORDER BY pr.priority DESC, discount_amount DESC;
$$ LANGUAGE sql STABLE;

-- Giá sau giảm: trừ khuyến mãi giảm tiền có mức giảm lớn nhất (không cộng dồn).
-- Muốn cộng dồn hay quy tắc phức tạp hơn thì xử lý ở backend dựa trên variant_promotions().
CREATE OR REPLACE FUNCTION variant_final_price(p_variant_id BIGINT, p_tier_id INT DEFAULT NULL)
RETURNS NUMERIC AS $$
    SELECT GREATEST(
        pv.sale_price - COALESCE(
            (SELECT MAX(vp.discount_amount)
             FROM variant_promotions(p_variant_id, p_tier_id) vp
             WHERE vp.kind = 'discount'), 0),
        0)
    FROM product_variants pv
    WHERE pv.variant_id = p_variant_id;
$$ LANGUAGE sql STABLE;

-- =====================================================================
-- B3. ƯU ĐÃI THANH TOÁN (giảm khi trả qua ngân hàng / ví / thẻ)
-- =====================================================================
CREATE TABLE payment_offers (
    offer_id          SERIAL PRIMARY KEY,
    title             VARCHAR(200) NOT NULL,
    description       TEXT,
    payment_method    payment_method,                       -- NULL = áp cho mọi phương thức
    bank_name         VARCHAR(80),                          -- 'HSBC', 'VPBank'
    discount_type     discount_type NOT NULL,
    discount_value    NUMERIC(14,2) NOT NULL CHECK (discount_value > 0),
    max_discount      NUMERIC(14,2),
    min_order_amount  NUMERIC(14,2) NOT NULL DEFAULT 0,
    image_url         VARCHAR(500),
    sort_order        INT NOT NULL DEFAULT 0,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at         TIMESTAMPTZ NOT NULL,
    ends_at           TIMESTAMPTZ NOT NULL,
    CHECK (ends_at > starts_at)
);
CREATE INDEX idx_payment_offers_active ON payment_offers(starts_at, ends_at) WHERE is_active;

-- =====================================================================
-- B4. TRẢ GÓP
-- Giá trả góp được TÍNH lúc hiển thị, không lưu theo sản phẩm.
-- =====================================================================
CREATE TABLE installment_plans (
    plan_id           SERIAL PRIMARY KEY,
    provider          VARCHAR(80) NOT NULL,                 -- 'Trả góp 0% qua thẻ', 'Home Credit'
    term_months       INT NOT NULL CHECK (term_months > 0),
    monthly_rate_pct  NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (monthly_rate_pct >= 0),  -- lãi phẳng %/tháng
    down_payment_pct  NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (down_payment_pct BETWEEN 0 AND 100),
    min_order_amount  NUMERIC(14,2) NOT NULL DEFAULT 0,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (provider, term_months)
);

-- Tiền góp mỗi tháng (lãi phẳng). Ví dụ 25.990.000đ, 12 tháng, 0% -> 2.165.833đ
-- Dùng: SELECT installment_monthly(25990000, 12, 0, 0);
CREATE OR REPLACE FUNCTION installment_monthly(
    p_price NUMERIC, p_term INT, p_rate_pct NUMERIC DEFAULT 0, p_down_pct NUMERIC DEFAULT 0
) RETURNS NUMERIC AS $$
    SELECT ROUND(p_price * (1 - p_down_pct / 100) * (1.0 / p_term + p_rate_pct / 100));
$$ LANGUAGE sql IMMUTABLE;

-- =====================================================================
-- B5. MUA KÈM GIÁ SỐC (combo)
-- =====================================================================
CREATE TABLE product_bundles (
    bundle_id           SERIAL PRIMARY KEY,
    main_product_id     BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    bundled_variant_id  BIGINT NOT NULL REFERENCES product_variants(variant_id) ON DELETE CASCADE,
    discount_type       discount_type NOT NULL,
    discount_value      NUMERIC(14,2) NOT NULL CHECK (discount_value > 0),
    sort_order          INT NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at           TIMESTAMPTZ,                         -- NULL = không giới hạn
    ends_at             TIMESTAMPTZ,
    UNIQUE (main_product_id, bundled_variant_id),
    CHECK (starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at)
);
CREATE INDEX idx_bundles_main ON product_bundles(main_product_id) WHERE is_active;

-- Combo đang hiệu lực kèm giá mua kèm
-- Dùng: SELECT * FROM v_active_bundles WHERE main_product_id = 1;
CREATE VIEW v_active_bundles AS
SELECT b.bundle_id, b.main_product_id, b.bundled_variant_id,
       p.name AS bundled_product_name, v.sku, v.sale_price AS original_price,
       CASE b.discount_type
           WHEN 'percent' THEN GREATEST(ROUND(v.sale_price * (1 - b.discount_value / 100)), 0)
           ELSE GREATEST(v.sale_price - b.discount_value, 0)
       END AS bundle_price,
       b.discount_type, b.discount_value, b.sort_order
FROM product_bundles b
JOIN product_variants v ON v.variant_id = b.bundled_variant_id AND v.is_active
JOIN products p         ON p.product_id = v.product_id AND p.is_active
WHERE b.is_active
  AND (b.starts_at IS NULL OR b.starts_at <= NOW())
  AND (b.ends_at   IS NULL OR b.ends_at   >  NOW());

-- =====================================================================
-- B6. GÓI BẢO HÀNH MỞ RỘNG
-- Giá gói thường phụ thuộc giá máy: dùng khoảng min/max giá sản phẩm.
-- =====================================================================
CREATE TABLE warranty_plans (
    plan_id            SERIAL PRIMARY KEY,
    category_id        INT REFERENCES categories(category_id) ON DELETE CASCADE,  -- NULL = mọi loại hàng
    name               VARCHAR(150) NOT NULL,               -- '1 đổi 1 - 12 tháng'
    plan_type          VARCHAR(20) NOT NULL DEFAULT 'extended'
                       CHECK (plan_type IN ('extended','swap','accident','other')),
    duration_months    INT NOT NULL CHECK (duration_months > 0),
    price              NUMERIC(14,2) NOT NULL CHECK (price >= 0),
    min_product_price  NUMERIC(14,2) NOT NULL DEFAULT 0,
    max_product_price  NUMERIC(14,2),                       -- NULL = không giới hạn trên
    description        TEXT,
    sort_order         INT NOT NULL DEFAULT 0,
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (max_product_price IS NULL OR max_product_price > min_product_price)
);

-- Gói bảo hành phù hợp với một biến thể (đúng danh mục và đúng khoảng giá)
-- Dùng: SELECT * FROM warranty_plans_for_variant(1);
CREATE OR REPLACE FUNCTION warranty_plans_for_variant(p_variant_id BIGINT)
RETURNS SETOF warranty_plans AS $$
    SELECT w.*
    FROM product_variants pv
    JOIN products p ON p.product_id = pv.product_id
    JOIN warranty_plans w
      ON w.is_active
     AND pv.sale_price >= w.min_product_price
     AND (w.max_product_price IS NULL OR pv.sale_price < w.max_product_price)
     AND (w.category_id IS NULL
          OR w.category_id IN (SELECT cp.cat_id FROM category_path(p.category_id) cp))
    WHERE pv.variant_id = p_variant_id
    ORDER BY w.sort_order, w.plan_id;
$$ LANGUAGE sql STABLE;


-- ####################  PHẦN C: PHÂN QUYỀN & AUDIT  ####################

INSERT INTO permissions (permission_code, description) VALUES
 ('promotion.manage','Quản lý khuyến mãi, ưu đãi thanh toán, combo, bảo hành mở rộng');
INSERT INTO role_permissions (role, permission_code) VALUES
 ('sales','promotion.manage');

CREATE TRIGGER trg_audit_promotions AFTER INSERT OR UPDATE OR DELETE ON promotions
    FOR EACH ROW EXECUTE FUNCTION log_audit('promotion_id');
CREATE TRIGGER trg_audit_payment_offers AFTER INSERT OR UPDATE OR DELETE ON payment_offers
    FOR EACH ROW EXECUTE FUNCTION log_audit('offer_id');
CREATE TRIGGER trg_audit_bundles AFTER INSERT OR UPDATE OR DELETE ON product_bundles
    FOR EACH ROW EXECUTE FUNCTION log_audit('bundle_id');
CREATE TRIGGER trg_audit_warranty AFTER INSERT OR UPDATE OR DELETE ON warranty_plans
    FOR EACH ROW EXECUTE FUNCTION log_audit('plan_id');

COMMIT;

-- =====================================================================
-- CÁCH DÙNG NHANH (trang chi tiết sản phẩm)
-- =====================================================================
--   SELECT * FROM product_breadcrumb('slug-san-pham');          -- breadcrumb
--   SELECT * FROM category_attributes_for(:category_id) WHERE is_spec;  -- dựng bảng thông số
--   SELECT * FROM category_attributes_for(:category_id) WHERE is_filter; -- dựng bộ lọc
--   SELECT * FROM variant_promotions(:variant_id, :tier_id);    -- khuyến mãi đi kèm
--   SELECT variant_final_price(:variant_id, :tier_id);          -- giá sau giảm
--   SELECT * FROM payment_offers WHERE is_active AND NOW() BETWEEN starts_at AND ends_at;
--   SELECT installment_monthly(:price, 12, 0, 0);               -- trả góp 0% 12 tháng
--   SELECT * FROM v_active_bundles WHERE main_product_id = :id; -- mua kèm giá sốc
--   SELECT * FROM warranty_plans_for_variant(:variant_id);      -- gói bảo hành
--   SELECT * FROM v_store_availability WHERE variant_id = :variant_id AND province = :tinh;
