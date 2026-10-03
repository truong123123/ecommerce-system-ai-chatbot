-- =====================================================================
-- DATABASE KINH DOANH TRỰC TUYẾN - BẢN ĐẦY ĐỦ (PostgreSQL 14+)
-- Phần 1: Schema lõi  |  Phần 2: Module quản lý
-- Chạy được trên DB Fiddle / Neon / Supabase (không dùng schema riêng)
-- =====================================================================

-- ####################  PHẦN 1: SCHEMA LÕI  ####################

-- =====================================================================
-- 1. KIỂU DỮ LIỆU ENUM
-- =====================================================================
CREATE TYPE order_status    AS ENUM ('pending','confirmed','processing','shipped','completed','cancelled','returned');
CREATE TYPE payment_status  AS ENUM ('unpaid','paid','failed','refunded');
CREATE TYPE payment_method  AS ENUM ('cod','bank_transfer','credit_card','momo','zalopay','vnpay');
CREATE TYPE shipment_status AS ENUM ('preparing','in_transit','delivered','failed','returned');
CREATE TYPE discount_type   AS ENUM ('percent','fixed');
CREATE TYPE staff_role      AS ENUM ('admin','sales','warehouse','support','accountant');

-- =====================================================================
-- 2. KHÁCH HÀNG & ĐỊA CHỈ
-- =====================================================================
CREATE TABLE customers (
    customer_id     BIGSERIAL PRIMARY KEY,
    full_name       VARCHAR(150)  NOT NULL,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    phone           VARCHAR(20)   UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,
    gender          CHAR(1)       CHECK (gender IN ('M','F','O')),
    birth_date      DATE,
    loyalty_points  INT           NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_addresses (
    address_id      BIGSERIAL PRIMARY KEY,
    customer_id     BIGINT        NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    receiver_name   VARCHAR(150)  NOT NULL,
    receiver_phone  VARCHAR(20)   NOT NULL,
    province        VARCHAR(100)  NOT NULL,
    district        VARCHAR(100)  NOT NULL,
    ward            VARCHAR(100),
    street_address  VARCHAR(255)  NOT NULL,
    is_default      BOOLEAN       NOT NULL DEFAULT FALSE
);
-- Mỗi khách chỉ có 1 địa chỉ mặc định
CREATE UNIQUE INDEX uq_default_address ON customer_addresses(customer_id) WHERE is_default;

-- =====================================================================
-- 3. NHÂN VIÊN
-- =====================================================================
CREATE TABLE staff (
    staff_id    SERIAL PRIMARY KEY,
    full_name   VARCHAR(150) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    role        staff_role   NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    hired_at    DATE         NOT NULL DEFAULT CURRENT_DATE
);

-- =====================================================================
-- 4. DANH MỤC, THƯƠNG HIỆU, NHÀ CUNG CẤP
-- =====================================================================
CREATE TABLE categories (
    category_id  SERIAL PRIMARY KEY,
    parent_id    INT REFERENCES categories(category_id) ON DELETE SET NULL,
    name         VARCHAR(120) NOT NULL,
    slug         VARCHAR(150) NOT NULL UNIQUE,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE brands (
    brand_id  SERIAL PRIMARY KEY,
    name      VARCHAR(120) NOT NULL UNIQUE,
    country   VARCHAR(80)
);

CREATE TABLE suppliers (
    supplier_id    SERIAL PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    contact_name   VARCHAR(120),
    phone          VARCHAR(20),
    email          VARCHAR(150),
    address        VARCHAR(255)
);

-- =====================================================================
-- 5. SẢN PHẨM & BIẾN THỂ (SKU)
-- =====================================================================
CREATE TABLE products (
    product_id    BIGSERIAL PRIMARY KEY,
    category_id   INT    NOT NULL REFERENCES categories(category_id),
    brand_id      INT    REFERENCES brands(brand_id),
    supplier_id   INT    REFERENCES suppliers(supplier_id),
    name          VARCHAR(255) NOT NULL,
    slug          VARCHAR(280) NOT NULL UNIQUE,
    description   TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_variants (
    variant_id   BIGSERIAL PRIMARY KEY,
    product_id   BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    sku          VARCHAR(60) NOT NULL UNIQUE,
    attributes   JSONB   NOT NULL DEFAULT '{}',          -- ví dụ {"color":"Đen","size":"M"}
    cost_price   NUMERIC(14,2) NOT NULL CHECK (cost_price >= 0),
    sale_price   NUMERIC(14,2) NOT NULL CHECK (sale_price >= 0),
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (sale_price >= 0)
);

CREATE TABLE product_images (
    image_id    BIGSERIAL PRIMARY KEY,
    product_id  BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    url         VARCHAR(500) NOT NULL,
    is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order  INT NOT NULL DEFAULT 0
);

-- =====================================================================
-- 6. KHO & TỒN KHO
-- =====================================================================
CREATE TABLE warehouses (
    warehouse_id  SERIAL PRIMARY KEY,
    name          VARCHAR(120) NOT NULL,
    address       VARCHAR(255)
);

CREATE TABLE inventory (
    warehouse_id  INT    NOT NULL REFERENCES warehouses(warehouse_id),
    variant_id    BIGINT NOT NULL REFERENCES product_variants(variant_id),
    quantity      INT    NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_qty  INT    NOT NULL DEFAULT 0 CHECK (reserved_qty >= 0),
    reorder_level INT    NOT NULL DEFAULT 10,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (warehouse_id, variant_id)
);

CREATE TABLE inventory_movements (
    movement_id    BIGSERIAL PRIMARY KEY,
    warehouse_id   INT    NOT NULL REFERENCES warehouses(warehouse_id),
    variant_id     BIGINT NOT NULL REFERENCES product_variants(variant_id),
    change_qty     INT    NOT NULL,                      -- dương: nhập, âm: xuất
    reason         VARCHAR(30) NOT NULL CHECK (reason IN ('purchase','sale','return','adjustment','damaged')),
    reference_id   BIGINT,                               -- order_id hoặc mã phiếu nhập
    staff_id       INT REFERENCES staff(staff_id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 7. KHUYẾN MÃI / MÃ GIẢM GIÁ
-- =====================================================================
CREATE TABLE coupons (
    coupon_id       SERIAL PRIMARY KEY,
    code            VARCHAR(40) NOT NULL UNIQUE,
    type            discount_type NOT NULL,
    value           NUMERIC(12,2) NOT NULL CHECK (value > 0),
    min_order_value NUMERIC(14,2) NOT NULL DEFAULT 0,
    max_discount    NUMERIC(14,2),
    usage_limit     INT,
    used_count      INT NOT NULL DEFAULT 0,
    starts_at       TIMESTAMPTZ NOT NULL,
    ends_at         TIMESTAMPTZ NOT NULL,
    CHECK (ends_at > starts_at)
);

-- =====================================================================
-- 8. GIỎ HÀNG
-- =====================================================================
CREATE TABLE carts (
    cart_id      BIGSERIAL PRIMARY KEY,
    customer_id  BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_items (
    cart_id     BIGINT NOT NULL REFERENCES carts(cart_id) ON DELETE CASCADE,
    variant_id  BIGINT NOT NULL REFERENCES product_variants(variant_id),
    quantity    INT    NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (cart_id, variant_id)
);

-- =====================================================================
-- 9. ĐƠN HÀNG
-- =====================================================================
CREATE TABLE orders (
    order_id         BIGSERIAL PRIMARY KEY,
    customer_id      BIGINT NOT NULL REFERENCES customers(customer_id),
    address_id       BIGINT REFERENCES customer_addresses(address_id),
    coupon_id        INT    REFERENCES coupons(coupon_id),
    staff_id         INT    REFERENCES staff(staff_id),
    order_date       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status           order_status NOT NULL DEFAULT 'pending',
    subtotal         NUMERIC(14,2) NOT NULL DEFAULT 0,
    discount_amount  NUMERIC(14,2) NOT NULL DEFAULT 0,
    shipping_fee     NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_amount     NUMERIC(14,2) NOT NULL DEFAULT 0,
    note             TEXT,
    channel          VARCHAR(20) NOT NULL DEFAULT 'web' CHECK (channel IN ('web','mobile','facebook','shopee','tiktok')),
    CHECK (total_amount >= 0)
);

CREATE TABLE order_items (
    order_item_id  BIGSERIAL PRIMARY KEY,
    order_id       BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    variant_id     BIGINT NOT NULL REFERENCES product_variants(variant_id),
    quantity       INT    NOT NULL CHECK (quantity > 0),
    unit_price     NUMERIC(14,2) NOT NULL CHECK (unit_price >= 0),  -- giá tại thời điểm mua
    unit_cost      NUMERIC(14,2) NOT NULL CHECK (unit_cost >= 0),   -- giá vốn tại thời điểm mua
    line_total     NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- =====================================================================
-- 10. THANH TOÁN, VẬN CHUYỂN, ĐỔI TRẢ, ĐÁNH GIÁ
-- =====================================================================
CREATE TABLE payments (
    payment_id      BIGSERIAL PRIMARY KEY,
    order_id        BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    method          payment_method NOT NULL,
    status          payment_status NOT NULL DEFAULT 'unpaid',
    amount          NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    transaction_ref VARCHAR(100),
    paid_at         TIMESTAMPTZ
);

CREATE TABLE shipments (
    shipment_id     BIGSERIAL PRIMARY KEY,
    order_id        BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    carrier         VARCHAR(60) NOT NULL,               -- GHN, GHTK, Viettel Post...
    tracking_number VARCHAR(80),
    status          shipment_status NOT NULL DEFAULT 'preparing',
    shipped_at      TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ
);

CREATE TABLE returns (
    return_id      BIGSERIAL PRIMARY KEY,
    order_item_id  BIGINT NOT NULL REFERENCES order_items(order_item_id),
    quantity       INT NOT NULL CHECK (quantity > 0),
    reason         VARCHAR(255),
    refund_amount  NUMERIC(14,2) NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (
    review_id    BIGSERIAL PRIMARY KEY,
    product_id   BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    customer_id  BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment      TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, customer_id)
);

-- =====================================================================
-- 11. INDEX TỐI ƯU TRUY VẤN
-- =====================================================================
CREATE INDEX idx_orders_customer     ON orders(customer_id);
CREATE INDEX idx_orders_date_status  ON orders(order_date, status);
CREATE INDEX idx_order_items_order   ON order_items(order_id);
CREATE INDEX idx_order_items_variant ON order_items(variant_id);
CREATE INDEX idx_products_category   ON products(category_id);
CREATE INDEX idx_variants_product    ON product_variants(product_id);
CREATE INDEX idx_variants_attrs      ON product_variants USING GIN (attributes);
CREATE INDEX idx_payments_order      ON payments(order_id);
CREATE INDEX idx_shipments_order     ON shipments(order_id);
CREATE INDEX idx_inv_mov_variant     ON inventory_movements(variant_id, created_at);

-- =====================================================================
-- 12. TRIGGER
-- =====================================================================
-- 12.1 Tự cập nhật updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 12.2 Tự tính lại subtotal / total_amount của đơn khi order_items thay đổi
CREATE OR REPLACE FUNCTION recalc_order_total() RETURNS TRIGGER AS $$
DECLARE
    v_order_id BIGINT := COALESCE(NEW.order_id, OLD.order_id);
BEGIN
    UPDATE orders o
    SET subtotal     = COALESCE(s.sub, 0),
        total_amount = GREATEST(COALESCE(s.sub, 0) - o.discount_amount + o.shipping_fee, 0)
    FROM (SELECT SUM(line_total) AS sub FROM order_items WHERE order_id = v_order_id) s
    WHERE o.order_id = v_order_id;
    RETURN NULL;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_items_recalc
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION recalc_order_total();

-- =====================================================================
-- 13. VIEW BÁO CÁO
-- =====================================================================
-- 13.1 Doanh thu & lợi nhuận theo tháng
CREATE VIEW v_monthly_revenue AS
SELECT
    DATE_TRUNC('month', o.order_date)::DATE         AS month,
    COUNT(DISTINCT o.order_id)                      AS total_orders,
    COUNT(DISTINCT o.customer_id)                   AS total_customers,
    SUM(o.total_amount)                             AS revenue,
    SUM(oi.quantity * (oi.unit_price - oi.unit_cost)) AS gross_profit
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.status = 'completed'
GROUP BY 1;

-- 13.2 Top sản phẩm bán chạy
CREATE VIEW v_product_sales AS
SELECT
    p.product_id, p.name AS product_name, c.name AS category,
    SUM(oi.quantity)     AS units_sold,
    SUM(oi.line_total)   AS revenue,
    SUM(oi.quantity * (oi.unit_price - oi.unit_cost)) AS profit
FROM order_items oi
JOIN orders o           ON o.order_id = oi.order_id AND o.status = 'completed'
JOIN product_variants v ON v.variant_id = oi.variant_id
JOIN products p         ON p.product_id = v.product_id
JOIN categories c       ON c.category_id = p.category_id
GROUP BY p.product_id, p.name, c.name;

-- 13.3 Cảnh báo tồn kho thấp
CREATE VIEW v_low_stock AS
SELECT
    w.name AS warehouse, p.name AS product, v.sku,
    i.quantity, i.reserved_qty, (i.quantity - i.reserved_qty) AS available, i.reorder_level
FROM inventory i
JOIN warehouses w       ON w.warehouse_id = i.warehouse_id
JOIN product_variants v ON v.variant_id = i.variant_id
JOIN products p         ON p.product_id = v.product_id
WHERE (i.quantity - i.reserved_qty) <= i.reorder_level;

-- 13.4 Phân khúc khách hàng RFM
CREATE VIEW v_customer_rfm AS
WITH base AS (
    SELECT
        customer_id,
        CURRENT_DATE - MAX(order_date)::DATE AS recency_days,
        COUNT(*)                             AS frequency,
        SUM(total_amount)                    AS monetary
    FROM orders
    WHERE status = 'completed'
    GROUP BY customer_id
),
scored AS (
    SELECT *,
        NTILE(5) OVER (ORDER BY recency_days DESC) AS r,
        NTILE(5) OVER (ORDER BY frequency)         AS f,
        NTILE(5) OVER (ORDER BY monetary)          AS m
    FROM base
)
SELECT
    s.*, c.full_name, c.email,
    CASE
        WHEN r >= 4 AND f >= 4 AND m >= 4 THEN 'VIP'
        WHEN r >= 3 AND f >= 3            THEN 'Trung thành'
        WHEN r <= 2 AND f >= 3            THEN 'Có nguy cơ rời bỏ'
        WHEN r >= 4 AND f <= 2            THEN 'Khách mới'
        ELSE 'Thông thường'
    END AS segment
FROM scored s
JOIN customers c USING (customer_id);



-- ####################  PHẦN 2: MODULE QUẢN LÝ  ####################

-- =====================================================================
-- 1. ENUM
-- =====================================================================
CREATE TYPE po_status         AS ENUM ('draft','ordered','received','cancelled');
CREATE TYPE expense_category  AS ENUM ('marketing','salary','rent','utilities','shipping','packaging','software','other');
CREATE TYPE ticket_status     AS ENUM ('open','in_progress','resolved','closed');
CREATE TYPE ticket_priority   AS ENUM ('low','normal','high','urgent');

-- =====================================================================
-- 2. MỞ RỘNG BẢNG NHÂN VIÊN
-- =====================================================================
ALTER TABLE staff
    ADD COLUMN phone         VARCHAR(20),
    ADD COLUMN password_hash VARCHAR(255),
    ADD COLUMN last_login_at TIMESTAMPTZ;

-- =====================================================================
-- 3. PHÂN QUYỀN (RBAC)
-- =====================================================================
CREATE TABLE permissions (
    permission_code  VARCHAR(60) PRIMARY KEY,
    description      VARCHAR(255) NOT NULL
);

CREATE TABLE role_permissions (
    role             staff_role  NOT NULL,
    permission_code  VARCHAR(60) NOT NULL REFERENCES permissions(permission_code) ON DELETE CASCADE,
    PRIMARY KEY (role, permission_code)
);

CREATE OR REPLACE FUNCTION has_permission(p_staff_id INT, p_code VARCHAR) RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM staff s
        JOIN role_permissions rp ON rp.role = s.role
        WHERE s.staff_id = p_staff_id
          AND s.is_active
          AND (rp.permission_code = p_code OR s.role = 'admin')
    );
$$ LANGUAGE sql STABLE;

-- Danh mục quyền cơ bản (dữ liệu cấu hình, không phải dữ liệu mẫu)
INSERT INTO permissions (permission_code, description) VALUES
 ('order.view','Xem đơn hàng'),
 ('order.update','Cập nhật / xử lý đơn hàng'),
 ('product.manage','Thêm, sửa, ẩn sản phẩm'),
 ('inventory.manage','Quản lý tồn kho, xuất nhập kho'),
 ('purchase.manage','Tạo và nhận phiếu nhập hàng'),
 ('finance.view','Xem báo cáo tài chính'),
 ('expense.manage','Ghi nhận chi phí'),
 ('customer.support','Xử lý ticket hỗ trợ khách'),
 ('staff.manage','Quản lý nhân viên và phân quyền');

INSERT INTO role_permissions (role, permission_code) VALUES
 ('sales','order.view'), ('sales','order.update'), ('sales','customer.support'),
 ('warehouse','order.view'), ('warehouse','inventory.manage'), ('warehouse','purchase.manage'),
 ('support','order.view'), ('support','customer.support'),
 ('accountant','order.view'), ('accountant','finance.view'), ('accountant','expense.manage');

-- =====================================================================
-- 4. NHẬT KÝ THAO TÁC (AUDIT LOG)
-- =====================================================================
CREATE TABLE audit_logs (
    log_id      BIGSERIAL PRIMARY KEY,
    staff_id    INT REFERENCES staff(staff_id) ON DELETE SET NULL,
    table_name  VARCHAR(60) NOT NULL,
    record_id   VARCHAR(60),
    action      VARCHAR(10) NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
    old_data    JSONB,
    new_data    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_table_time ON audit_logs(table_name, created_at DESC);
CREATE INDEX idx_audit_staff      ON audit_logs(staff_id, created_at DESC);

-- Ứng dụng gán người thao tác cho mỗi phiên: SET app.staff_id = '1';
CREATE OR REPLACE FUNCTION log_audit() RETURNS TRIGGER AS $$
DECLARE
    v_row JSONB := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
BEGIN
    INSERT INTO audit_logs (staff_id, table_name, record_id, action, old_data, new_data)
    VALUES (
        NULLIF(current_setting('app.staff_id', TRUE), '')::INT,
        TG_TABLE_NAME,
        v_row ->> TG_ARGV[0],
        TG_OP,
        CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END,
        CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) END
    );
    RETURN NULL;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_products  AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION log_audit('product_id');
CREATE TRIGGER trg_audit_variants  AFTER INSERT OR UPDATE OR DELETE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION log_audit('variant_id');
CREATE TRIGGER trg_audit_coupons   AFTER INSERT OR UPDATE OR DELETE ON coupons
    FOR EACH ROW EXECUTE FUNCTION log_audit('coupon_id');
CREATE TRIGGER trg_audit_orders    AFTER UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_audit('order_id');

-- =====================================================================
-- 5. LỊCH SỬ TRẠNG THÁI ĐƠN HÀNG
-- =====================================================================
CREATE TABLE order_status_history (
    history_id  BIGSERIAL PRIMARY KEY,
    order_id    BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    old_status  order_status,
    new_status  order_status NOT NULL,
    changed_by  INT REFERENCES staff(staff_id) ON DELETE SET NULL,
    changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    note        TEXT
);
CREATE INDEX idx_status_hist_order ON order_status_history(order_id, changed_at);

CREATE OR REPLACE FUNCTION log_order_status() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO order_status_history (order_id, old_status, new_status, changed_by)
        VALUES (NEW.order_id, NULL, NEW.status, NULLIF(current_setting('app.staff_id', TRUE), '')::INT);
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO order_status_history (order_id, old_status, new_status, changed_by)
        VALUES (NEW.order_id, OLD.status, NEW.status, NULLIF(current_setting('app.staff_id', TRUE), '')::INT);
    END IF;
    RETURN NULL;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_status_history
AFTER INSERT OR UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION log_order_status();

-- =====================================================================
-- 6. NHẬP HÀNG (PURCHASE ORDER)
-- =====================================================================
CREATE TABLE purchase_orders (
    po_id         BIGSERIAL PRIMARY KEY,
    supplier_id   INT NOT NULL REFERENCES suppliers(supplier_id),
    warehouse_id  INT NOT NULL REFERENCES warehouses(warehouse_id),
    created_by    INT REFERENCES staff(staff_id) ON DELETE SET NULL,
    status        po_status NOT NULL DEFAULT 'draft',
    ordered_at    TIMESTAMPTZ,
    expected_at   DATE,
    received_at   TIMESTAMPTZ,
    total_amount  NUMERIC(14,2) NOT NULL DEFAULT 0,
    note          TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
    po_item_id    BIGSERIAL PRIMARY KEY,
    po_id         BIGINT NOT NULL REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
    variant_id    BIGINT NOT NULL REFERENCES product_variants(variant_id),
    quantity      INT NOT NULL CHECK (quantity > 0),
    unit_cost     NUMERIC(14,2) NOT NULL CHECK (unit_cost >= 0),
    received_qty  INT NOT NULL DEFAULT 0 CHECK (received_qty >= 0),
    line_total    NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    UNIQUE (po_id, variant_id)
);
CREATE INDEX idx_po_items_po ON purchase_order_items(po_id);

CREATE OR REPLACE FUNCTION recalc_po_total() RETURNS TRIGGER AS $$
DECLARE
    v_po BIGINT := COALESCE(NEW.po_id, OLD.po_id);
BEGIN
    UPDATE purchase_orders
    SET total_amount = COALESCE((SELECT SUM(line_total) FROM purchase_order_items WHERE po_id = v_po), 0)
    WHERE po_id = v_po;
    RETURN NULL;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_po_items_total
AFTER INSERT OR UPDATE OR DELETE ON purchase_order_items
FOR EACH ROW EXECUTE FUNCTION recalc_po_total();

-- Nhận hàng: cộng tồn kho, ghi movement, đóng phiếu nhập
CREATE OR REPLACE FUNCTION receive_purchase_order(p_po_id BIGINT, p_staff_id INT) RETURNS VOID AS $$
DECLARE
    r        RECORD;
    v_wh     INT;
    v_status po_status;
BEGIN
    SELECT warehouse_id, status INTO v_wh, v_status
    FROM purchase_orders WHERE po_id = p_po_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Phiếu nhập % không tồn tại', p_po_id;
    END IF;
    IF v_status <> 'ordered' THEN
        RAISE EXCEPTION 'Chỉ nhận hàng được với phiếu ở trạng thái ordered (hiện tại: %)', v_status;
    END IF;

    FOR r IN SELECT variant_id, quantity FROM purchase_order_items WHERE po_id = p_po_id LOOP
        INSERT INTO inventory (warehouse_id, variant_id, quantity)
        VALUES (v_wh, r.variant_id, r.quantity)
        ON CONFLICT (warehouse_id, variant_id)
        DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity, updated_at = NOW();

        INSERT INTO inventory_movements (warehouse_id, variant_id, change_qty, reason, reference_id, staff_id)
        VALUES (v_wh, r.variant_id, r.quantity, 'purchase', p_po_id, p_staff_id);
    END LOOP;

    UPDATE purchase_order_items SET received_qty = quantity WHERE po_id = p_po_id;
    UPDATE purchase_orders SET status = 'received', received_at = NOW() WHERE po_id = p_po_id;
END; $$ LANGUAGE plpgsql;

-- =====================================================================
-- 7. XUẤT KHO CHO ĐƠN HÀNG
-- =====================================================================
CREATE OR REPLACE FUNCTION fulfill_order(p_order_id BIGINT, p_warehouse_id INT, p_staff_id INT) RETURNS VOID AS $$
DECLARE
    r RECORD;
    v_available INT;
BEGIN
    IF EXISTS (SELECT 1 FROM inventory_movements
               WHERE reason = 'sale' AND reference_id = p_order_id) THEN
        RAISE EXCEPTION 'Đơn % đã được xuất kho trước đó', p_order_id;
    END IF;

    FOR r IN SELECT variant_id, quantity FROM order_items WHERE order_id = p_order_id LOOP
        SELECT quantity - reserved_qty INTO v_available
        FROM inventory
        WHERE warehouse_id = p_warehouse_id AND variant_id = r.variant_id
        FOR UPDATE;

        IF v_available IS NULL OR v_available < r.quantity THEN
            RAISE EXCEPTION 'Không đủ tồn kho cho variant % (cần %, còn %)',
                r.variant_id, r.quantity, COALESCE(v_available, 0);
        END IF;

        UPDATE inventory
        SET quantity = quantity - r.quantity, updated_at = NOW()
        WHERE warehouse_id = p_warehouse_id AND variant_id = r.variant_id;

        INSERT INTO inventory_movements (warehouse_id, variant_id, change_qty, reason, reference_id, staff_id)
        VALUES (p_warehouse_id, r.variant_id, -r.quantity, 'sale', p_order_id, p_staff_id);
    END LOOP;

    UPDATE orders SET status = 'processing' WHERE order_id = p_order_id AND status IN ('pending','confirmed');
END; $$ LANGUAGE plpgsql;

-- =====================================================================
-- 8. CHI PHÍ VẬN HÀNH & MỤC TIÊU DOANH SỐ
-- =====================================================================
CREATE TABLE expenses (
    expense_id    BIGSERIAL PRIMARY KEY,
    category      expense_category NOT NULL,
    amount        NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    expense_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    description   VARCHAR(255),
    staff_id      INT REFERENCES staff(staff_id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_expenses_date ON expenses(expense_date);

CREATE TABLE sales_targets (
    staff_id        INT  NOT NULL REFERENCES staff(staff_id) ON DELETE CASCADE,
    month           DATE NOT NULL CHECK (month = DATE_TRUNC('month', month)::DATE),  -- ngày đầu tháng
    target_revenue  NUMERIC(14,2) NOT NULL CHECK (target_revenue >= 0),
    PRIMARY KEY (staff_id, month)
);

-- =====================================================================
-- 9. HỖ TRỢ KHÁCH HÀNG & CÀI ĐẶT HỆ THỐNG
-- =====================================================================
CREATE TABLE support_tickets (
    ticket_id    BIGSERIAL PRIMARY KEY,
    customer_id  BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    order_id     BIGINT REFERENCES orders(order_id) ON DELETE SET NULL,
    assigned_to  INT REFERENCES staff(staff_id) ON DELETE SET NULL,
    subject      VARCHAR(200) NOT NULL,
    description  TEXT,
    status       ticket_status   NOT NULL DEFAULT 'open',
    priority     ticket_priority NOT NULL DEFAULT 'normal',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at  TIMESTAMPTZ
);
CREATE INDEX idx_tickets_status ON support_tickets(status, priority);

CREATE TABLE system_settings (
    setting_key  VARCHAR(80) PRIMARY KEY,
    value        JSONB NOT NULL,
    description  VARCHAR(255),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 10. VIEW DASHBOARD & BÁO CÁO QUẢN LÝ
-- =====================================================================
-- 10.1 Tổng quan hôm nay
CREATE VIEW v_dashboard_today AS
SELECT
    (SELECT COUNT(*) FROM orders WHERE order_date::DATE = CURRENT_DATE)                              AS orders_today,
    (SELECT COALESCE(SUM(total_amount),0) FROM orders
      WHERE order_date::DATE = CURRENT_DATE AND status NOT IN ('cancelled','returned'))              AS revenue_today,
    (SELECT COUNT(*) FROM customers WHERE created_at::DATE = CURRENT_DATE)                           AS new_customers_today,
    (SELECT COUNT(*) FROM orders WHERE status IN ('pending','confirmed','processing'))               AS orders_to_handle,
    (SELECT COUNT(*) FROM v_low_stock)                                                               AS low_stock_items,
    (SELECT COUNT(*) FROM support_tickets WHERE status IN ('open','in_progress'))                    AS open_tickets;

-- 10.2 Báo cáo lãi lỗ theo tháng (doanh thu thuần - giá vốn - chi phí vận hành)
CREATE VIEW v_profit_loss_monthly AS
WITH sales AS (
    SELECT DATE_TRUNC('month', order_date)::DATE AS month,
           SUM(subtotal - discount_amount)       AS net_sales
    FROM orders WHERE status = 'completed' GROUP BY 1
),
cogs AS (
    SELECT DATE_TRUNC('month', o.order_date)::DATE AS month,
           SUM(oi.quantity * oi.unit_cost)          AS cogs
    FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
    WHERE o.status = 'completed' GROUP BY 1
),
opex AS (
    SELECT DATE_TRUNC('month', expense_date)::DATE AS month,
           SUM(amount)                              AS operating_expenses
    FROM expenses GROUP BY 1
),
months AS (
    SELECT month FROM sales UNION SELECT month FROM cogs UNION SELECT month FROM opex
)
SELECT
    m.month,
    COALESCE(s.net_sales, 0)                                              AS net_sales,
    COALESCE(c.cogs, 0)                                                   AS cogs,
    COALESCE(s.net_sales, 0) - COALESCE(c.cogs, 0)                        AS gross_profit,
    COALESCE(e.operating_expenses, 0)                                     AS operating_expenses,
    COALESCE(s.net_sales, 0) - COALESCE(c.cogs, 0)
        - COALESCE(e.operating_expenses, 0)                               AS net_profit
FROM months m
LEFT JOIN sales s USING (month)
LEFT JOIN cogs  c USING (month)
LEFT JOIN opex  e USING (month)
ORDER BY m.month;

-- 10.3 Hiệu suất nhân viên bán hàng so với mục tiêu
CREATE VIEW v_staff_performance AS
WITH perf AS (
    SELECT staff_id,
           DATE_TRUNC('month', order_date)::DATE AS month,
           COUNT(*)                              AS orders_completed,
           SUM(total_amount)                     AS revenue
    FROM orders
    WHERE status = 'completed' AND staff_id IS NOT NULL
    GROUP BY 1, 2
)
SELECT s.staff_id, s.full_name, p.month, p.orders_completed, p.revenue,
       t.target_revenue,
       ROUND(100.0 * p.revenue / NULLIF(t.target_revenue, 0), 2) AS achievement_pct
FROM perf p
JOIN staff s USING (staff_id)
LEFT JOIN sales_targets t ON t.staff_id = p.staff_id AND t.month = p.month;

-- 10.4 Đơn cần xử lý (sắp theo đơn chờ lâu nhất)
CREATE VIEW v_pending_orders AS
SELECT o.order_id, o.order_date, o.status, o.total_amount, o.channel,
       c.full_name AS customer, c.phone,
       ROUND(EXTRACT(EPOCH FROM (NOW() - o.order_date)) / 3600, 1) AS waiting_hours,
       COALESCE(p.status::TEXT, 'unpaid') AS payment_status
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
LEFT JOIN LATERAL (
    SELECT status FROM payments WHERE order_id = o.order_id ORDER BY payment_id DESC LIMIT 1
) p ON TRUE
WHERE o.status IN ('pending','confirmed','processing')
ORDER BY o.order_date;

-- 10.5 Giá trị tồn kho theo kho (theo giá vốn và giá bán)
CREATE VIEW v_inventory_value AS
SELECT w.warehouse_id, w.name AS warehouse,
       SUM(i.quantity)                     AS total_units,
       SUM(i.quantity * v.cost_price)      AS cost_value,
       SUM(i.quantity * v.sale_price)      AS retail_value
FROM inventory i
JOIN warehouses w       ON w.warehouse_id = i.warehouse_id
JOIN product_variants v ON v.variant_id = i.variant_id
GROUP BY w.warehouse_id, w.name;

-- 10.6 Hàng tồn lâu (còn hàng nhưng 60 ngày chưa bán được)
CREATE VIEW v_slow_moving_stock AS
WITH stock AS (
    SELECT variant_id, SUM(quantity) AS stock FROM inventory GROUP BY variant_id
),
last_sold AS (
    SELECT oi.variant_id, MAX(o.order_date) AS last_sold_at
    FROM order_items oi
    JOIN orders o ON o.order_id = oi.order_id AND o.status = 'completed'
    GROUP BY oi.variant_id
)
SELECT v.variant_id, v.sku, p.name AS product, s.stock,
       s.stock * v.cost_price AS tied_up_capital,
       l.last_sold_at
FROM stock s
JOIN product_variants v ON v.variant_id = s.variant_id
JOIN products p         ON p.product_id = v.product_id
LEFT JOIN last_sold l   ON l.variant_id = s.variant_id
WHERE s.stock > 0
  AND (l.last_sold_at IS NULL OR l.last_sold_at < NOW() - INTERVAL '60 days')
ORDER BY tied_up_capital DESC;

-- 10.7 Hiệu quả mã giảm giá
CREATE VIEW v_coupon_effectiveness AS
SELECT c.coupon_id, c.code, c.type, c.value,
       COUNT(o.order_id)                AS orders_used,
       COALESCE(SUM(o.discount_amount), 0) AS total_discount_given,
       COALESCE(SUM(o.total_amount), 0)    AS revenue_generated
FROM coupons c
LEFT JOIN orders o ON o.coupon_id = c.coupon_id AND o.status = 'completed'
GROUP BY c.coupon_id, c.code, c.type, c.value;

-- 10.8 Tỷ lệ đổi trả theo sản phẩm
CREATE VIEW v_product_return_rate AS
WITH sold AS (
    SELECT v.product_id, SUM(oi.quantity) AS units_sold
    FROM order_items oi
    JOIN orders o           ON o.order_id = oi.order_id AND o.status IN ('completed','returned')
    JOIN product_variants v ON v.variant_id = oi.variant_id
    GROUP BY v.product_id
),
returned AS (
    SELECT v.product_id, SUM(r.quantity) AS units_returned
    FROM returns r
    JOIN order_items oi     ON oi.order_item_id = r.order_item_id
    JOIN product_variants v ON v.variant_id = oi.variant_id
    GROUP BY v.product_id
)
SELECT p.product_id, p.name AS product, s.units_sold,
       COALESCE(r.units_returned, 0) AS units_returned,
       ROUND(100.0 * COALESCE(r.units_returned, 0) / NULLIF(s.units_sold, 0), 2) AS return_rate_pct
FROM sold s
JOIN products p ON p.product_id = s.product_id
LEFT JOIN returned r ON r.product_id = s.product_id
ORDER BY return_rate_pct DESC NULLS LAST;

-- 10.9 Tổng hợp nhập hàng theo nhà cung cấp
CREATE VIEW v_supplier_purchases AS
SELECT s.supplier_id, s.name AS supplier,
       COUNT(po.po_id)                     AS total_pos,
       COALESCE(SUM(po.total_amount), 0)   AS total_purchased,
       MAX(po.received_at)                 AS last_received_at
FROM suppliers s
LEFT JOIN purchase_orders po ON po.supplier_id = s.supplier_id AND po.status = 'received'
GROUP BY s.supplier_id, s.name;

-- 10.10 Thời gian xử lý ticket hỗ trợ theo nhân viên
CREATE VIEW v_support_performance AS
SELECT s.staff_id, s.full_name,
       COUNT(*)                                                  AS total_tickets,
       COUNT(*) FILTER (WHERE t.status IN ('resolved','closed')) AS resolved,
       ROUND(AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 3600)
             FILTER (WHERE t.resolved_at IS NOT NULL), 1)        AS avg_resolve_hours
FROM support_tickets t
JOIN staff s ON s.staff_id = t.assigned_to
GROUP BY s.staff_id, s.full_name;

-- =====================================================================
-- 11. CÁCH DÙNG NHANH
-- =====================================================================
-- Gán người thao tác cho phiên làm việc (để audit log biết ai làm):
--   SET app.staff_id = '1';
-- Nhận hàng từ phiếu nhập:
--   SELECT receive_purchase_order(1, 1);
-- Xuất kho cho đơn hàng:
--   SELECT fulfill_order(10, 1, 1);   -- (order_id, warehouse_id, staff_id)
-- Kiểm tra quyền:
--   SELECT has_permission(2, 'order.update');
-- Xem dashboard:
--   SELECT * FROM v_dashboard_today;
--   SELECT * FROM v_profit_loss_monthly;
