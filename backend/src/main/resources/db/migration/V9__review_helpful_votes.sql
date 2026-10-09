-- ====================================================================
-- FLYWAY MIGRATION V9: REVIEW HELPFUL VOTES
-- Bang luu luot binh chon huu ich cua khach hang cho danh gia san pham
-- ====================================================================

CREATE TABLE IF NOT EXISTS review_helpful_votes (
    vote_id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_helpful_votes_review FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
    CONSTRAINT fk_helpful_votes_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    CONSTRAINT uq_review_helpful_vote UNIQUE (review_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_helpful_votes_review ON review_helpful_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_helpful_votes_customer ON review_helpful_votes(customer_id);

-- ====================================================================
-- GHI CHU ROLLBACK:
-- DROP TABLE IF EXISTS review_helpful_votes CASCADE;
-- ====================================================================
