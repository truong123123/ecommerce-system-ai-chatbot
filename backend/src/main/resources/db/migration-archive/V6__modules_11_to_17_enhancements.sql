-- ====================================================================
-- FLYWAY MIGRATION V6: ENHANCEMENTS FOR MODULES 11 - 17
-- Wishlist, Review Verified Purchase, Coupon Scope, Inventory Movements
-- ====================================================================

-- 1. MODULE 11: Wishlist Items
CREATE TABLE IF NOT EXISTS wishlist_items (
    wishlist_item_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_customer_product_wishlist UNIQUE (customer_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_customer ON wishlist_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist_items(product_id);

-- 2. MODULE 12: Review Verified Purchase & Moderation Status
ALTER TABLE reviews 
    ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'APPROVED',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON reviews(product_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id);

-- 3. MODULE 14: Coupon Target Scopes (Category, Brand, Product)
ALTER TABLE coupons
    ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(brand_id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS product_id BIGINT REFERENCES products(product_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_coupons_scope_cat ON coupons(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coupons_scope_brand ON coupons(brand_id) WHERE brand_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coupons_scope_prod ON coupons(product_id) WHERE product_id IS NOT NULL;

-- 4. MODULE 15: Inventory Movements reasons check extension
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'inventory_movements_reason_check' 
        AND table_name = 'inventory_movements'
    ) THEN
        ALTER TABLE inventory_movements DROP CONSTRAINT inventory_movements_reason_check;
    END IF;
END $$;

ALTER TABLE inventory_movements 
    ADD CONSTRAINT inventory_movements_reason_check 
    CHECK (reason IN ('purchase', 'sale', 'return', 'adjustment', 'damaged', 'import', 'export', 'reserve', 'release', 'consume'));
