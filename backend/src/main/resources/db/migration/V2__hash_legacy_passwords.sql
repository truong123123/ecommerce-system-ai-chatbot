-- V2__hash_legacy_passwords.sql
-- Migration: Chuyển đổi tài khoản guest sang '!NO_LOGIN' và băm mật khẩu legacy plaintext bằng BCrypt (pgcrypto)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Khóa đăng nhập đối với tất cả tài khoản guest cũ
UPDATE customers
SET password_hash = '!NO_LOGIN'
WHERE password_hash = 'GUEST_NO_PASSWORD';

-- 2. Băm tất cả mật khẩu dạng văn bản thuần (plaintext) của bảng customers sang BCrypt
UPDATE customers
SET password_hash = crypt(password_hash, gen_salt('bf', 10))
WHERE password_hash IS NOT NULL
  AND password_hash NOT LIKE '$2%'
  AND password_hash NOT LIKE '!%';

-- 3. Băm tất cả mật khẩu dạng văn bản thuần (plaintext) của bảng staff sang BCrypt
UPDATE staff
SET password_hash = crypt(password_hash, gen_salt('bf', 10))
WHERE password_hash IS NOT NULL
  AND password_hash NOT LIKE '$2%'
  AND password_hash NOT LIKE '!%';
