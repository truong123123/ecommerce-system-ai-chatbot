#!/usr/bin/env bash
set -euo pipefail

# Scripts nạp dữ liệu mẫu cho môi trường Development (Chỉ chạy ở DEV)
# Yêu cầu psql đã được cài đặt và kết nối được tới database Postgres.

# Kiểm tra môi trường: Chặn tuyệt đối trên PROD
if [[ "${SPRING_PROFILES_ACTIVE:-}" =~ (prod|production) ]] || [[ "${APP_ENV:-}" =~ (prod|production) ]]; then
  echo "[LỖI BẢO MẬT] Script seed-dev.sh chỉ được phép chạy trên môi trường Development. Đã phát hiện profile/env là PROD!" >&2
  exit 1
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-store_dev}"
DB_USER="${DB_USER:-postgres}"

if [ -n "${DB_PASSWORD:-}" ]; then
  export PGPASSWORD="${DB_PASSWORD}"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "==> Bắt đầu nạp dữ liệu mẫu vào database [${DB_NAME}] tại ${DB_HOST}:${DB_PORT}..."

SEED_FILES=(
  "${ROOT_DIR}/database/seed/reference_data.sql"
  "${ROOT_DIR}/database/seed/V3__membership_tiers.sql"
)

for file in "${SEED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo " -> Đang nạp $(basename "$file")..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" > /dev/null
  else
    echo " [CẢNH BÁO] Không tìm thấy $file, bỏ qua."
  fi
done

echo "==> Nạp dữ liệu mẫu hoàn tất thành công!"

