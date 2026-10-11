# Hướng dẫn Dữ liệu Mẫu (Seed Data)

Thư mục này chứa các tệp SQL dùng để nạp dữ liệu mẫu phục vụ phát triển (Local Development / Testing).

## 1. Tệp Dữ liệu Khớp Schema Thật (Production/Dev-ready)
Các tệp này tương thích hoàn toàn với schema thật (`V1__baseline_schema.sql`) và được nạp tự động qua `scripts/seed-dev.sh` (hoặc `scripts/seed-dev.ps1` trên Windows):
- `reference_data.sql`: Dữ liệu cấu hình nền tảng và catalog chuẩn (27 danh mục, 17 thương hiệu, 31 sản phẩm, 35 biến thể, 245 tồn kho, nhà cung cấp, kho bãi, quyền hạn, cài đặt hệ thống, gói bảo hành, banner, ưu đãi thanh toán). Đã được kiểm tra an toàn, **không chứa mật khẩu/secret hay dữ liệu nhạy cảm**.
- `V3__membership_tiers.sql`: Hạng thành viên tích điểm (TMEMBER, TSTUDENT, SVIP).

## 2. Tệp Cũ / Không Khớp Hoàn Toàn (Đã được thay thế bởi reference_data.sql)
- ⚠️ `V2__seed_data.sql`: Cấu trúc cũ từ phiên bản sơ khai (sử dụng cột `sku`, `price`, `brand` trực tiếp trên bảng `products`, không qua `product_variants`).
- ⚠️ `full_seed_data.sql`: Khối chèn `orders` ở cuối tệp thiếu cột `order_code` (ràng buộc `NOT NULL UNIQUE` được áp dụng từ V3 trở đi).
- ⚠️ `seed_laptops.sql`, `seed_phones.sql`, `seed_watch_audio.sql`: Các câu lệnh INSERT vào `brands` thiếu trường `slug` (ràng buộc `NOT NULL UNIQUE`). Toàn bộ dữ liệu sản phẩm tương ứng đã được tích hợp đầy đủ trong `reference_data.sql`.
