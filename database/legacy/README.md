# Thư mục Schema Cũ (Legacy Schema)

Tệp `V1__init_schema.sql` trong thư mục này là phiên bản schema khởi tạo sơ khai ban đầu của dự án, sử dụng bảng `users` đơn giản và không có các cấu trúc thực tế của hệ thống hiện tại (như `staff`, `customers`, `product_variants`, `warehouses`, v.v.).

Tệp này **không còn được sử dụng** và đã được thay thế hoàn toàn bởi:
- [backend/src/main/resources/db/migration/V1__baseline_schema.sql](file:///d:/DoAnTotNgiep/backend/src/main/resources/db/migration/V1__baseline_schema.sql): Baseline schema chuẩn 3NF của toàn bộ hệ thống (PostgreSQL 15-18).
