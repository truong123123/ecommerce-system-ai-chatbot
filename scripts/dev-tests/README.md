# Bộ Công Cụ Kiểm Thử Phát Triển & Nghiệm Thu Hệ Thống (Dev & Acceptance Test Suite)

Thư mục lưu trữ tập trung toàn bộ các kịch bản kiểm thử độc lập (manual/automated test scripts), công cụ đếm CSDL và các báo cáo kiểm định kỹ thuật phục vụ quá trình phát triển, kiểm thử chức năng và bảo vệ đồ án tốt nghiệp.

---

## 1. Danh Sách Script Kiểm Thử Chạy Thử (Test Scripts)

Các script dưới đây kiểm thử trực tiếp lên hệ thống đang chạy (Backend cổng `8080`, Frontend cổng `3000`).

| STT | Tên Script | Công Nghệ | Mô Tả Chức Năng | Lệnh Chạy Nhanh |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `test_admin_full_crud.js` | Node.js | **Kiểm thử 15 phân hệ Admin & RBAC (55 tests)**: Route 16 trang Admin, CRUD Payments, Customers, Stores, Banners, Staff BCrypt, Settings, Support Chat, Orders và phân quyền 7 Role. | `node test_admin_full_crud.js`<br>hoặc `npm run test:admin` |
| 2 | `test_post_cleanup_deep.js` | Node.js | **Kiểm định tích hợp sâu 26 kịch bản**: Auth Cookie HttpOnly, JWT, CSRF, IDOR Defense, CRUD Sản phẩm & Danh mục, 34 đơn vị hành chính, Checkout & VNPay IPN. | `node test_post_cleanup_deep.js`<br>hoặc `npm run test:deep` |
| 3 | `test_product_specs_live.js` | Node.js | **Kiểm thử mapping JSON Specs sản phẩm**: Tạo SP với specs object/Map, specs rỗng, specs null, update specs, đọc lại dữ liệu. | `node test_product_specs_live.js`<br>hoặc `npm run test:specs` |
| 4 | `test_full_system.js` | Node.js | **Kiểm thử toàn diện luồng hệ thống**: Storefront, Cart, Checkout, Auth, AI Chatbot Gemini. | `node test_full_system.js`<br>hoặc `npm run test:system` |
| 5 | `test_voucher_csrf.js` | Node.js | **Kiểm tra CSRF & Voucher**: Kiểm tra tính năng validate mã giảm giá và bảo vệ token XSRF. | `node test_voucher_csrf.js`<br>hoặc `npm run test:csrf` |
| 6 | `integration_test.ps1` | PowerShell | **Kiểm thử tích hợp API**: Wishlist, Reviews, Comparison, Cart, Inventory. | `powershell -ExecutionPolicy Bypass -File .\integration_test.ps1` |
| 7 | `test_reviews.ps1` | PowerShell | **Kiểm thử nghiệp vụ đánh giá**: Luồng gửi review, duyệt review, phân quyền khách hàng / admin. | `powershell -ExecutionPolicy Bypass -File .\test_reviews.ps1` |
| 8 | `check_db_count.ps1` | PowerShell | **Kiểm tra số lượng bản ghi DB**: Đếm số dòng nhanh của các bảng chính (`users`, `products`, `orders`,...). | `powershell -ExecutionPolicy Bypass -File .\check_db_count.ps1` |
| 9 | `test_browser_acceptance.js` | Puppeteer | **Nghiệm thu giao diện tự động**: Mở trình duyệt Chrome, tương tác và chụp ảnh màn hình nghiệm thu. | `node test_browser_acceptance.js`<br>hoặc `npm run test:browser` |

---

## 2. Thư Mục Báo Cáo Kỹ Thuật & Kiểm Định (`reports/`)

Nơi lưu trữ toàn bộ hồ sơ kỹ thuật và bằng chứng kiểm thử đạt chuẩn:

- [`reports/POST_CLEANUP_VERIFICATION.md`](file:///d:/DoAnTotNgiep/scripts/dev-tests/reports/POST_CLEANUP_VERIFICATION.md): Báo cáo kiểm định toàn diện sau dọn dẹp hệ thống (169/169 unit test Backend, 80/80 Vitest Frontend, 26 API deep tests, bảo mật RBAC, IDOR, CSRF).
- [`reports/PRODUCT_SPECS_FIX_REPORT.md`](file:///d:/DoAnTotNgiep/scripts/dev-tests/reports/PRODUCT_SPECS_FIX_REPORT.md): Báo cáo xử lý triệt để lỗi `ClassCastException` và kiến trúc mapping JSON Hibernate của trường `Product.specs`.
- [`reports/CLEANUP_AUDIT.md`](file:///d:/DoAnTotNgiep/scripts/dev-tests/reports/CLEANUP_AUDIT.md): Báo cáo phân tích audit toàn diện 13 danh mục file dư thừa, component cũ và kế hoạch tối ưu.
- [`reports/CLEANUP_RESULT.md`](file:///d:/DoAnTotNgiep/scripts/dev-tests/reports/CLEANUP_RESULT.md): Nhật ký thực hiện dọn dẹp an toàn các file thừa.

---

## 3. Các Biến Môi Trường Tùy Chọn

Các script tự động sử dụng cấu hình mặc định tương thích với `store_dev`. Bạn có thể ghi đè qua biến môi trường nếu cần:

- **Backend API**: `API_BASE_URL` (Mặc định: `http://localhost:8080/api/v1`)
- **Frontend URL**: `FRONTEND_URL` (Mặc định: `http://localhost:3000`)
- **Database**: `PGHOST` (localhost), `PGPORT` (5432), `PGUSER` (postgres), `PGDATABASE` (store_dev), `PGPASSWORD`
- **Tài khoản Test**:
  - Khách hàng: `TEST_CUST_EMAIL=customer@store.com`, `TEST_CUST_PASS=123456`
  - Quản trị viên: `TEST_ADMIN_EMAIL=admin@store.com`, `TEST_ADMIN_PASS=admin123`
