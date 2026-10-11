-- ====================================================================
-- FLYWAY MIGRATION V7: UPGRADE PRODUCT REVIEWS
-- 1. Chuan hoa status sang UPPER(status), NOT NULL DEFAULT 'APPROVED'
--    va rang buoc CHECK theo enum ReviewStatus ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN')
-- 2. Them cot order_item_id (BIGINT NULL REFERENCES order_items(order_item_id) ON DELETE SET NULL)
-- 3. Backfill order_item_id bang UPDATE ... FROM JOIN theo customer, product, don completed (khong hard-code)
-- 4. Tao chi muc toi uu cho order_item_id
-- ====================================================================

-- 1. Them cot order_item_id neu chua co
ALTER TABLE reviews 
    ADD COLUMN IF NOT EXISTS order_item_id BIGINT REFERENCES order_items(order_item_id) ON DELETE SET NULL;

-- 2. Chuan hoa du lieu status cu thanh chu hoa
UPDATE reviews 
SET status = UPPER(TRIM(status))
WHERE status IS NOT NULL;

UPDATE reviews 
SET status = 'APPROVED'
WHERE status IS NULL OR status = '';

-- Thiet lap rang buoc NOT NULL, DEFAULT va CHECK cho status
ALTER TABLE reviews 
    ALTER COLUMN status SET DEFAULT 'APPROVED',
    ALTER COLUMN status SET NOT NULL;

-- Them CHECK constraint cho status theo enum ReviewStatus neu chua co
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_reviews_status'
    ) THEN
        ALTER TABLE reviews 
            ADD CONSTRAINT chk_reviews_status 
            CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN'));
    END IF;
END $$;

-- 3. Backfill order_item_id cho review cu bang cau lenh UPDATE ... FROM (khong hardcode id)
-- Tim mon hang (order_item) gan nhat cua khach hang da mua san pham trong don da completed
UPDATE reviews r
SET order_item_id = sub.order_item_id,
    is_verified_purchase = true
FROM (
    SELECT DISTINCT ON (r_sub.review_id)
        r_sub.review_id,
        oi.order_item_id
    FROM reviews r_sub
    JOIN products p ON r_sub.product_id = p.product_id
    JOIN product_variants pv ON pv.product_id = p.product_id
    JOIN order_items oi ON oi.variant_id = pv.variant_id
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.customer_id = r_sub.customer_id
      AND o.status = 'completed'
    ORDER BY r_sub.review_id, o.order_date DESC, oi.order_item_id DESC
) sub
WHERE r.review_id = sub.review_id
  AND r.order_item_id IS NULL;

-- 4. Tao index cho order_item_id de toi uu tim kiem
CREATE INDEX IF NOT EXISTS idx_reviews_order_item ON reviews(order_item_id);

-- Luu y: Rang buoc UNIQUE (product_id, customer_id) hien tai duoc GIU NGUYEN theo yeu cau.
-- CHUA DROP CONSTRAINT reviews_product_id_customer_id_key.

-- ====================================================================
-- GHI CHU ROLLBACK (KHI CAN HUY BO MIGRATION):
-- ALTER TABLE reviews DROP CONSTRAINT IF EXISTS chk_reviews_status;
-- DROP INDEX IF EXISTS idx_reviews_order_item;
-- ALTER TABLE reviews DROP COLUMN IF EXISTS order_item_id;
-- ====================================================================
