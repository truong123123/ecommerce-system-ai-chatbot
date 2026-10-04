-- ====================================================================
-- FLYWAY MIGRATION V5: UPGRADE ADMIN FLASH SALE PRO
-- Thêm publish_status, optimistic locking version, display_order, audit log
-- ====================================================================

-- 1. Cập nhật bảng flash_sale_campaign
ALTER TABLE flash_sale_campaign 
    ADD COLUMN IF NOT EXISTS publish_status VARCHAR(20) DEFAULT 'ACTIVE',
    ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);

-- Đồng bộ dữ liệu cũ: nếu isActive=false hoặc status='INACTIVE' -> 'PAUSED', ngược lại 'ACTIVE'
UPDATE flash_sale_campaign 
SET publish_status = CASE 
    WHEN is_active = false OR status = 'INACTIVE' THEN 'PAUSED'
    WHEN status = 'DRAFT' THEN 'DRAFT'
    ELSE 'ACTIVE'
END
WHERE publish_status IS NULL OR publish_status = 'ACTIVE';

-- 2. Cập nhật bảng flash_sale_time_slot
ALTER TABLE flash_sale_time_slot 
    ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_fs_slot_time_range ON flash_sale_time_slot(start_time, end_time);

-- 3. Cập nhật bảng flash_sale_item
ALTER TABLE flash_sale_item 
    ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_fs_item_display_order ON flash_sale_item(slot_id, display_order ASC);

-- 4. Bảng nhật ký chỉnh sửa Flash Sale (Audit Log)
CREATE TABLE IF NOT EXISTS flash_sale_audit_log (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    performed_by VARCHAR(100) DEFAULT 'Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fs_audit_campaign ON flash_sale_audit_log(campaign_id, created_at DESC);
