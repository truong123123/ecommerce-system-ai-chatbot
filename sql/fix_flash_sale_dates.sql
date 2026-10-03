-- Script khôi phục thời gian chuẩn cho Chiến dịch Flash Sale #1 và #2
BEGIN;

-- Khôi phục chiến dịch #1 về giờ gốc mong muốn (13:13 03/10/2026 -> 14:13 10/10/2026 GMT+7) và status ACTIVE
UPDATE flash_sale_campaign
SET title = 'FLASHSALE TỰU TRƯỜNG',
    start_time = '2026-10-03 13:13:00+07',
    end_time   = '2026-10-10 14:13:00+07',
    status     = 'ACTIVE',
    is_active  = true,
    updated_at = NOW()
WHERE campaign_id = 1;

-- Cập nhật chiến dịch #2 về UPCOMING vì chưa bắt đầu và hiện tại 0 sản phẩm
UPDATE flash_sale_campaign
SET status     = 'UPCOMING',
    is_active  = true,
    updated_at = NOW()
WHERE campaign_id = 2;

COMMIT;
