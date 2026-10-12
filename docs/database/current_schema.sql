--
-- PostgreSQL database dump
--

\restrict bcLNjgUWvBtV1efSnYUESL6CPfIdMED6Y8TtOi8yF4zakYh9sh0BfQjrAjRXG9N

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
-- Name: discount_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.discount_type AS ENUM (
    'percent',
    'fixed'
);


ALTER TYPE public.discount_type OWNER TO postgres;

--
-- Name: discounttype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.discounttype AS ENUM (
    'percent',
    'fixed'
);


ALTER TYPE public.discounttype OWNER TO postgres;

--
-- Name: expense_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.expense_category AS ENUM (
    'marketing',
    'salary',
    'rent',
    'utilities',
    'shipping',
    'packaging',
    'software',
    'other'
);


ALTER TYPE public.expense_category OWNER TO postgres;

--
-- Name: order_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'completed',
    'cancelled',
    'returned',
    'pending_payment',
    'paid',
    'expired'
);


ALTER TYPE public.order_status OWNER TO postgres;

--
-- Name: orderstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.orderstatus AS ENUM (
    'pending',
    'pending_payment',
    'paid',
    'confirmed',
    'processing',
    'shipped',
    'completed',
    'cancelled',
    'expired',
    'returned'
);


ALTER TYPE public.orderstatus OWNER TO postgres;

--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_method AS ENUM (
    'cod',
    'bank_transfer',
    'credit_card',
    'momo',
    'zalopay',
    'vnpay'
);


ALTER TYPE public.payment_method OWNER TO postgres;

--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_status AS ENUM (
    'unpaid',
    'paid',
    'failed',
    'refunded'
);


ALTER TYPE public.payment_status OWNER TO postgres;

--
-- Name: po_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.po_status AS ENUM (
    'draft',
    'ordered',
    'received',
    'cancelled'
);


ALTER TYPE public.po_status OWNER TO postgres;

--
-- Name: promotion_kind; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.promotion_kind AS ENUM (
    'discount',
    'gift',
    'service'
);


ALTER TYPE public.promotion_kind OWNER TO postgres;

--
-- Name: shipment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.shipment_status AS ENUM (
    'preparing',
    'in_transit',
    'delivered',
    'failed',
    'returned'
);


ALTER TYPE public.shipment_status OWNER TO postgres;

--
-- Name: staff_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.staff_role AS ENUM (
    'admin',
    'sales',
    'warehouse',
    'support',
    'accountant'
);


ALTER TYPE public.staff_role OWNER TO postgres;

--
-- Name: staffrole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.staffrole AS ENUM (
    'admin',
    'sales',
    'warehouse',
    'support',
    'accountant'
);


ALTER TYPE public.staffrole OWNER TO postgres;

--
-- Name: ticket_priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ticket_priority AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);


ALTER TYPE public.ticket_priority OWNER TO postgres;

--
-- Name: ticket_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ticket_status AS ENUM (
    'open',
    'in_progress',
    'resolved',
    'closed'
);


ALTER TYPE public.ticket_status OWNER TO postgres;

--
-- Name: CAST (public.discounttype AS character varying); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (public.discounttype AS character varying) WITH INOUT AS IMPLICIT;


--
-- Name: CAST (public.orderstatus AS character varying); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (public.orderstatus AS character varying) WITH INOUT AS IMPLICIT;


--
-- Name: CAST (public.staffrole AS character varying); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (public.staffrole AS character varying) WITH INOUT AS IMPLICIT;


--
-- Name: CAST (character varying AS public.discounttype); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (character varying AS public.discounttype) WITH INOUT AS IMPLICIT;


--
-- Name: CAST (character varying AS public.orderstatus); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (character varying AS public.orderstatus) WITH INOUT AS IMPLICIT;


--
-- Name: CAST (character varying AS public.staffrole); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (character varying AS public.staffrole) WITH INOUT AS IMPLICIT;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: category_attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category_attributes (
    attr_id integer NOT NULL,
    category_id integer NOT NULL,
    key character varying(60) NOT NULL,
    label character varying(100) NOT NULL,
    data_type character varying(10) DEFAULT 'text'::character varying NOT NULL,
    unit character varying(20),
    group_name character varying(100),
    options jsonb,
    is_spec boolean DEFAULT true NOT NULL,
    is_filter boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    CONSTRAINT category_attributes_data_type_check CHECK (((data_type)::text = ANY ((ARRAY['text'::character varying, 'number'::character varying, 'bool'::character varying])::text[])))
);


ALTER TABLE public.category_attributes OWNER TO postgres;

--
-- Name: category_attributes_for(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.category_attributes_for(p_category_id integer) RETURNS SETOF public.category_attributes
    LANGUAGE sql STABLE
    AS $$
    SELECT ca.*
    FROM category_attributes ca
    JOIN category_path(p_category_id) cp ON cp.cat_id = ca.category_id
    ORDER BY ca.sort_order, ca.attr_id;
$$;


ALTER FUNCTION public.category_attributes_for(p_category_id integer) OWNER TO postgres;

--
-- Name: category_descendants(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.category_descendants(p_category_id integer) RETURNS TABLE(cat_id integer)
    LANGUAGE sql STABLE
    AS $$
    WITH RECURSIVE sub AS (
        SELECT category_id FROM categories WHERE category_id = p_category_id
        UNION ALL
        SELECT c.category_id FROM categories c JOIN sub s ON c.parent_id = s.category_id
    )
    SELECT category_id FROM sub;
$$;


ALTER FUNCTION public.category_descendants(p_category_id integer) OWNER TO postgres;

--
-- Name: category_path(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.category_path(p_category_id integer) RETURNS TABLE(pos integer, cat_id integer, name character varying, slug character varying)
    LANGUAGE sql STABLE
    AS $$
    WITH RECURSIVE up AS (
        SELECT c.category_id, c.parent_id, c.name, c.slug, 0 AS depth
        FROM categories c WHERE c.category_id = p_category_id
        UNION ALL
        SELECT c.category_id, c.parent_id, c.name, c.slug, up.depth + 1
        FROM categories c JOIN up ON c.category_id = up.parent_id
    )
    SELECT (ROW_NUMBER() OVER (ORDER BY depth DESC))::INT, category_id, name, slug
    FROM up ORDER BY depth DESC;
$$;


ALTER FUNCTION public.category_path(p_category_id integer) OWNER TO postgres;

--
-- Name: check_category_cycle(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_category_cycle() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
END; $$;


ALTER FUNCTION public.check_category_cycle() OWNER TO postgres;

--
-- Name: fulfill_order(bigint, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fulfill_order(p_order_id bigint, p_warehouse_id integer, p_staff_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
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
END; $$;


ALTER FUNCTION public.fulfill_order(p_order_id bigint, p_warehouse_id integer, p_staff_id integer) OWNER TO postgres;

--
-- Name: has_permission(integer, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.has_permission(p_staff_id integer, p_code character varying) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
    SELECT EXISTS (
        SELECT 1
        FROM staff s
        JOIN role_permissions rp ON rp.role = s.role
        WHERE s.staff_id = p_staff_id
          AND s.is_active
          AND (rp.permission_code = p_code OR s.role = 'admin')
    );
$$;


ALTER FUNCTION public.has_permission(p_staff_id integer, p_code character varying) OWNER TO postgres;

--
-- Name: installment_monthly(numeric, integer, numeric, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.installment_monthly(p_price numeric, p_term integer, p_rate_pct numeric DEFAULT 0, p_down_pct numeric DEFAULT 0) RETURNS numeric
    LANGUAGE sql IMMUTABLE
    AS $$
    SELECT ROUND(p_price * (1 - p_down_pct / 100) * (1.0 / p_term + p_rate_pct / 100));
$$;


ALTER FUNCTION public.installment_monthly(p_price numeric, p_term integer, p_rate_pct numeric, p_down_pct numeric) OWNER TO postgres;

--
-- Name: log_audit(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_audit() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
END; $$;


ALTER FUNCTION public.log_audit() OWNER TO postgres;

--
-- Name: log_order_status(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_order_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO order_status_history (order_id, old_status, new_status, changed_by)
        VALUES (NEW.order_id, NULL, NEW.status, NULLIF(current_setting('app.staff_id', TRUE), '')::INT);
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO order_status_history (order_id, old_status, new_status, changed_by)
        VALUES (NEW.order_id, OLD.status, NEW.status, NULLIF(current_setting('app.staff_id', TRUE), '')::INT);
    END IF;
    RETURN NULL;
END; $$;


ALTER FUNCTION public.log_order_status() OWNER TO postgres;

--
-- Name: product_breadcrumb(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.product_breadcrumb(p_slug character varying) RETURNS TABLE(pos integer, kind text, name character varying, slug character varying)
    LANGUAGE sql STABLE
    AS $$
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
$$;


ALTER FUNCTION public.product_breadcrumb(p_slug character varying) OWNER TO postgres;

--
-- Name: recalc_order_total(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.recalc_order_total() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_order_id BIGINT := COALESCE(NEW.order_id, OLD.order_id);
BEGIN
    UPDATE orders o
    SET subtotal     = COALESCE(s.sub, 0),
        total_amount = GREATEST(COALESCE(s.sub, 0) - o.discount_amount + o.shipping_fee, 0)
    FROM (SELECT SUM(line_total) AS sub FROM order_items WHERE order_id = v_order_id) s
    WHERE o.order_id = v_order_id;
    RETURN NULL;
END; $$;


ALTER FUNCTION public.recalc_order_total() OWNER TO postgres;

--
-- Name: recalc_po_total(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.recalc_po_total() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_po BIGINT := COALESCE(NEW.po_id, OLD.po_id);
BEGIN
    UPDATE purchase_orders
    SET total_amount = COALESCE((SELECT SUM(line_total) FROM purchase_order_items WHERE po_id = v_po), 0)
    WHERE po_id = v_po;
    RETURN NULL;
END; $$;


ALTER FUNCTION public.recalc_po_total() OWNER TO postgres;

--
-- Name: receive_purchase_order(bigint, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.receive_purchase_order(p_po_id bigint, p_staff_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
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
END; $$;


ALTER FUNCTION public.receive_purchase_order(p_po_id bigint, p_staff_id integer) OWNER TO postgres;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END; $$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

--
-- Name: variant_final_price(bigint, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.variant_final_price(p_variant_id bigint, p_tier_id integer DEFAULT NULL::integer) RETURNS numeric
    LANGUAGE sql STABLE
    AS $$
    SELECT GREATEST(
        pv.sale_price - COALESCE(
            (SELECT MAX(vp.discount_amount)
             FROM variant_promotions(p_variant_id, p_tier_id) vp
             WHERE vp.kind = 'discount'), 0),
        0)
    FROM product_variants pv
    WHERE pv.variant_id = p_variant_id;
$$;


ALTER FUNCTION public.variant_final_price(p_variant_id bigint, p_tier_id integer) OWNER TO postgres;

--
-- Name: variant_promotions(bigint, integer, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.variant_promotions(p_variant_id bigint, p_tier_id integer DEFAULT NULL::integer, p_at timestamp with time zone DEFAULT now()) RETURNS TABLE(promotion_id integer, name character varying, description text, kind public.promotion_kind, discount_amount numeric, gift_text character varying, priority integer, ends_at timestamp with time zone)
    LANGUAGE sql STABLE
    AS $$
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
$$;


ALTER FUNCTION public.variant_promotions(p_variant_id bigint, p_tier_id integer, p_at timestamp with time zone) OWNER TO postgres;

--
-- Name: warranty_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warranty_plans (
    plan_id integer NOT NULL,
    category_id integer,
    name character varying(150) NOT NULL,
    plan_type character varying(20) DEFAULT 'extended'::character varying NOT NULL,
    duration_months integer NOT NULL,
    price numeric(14,2) NOT NULL,
    min_product_price numeric(14,2) DEFAULT 0 NOT NULL,
    max_product_price numeric(14,2),
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    CONSTRAINT warranty_plans_check CHECK (((max_product_price IS NULL) OR (max_product_price > min_product_price))),
    CONSTRAINT warranty_plans_duration_months_check CHECK ((duration_months > 0)),
    CONSTRAINT warranty_plans_plan_type_check CHECK (((plan_type)::text = ANY ((ARRAY['extended'::character varying, 'swap'::character varying, 'accident'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT warranty_plans_price_check CHECK ((price >= (0)::numeric))
);


ALTER TABLE public.warranty_plans OWNER TO postgres;

--
-- Name: warranty_plans_for_variant(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.warranty_plans_for_variant(p_variant_id bigint) RETURNS SETOF public.warranty_plans
    LANGUAGE sql STABLE
    AS $$
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
$$;


ALTER FUNCTION public.warranty_plans_for_variant(p_variant_id bigint) OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    log_id bigint NOT NULL,
    staff_id integer,
    table_name character varying(60) NOT NULL,
    record_id character varying(60),
    action character varying(10) NOT NULL,
    old_data jsonb,
    new_data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT audit_logs_action_check CHECK (((action)::text = ANY ((ARRAY['INSERT'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying])::text[])))
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_log_id_seq OWNER TO postgres;

--
-- Name: audit_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_log_id_seq OWNED BY public.audit_logs.log_id;


--
-- Name: banners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banners (
    id bigint NOT NULL,
    bg_color character varying(255),
    created_at timestamp(6) without time zone,
    display_order integer,
    headline character varying(500),
    image_url character varying(500),
    is_active boolean,
    primary_btn_link character varying(500),
    primary_btn_text character varying(255),
    secondary_btn_link character varying(500),
    secondary_btn_text character varying(255),
    sub_headline text,
    text_color character varying(255),
    title character varying(255) NOT NULL
);


ALTER TABLE public.banners OWNER TO postgres;

--
-- Name: banners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.banners_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.banners_id_seq OWNER TO postgres;

--
-- Name: banners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banners_id_seq OWNED BY public.banners.id;


--
-- Name: brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brands (
    brand_id integer NOT NULL,
    name character varying(120) NOT NULL,
    country character varying(80),
    slug character varying(150) NOT NULL,
    logo_url character varying(500),
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.brands OWNER TO postgres;

--
-- Name: brands_brand_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.brands_brand_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.brands_brand_id_seq OWNER TO postgres;

--
-- Name: brands_brand_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.brands_brand_id_seq OWNED BY public.brands.brand_id;


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    cart_id bigint NOT NULL,
    variant_id bigint NOT NULL,
    quantity integer NOT NULL,
    CONSTRAINT cart_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    cart_id bigint NOT NULL,
    customer_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- Name: carts_cart_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carts_cart_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carts_cart_id_seq OWNER TO postgres;

--
-- Name: carts_cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carts_cart_id_seq OWNED BY public.carts.cart_id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    category_id integer NOT NULL,
    parent_id integer,
    name character varying(120) NOT NULL,
    slug character varying(150) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    image_url character varying(500),
    icon_url character varying(100),
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_category_id_seq OWNER TO postgres;

--
-- Name: categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_category_id_seq OWNED BY public.categories.category_id;


--
-- Name: category_attributes_attr_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.category_attributes_attr_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.category_attributes_attr_id_seq OWNER TO postgres;

--
-- Name: category_attributes_attr_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.category_attributes_attr_id_seq OWNED BY public.category_attributes.attr_id;


--
-- Name: checkout_idempotency; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checkout_idempotency (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    idempotency_key character varying(64) NOT NULL,
    request_hash character varying(64) NOT NULL,
    order_id bigint,
    response_snapshot text,
    status character varying(20) DEFAULT 'PROCESSING'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone NOT NULL
);


ALTER TABLE public.checkout_idempotency OWNER TO postgres;

--
-- Name: checkout_idempotency_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checkout_idempotency_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checkout_idempotency_id_seq OWNER TO postgres;

--
-- Name: checkout_idempotency_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checkout_idempotency_id_seq OWNED BY public.checkout_idempotency.id;


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    coupon_id integer NOT NULL,
    code character varying(40) NOT NULL,
    type public.discount_type NOT NULL,
    value numeric(12,2) NOT NULL,
    min_order_value numeric(14,2) DEFAULT 0 NOT NULL,
    max_discount numeric(14,2),
    usage_limit integer,
    used_count integer DEFAULT 0 NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    max_usage_per_user integer DEFAULT 1,
    reserved_count integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    title character varying(150),
    description text,
    category_id integer,
    brand_id integer,
    product_id bigint,
    CONSTRAINT coupons_check CHECK ((ends_at > starts_at)),
    CONSTRAINT coupons_value_check CHECK ((value > (0)::numeric))
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- Name: coupons_coupon_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coupons_coupon_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupons_coupon_id_seq OWNER TO postgres;

--
-- Name: coupons_coupon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coupons_coupon_id_seq OWNED BY public.coupons.coupon_id;


--
-- Name: customer_addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_addresses (
    address_id bigint NOT NULL,
    customer_id bigint NOT NULL,
    receiver_name character varying(150) NOT NULL,
    receiver_phone character varying(20) NOT NULL,
    province character varying(100) NOT NULL,
    district character varying(100) NOT NULL,
    ward character varying(100),
    street_address character varying(255) NOT NULL,
    is_default boolean DEFAULT false NOT NULL
);


ALTER TABLE public.customer_addresses OWNER TO postgres;

--
-- Name: customer_addresses_address_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_addresses_address_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_addresses_address_id_seq OWNER TO postgres;

--
-- Name: customer_addresses_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_addresses_address_id_seq OWNED BY public.customer_addresses.address_id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    customer_id bigint NOT NULL,
    full_name character varying(150) NOT NULL,
    email character varying(150) NOT NULL,
    phone character varying(20),
    password_hash character varying(255) NOT NULL,
    gender character varying(1),
    birth_date date,
    loyalty_points integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tier_id integer,
    CONSTRAINT customers_gender_check CHECK (((gender)::bpchar = ANY (ARRAY['M'::bpchar, 'F'::bpchar, 'O'::bpchar]))),
    CONSTRAINT customers_loyalty_points_check CHECK ((loyalty_points >= 0))
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: customers_customer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_customer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_customer_id_seq OWNER TO postgres;

--
-- Name: customers_customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_customer_id_seq OWNED BY public.customers.customer_id;


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    expense_id bigint NOT NULL,
    category public.expense_category NOT NULL,
    amount numeric(14,2) NOT NULL,
    expense_date date DEFAULT CURRENT_DATE NOT NULL,
    description character varying(255),
    staff_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT expenses_amount_check CHECK ((amount > (0)::numeric))
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: expenses_expense_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expenses_expense_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expenses_expense_id_seq OWNER TO postgres;

--
-- Name: expenses_expense_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expenses_expense_id_seq OWNED BY public.expenses.expense_id;


--
-- Name: flash_sale_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flash_sale_audit_log (
    id bigint NOT NULL,
    action character varying(50) NOT NULL,
    campaign_id bigint NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    details text,
    performed_by character varying(100)
);


ALTER TABLE public.flash_sale_audit_log OWNER TO postgres;

--
-- Name: flash_sale_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.flash_sale_audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.flash_sale_audit_log_id_seq OWNER TO postgres;

--
-- Name: flash_sale_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.flash_sale_audit_log_id_seq OWNED BY public.flash_sale_audit_log.id;


--
-- Name: flash_sale_campaign; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flash_sale_campaign (
    campaign_id bigint NOT NULL,
    title character varying(255) DEFAULT 'FLASHSALE TỰU TRƯỜNG'::character varying NOT NULL,
    disclaimer text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    start_time timestamp with time zone DEFAULT now(),
    end_time timestamp with time zone DEFAULT (now() + '7 days'::interval),
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    updated_at timestamp with time zone DEFAULT now(),
    publish_status character varying(20),
    updated_by character varying(100),
    version bigint
);


ALTER TABLE public.flash_sale_campaign OWNER TO postgres;

--
-- Name: flash_sale_campaign_campaign_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.flash_sale_campaign_campaign_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.flash_sale_campaign_campaign_id_seq OWNER TO postgres;

--
-- Name: flash_sale_campaign_campaign_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.flash_sale_campaign_campaign_id_seq OWNED BY public.flash_sale_campaign.campaign_id;


--
-- Name: flash_sale_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flash_sale_item (
    item_id bigint NOT NULL,
    campaign_id bigint,
    product_id bigint,
    name character varying(255) NOT NULL,
    image_url character varying(500),
    original_price numeric(14,2) NOT NULL,
    sale_price numeric(14,2) NOT NULL,
    discount_percent integer DEFAULT 0,
    sold_count integer DEFAULT 0,
    total_stock integer DEFAULT 10 NOT NULL,
    status character varying(50) DEFAULT 'AVAILABLE'::character varying,
    slot_id bigint,
    max_quantity_per_user integer DEFAULT 1,
    reserved_quantity integer DEFAULT 0 NOT NULL,
    display_order integer,
    version bigint,
    CONSTRAINT chk_fs_stock_limit CHECK (((sold_count + reserved_quantity) <= total_stock))
);


ALTER TABLE public.flash_sale_item OWNER TO postgres;

--
-- Name: flash_sale_item_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.flash_sale_item_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.flash_sale_item_item_id_seq OWNER TO postgres;

--
-- Name: flash_sale_item_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.flash_sale_item_item_id_seq OWNED BY public.flash_sale_item.item_id;


--
-- Name: flash_sale_purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flash_sale_purchases (
    id bigint NOT NULL,
    slot_id bigint NOT NULL,
    product_id bigint NOT NULL,
    phone character varying(20) NOT NULL,
    order_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.flash_sale_purchases OWNER TO postgres;

--
-- Name: flash_sale_purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.flash_sale_purchases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.flash_sale_purchases_id_seq OWNER TO postgres;

--
-- Name: flash_sale_purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.flash_sale_purchases_id_seq OWNED BY public.flash_sale_purchases.id;


--
-- Name: flash_sale_slot_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flash_sale_slot_products (
    id bigint NOT NULL,
    slot_id bigint NOT NULL,
    product_id bigint NOT NULL,
    sale_price bigint NOT NULL,
    original_price bigint NOT NULL,
    quota integer NOT NULL,
    sold integer DEFAULT 0 NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    CONSTRAINT chk_sold_quota CHECK ((sold <= quota))
);


ALTER TABLE public.flash_sale_slot_products OWNER TO postgres;

--
-- Name: flash_sale_slot_products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.flash_sale_slot_products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.flash_sale_slot_products_id_seq OWNER TO postgres;

--
-- Name: flash_sale_slot_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.flash_sale_slot_products_id_seq OWNED BY public.flash_sale_slot_products.id;


--
-- Name: flash_sale_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flash_sale_slots (
    id bigint NOT NULL,
    start_at timestamp with time zone NOT NULL,
    end_at timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.flash_sale_slots OWNER TO postgres;

--
-- Name: flash_sale_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.flash_sale_slots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.flash_sale_slots_id_seq OWNER TO postgres;

--
-- Name: flash_sale_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.flash_sale_slots_id_seq OWNED BY public.flash_sale_slots.id;


--
-- Name: flash_sale_time_slot; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flash_sale_time_slot (
    slot_id bigint NOT NULL,
    campaign_id bigint,
    label character varying(100) NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    is_active boolean DEFAULT false,
    version bigint
);


ALTER TABLE public.flash_sale_time_slot OWNER TO postgres;

--
-- Name: flash_sale_time_slot_slot_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.flash_sale_time_slot_slot_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.flash_sale_time_slot_slot_id_seq OWNER TO postgres;

--
-- Name: flash_sale_time_slot_slot_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.flash_sale_time_slot_slot_id_seq OWNED BY public.flash_sale_time_slot.slot_id;


--
-- Name: flash_sale_user_purchase; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flash_sale_user_purchase (
    purchase_id bigint NOT NULL,
    item_id bigint NOT NULL,
    customer_id bigint NOT NULL,
    order_id bigint,
    quantity integer DEFAULT 1 NOT NULL,
    purchased_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.flash_sale_user_purchase OWNER TO postgres;

--
-- Name: flash_sale_user_purchase_purchase_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.flash_sale_user_purchase_purchase_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.flash_sale_user_purchase_purchase_id_seq OWNER TO postgres;

--
-- Name: flash_sale_user_purchase_purchase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.flash_sale_user_purchase_purchase_id_seq OWNED BY public.flash_sale_user_purchase.purchase_id;


--
-- Name: installment_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.installment_plans (
    plan_id integer NOT NULL,
    provider character varying(80) NOT NULL,
    term_months integer NOT NULL,
    monthly_rate_pct numeric(5,2) DEFAULT 0 NOT NULL,
    down_payment_pct numeric(5,2) DEFAULT 0 NOT NULL,
    min_order_amount numeric(14,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    CONSTRAINT installment_plans_down_payment_pct_check CHECK (((down_payment_pct >= (0)::numeric) AND (down_payment_pct <= (100)::numeric))),
    CONSTRAINT installment_plans_monthly_rate_pct_check CHECK ((monthly_rate_pct >= (0)::numeric)),
    CONSTRAINT installment_plans_term_months_check CHECK ((term_months > 0))
);


ALTER TABLE public.installment_plans OWNER TO postgres;

--
-- Name: installment_plans_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.installment_plans_plan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.installment_plans_plan_id_seq OWNER TO postgres;

--
-- Name: installment_plans_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.installment_plans_plan_id_seq OWNED BY public.installment_plans.plan_id;


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory (
    warehouse_id integer NOT NULL,
    variant_id bigint NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    reserved_qty integer DEFAULT 0 NOT NULL,
    reorder_level integer DEFAULT 10 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT inventory_quantity_check CHECK ((quantity >= 0)),
    CONSTRAINT inventory_reserved_qty_check CHECK ((reserved_qty >= 0))
);


ALTER TABLE public.inventory OWNER TO postgres;

--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_movements (
    movement_id bigint NOT NULL,
    warehouse_id integer NOT NULL,
    variant_id bigint NOT NULL,
    change_qty integer NOT NULL,
    reason character varying(30) NOT NULL,
    reference_id bigint,
    staff_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT inventory_movements_reason_check CHECK (((reason)::text = ANY ((ARRAY['purchase'::character varying, 'sale'::character varying, 'return'::character varying, 'adjustment'::character varying, 'damaged'::character varying, 'import'::character varying, 'export'::character varying, 'reserve'::character varying, 'release'::character varying, 'consume'::character varying])::text[])))
);


ALTER TABLE public.inventory_movements OWNER TO postgres;

--
-- Name: inventory_movements_movement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_movements_movement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_movements_movement_id_seq OWNER TO postgres;

--
-- Name: inventory_movements_movement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_movements_movement_id_seq OWNED BY public.inventory_movements.movement_id;


--
-- Name: inventory_reservation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_reservation (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    variant_id bigint NOT NULL,
    warehouse_id integer NOT NULL,
    flash_sale_item_id bigint,
    quantity integer NOT NULL,
    status character varying(20) DEFAULT 'RESERVED'::character varying NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.inventory_reservation OWNER TO postgres;

--
-- Name: inventory_reservation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_reservation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_reservation_id_seq OWNER TO postgres;

--
-- Name: inventory_reservation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_reservation_id_seq OWNED BY public.inventory_reservation.id;


--
-- Name: membership_tiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.membership_tiers (
    tier_id integer NOT NULL,
    code character varying(30) NOT NULL,
    name character varying(100) NOT NULL,
    min_annual_spend numeric(14,2) DEFAULT 0 NOT NULL,
    discount_percent numeric(5,2) DEFAULT 0 NOT NULL,
    requires_verification boolean DEFAULT false NOT NULL,
    description text,
    CONSTRAINT membership_tiers_discount_percent_check CHECK (((discount_percent >= (0)::numeric) AND (discount_percent <= (100)::numeric)))
);


ALTER TABLE public.membership_tiers OWNER TO postgres;

--
-- Name: membership_tiers_tier_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.membership_tiers_tier_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.membership_tiers_tier_id_seq OWNER TO postgres;

--
-- Name: membership_tiers_tier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.membership_tiers_tier_id_seq OWNED BY public.membership_tiers.tier_id;


--
-- Name: order_invoice_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_invoice_info (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    tax_code character varying(50) NOT NULL,
    company_name character varying(255) NOT NULL,
    company_address character varying(255) NOT NULL,
    company_email character varying(150),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.order_invoice_info OWNER TO postgres;

--
-- Name: order_invoice_info_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_invoice_info_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_invoice_info_id_seq OWNER TO postgres;

--
-- Name: order_invoice_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_invoice_info_id_seq OWNED BY public.order_invoice_info.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    order_item_id bigint NOT NULL,
    order_id bigint NOT NULL,
    variant_id bigint NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(14,2) NOT NULL,
    unit_cost numeric(14,2) NOT NULL,
    line_total numeric(14,2) GENERATED ALWAYS AS (((quantity)::numeric * unit_price)) STORED,
    product_name_snapshot character varying(255),
    product_image_snapshot character varying(500),
    original_price numeric(14,2) DEFAULT 0,
    sale_price numeric(14,2) DEFAULT 0,
    flash_sale_item_id bigint,
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT order_items_unit_cost_check CHECK ((unit_cost >= (0)::numeric)),
    CONSTRAINT order_items_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_items_order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_order_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_order_item_id_seq OWNER TO postgres;

--
-- Name: order_items_order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_order_item_id_seq OWNED BY public.order_items.order_item_id;


--
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_status_history (
    history_id bigint NOT NULL,
    order_id bigint NOT NULL,
    old_status public.order_status,
    new_status public.order_status NOT NULL,
    changed_by integer,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    note text
);


ALTER TABLE public.order_status_history OWNER TO postgres;

--
-- Name: order_status_history_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_status_history_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_status_history_history_id_seq OWNER TO postgres;

--
-- Name: order_status_history_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_status_history_history_id_seq OWNED BY public.order_status_history.history_id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    order_id bigint NOT NULL,
    customer_id bigint NOT NULL,
    address_id bigint,
    coupon_id integer,
    staff_id integer,
    order_date timestamp with time zone DEFAULT now() NOT NULL,
    status public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
    subtotal numeric(14,2) DEFAULT 0 NOT NULL,
    discount_amount numeric(14,2) DEFAULT 0 NOT NULL,
    shipping_fee numeric(14,2) DEFAULT 0 NOT NULL,
    total_amount numeric(14,2) DEFAULT 0 NOT NULL,
    note text,
    channel character varying(20) DEFAULT 'web'::character varying NOT NULL,
    order_code character varying(50) NOT NULL,
    receive_type character varying(20) DEFAULT 'STORE_PICKUP'::character varying NOT NULL,
    store_id integer,
    shipping_province character varying(100),
    shipping_district character varying(100),
    shipping_ward character varying(100),
    shipping_street character varying(255),
    customer_name character varying(150),
    customer_phone character varying(20),
    customer_email character varying(150),
    need_invoice boolean DEFAULT false NOT NULL,
    payment_method character varying(50) DEFAULT 'STORE'::character varying NOT NULL,
    voucher_discount numeric(14,2) DEFAULT 0 NOT NULL,
    expires_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT orders_channel_check CHECK (((channel)::text = ANY ((ARRAY['web'::character varying, 'mobile'::character varying, 'facebook'::character varying, 'shopee'::character varying, 'tiktok'::character varying])::text[]))),
    CONSTRAINT orders_total_amount_check CHECK ((total_amount >= (0)::numeric))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_order_id_seq OWNER TO postgres;

--
-- Name: orders_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_order_id_seq OWNED BY public.orders.order_id;


--
-- Name: payment_method_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_method_config (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    icon character varying(255),
    description character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.payment_method_config OWNER TO postgres;

--
-- Name: payment_method_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_method_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_method_config_id_seq OWNER TO postgres;

--
-- Name: payment_method_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_method_config_id_seq OWNED BY public.payment_method_config.id;


--
-- Name: payment_offers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_offers (
    offer_id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    payment_method public.payment_method,
    bank_name character varying(80),
    discount_type public.discount_type NOT NULL,
    discount_value numeric(14,2) NOT NULL,
    max_discount numeric(14,2),
    min_order_amount numeric(14,2) DEFAULT 0 NOT NULL,
    image_url character varying(500),
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    CONSTRAINT payment_offers_check CHECK ((ends_at > starts_at)),
    CONSTRAINT payment_offers_discount_value_check CHECK ((discount_value > (0)::numeric))
);


ALTER TABLE public.payment_offers OWNER TO postgres;

--
-- Name: payment_offers_offer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_offers_offer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_offers_offer_id_seq OWNER TO postgres;

--
-- Name: payment_offers_offer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_offers_offer_id_seq OWNED BY public.payment_offers.offer_id;


--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_transactions (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    payment_method character varying(50) NOT NULL,
    provider character varying(50) NOT NULL,
    amount numeric(14,2) NOT NULL,
    currency character varying(10) DEFAULT 'VND'::character varying NOT NULL,
    status character varying(30) DEFAULT 'INITIATED'::character varying NOT NULL,
    provider_txn_ref character varying(100) NOT NULL,
    provider_transaction_no character varying(100),
    request_payload text,
    callback_payload text,
    created_at timestamp with time zone DEFAULT now(),
    paid_at timestamp with time zone,
    expired_at timestamp with time zone
);


ALTER TABLE public.payment_transactions OWNER TO postgres;

--
-- Name: payment_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_transactions_id_seq OWNER TO postgres;

--
-- Name: payment_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_transactions_id_seq OWNED BY public.payment_transactions.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    payment_id bigint NOT NULL,
    order_id bigint NOT NULL,
    method public.payment_method NOT NULL,
    status public.payment_status DEFAULT 'unpaid'::public.payment_status NOT NULL,
    amount numeric(14,2) NOT NULL,
    transaction_ref character varying(100),
    paid_at timestamp with time zone,
    CONSTRAINT payments_amount_check CHECK ((amount >= (0)::numeric))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_payment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_payment_id_seq OWNER TO postgres;

--
-- Name: payments_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_payment_id_seq OWNED BY public.payments.payment_id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    permission_code character varying(60) NOT NULL,
    description character varying(255) NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: product_bundles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_bundles (
    bundle_id integer NOT NULL,
    main_product_id bigint NOT NULL,
    bundled_variant_id bigint NOT NULL,
    discount_type public.discount_type NOT NULL,
    discount_value numeric(14,2) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    CONSTRAINT product_bundles_check CHECK (((starts_at IS NULL) OR (ends_at IS NULL) OR (ends_at > starts_at))),
    CONSTRAINT product_bundles_discount_value_check CHECK ((discount_value > (0)::numeric))
);


ALTER TABLE public.product_bundles OWNER TO postgres;

--
-- Name: product_bundles_bundle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_bundles_bundle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_bundles_bundle_id_seq OWNER TO postgres;

--
-- Name: product_bundles_bundle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_bundles_bundle_id_seq OWNED BY public.product_bundles.bundle_id;


--
-- Name: product_commitments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_commitments (
    commitment_id integer NOT NULL,
    category_id integer,
    title character varying(150) NOT NULL,
    content text NOT NULL,
    icon_url character varying(500),
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.product_commitments OWNER TO postgres;

--
-- Name: product_commitments_commitment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_commitments_commitment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_commitments_commitment_id_seq OWNER TO postgres;

--
-- Name: product_commitments_commitment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_commitments_commitment_id_seq OWNED BY public.product_commitments.commitment_id;


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    image_id bigint NOT NULL,
    product_id bigint NOT NULL,
    url character varying(500) NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- Name: product_images_image_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_images_image_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_images_image_id_seq OWNER TO postgres;

--
-- Name: product_images_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_images_image_id_seq OWNED BY public.product_images.image_id;


--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    variant_id bigint NOT NULL,
    product_id bigint NOT NULL,
    sku character varying(60) NOT NULL,
    attributes jsonb DEFAULT '{}'::jsonb NOT NULL,
    cost_price numeric(14,2) NOT NULL,
    sale_price numeric(14,2) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    CONSTRAINT product_variants_cost_price_check CHECK ((cost_price >= (0)::numeric)),
    CONSTRAINT product_variants_sale_price_check CHECK ((sale_price >= (0)::numeric)),
    CONSTRAINT product_variants_sale_price_check1 CHECK ((sale_price >= (0)::numeric))
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- Name: product_variants_variant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_variants_variant_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_variants_variant_id_seq OWNER TO postgres;

--
-- Name: product_variants_variant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_variants_variant_id_seq OWNED BY public.product_variants.variant_id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    product_id bigint NOT NULL,
    category_id integer NOT NULL,
    brand_id integer,
    supplier_id integer,
    name character varying(255) NOT NULL,
    slug character varying(280) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    series_id integer,
    model_code character varying(120),
    specs jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_hot boolean DEFAULT false NOT NULL,
    is_new boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_product_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_product_id_seq OWNER TO postgres;

--
-- Name: products_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_product_id_seq OWNED BY public.products.product_id;


--
-- Name: promotion_targets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_targets (
    target_id integer NOT NULL,
    promotion_id integer NOT NULL,
    variant_id bigint,
    product_id bigint,
    category_id integer,
    brand_id integer,
    CONSTRAINT promotion_targets_check CHECK ((((num_nonnulls(variant_id, product_id) = 1) AND (category_id IS NULL) AND (brand_id IS NULL)) OR ((variant_id IS NULL) AND (product_id IS NULL) AND (num_nonnulls(category_id, brand_id) >= 1))))
);


ALTER TABLE public.promotion_targets OWNER TO postgres;

--
-- Name: promotion_targets_target_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotion_targets_target_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promotion_targets_target_id_seq OWNER TO postgres;

--
-- Name: promotion_targets_target_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotion_targets_target_id_seq OWNED BY public.promotion_targets.target_id;


--
-- Name: promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotions (
    promotion_id integer NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    kind public.promotion_kind DEFAULT 'discount'::public.promotion_kind NOT NULL,
    discount_type public.discount_type,
    discount_value numeric(14,2),
    max_discount numeric(14,2),
    gift_text character varying(255),
    required_tier_id integer,
    priority integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT promotions_check CHECK ((ends_at > starts_at)),
    CONSTRAINT promotions_check1 CHECK (((kind <> 'discount'::public.promotion_kind) OR ((discount_type IS NOT NULL) AND (discount_value > (0)::numeric)))),
    CONSTRAINT promotions_check2 CHECK (((discount_type IS DISTINCT FROM 'percent'::public.discount_type) OR (discount_value IS NULL) OR (discount_value <= (100)::numeric)))
);


ALTER TABLE public.promotions OWNER TO postgres;

--
-- Name: promotions_promotion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotions_promotion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promotions_promotion_id_seq OWNER TO postgres;

--
-- Name: promotions_promotion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotions_promotion_id_seq OWNED BY public.promotions.promotion_id;


--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_items (
    po_item_id bigint NOT NULL,
    po_id bigint NOT NULL,
    variant_id bigint NOT NULL,
    quantity integer NOT NULL,
    unit_cost numeric(14,2) NOT NULL,
    received_qty integer DEFAULT 0 NOT NULL,
    line_total numeric(14,2) GENERATED ALWAYS AS (((quantity)::numeric * unit_cost)) STORED,
    CONSTRAINT purchase_order_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT purchase_order_items_received_qty_check CHECK ((received_qty >= 0)),
    CONSTRAINT purchase_order_items_unit_cost_check CHECK ((unit_cost >= (0)::numeric))
);


ALTER TABLE public.purchase_order_items OWNER TO postgres;

--
-- Name: purchase_order_items_po_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchase_order_items_po_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_order_items_po_item_id_seq OWNER TO postgres;

--
-- Name: purchase_order_items_po_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_order_items_po_item_id_seq OWNED BY public.purchase_order_items.po_item_id;


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_orders (
    po_id bigint NOT NULL,
    supplier_id integer NOT NULL,
    warehouse_id integer NOT NULL,
    created_by integer,
    status public.po_status DEFAULT 'draft'::public.po_status NOT NULL,
    ordered_at timestamp with time zone,
    expected_at date,
    received_at timestamp with time zone,
    total_amount numeric(14,2) DEFAULT 0 NOT NULL,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: purchase_orders_po_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchase_orders_po_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_orders_po_id_seq OWNER TO postgres;

--
-- Name: purchase_orders_po_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_orders_po_id_seq OWNED BY public.purchase_orders.po_id;


--
-- Name: returns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.returns (
    return_id bigint NOT NULL,
    order_item_id bigint NOT NULL,
    quantity integer NOT NULL,
    reason character varying(255),
    refund_amount numeric(14,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT returns_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.returns OWNER TO postgres;

--
-- Name: returns_return_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.returns_return_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.returns_return_id_seq OWNER TO postgres;

--
-- Name: returns_return_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.returns_return_id_seq OWNED BY public.returns.return_id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    review_id bigint NOT NULL,
    product_id bigint NOT NULL,
    customer_id bigint NOT NULL,
    rating smallint NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_verified_purchase boolean DEFAULT false,
    status character varying(20) DEFAULT 'APPROVED'::character varying,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_review_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_review_id_seq OWNER TO postgres;

--
-- Name: reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public.reviews.review_id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role public.staff_role NOT NULL,
    permission_code character varying(60) NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: sales_targets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_targets (
    staff_id integer NOT NULL,
    month date NOT NULL,
    target_revenue numeric(14,2) NOT NULL,
    CONSTRAINT sales_targets_month_check CHECK ((month = (date_trunc('month'::text, (month)::timestamp with time zone))::date)),
    CONSTRAINT sales_targets_target_revenue_check CHECK ((target_revenue >= (0)::numeric))
);


ALTER TABLE public.sales_targets OWNER TO postgres;

--
-- Name: series; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.series (
    series_id integer NOT NULL,
    brand_id integer NOT NULL,
    name character varying(120) NOT NULL,
    slug character varying(150) NOT NULL
);


ALTER TABLE public.series OWNER TO postgres;

--
-- Name: series_series_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.series_series_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.series_series_id_seq OWNER TO postgres;

--
-- Name: series_series_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.series_series_id_seq OWNED BY public.series.series_id;


--
-- Name: shipments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipments (
    shipment_id bigint NOT NULL,
    order_id bigint NOT NULL,
    carrier character varying(60) NOT NULL,
    tracking_number character varying(80),
    status public.shipment_status DEFAULT 'preparing'::public.shipment_status NOT NULL,
    shipped_at timestamp with time zone,
    delivered_at timestamp with time zone
);


ALTER TABLE public.shipments OWNER TO postgres;

--
-- Name: shipments_shipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shipments_shipment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shipments_shipment_id_seq OWNER TO postgres;

--
-- Name: shipments_shipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shipments_shipment_id_seq OWNED BY public.shipments.shipment_id;


--
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    staff_id integer NOT NULL,
    full_name character varying(150) NOT NULL,
    email character varying(150) NOT NULL,
    role public.staff_role NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    hired_at date DEFAULT CURRENT_DATE NOT NULL,
    phone character varying(20),
    password_hash character varying(255),
    last_login_at timestamp with time zone
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- Name: staff_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_staff_id_seq OWNER TO postgres;

--
-- Name: staff_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_staff_id_seq OWNED BY public.staff.staff_id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    supplier_id integer NOT NULL,
    name character varying(150) NOT NULL,
    contact_name character varying(120),
    phone character varying(20),
    email character varying(150),
    address character varying(255)
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: suppliers_supplier_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.suppliers_supplier_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suppliers_supplier_id_seq OWNER TO postgres;

--
-- Name: suppliers_supplier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suppliers_supplier_id_seq OWNED BY public.suppliers.supplier_id;


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.support_tickets (
    ticket_id bigint NOT NULL,
    customer_id bigint NOT NULL,
    order_id bigint,
    assigned_to integer,
    subject character varying(200) NOT NULL,
    description text,
    status public.ticket_status DEFAULT 'open'::public.ticket_status NOT NULL,
    priority public.ticket_priority DEFAULT 'normal'::public.ticket_priority NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone
);


ALTER TABLE public.support_tickets OWNER TO postgres;

--
-- Name: support_tickets_ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.support_tickets_ticket_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.support_tickets_ticket_id_seq OWNER TO postgres;

--
-- Name: support_tickets_ticket_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.support_tickets_ticket_id_seq OWNED BY public.support_tickets.ticket_id;


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_settings (
    setting_key character varying(80) NOT NULL,
    value text NOT NULL,
    description character varying(255),
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.system_settings OWNER TO postgres;

--
-- Name: v_active_bundles; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_active_bundles AS
 SELECT b.bundle_id,
    b.main_product_id,
    b.bundled_variant_id,
    p.name AS bundled_product_name,
    v.sku,
    v.sale_price AS original_price,
        CASE b.discount_type
            WHEN 'percent'::public.discount_type THEN GREATEST(round((v.sale_price * ((1)::numeric - (b.discount_value / (100)::numeric)))), (0)::numeric)
            ELSE GREATEST((v.sale_price - b.discount_value), (0)::numeric)
        END AS bundle_price,
    b.discount_type,
    b.discount_value,
    b.sort_order
   FROM ((public.product_bundles b
     JOIN public.product_variants v ON (((v.variant_id = b.bundled_variant_id) AND v.is_active)))
     JOIN public.products p ON (((p.product_id = v.product_id) AND p.is_active)))
  WHERE (b.is_active AND ((b.starts_at IS NULL) OR (b.starts_at <= now())) AND ((b.ends_at IS NULL) OR (b.ends_at > now())));


ALTER VIEW public.v_active_bundles OWNER TO postgres;

--
-- Name: v_coupon_effectiveness; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_coupon_effectiveness AS
 SELECT c.coupon_id,
    c.code,
    c.type,
    c.value,
    count(o.order_id) AS orders_used,
    COALESCE(sum(o.discount_amount), (0)::numeric) AS total_discount_given,
    COALESCE(sum(o.total_amount), (0)::numeric) AS revenue_generated
   FROM (public.coupons c
     LEFT JOIN public.orders o ON (((o.coupon_id = c.coupon_id) AND (o.status = 'completed'::public.order_status))))
  GROUP BY c.coupon_id, c.code, c.type, c.value;


ALTER VIEW public.v_coupon_effectiveness OWNER TO postgres;

--
-- Name: v_customer_rfm; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_customer_rfm AS
 WITH base AS (
         SELECT orders.customer_id,
            (CURRENT_DATE - (max(orders.order_date))::date) AS recency_days,
            count(*) AS frequency,
            sum(orders.total_amount) AS monetary
           FROM public.orders
          WHERE (orders.status = 'completed'::public.order_status)
          GROUP BY orders.customer_id
        ), scored AS (
         SELECT base.customer_id,
            base.recency_days,
            base.frequency,
            base.monetary,
            ntile(5) OVER (ORDER BY base.recency_days DESC) AS r,
            ntile(5) OVER (ORDER BY base.frequency) AS f,
            ntile(5) OVER (ORDER BY base.monetary) AS m
           FROM base
        )
 SELECT s.customer_id,
    s.recency_days,
    s.frequency,
    s.monetary,
    s.r,
    s.f,
    s.m,
    c.full_name,
    c.email,
        CASE
            WHEN ((s.r >= 4) AND (s.f >= 4) AND (s.m >= 4)) THEN 'VIP'::text
            WHEN ((s.r >= 3) AND (s.f >= 3)) THEN 'Trung thành'::text
            WHEN ((s.r <= 2) AND (s.f >= 3)) THEN 'Có nguy cơ rời bỏ'::text
            WHEN ((s.r >= 4) AND (s.f <= 2)) THEN 'Khách mới'::text
            ELSE 'Thông thường'::text
        END AS segment
   FROM (scored s
     JOIN public.customers c USING (customer_id));


ALTER VIEW public.v_customer_rfm OWNER TO postgres;

--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouses (
    warehouse_id integer NOT NULL,
    name character varying(120) NOT NULL,
    address character varying(255),
    is_store boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    province character varying(100),
    district character varying(100),
    ward character varying(100),
    phone character varying(20),
    latitude numeric(9,6),
    longitude numeric(9,6),
    open_hours character varying(100),
    is_regional_hub boolean DEFAULT false NOT NULL,
    region character varying(20)
);


ALTER TABLE public.warehouses OWNER TO postgres;

--
-- Name: v_low_stock; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_low_stock AS
 SELECT w.name AS warehouse,
    p.name AS product,
    v.sku,
    i.quantity,
    i.reserved_qty,
    (i.quantity - i.reserved_qty) AS available,
    i.reorder_level
   FROM (((public.inventory i
     JOIN public.warehouses w ON ((w.warehouse_id = i.warehouse_id)))
     JOIN public.product_variants v ON ((v.variant_id = i.variant_id)))
     JOIN public.products p ON ((p.product_id = v.product_id)))
  WHERE ((i.quantity - i.reserved_qty) <= i.reorder_level);


ALTER VIEW public.v_low_stock OWNER TO postgres;

--
-- Name: v_dashboard_today; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_dashboard_today AS
 SELECT ( SELECT count(*) AS count
           FROM public.orders
          WHERE ((orders.order_date)::date = CURRENT_DATE)) AS orders_today,
    ( SELECT COALESCE(sum(orders.total_amount), (0)::numeric) AS "coalesce"
           FROM public.orders
          WHERE (((orders.order_date)::date = CURRENT_DATE) AND (orders.status <> ALL (ARRAY['cancelled'::public.order_status, 'returned'::public.order_status])))) AS revenue_today,
    ( SELECT count(*) AS count
           FROM public.customers
          WHERE ((customers.created_at)::date = CURRENT_DATE)) AS new_customers_today,
    ( SELECT count(*) AS count
           FROM public.orders
          WHERE (orders.status = ANY (ARRAY['pending'::public.order_status, 'confirmed'::public.order_status, 'processing'::public.order_status]))) AS orders_to_handle,
    ( SELECT count(*) AS count
           FROM public.v_low_stock) AS low_stock_items,
    ( SELECT count(*) AS count
           FROM public.support_tickets
          WHERE (support_tickets.status = ANY (ARRAY['open'::public.ticket_status, 'in_progress'::public.ticket_status]))) AS open_tickets;


ALTER VIEW public.v_dashboard_today OWNER TO postgres;

--
-- Name: v_inventory_value; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_inventory_value AS
 SELECT w.warehouse_id,
    w.name AS warehouse,
    sum(i.quantity) AS total_units,
    sum(((i.quantity)::numeric * v.cost_price)) AS cost_value,
    sum(((i.quantity)::numeric * v.sale_price)) AS retail_value
   FROM ((public.inventory i
     JOIN public.warehouses w ON ((w.warehouse_id = i.warehouse_id)))
     JOIN public.product_variants v ON ((v.variant_id = i.variant_id)))
  GROUP BY w.warehouse_id, w.name;


ALTER VIEW public.v_inventory_value OWNER TO postgres;

--
-- Name: v_monthly_revenue; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_monthly_revenue AS
 SELECT (date_trunc('month'::text, o.order_date))::date AS month,
    count(DISTINCT o.order_id) AS total_orders,
    count(DISTINCT o.customer_id) AS total_customers,
    sum(o.total_amount) AS revenue,
    sum(((oi.quantity)::numeric * (oi.unit_price - oi.unit_cost))) AS gross_profit
   FROM (public.orders o
     JOIN public.order_items oi ON ((oi.order_id = o.order_id)))
  WHERE (o.status = 'completed'::public.order_status)
  GROUP BY ((date_trunc('month'::text, o.order_date))::date);


ALTER VIEW public.v_monthly_revenue OWNER TO postgres;

--
-- Name: v_pending_orders; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_pending_orders AS
 SELECT o.order_id,
    o.order_date,
    o.status,
    o.total_amount,
    o.channel,
    c.full_name AS customer,
    c.phone,
    round((EXTRACT(epoch FROM (now() - o.order_date)) / (3600)::numeric), 1) AS waiting_hours,
    COALESCE((p.status)::text, 'unpaid'::text) AS payment_status
   FROM ((public.orders o
     JOIN public.customers c ON ((c.customer_id = o.customer_id)))
     LEFT JOIN LATERAL ( SELECT payments.status
           FROM public.payments
          WHERE (payments.order_id = o.order_id)
          ORDER BY payments.payment_id DESC
         LIMIT 1) p ON (true))
  WHERE (o.status = ANY (ARRAY['pending'::public.order_status, 'confirmed'::public.order_status, 'processing'::public.order_status]))
  ORDER BY o.order_date;


ALTER VIEW public.v_pending_orders OWNER TO postgres;

--
-- Name: v_product_return_rate; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_product_return_rate AS
 WITH sold AS (
         SELECT v.product_id,
            sum(oi.quantity) AS units_sold
           FROM ((public.order_items oi
             JOIN public.orders o ON (((o.order_id = oi.order_id) AND (o.status = ANY (ARRAY['completed'::public.order_status, 'returned'::public.order_status])))))
             JOIN public.product_variants v ON ((v.variant_id = oi.variant_id)))
          GROUP BY v.product_id
        ), returned AS (
         SELECT v.product_id,
            sum(r_1.quantity) AS units_returned
           FROM ((public.returns r_1
             JOIN public.order_items oi ON ((oi.order_item_id = r_1.order_item_id)))
             JOIN public.product_variants v ON ((v.variant_id = oi.variant_id)))
          GROUP BY v.product_id
        )
 SELECT p.product_id,
    p.name AS product,
    s.units_sold,
    COALESCE(r.units_returned, (0)::bigint) AS units_returned,
    round(((100.0 * (COALESCE(r.units_returned, (0)::bigint))::numeric) / (NULLIF(s.units_sold, 0))::numeric), 2) AS return_rate_pct
   FROM ((sold s
     JOIN public.products p ON ((p.product_id = s.product_id)))
     LEFT JOIN returned r ON ((r.product_id = s.product_id)))
  ORDER BY (round(((100.0 * (COALESCE(r.units_returned, (0)::bigint))::numeric) / (NULLIF(s.units_sold, 0))::numeric), 2)) DESC NULLS LAST;


ALTER VIEW public.v_product_return_rate OWNER TO postgres;

--
-- Name: v_product_sales; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_product_sales AS
 SELECT p.product_id,
    p.name AS product_name,
    c.name AS category,
    sum(oi.quantity) AS units_sold,
    sum(oi.line_total) AS revenue,
    sum(((oi.quantity)::numeric * (oi.unit_price - oi.unit_cost))) AS profit
   FROM ((((public.order_items oi
     JOIN public.orders o ON (((o.order_id = oi.order_id) AND (o.status = 'completed'::public.order_status))))
     JOIN public.product_variants v ON ((v.variant_id = oi.variant_id)))
     JOIN public.products p ON ((p.product_id = v.product_id)))
     JOIN public.categories c ON ((c.category_id = p.category_id)))
  GROUP BY p.product_id, p.name, c.name;


ALTER VIEW public.v_product_sales OWNER TO postgres;

--
-- Name: v_profit_loss_monthly; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_profit_loss_monthly AS
 WITH sales AS (
         SELECT (date_trunc('month'::text, orders.order_date))::date AS month,
            sum((orders.subtotal - orders.discount_amount)) AS net_sales
           FROM public.orders
          WHERE (orders.status = 'completed'::public.order_status)
          GROUP BY ((date_trunc('month'::text, orders.order_date))::date)
        ), cogs AS (
         SELECT (date_trunc('month'::text, o.order_date))::date AS month,
            sum(((oi.quantity)::numeric * oi.unit_cost)) AS cogs
           FROM (public.orders o
             JOIN public.order_items oi ON ((oi.order_id = o.order_id)))
          WHERE (o.status = 'completed'::public.order_status)
          GROUP BY ((date_trunc('month'::text, o.order_date))::date)
        ), opex AS (
         SELECT (date_trunc('month'::text, (expenses.expense_date)::timestamp with time zone))::date AS month,
            sum(expenses.amount) AS operating_expenses
           FROM public.expenses
          GROUP BY ((date_trunc('month'::text, (expenses.expense_date)::timestamp with time zone))::date)
        ), months AS (
         SELECT sales.month
           FROM sales
        UNION
         SELECT cogs.month
           FROM cogs
        UNION
         SELECT opex.month
           FROM opex
        )
 SELECT m.month,
    COALESCE(s.net_sales, (0)::numeric) AS net_sales,
    COALESCE(c.cogs, (0)::numeric) AS cogs,
    (COALESCE(s.net_sales, (0)::numeric) - COALESCE(c.cogs, (0)::numeric)) AS gross_profit,
    COALESCE(e.operating_expenses, (0)::numeric) AS operating_expenses,
    ((COALESCE(s.net_sales, (0)::numeric) - COALESCE(c.cogs, (0)::numeric)) - COALESCE(e.operating_expenses, (0)::numeric)) AS net_profit
   FROM (((months m
     LEFT JOIN sales s USING (month))
     LEFT JOIN cogs c USING (month))
     LEFT JOIN opex e USING (month))
  ORDER BY m.month;


ALTER VIEW public.v_profit_loss_monthly OWNER TO postgres;

--
-- Name: v_slow_moving_stock; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_slow_moving_stock AS
 WITH stock AS (
         SELECT inventory.variant_id,
            sum(inventory.quantity) AS stock
           FROM public.inventory
          GROUP BY inventory.variant_id
        ), last_sold AS (
         SELECT oi.variant_id,
            max(o.order_date) AS last_sold_at
           FROM (public.order_items oi
             JOIN public.orders o ON (((o.order_id = oi.order_id) AND (o.status = 'completed'::public.order_status))))
          GROUP BY oi.variant_id
        )
 SELECT v.variant_id,
    v.sku,
    p.name AS product,
    s.stock,
    ((s.stock)::numeric * v.cost_price) AS tied_up_capital,
    l.last_sold_at
   FROM (((stock s
     JOIN public.product_variants v ON ((v.variant_id = s.variant_id)))
     JOIN public.products p ON ((p.product_id = v.product_id)))
     LEFT JOIN last_sold l ON ((l.variant_id = s.variant_id)))
  WHERE ((s.stock > 0) AND ((l.last_sold_at IS NULL) OR (l.last_sold_at < (now() - '60 days'::interval))))
  ORDER BY ((s.stock)::numeric * v.cost_price) DESC;


ALTER VIEW public.v_slow_moving_stock OWNER TO postgres;

--
-- Name: v_staff_performance; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_staff_performance AS
 WITH perf AS (
         SELECT orders.staff_id,
            (date_trunc('month'::text, orders.order_date))::date AS month,
            count(*) AS orders_completed,
            sum(orders.total_amount) AS revenue
           FROM public.orders
          WHERE ((orders.status = 'completed'::public.order_status) AND (orders.staff_id IS NOT NULL))
          GROUP BY orders.staff_id, ((date_trunc('month'::text, orders.order_date))::date)
        )
 SELECT s.staff_id,
    s.full_name,
    p.month,
    p.orders_completed,
    p.revenue,
    t.target_revenue,
    round(((100.0 * p.revenue) / NULLIF(t.target_revenue, (0)::numeric)), 2) AS achievement_pct
   FROM ((perf p
     JOIN public.staff s USING (staff_id))
     LEFT JOIN public.sales_targets t ON (((t.staff_id = p.staff_id) AND (t.month = p.month))));


ALTER VIEW public.v_staff_performance OWNER TO postgres;

--
-- Name: v_store_availability; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_store_availability AS
 SELECT w.warehouse_id,
    w.name AS store_name,
    w.address,
    w.province,
    w.district,
    w.ward,
    w.phone,
    w.latitude,
    w.longitude,
    w.open_hours,
    i.variant_id,
    (i.quantity - i.reserved_qty) AS available_qty
   FROM (public.warehouses w
     JOIN public.inventory i ON ((i.warehouse_id = w.warehouse_id)))
  WHERE (w.is_store AND w.is_active AND ((i.quantity - i.reserved_qty) > 0));


ALTER VIEW public.v_store_availability OWNER TO postgres;

--
-- Name: v_supplier_purchases; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_supplier_purchases AS
 SELECT s.supplier_id,
    s.name AS supplier,
    count(po.po_id) AS total_pos,
    COALESCE(sum(po.total_amount), (0)::numeric) AS total_purchased,
    max(po.received_at) AS last_received_at
   FROM (public.suppliers s
     LEFT JOIN public.purchase_orders po ON (((po.supplier_id = s.supplier_id) AND (po.status = 'received'::public.po_status))))
  GROUP BY s.supplier_id, s.name;


ALTER VIEW public.v_supplier_purchases OWNER TO postgres;

--
-- Name: v_support_performance; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_support_performance AS
 SELECT s.staff_id,
    s.full_name,
    count(*) AS total_tickets,
    count(*) FILTER (WHERE (t.status = ANY (ARRAY['resolved'::public.ticket_status, 'closed'::public.ticket_status]))) AS resolved,
    round(avg((EXTRACT(epoch FROM (t.resolved_at - t.created_at)) / (3600)::numeric)) FILTER (WHERE (t.resolved_at IS NOT NULL)), 1) AS avg_resolve_hours
   FROM (public.support_tickets t
     JOIN public.staff s ON ((s.staff_id = t.assigned_to)))
  GROUP BY s.staff_id, s.full_name;


ALTER VIEW public.v_support_performance OWNER TO postgres;

--
-- Name: voucher_usage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.voucher_usage (
    id bigint NOT NULL,
    coupon_id integer NOT NULL,
    customer_id bigint NOT NULL,
    order_id bigint NOT NULL,
    discount_amount numeric(14,2) NOT NULL,
    status character varying(20) DEFAULT 'RESERVED'::character varying NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.voucher_usage OWNER TO postgres;

--
-- Name: voucher_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.voucher_usage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.voucher_usage_id_seq OWNER TO postgres;

--
-- Name: voucher_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.voucher_usage_id_seq OWNED BY public.voucher_usage.id;


--
-- Name: warehouses_warehouse_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.warehouses_warehouse_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.warehouses_warehouse_id_seq OWNER TO postgres;

--
-- Name: warehouses_warehouse_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.warehouses_warehouse_id_seq OWNED BY public.warehouses.warehouse_id;


--
-- Name: warranty_plans_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.warranty_plans_plan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.warranty_plans_plan_id_seq OWNER TO postgres;

--
-- Name: warranty_plans_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.warranty_plans_plan_id_seq OWNED BY public.warranty_plans.plan_id;


--
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlist_items (
    wishlist_item_id bigint NOT NULL,
    customer_id bigint NOT NULL,
    product_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.wishlist_items OWNER TO postgres;

--
-- Name: wishlist_items_wishlist_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wishlist_items_wishlist_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wishlist_items_wishlist_item_id_seq OWNER TO postgres;

--
-- Name: wishlist_items_wishlist_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wishlist_items_wishlist_item_id_seq OWNED BY public.wishlist_items.wishlist_item_id;


--
-- Name: audit_logs log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN log_id SET DEFAULT nextval('public.audit_logs_log_id_seq'::regclass);


--
-- Name: banners id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners ALTER COLUMN id SET DEFAULT nextval('public.banners_id_seq'::regclass);


--
-- Name: brands brand_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands ALTER COLUMN brand_id SET DEFAULT nextval('public.brands_brand_id_seq'::regclass);


--
-- Name: carts cart_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts ALTER COLUMN cart_id SET DEFAULT nextval('public.carts_cart_id_seq'::regclass);


--
-- Name: categories category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN category_id SET DEFAULT nextval('public.categories_category_id_seq'::regclass);


--
-- Name: category_attributes attr_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_attributes ALTER COLUMN attr_id SET DEFAULT nextval('public.category_attributes_attr_id_seq'::regclass);


--
-- Name: checkout_idempotency id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkout_idempotency ALTER COLUMN id SET DEFAULT nextval('public.checkout_idempotency_id_seq'::regclass);


--
-- Name: coupons coupon_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons ALTER COLUMN coupon_id SET DEFAULT nextval('public.coupons_coupon_id_seq'::regclass);


--
-- Name: customer_addresses address_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses ALTER COLUMN address_id SET DEFAULT nextval('public.customer_addresses_address_id_seq'::regclass);


--
-- Name: customers customer_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN customer_id SET DEFAULT nextval('public.customers_customer_id_seq'::regclass);


--
-- Name: expenses expense_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses ALTER COLUMN expense_id SET DEFAULT nextval('public.expenses_expense_id_seq'::regclass);


--
-- Name: flash_sale_audit_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_audit_log ALTER COLUMN id SET DEFAULT nextval('public.flash_sale_audit_log_id_seq'::regclass);


--
-- Name: flash_sale_campaign campaign_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_campaign ALTER COLUMN campaign_id SET DEFAULT nextval('public.flash_sale_campaign_campaign_id_seq'::regclass);


--
-- Name: flash_sale_item item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_item ALTER COLUMN item_id SET DEFAULT nextval('public.flash_sale_item_item_id_seq'::regclass);


--
-- Name: flash_sale_purchases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_purchases ALTER COLUMN id SET DEFAULT nextval('public.flash_sale_purchases_id_seq'::regclass);


--
-- Name: flash_sale_slot_products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_slot_products ALTER COLUMN id SET DEFAULT nextval('public.flash_sale_slot_products_id_seq'::regclass);


--
-- Name: flash_sale_slots id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_slots ALTER COLUMN id SET DEFAULT nextval('public.flash_sale_slots_id_seq'::regclass);


--
-- Name: flash_sale_time_slot slot_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_time_slot ALTER COLUMN slot_id SET DEFAULT nextval('public.flash_sale_time_slot_slot_id_seq'::regclass);


--
-- Name: flash_sale_user_purchase purchase_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_user_purchase ALTER COLUMN purchase_id SET DEFAULT nextval('public.flash_sale_user_purchase_purchase_id_seq'::regclass);


--
-- Name: installment_plans plan_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installment_plans ALTER COLUMN plan_id SET DEFAULT nextval('public.installment_plans_plan_id_seq'::regclass);


--
-- Name: inventory_movements movement_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements ALTER COLUMN movement_id SET DEFAULT nextval('public.inventory_movements_movement_id_seq'::regclass);


--
-- Name: inventory_reservation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_reservation ALTER COLUMN id SET DEFAULT nextval('public.inventory_reservation_id_seq'::regclass);


--
-- Name: membership_tiers tier_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_tiers ALTER COLUMN tier_id SET DEFAULT nextval('public.membership_tiers_tier_id_seq'::regclass);


--
-- Name: order_invoice_info id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_invoice_info ALTER COLUMN id SET DEFAULT nextval('public.order_invoice_info_id_seq'::regclass);


--
-- Name: order_items order_item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN order_item_id SET DEFAULT nextval('public.order_items_order_item_id_seq'::regclass);


--
-- Name: order_status_history history_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history ALTER COLUMN history_id SET DEFAULT nextval('public.order_status_history_history_id_seq'::regclass);


--
-- Name: orders order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN order_id SET DEFAULT nextval('public.orders_order_id_seq'::regclass);


--
-- Name: payment_method_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_method_config ALTER COLUMN id SET DEFAULT nextval('public.payment_method_config_id_seq'::regclass);


--
-- Name: payment_offers offer_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_offers ALTER COLUMN offer_id SET DEFAULT nextval('public.payment_offers_offer_id_seq'::regclass);


--
-- Name: payment_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions ALTER COLUMN id SET DEFAULT nextval('public.payment_transactions_id_seq'::regclass);


--
-- Name: payments payment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN payment_id SET DEFAULT nextval('public.payments_payment_id_seq'::regclass);


--
-- Name: product_bundles bundle_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_bundles ALTER COLUMN bundle_id SET DEFAULT nextval('public.product_bundles_bundle_id_seq'::regclass);


--
-- Name: product_commitments commitment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_commitments ALTER COLUMN commitment_id SET DEFAULT nextval('public.product_commitments_commitment_id_seq'::regclass);


--
-- Name: product_images image_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images ALTER COLUMN image_id SET DEFAULT nextval('public.product_images_image_id_seq'::regclass);


--
-- Name: product_variants variant_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants ALTER COLUMN variant_id SET DEFAULT nextval('public.product_variants_variant_id_seq'::regclass);


--
-- Name: products product_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN product_id SET DEFAULT nextval('public.products_product_id_seq'::regclass);


--
-- Name: promotion_targets target_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_targets ALTER COLUMN target_id SET DEFAULT nextval('public.promotion_targets_target_id_seq'::regclass);


--
-- Name: promotions promotion_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions ALTER COLUMN promotion_id SET DEFAULT nextval('public.promotions_promotion_id_seq'::regclass);


--
-- Name: purchase_order_items po_item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items ALTER COLUMN po_item_id SET DEFAULT nextval('public.purchase_order_items_po_item_id_seq'::regclass);


--
-- Name: purchase_orders po_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders ALTER COLUMN po_id SET DEFAULT nextval('public.purchase_orders_po_id_seq'::regclass);


--
-- Name: returns return_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.returns ALTER COLUMN return_id SET DEFAULT nextval('public.returns_return_id_seq'::regclass);


--
-- Name: reviews review_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);


--
-- Name: series series_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.series ALTER COLUMN series_id SET DEFAULT nextval('public.series_series_id_seq'::regclass);


--
-- Name: shipments shipment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments ALTER COLUMN shipment_id SET DEFAULT nextval('public.shipments_shipment_id_seq'::regclass);


--
-- Name: staff staff_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff ALTER COLUMN staff_id SET DEFAULT nextval('public.staff_staff_id_seq'::regclass);


--
-- Name: suppliers supplier_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN supplier_id SET DEFAULT nextval('public.suppliers_supplier_id_seq'::regclass);


--
-- Name: support_tickets ticket_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets ALTER COLUMN ticket_id SET DEFAULT nextval('public.support_tickets_ticket_id_seq'::regclass);


--
-- Name: voucher_usage id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voucher_usage ALTER COLUMN id SET DEFAULT nextval('public.voucher_usage_id_seq'::regclass);


--
-- Name: warehouses warehouse_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses ALTER COLUMN warehouse_id SET DEFAULT nextval('public.warehouses_warehouse_id_seq'::regclass);


--
-- Name: warranty_plans plan_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warranty_plans ALTER COLUMN plan_id SET DEFAULT nextval('public.warranty_plans_plan_id_seq'::regclass);


--
-- Name: wishlist_items wishlist_item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items ALTER COLUMN wishlist_item_id SET DEFAULT nextval('public.wishlist_items_wishlist_item_id_seq'::regclass);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (log_id);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: brands brands_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_name_key UNIQUE (name);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (brand_id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (cart_id, variant_id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (cart_id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: category_attributes category_attributes_category_id_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_attributes
    ADD CONSTRAINT category_attributes_category_id_key_key UNIQUE (category_id, key);


--
-- Name: category_attributes category_attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_attributes
    ADD CONSTRAINT category_attributes_pkey PRIMARY KEY (attr_id);


--
-- Name: checkout_idempotency checkout_idempotency_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkout_idempotency
    ADD CONSTRAINT checkout_idempotency_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (coupon_id);


--
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (address_id);


--
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- Name: customers customers_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_phone_key UNIQUE (phone);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (customer_id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (expense_id);


--
-- Name: flash_sale_audit_log flash_sale_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_audit_log
    ADD CONSTRAINT flash_sale_audit_log_pkey PRIMARY KEY (id);


--
-- Name: flash_sale_campaign flash_sale_campaign_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_campaign
    ADD CONSTRAINT flash_sale_campaign_pkey PRIMARY KEY (campaign_id);


--
-- Name: flash_sale_item flash_sale_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_item
    ADD CONSTRAINT flash_sale_item_pkey PRIMARY KEY (item_id);


--
-- Name: flash_sale_purchases flash_sale_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_purchases
    ADD CONSTRAINT flash_sale_purchases_pkey PRIMARY KEY (id);


--
-- Name: flash_sale_slot_products flash_sale_slot_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_slot_products
    ADD CONSTRAINT flash_sale_slot_products_pkey PRIMARY KEY (id);


--
-- Name: flash_sale_slots flash_sale_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_slots
    ADD CONSTRAINT flash_sale_slots_pkey PRIMARY KEY (id);


--
-- Name: flash_sale_time_slot flash_sale_time_slot_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_time_slot
    ADD CONSTRAINT flash_sale_time_slot_pkey PRIMARY KEY (slot_id);


--
-- Name: flash_sale_user_purchase flash_sale_user_purchase_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_user_purchase
    ADD CONSTRAINT flash_sale_user_purchase_pkey PRIMARY KEY (purchase_id);


--
-- Name: installment_plans installment_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installment_plans
    ADD CONSTRAINT installment_plans_pkey PRIMARY KEY (plan_id);


--
-- Name: installment_plans installment_plans_provider_term_months_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installment_plans
    ADD CONSTRAINT installment_plans_provider_term_months_key UNIQUE (provider, term_months);


--
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (movement_id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (warehouse_id, variant_id);


--
-- Name: inventory_reservation inventory_reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_reservation
    ADD CONSTRAINT inventory_reservation_pkey PRIMARY KEY (id);


--
-- Name: membership_tiers membership_tiers_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_tiers
    ADD CONSTRAINT membership_tiers_code_key UNIQUE (code);


--
-- Name: membership_tiers membership_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_tiers
    ADD CONSTRAINT membership_tiers_pkey PRIMARY KEY (tier_id);


--
-- Name: order_invoice_info order_invoice_info_order_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_invoice_info
    ADD CONSTRAINT order_invoice_info_order_id_key UNIQUE (order_id);


--
-- Name: order_invoice_info order_invoice_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_invoice_info
    ADD CONSTRAINT order_invoice_info_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (order_item_id);


--
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (history_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- Name: payment_method_config payment_method_config_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_method_config
    ADD CONSTRAINT payment_method_config_code_key UNIQUE (code);


--
-- Name: payment_method_config payment_method_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_method_config
    ADD CONSTRAINT payment_method_config_pkey PRIMARY KEY (id);


--
-- Name: payment_offers payment_offers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_offers
    ADD CONSTRAINT payment_offers_pkey PRIMARY KEY (offer_id);


--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_provider_txn_ref_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_provider_txn_ref_key UNIQUE (provider_txn_ref);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (payment_id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (permission_code);


--
-- Name: product_bundles product_bundles_main_product_id_bundled_variant_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_bundles
    ADD CONSTRAINT product_bundles_main_product_id_bundled_variant_id_key UNIQUE (main_product_id, bundled_variant_id);


--
-- Name: product_bundles product_bundles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_bundles
    ADD CONSTRAINT product_bundles_pkey PRIMARY KEY (bundle_id);


--
-- Name: product_commitments product_commitments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_commitments
    ADD CONSTRAINT product_commitments_pkey PRIMARY KEY (commitment_id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (image_id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (variant_id);


--
-- Name: product_variants product_variants_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_sku_key UNIQUE (sku);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- Name: promotion_targets promotion_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_targets
    ADD CONSTRAINT promotion_targets_pkey PRIMARY KEY (target_id);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (promotion_id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (po_item_id);


--
-- Name: purchase_order_items purchase_order_items_po_id_variant_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_po_id_variant_id_key UNIQUE (po_id, variant_id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (po_id);


--
-- Name: returns returns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_pkey PRIMARY KEY (return_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- Name: reviews reviews_product_id_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_customer_id_key UNIQUE (product_id, customer_id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role, permission_code);


--
-- Name: sales_targets sales_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_targets
    ADD CONSTRAINT sales_targets_pkey PRIMARY KEY (staff_id, month);


--
-- Name: series series_brand_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.series
    ADD CONSTRAINT series_brand_id_slug_key UNIQUE (brand_id, slug);


--
-- Name: series series_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.series
    ADD CONSTRAINT series_pkey PRIMARY KEY (series_id);


--
-- Name: shipments shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_pkey PRIMARY KEY (shipment_id);


--
-- Name: staff staff_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_email_key UNIQUE (email);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (staff_id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (supplier_id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (ticket_id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (setting_key);


--
-- Name: brands uq_brands_slug; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT uq_brands_slug UNIQUE (slug);


--
-- Name: wishlist_items uq_customer_product_wishlist; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT uq_customer_product_wishlist UNIQUE (customer_id, product_id);


--
-- Name: orders uq_orders_order_code; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT uq_orders_order_code UNIQUE (order_code);


--
-- Name: flash_sale_slot_products uq_slot_product; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_slot_products
    ADD CONSTRAINT uq_slot_product UNIQUE (slot_id, product_id);


--
-- Name: flash_sale_purchases uq_slot_product_phone; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_purchases
    ADD CONSTRAINT uq_slot_product_phone UNIQUE (slot_id, product_id, phone);


--
-- Name: checkout_idempotency uq_user_idempotency; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkout_idempotency
    ADD CONSTRAINT uq_user_idempotency UNIQUE (customer_id, idempotency_key);


--
-- Name: voucher_usage uq_voucher_order; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voucher_usage
    ADD CONSTRAINT uq_voucher_order UNIQUE (coupon_id, order_id);


--
-- Name: voucher_usage voucher_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voucher_usage
    ADD CONSTRAINT voucher_usage_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (warehouse_id);


--
-- Name: warranty_plans warranty_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warranty_plans
    ADD CONSTRAINT warranty_plans_pkey PRIMARY KEY (plan_id);


--
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (wishlist_item_id);


--
-- Name: idx_audit_staff; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_staff ON public.audit_logs USING btree (staff_id, created_at DESC);


--
-- Name: idx_audit_table_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_table_time ON public.audit_logs USING btree (table_name, created_at DESC);


--
-- Name: idx_bundles_main; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bundles_main ON public.product_bundles USING btree (main_product_id) WHERE is_active;


--
-- Name: idx_categories_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categories_parent ON public.categories USING btree (parent_id);


--
-- Name: idx_coupons_scope_brand; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupons_scope_brand ON public.coupons USING btree (brand_id) WHERE (brand_id IS NOT NULL);


--
-- Name: idx_coupons_scope_cat; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupons_scope_cat ON public.coupons USING btree (category_id) WHERE (category_id IS NOT NULL);


--
-- Name: idx_coupons_scope_prod; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupons_scope_prod ON public.coupons USING btree (product_id) WHERE (product_id IS NOT NULL);


--
-- Name: idx_expenses_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_date ON public.expenses USING btree (expense_date);


--
-- Name: idx_fs_purchases_lookup; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fs_purchases_lookup ON public.flash_sale_purchases USING btree (slot_id, product_id, phone);


--
-- Name: idx_fs_slot_products_slot; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fs_slot_products_slot ON public.flash_sale_slot_products USING btree (slot_id, sort_order);


--
-- Name: idx_fs_slots_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fs_slots_time ON public.flash_sale_slots USING btree (start_at, end_at, is_active);


--
-- Name: idx_fs_user_purchase; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fs_user_purchase ON public.flash_sale_user_purchase USING btree (item_id, customer_id);


--
-- Name: idx_idempotency_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_idempotency_expires ON public.checkout_idempotency USING btree (expires_at);


--
-- Name: idx_inv_mov_variant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inv_mov_variant ON public.inventory_movements USING btree (variant_id, created_at);


--
-- Name: idx_inv_res_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inv_res_expires ON public.inventory_reservation USING btree (status, expires_at);


--
-- Name: idx_inv_res_order_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inv_res_order_status ON public.inventory_reservation USING btree (order_id, status);


--
-- Name: idx_inventory_variant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_variant ON public.inventory USING btree (variant_id);


--
-- Name: idx_order_items_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);


--
-- Name: idx_order_items_variant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_variant ON public.order_items USING btree (variant_id);


--
-- Name: idx_orders_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer ON public.orders USING btree (customer_id);


--
-- Name: idx_orders_customer_store; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer_store ON public.orders USING btree (customer_id, receive_type, status);


--
-- Name: idx_orders_date_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_date_status ON public.orders USING btree (order_date, status);


--
-- Name: idx_orders_status_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status_expires ON public.orders USING btree (status, expires_at);


--
-- Name: idx_pay_tx_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pay_tx_order ON public.payment_transactions USING btree (order_id);


--
-- Name: idx_pay_tx_ref; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pay_tx_ref ON public.payment_transactions USING btree (provider_txn_ref);


--
-- Name: idx_payment_offers_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_offers_active ON public.payment_offers USING btree (starts_at, ends_at) WHERE is_active;


--
-- Name: idx_payments_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_order ON public.payments USING btree (order_id);


--
-- Name: idx_po_items_po; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_po_items_po ON public.purchase_order_items USING btree (po_id);


--
-- Name: idx_products_brand_series; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_brand_series ON public.products USING btree (brand_id, series_id);


--
-- Name: idx_products_cat_brand; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_cat_brand ON public.products USING btree (category_id, brand_id) WHERE is_active;


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_category ON public.products USING btree (category_id);


--
-- Name: idx_products_is_hot; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_is_hot ON public.products USING btree (is_hot) WHERE is_active;


--
-- Name: idx_products_is_new; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_is_new ON public.products USING btree (is_new) WHERE is_active;


--
-- Name: idx_products_specs; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_specs ON public.products USING gin (specs);


--
-- Name: idx_promo_targets_brand; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promo_targets_brand ON public.promotion_targets USING btree (brand_id) WHERE (brand_id IS NOT NULL);


--
-- Name: idx_promo_targets_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promo_targets_category ON public.promotion_targets USING btree (category_id) WHERE (category_id IS NOT NULL);


--
-- Name: idx_promo_targets_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promo_targets_product ON public.promotion_targets USING btree (product_id) WHERE (product_id IS NOT NULL);


--
-- Name: idx_promo_targets_promo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promo_targets_promo ON public.promotion_targets USING btree (promotion_id);


--
-- Name: idx_promo_targets_variant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promo_targets_variant ON public.promotion_targets USING btree (variant_id) WHERE (variant_id IS NOT NULL);


--
-- Name: idx_promotions_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promotions_active ON public.promotions USING btree (starts_at, ends_at) WHERE is_active;


--
-- Name: idx_reviews_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_customer ON public.reviews USING btree (customer_id);


--
-- Name: idx_reviews_product_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_product_status ON public.reviews USING btree (product_id, status);


--
-- Name: idx_shipments_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipments_order ON public.shipments USING btree (order_id);


--
-- Name: idx_status_hist_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_status_hist_order ON public.order_status_history USING btree (order_id, changed_at);


--
-- Name: idx_tickets_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_status ON public.support_tickets USING btree (status, priority);


--
-- Name: idx_variants_attrs; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_variants_attrs ON public.product_variants USING gin (attributes);


--
-- Name: idx_variants_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_variants_product ON public.product_variants USING btree (product_id);


--
-- Name: idx_voucher_usage_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_voucher_usage_user ON public.voucher_usage USING btree (coupon_id, customer_id, status);


--
-- Name: idx_warehouses_store_area; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_warehouses_store_area ON public.warehouses USING btree (province, district) WHERE (is_store AND is_active);


--
-- Name: idx_wishlist_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wishlist_customer ON public.wishlist_items USING btree (customer_id);


--
-- Name: idx_wishlist_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wishlist_product ON public.wishlist_items USING btree (product_id);


--
-- Name: uq_default_address; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_default_address ON public.customer_addresses USING btree (customer_id) WHERE is_default;


--
-- Name: product_bundles trg_audit_bundles; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_bundles AFTER INSERT OR DELETE OR UPDATE ON public.product_bundles FOR EACH ROW EXECUTE FUNCTION public.log_audit('bundle_id');


--
-- Name: coupons trg_audit_coupons; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_coupons AFTER INSERT OR DELETE OR UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.log_audit('coupon_id');


--
-- Name: orders trg_audit_orders; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_orders AFTER DELETE OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.log_audit('order_id');


--
-- Name: payment_offers trg_audit_payment_offers; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_payment_offers AFTER INSERT OR DELETE OR UPDATE ON public.payment_offers FOR EACH ROW EXECUTE FUNCTION public.log_audit('offer_id');


--
-- Name: products trg_audit_products; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_products AFTER INSERT OR DELETE OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.log_audit('product_id');


--
-- Name: promotions trg_audit_promotions; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_promotions AFTER INSERT OR DELETE OR UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.log_audit('promotion_id');


--
-- Name: product_variants trg_audit_variants; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_variants AFTER INSERT OR DELETE OR UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.log_audit('variant_id');


--
-- Name: warranty_plans trg_audit_warranty; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_warranty AFTER INSERT OR DELETE OR UPDATE ON public.warranty_plans FOR EACH ROW EXECUTE FUNCTION public.log_audit('plan_id');


--
-- Name: categories trg_categories_no_cycle; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_categories_no_cycle BEFORE INSERT OR UPDATE OF parent_id ON public.categories FOR EACH ROW EXECUTE FUNCTION public.check_category_cycle();


--
-- Name: customers trg_customers_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: order_items trg_order_items_recalc; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_order_items_recalc AFTER INSERT OR DELETE OR UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.recalc_order_total();


--
-- Name: orders trg_order_status_history; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_order_status_history AFTER INSERT OR UPDATE OF status ON public.orders FOR EACH ROW EXECUTE FUNCTION public.log_order_status();


--
-- Name: purchase_order_items trg_po_items_total; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_po_items_total AFTER INSERT OR DELETE OR UPDATE ON public.purchase_order_items FOR EACH ROW EXECUTE FUNCTION public.recalc_po_total();


--
-- Name: audit_logs audit_logs_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id) ON DELETE SET NULL;


--
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(cart_id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id);


--
-- Name: carts carts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(category_id) ON DELETE RESTRICT;


--
-- Name: category_attributes category_attributes_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_attributes
    ADD CONSTRAINT category_attributes_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE CASCADE;


--
-- Name: checkout_idempotency checkout_idempotency_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkout_idempotency
    ADD CONSTRAINT checkout_idempotency_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: checkout_idempotency checkout_idempotency_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkout_idempotency
    ADD CONSTRAINT checkout_idempotency_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- Name: coupons coupons_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(brand_id) ON DELETE SET NULL;


--
-- Name: coupons coupons_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE SET NULL;


--
-- Name: coupons coupons_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE SET NULL;


--
-- Name: customer_addresses customer_addresses_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;


--
-- Name: customers customers_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES public.membership_tiers(tier_id) ON DELETE SET NULL;


--
-- Name: expenses expenses_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id) ON DELETE SET NULL;


--
-- Name: flash_sale_item fkebogjrj9vhrjfa80fdvvnlce0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_item
    ADD CONSTRAINT fkebogjrj9vhrjfa80fdvvnlce0 FOREIGN KEY (product_id) REFERENCES public.products(product_id);


--
-- Name: flash_sale_item flash_sale_item_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_item
    ADD CONSTRAINT flash_sale_item_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.flash_sale_campaign(campaign_id) ON DELETE CASCADE;


--
-- Name: flash_sale_item flash_sale_item_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_item
    ADD CONSTRAINT flash_sale_item_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.flash_sale_time_slot(slot_id) ON DELETE SET NULL;


--
-- Name: flash_sale_purchases flash_sale_purchases_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_purchases
    ADD CONSTRAINT flash_sale_purchases_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE SET NULL;


--
-- Name: flash_sale_purchases flash_sale_purchases_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_purchases
    ADD CONSTRAINT flash_sale_purchases_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: flash_sale_purchases flash_sale_purchases_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_purchases
    ADD CONSTRAINT flash_sale_purchases_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.flash_sale_slots(id) ON DELETE CASCADE;


--
-- Name: flash_sale_slot_products flash_sale_slot_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_slot_products
    ADD CONSTRAINT flash_sale_slot_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: flash_sale_slot_products flash_sale_slot_products_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_slot_products
    ADD CONSTRAINT flash_sale_slot_products_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.flash_sale_slots(id) ON DELETE CASCADE;


--
-- Name: flash_sale_time_slot flash_sale_time_slot_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_time_slot
    ADD CONSTRAINT flash_sale_time_slot_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.flash_sale_campaign(campaign_id) ON DELETE CASCADE;


--
-- Name: flash_sale_user_purchase flash_sale_user_purchase_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_user_purchase
    ADD CONSTRAINT flash_sale_user_purchase_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;


--
-- Name: flash_sale_user_purchase flash_sale_user_purchase_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_user_purchase
    ADD CONSTRAINT flash_sale_user_purchase_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.flash_sale_item(item_id) ON DELETE CASCADE;


--
-- Name: flash_sale_user_purchase flash_sale_user_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flash_sale_user_purchase
    ADD CONSTRAINT flash_sale_user_purchase_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE SET NULL;


--
-- Name: inventory_movements inventory_movements_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id);


--
-- Name: inventory_movements inventory_movements_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id);


--
-- Name: inventory_movements inventory_movements_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id);


--
-- Name: inventory_reservation inventory_reservation_flash_sale_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_reservation
    ADD CONSTRAINT inventory_reservation_flash_sale_item_id_fkey FOREIGN KEY (flash_sale_item_id) REFERENCES public.flash_sale_item(item_id);


--
-- Name: inventory_reservation inventory_reservation_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_reservation
    ADD CONSTRAINT inventory_reservation_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: inventory_reservation inventory_reservation_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_reservation
    ADD CONSTRAINT inventory_reservation_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id);


--
-- Name: inventory_reservation inventory_reservation_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_reservation
    ADD CONSTRAINT inventory_reservation_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id);


--
-- Name: inventory inventory_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id);


--
-- Name: inventory inventory_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id);


--
-- Name: order_invoice_info order_invoice_info_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_invoice_info
    ADD CONSTRAINT order_invoice_info_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: order_items order_items_flash_sale_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_flash_sale_item_id_fkey FOREIGN KEY (flash_sale_item_id) REFERENCES public.flash_sale_item(item_id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: order_items order_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id);


--
-- Name: order_status_history order_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.staff(staff_id) ON DELETE SET NULL;


--
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: orders orders_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.customer_addresses(address_id);


--
-- Name: orders orders_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(coupon_id);


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: orders orders_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id);


--
-- Name: orders orders_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.warehouses(warehouse_id);


--
-- Name: payment_transactions payment_transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: product_bundles product_bundles_bundled_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_bundles
    ADD CONSTRAINT product_bundles_bundled_variant_id_fkey FOREIGN KEY (bundled_variant_id) REFERENCES public.product_variants(variant_id) ON DELETE CASCADE;


--
-- Name: product_bundles product_bundles_main_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_bundles
    ADD CONSTRAINT product_bundles_main_product_id_fkey FOREIGN KEY (main_product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: product_commitments product_commitments_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_commitments
    ADD CONSTRAINT product_commitments_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE CASCADE;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: products products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(brand_id);


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id);


--
-- Name: products products_series_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_series_id_fkey FOREIGN KEY (series_id) REFERENCES public.series(series_id) ON DELETE SET NULL;


--
-- Name: products products_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(supplier_id);


--
-- Name: promotion_targets promotion_targets_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_targets
    ADD CONSTRAINT promotion_targets_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(brand_id) ON DELETE CASCADE;


--
-- Name: promotion_targets promotion_targets_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_targets
    ADD CONSTRAINT promotion_targets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE CASCADE;


--
-- Name: promotion_targets promotion_targets_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_targets
    ADD CONSTRAINT promotion_targets_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: promotion_targets promotion_targets_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_targets
    ADD CONSTRAINT promotion_targets_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(promotion_id) ON DELETE CASCADE;


--
-- Name: promotion_targets promotion_targets_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_targets
    ADD CONSTRAINT promotion_targets_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id) ON DELETE CASCADE;


--
-- Name: promotions promotions_required_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_required_tier_id_fkey FOREIGN KEY (required_tier_id) REFERENCES public.membership_tiers(tier_id);


--
-- Name: purchase_order_items purchase_order_items_po_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_po_id_fkey FOREIGN KEY (po_id) REFERENCES public.purchase_orders(po_id) ON DELETE CASCADE;


--
-- Name: purchase_order_items purchase_order_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id);


--
-- Name: purchase_orders purchase_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff(staff_id) ON DELETE SET NULL;


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(supplier_id);


--
-- Name: purchase_orders purchase_orders_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id);


--
-- Name: returns returns_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(order_item_id);


--
-- Name: reviews reviews_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;


--
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_code_fkey FOREIGN KEY (permission_code) REFERENCES public.permissions(permission_code) ON DELETE CASCADE;


--
-- Name: sales_targets sales_targets_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_targets
    ADD CONSTRAINT sales_targets_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id) ON DELETE CASCADE;


--
-- Name: series series_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.series
    ADD CONSTRAINT series_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(brand_id) ON DELETE RESTRICT;


--
-- Name: shipments shipments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: support_tickets support_tickets_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.staff(staff_id) ON DELETE SET NULL;


--
-- Name: support_tickets support_tickets_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;


--
-- Name: support_tickets support_tickets_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE SET NULL;


--
-- Name: voucher_usage voucher_usage_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voucher_usage
    ADD CONSTRAINT voucher_usage_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(coupon_id);


--
-- Name: voucher_usage voucher_usage_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voucher_usage
    ADD CONSTRAINT voucher_usage_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: voucher_usage voucher_usage_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voucher_usage
    ADD CONSTRAINT voucher_usage_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: warranty_plans warranty_plans_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warranty_plans
    ADD CONSTRAINT warranty_plans_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict bcLNjgUWvBtV1efSnYUESL6CPfIdMED6Y8TtOi8yF4zakYh9sh0BfQjrAjRXG9N

