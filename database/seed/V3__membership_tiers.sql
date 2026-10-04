-- Seed default membership tiers (Smember, S-Student, S-VIP)
INSERT INTO membership_tiers (code, name, min_annual_spend, discount_percent, requires_verification, description)
VALUES 
    ('SMEMBER', 'Smember', 0, 1.00, FALSE, 'Uu dai thanh vien Smember giam 1%'),
    ('SSTUDENT', 'S-Student', 0, 3.00, TRUE, 'Uu dai hoc sinh - sinh vien giam them 3%'),
    ('SVIP', 'S-VIP', 50000000, 2.00, FALSE, 'Uu dai khach hang VIP giam 2%')
ON CONFLICT (code) DO UPDATE 
SET discount_percent = EXCLUDED.discount_percent,
    name = EXCLUDED.name,
    description = EXCLUDED.description;
