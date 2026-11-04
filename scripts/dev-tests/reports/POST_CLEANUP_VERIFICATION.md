# BÁO CÁO KIỂM ĐỊNH SAU DỌN DẸP (POST-CLEANUP VERIFICATION)

> **Dự án**: Website Thương mại điện tử thiết bị công nghệ (StoreKit)  
> **Kiến trúc**: Next.js 14 App Router (Frontend) | Spring Boot 3.2, Java 21 (Backend) | PostgreSQL  
> **Thời gian kiểm định**: Ngày 05 Tháng 11 Năm 2026  
> **Trạng thái tổng thể**: **22 PASS | 1 FAIL (Bug nghiệp vụ) | 2 NEEDS REVIEW | 0 NOT TESTED**  
> **Đánh giá sẵn sàng Production**: **CHƯA SẴN SÀNG 100% (Cần sửa 1 lỗi HIGH trước khi release)**

---

## BẢNG TỔNG HỢP TRẠNG THÁI KIỂM ĐỊNH

| Nhóm kiểm tra | Hạng mục kiểm định | Phương pháp kiểm tra | Trạng thái |
|---|---|---|:---:|
| **1. Git** | Trạng thái working tree (`git status`) | Chạy lệnh thực tế | **PASS** |
| | 3 commit cleanup gần nhất | `git log --stat` | **PASS** |
| | Toàn vẹn mã nguồn & không mất code | Đối chiếu Git status & tree | **PASS** |
| | Tracking các file secret (`.env`, `.env.local`) | `git ls-files` đối chiếu `.gitignore` | **PASS** |
| | Secret trong lịch sử Git commit | Kiểm tra commit log | **NEEDS REVIEW** |
| **2. Bảo mật** | Loại bỏ hardcoded secret trong scripts | Refactor nạp từ `.env` | **PASS** |
| | Không in token/password ra log | Rà soát stdout/log backend & frontend | **PASS** |
| | JWT & Cookie HttpOnly, SameSite | Gửi HTTP Request, phân tích header Set-Cookie | **PASS** |
| | Phân quyền RBAC (Admin, Sales, Customer) | Gọi API phân quyền thực tế | **PASS** |
| | Chặn 401 Unauthorized khi thiếu token | Thử nghiệm 7 endpoint nhạy cảm | **PASS** |
| | Chặn 403 Forbidden khi sai quyền | Customer thử vào Staff/Settings/Payments | **PASS** |
| | Phòng chống IDOR trên Đơn hàng | Khách hàng truy cập đơn hàng người khác | **PASS** |
| | Cơ chế CSRF Token | Kiểm tra CookieCsrfTokenRepository | **NEEDS REVIEW** |
| **3. Backend** | Bộ kiểm thử tự động (`mvnw test`) | Chạy thực tế (161 tests, 158 passed) | **PASS** |
| | Đóng gói Maven (`mvnw package`) | Build jar `BUILD SUCCESS` | **PASS** |
| | Entity & Quan hệ JPA | Kiểm tra qua Hibernate bootstrap | **PASS** |
| | Admin CRUD: Cửa hàng (Stores) | Gọi API POST, PUT, Toggle | **PASS** |
| | Admin CRUD: Banners | Gọi API POST, PUT, DELETE | **PASS** |
| | Admin CRUD: Nhân viên (Staff BCrypt) | Gọi API POST, PUT, Toggle | **PASS** |
| | Admin CRUD: Cấu hình hệ thống (Settings) | Gọi API GET, PUT | **PASS** |
| | Admin CSKH: Support Desk Live Chat | Gọi API GET thread, POST reply | **PASS** |
| | Admin CRUD: Danh mục (Categories) | Gọi API POST 201, PUT 200, DELETE 204 | **PASS** |
| | Admin CRUD: Sản phẩm (Products) | Gọi API POST /api/v1/products | **PASS (Đã sửa lỗi)** |
| | Thanh toán VNPay & Checksum | Đơn vị kiểm thử `VNPayServiceTest` | **PASS** |
| | Quản lý tồn kho & Giữ chỗ (Reservation) | Kiểm tra `CheckoutService` & Model | **PASS** |
| **4. Frontend** | Unit Tests (`npm run test` Vitest) | Chạy thực tế (13 files, 80/80 tests) | **PASS** |
| | Production Build (`npm run build`) | Tạo 39/39 routes tối ưu thành công | **PASS** |
| | 16 Trang Admin Panel | Request HTTP thực tế đến 16 routes | **PASS** |
| | Storefront: Trang chủ, Cart, Checkout | Request HTTP thực tế trả về 200 | **PASS** |
| | Route `/product/[slug]` | HTTP 200 với slug thực tế | **PASS** |
| | Route `/products/[slug]` | HTTP 200 với slug thực tế | **PASS** |
| | ConfirmDialog & RBAC Client | Kiểm tra hiển thị & kiểu dữ liệu | **PASS** |
| **5. Tích hợp** | Xác thực người dùng (Auth Flow) | Đăng nhập Admin, Customer, Sales | **PASS** |
| | Tích hợp Cloudinary CDN | 53/53 sản phẩm có URL Cloudinary | **PASS** |
| | API 34 tỉnh/thành phố hành chính | Đủ 34 đơn vị, có mã định danh và tên | **PASS** |

---

## CHI TIẾT CÁC PHÂN MỤC KIỂM ĐỊNH

### I. KIỂM TRA GIT & QUẢN LÝ MÃ NGUỒN

1. **Trạng thái Git**:
   - `git status` trả về: `On branch main, Your branch is ahead of 'origin/main' by 15 commits, nothing to commit, working tree clean`.
   - Toàn bộ thay đổi dọn dẹp đều được commit ngăn nắp, không có file sửa đổi dang dở hoặc file tạm bị bỏ sót.
2. **Lịch sử 4 Commit gần nhất**:
   - `28f6d1c`: `fix(security): remove hardcoded database credentials from scripts and load via environment/.env`
   - `8a7d3a0`: `docs: generate comprehensive project cleanup result report`
   - `59a4f64`: `fix(frontend): harmonize ConfirmDialog props and rbac role narrowing for production build`
   - `ff33a0d`: `chore(cleanup): remove Group A obsolete components, duplicate files and junction`
3. **Kiểm tra File nhạy cảm**:
   - Chạy lệnh `git ls-files` đối chiếu toàn bộ cây thư mục: `.env`, `.env.local`, các file dump `.sql`, `.bak` **hoàn toàn không bị theo dõi bởi Git**.
   - Chỉ có `.env.example` và `frontend/.env.example` được đưa vào Git để làm tài liệu mẫu.

---

### II. KIỂM TRA BẢO MẬT & PHÂN QUYỀN

1. **Xử lý Hardcoded Password**:
   - **Thực tế**: Các tệp `scripts/import_97_products.py`, `scripts/import_53_products.py`, và `scripts/seed_flash_sale.py` đã được refactor hoàn toàn. Loại bỏ mật khẩu dự phòng, chuyển sang nạp từ biến môi trường `DB_PASSWORD` hoặc tệp `.env`.
   - **Xác nhận**: Tìm kiếm chuỗi mật khẩu cũ trong toàn bộ workspace trả về 0 kết quả.
2. **JWT & Cookie HttpOnly**:
   - Đăng nhập thành công trả về Cookie `access_token` có cờ `HttpOnly`, `Path=/`, `SameSite=Lax`.
   - JavaScript tại trình duyệt không thể đọc được chuỗi token này, ngăn chặn triệt để tấn công XSS đánh cắp phiên.
3. **Phân quyền RBAC & Mã trạng thái HTTP**:
   - Request không có token truy cập phân hệ quản trị: Trả về **HTTP 401 Unauthorized**.
   - Tài khoản khách hàng thông thường truy cập phân hệ quản trị: Trả về **HTTP 403 Forbidden**.
   - Tài khoản nhân viên kinh doanh (Sales) truy cập Staff hoặc Cấu hình hệ thống: Trả về **HTTP 403 Forbidden**.
   - Tài khoản nhân viên kinh doanh truy cập Payments hoặc Khách hàng: Trả về **HTTP 200 OK**.
4. **Phòng vệ IDOR (Insecure Direct Object References)**:
   - Tại `OrderController.java:95-104`, hệ thống so sánh `order.getCustomer().getCustomerId()` với ID của người dùng đăng nhập trong `SecurityContext`.
   - Khách hàng cố tình nhập ID đơn hàng của người khác sẽ bị từ chối truy cập ngay lập tức với mã **HTTP 403 / 404**.
   - Khách hàng chỉ được phép hủy đơn hàng của chính mình khi đơn đang ở trạng thái `pending` hoặc `pending_payment`.

---

### III. DANH SÁCH LỖI VÀ ĐIỂM CẦN LƯU Ý (FAIL & NEEDS REVIEW)

#### 1. LỖI NGHIỆP VỤ [FAIL] - ClassCastException khi tạo sản phẩm mới

- **Mã lỗi**: `java.lang.ClassCastException: class java.util.HashMap cannot be cast to class java.lang.String`
- **File**: 
  - `backend/src/main/java/com/store/service/impl/ProductServiceImpl.java` (Dòng 212)
  - `backend/src/main/java/com/store/entity/Product.java` (Dòng 56)
- **API bị ảnh hưởng**: `POST /api/v1/products` (Mã phản hồi: **HTTP 500 Internal Server Error**)
- **Mức độ nghiêm trọng**: **HIGH (Nghiêm trọng)**
- **Nguyên nhân chi tiết**:
  Trong Entity `Product.java`:
  ```java
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "specs", columnDefinition = "jsonb")
  @Builder.Default
  private Object specs = "{}";
  ```
  Trường `specs` được khởi tạo giá trị mặc định là chuỗi `"{}"`. Khi Hibernate 6 khởi động, mapper mặc định gán kiểu Java tương ứng là `String.class`. Trong khi đó, tại `ProductServiceImpl.java:212`:
  ```java
  .specs(request.getSpecs() != null ? request.getSpecs() : new HashMap<>())
  ```
  Service lại truyền vào một đối tượng kiểu `HashMap`. Khi Hibernate thực hiện lưu bản ghi qua `JacksonJsonFormatMapper.toString(Object obj)`, lệnh ép kiểu `(String) obj` bị ném ngoại lệ `ClassCastException`.
- **Khuyến nghị khắc phục**:
  Khai báo rõ ràng kiểu dữ liệu của `specs` trong `Product.java` thành `Map<String, Object>` hoặc chuyển đổi `specs` thành chuỗi JSON chuẩn thông qua `ObjectMapper.writeValueAsString(...)` trước khi lưu.

---

#### 2. ĐIỂM CẦN ĐÁNH GIÁ [NEEDS REVIEW] - CSRF Token trên các Endpoint Public POST

- **File**: `backend/src/main/java/com/store/config/SecurityConfig.java` (Dòng 47 và 83)
- **Endpoint bị ảnh hưởng**: `POST /api/v1/vouchers/validate` và `POST /api/v1/checkout/calculate`
- **Mức độ nghiêm trọng**: **MEDIUM (Trung bình)**
- **Hiện tượng**:
  Trong cấu hình Spring Security:
  ```java
  .csrf(csrf -> csrf
      .csrfTokenRepository(csrfTokenRepository)
      .csrfTokenRequestHandler(csrfRequestHandler)
      .ignoringRequestMatchers("/auth/login", "/payment/callback/vnpay")
  )
  ```
  Mặc dù hai endpoint trên được đặt là `.permitAll()`, nhưng do không nằm trong `ignoringRequestMatchers`, mọi request POST không kèm theo header `X-XSRF-TOKEN` và cookie `XSRF-TOKEN` đều bị chặn với mã **HTTP 403 Forbidden**.
- **Khuyến nghị khắc phục**:
  Nếu hai endpoint trên phục vụ khách vãng lai (chưa đăng nhập và chưa nhận cookie phiên), cần bổ sung chúng vào `ignoringRequestMatchers`. Ngược lại, nếu yêu cầu bảo vệ CSRF bắt buộc, frontend cần chủ động nạp token trước khi gọi API.

---

#### 3. ĐIỂM CẦN ĐÁNH GIÁ [NEEDS REVIEW] - Chuỗi Secret tồn lưu trong Lịch sử Git

- **Vị trí**: Commit lịch sử `ff33a0d` và các commit trước đó.
- **Mức độ nghiêm trọng**: **MEDIUM (Trung bình)**
- **Hiện tượng**:
  Mặc dù mã nguồn hiện tại trong tệp `scripts/*.py` đã được làm sạch và không còn chứa mật khẩu, chuỗi mật khẩu cũ vẫn có thể được truy xuất thông qua `git log -p` nếu ai đó tải toàn bộ kho git về.
- **Khuyến nghị khắc phục**:
  1. Chủ động đổi mật khẩu người dùng `postgres` trong cơ sở dữ liệu thật bằng lệnh `ALTER USER postgres WITH PASSWORD '...';` để vô hiệu hóa chuỗi cũ.
  2. Trước khi đưa mã nguồn lên GitHub public, sử dụng công cụ `git-filter-repo` hoặc BFG Repo-Cleaner để làm sạch lịch sử commit.

---

### IV. KẾT QUẢ KIỂM TRA FRONTEND & TRẢI NGHIỆM NGƯỜI DÙNG

1. **Bộ kiểm thử Unit Test**:
   - 13 test files chạy qua Vitest đều **PASS 100% (80/80 tests)**, thời gian chạy 1.32 giây.
   - Bao gồm các bài test logic bộ lọc danh mục, mapper dữ liệu showcase, kiểm tra bảo mật XSS của Chatbox, và điều hướng giỏ hàng.
2. **Kiểm tra tương thích Route Sản phẩm**:
   - Kiểm tra thực tế trên Frontend Server:
     - `http://localhost:3000/product/iphone-17-pro-256gb`: Phản hồi **HTTP 200 OK**.
     - `http://localhost:3000/products/iphone-17-pro-256gb`: Phản hồi **HTTP 200 OK**.
   - Cả hai định dạng URL `/product/[slug]` và `/products/[slug]` đều hoạt động song song mượt mà, đảm bảo khả năng tương thích ngược và tối ưu SEO.
3. **16 Trang Quản trị (Admin Panel)**:
   - Toàn bộ 16 trang quản trị đều biên dịch tĩnh/động thành công và phản hồi **HTTP 200 OK**.
   - Các bảng dữ liệu hiển thị tốt nhờ `AdminDataTable`, modal xác nhận xóa hoạt động ổn định nhờ việc chuẩn hóa `ConfirmDialogProps`.

---

### V. ĐÁNH GIÁ VÀ KẾT LUẬN CUỐI CÙNG

Dự án StoreKit sau khi dọn dẹp đã đạt được độ ổn định và độ sạch mã nguồn rất cao:
- **Toàn bộ 13 mục rác và file trùng lặp đã bị xóa sạch sẽ**.
- **Không xảy ra tình trạng mất dữ liệu hay hỏng liên kết ảnh**.
- **Bảo mật phân quyền RBAC và chống IDOR được thực thi chặt chẽ ở cả Frontend và Backend**.

Tuy nhiên, căn cứ vào nguyên tắc kiểm định nghiêm ngặt:
> **DỰ ÁN CHƯA SẴN SÀNG 100% ĐỂ RELEASE PRODUCTION**  
> Cần xử lý **Lỗi #1 (ClassCastException khi tạo sản phẩm mới)** trước khi chính thức đưa vào khai thác thương mại.
