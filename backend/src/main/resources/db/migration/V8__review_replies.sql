-- ====================================================================
-- FLYWAY MIGRATION V8: REVIEW REPLIES
-- Bang luu phan hoi cua quan tri / shop cho danh gia san pham
-- ====================================================================

CREATE TABLE IF NOT EXISTS review_replies (
    reply_id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL,
    staff_id INT,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_review_replies_review FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_replies_staff FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL,
    CONSTRAINT uq_review_replies_review UNIQUE (review_id)
);

CREATE INDEX IF NOT EXISTS idx_review_replies_review ON review_replies(review_id);
CREATE INDEX IF NOT EXISTS idx_review_replies_staff ON review_replies(staff_id);

-- ====================================================================
-- GHI CHU ROLLBACK:
-- DROP TABLE IF EXISTS review_replies CASCADE;
-- ====================================================================
