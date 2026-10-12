# Development & Integration Test Scripts

Thư mục chứa các script kiểm thử tự động, tích hợp API và nghiệm thu trình duyệt phục vụ môi trường phát triển (development).

## Danh sách scripts

| Script | Mô tả | Cách chạy |
| :--- | :--- | :--- |
| `check_db_count.ps1` | Kiểm tra nhanh số lượng bản ghi các bảng chính trong PostgreSQL | `powershell -ExecutionPolicy Bypass -File .\check_db_count.ps1` |
| `integration_test.ps1` | Kiểm thử tích hợp toàn bộ API (Wishlist, Reviews, Comparison, Cart, Inventory) | `powershell -ExecutionPolicy Bypass -File .\integration_test.ps1` |
| `test_reviews.ps1` | Kiểm thử nghiệp vụ phân quyền và luồng đánh giá sản phẩm | `powershell -ExecutionPolicy Bypass -File .\test_reviews.ps1` |
| `test_browser_acceptance.js` | Kiểm thử nghiệm thu giao diện trên trình duyệt Chrome (Puppeteer) | `npm test` hoặc `node test_browser_acceptance.js` |

## Các biến môi trường hỗ trợ

Các script ưu tiên đọc biến môi trường nếu được thiết lập, nếu không sẽ sử dụng giá trị mặc định từ dữ liệu seed dev:

### 1. Cơ sở dữ liệu (cho `check_db_count.ps1`):
- `PGHOST`: Host DB (mặc định: `localhost`)
- `PGPORT`: Cổng DB (mặc định: `5432`)
- `PGUSER`: Tên user DB (mặc định: `postgres`)
- `PGDATABASE`: Tên cơ sở dữ liệu (mặc định: `LNT_Doantotnghiep`)
- `PGPASSWORD`: Mật khẩu kết nối DB
- `PSQL_PATH`: Đường dẫn file thực thi `psql.exe`

### 2. API Backend & Tài khoản Test (cho `integration_test.ps1`, `test_reviews.ps1`):
- `API_BASE_URL`: Địa chỉ API Backend (mặc định: `http://localhost:8080/api/v1`)
- `TEST_CUST_EMAIL`: Email tài khoản khách hàng test (mặc định: `customer@store.com`)
- `TEST_CUST_PASS`: Mật khẩu tài khoản khách hàng test (mặc định: `123456`)
- `TEST_ADMIN_EMAIL`: Email tài khoản admin test (mặc định: `admin@store.com`)
- `TEST_ADMIN_PASS`: Mật khẩu tài khoản admin test (mặc định: `admin123`)

### 3. Trình duyệt (cho `test_browser_acceptance.js`):
- `FRONTEND_URL`: Địa chỉ frontend (mặc định: `http://localhost:3000`)
- `CHROME_PATH`: Đường dẫn tới trình duyệt Chrome (mặc định: `C:\Program Files\Google\Chrome\Application\chrome.exe`)

## Cài đặt thư viện cho Browser Acceptance Test:
```bash
npm install
node test_browser_acceptance.js
```
*(Thư mục `node_modules` và `screenshots` tại đây đã được cấu hình trong `.gitignore`)*
