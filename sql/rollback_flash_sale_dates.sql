-- Script Rollback dữ liệu Flash Sale #1 và #2 về trạng thái trước khi sửa
BEGIN;

UPDATE flash_sale_campaign
SET title = 'FLASHSALE T',
    start_time = '2026-10-02 23:13:00+07',
    end_time   = '2026-10-10 00:13:00+07',
    status     = 'UPCOMING',
    is_active  = true,
    updated_at = NOW()
WHERE campaign_id = 1;

UPDATE flash_sale_campaign
SET title = 'FLASHSALE TỰU TRƯỜNG',
    start_time = '2026-10-04 09:19:00+07',
    end_time   = '2026-10-10 09:19:00+07',
    status     = 'ACTIVE',
    is_active  = true,
    updated_at = NOW()
WHERE campaign_id = 2;

COMMIT;
