# TỔNG HỢP CÁC THAY ĐỔI BẢO MẬT & KIẾN TRÚC HỆ THỐNG (TUẦN 1)

Tài liệu ghi nhận toàn bộ các điều chỉnh bảo mật, tối ưu hóa hạ tầng và các nguyên tắc kỹ thuật được triển khai trong chiến dịch **"Tuần 1 – Làm cho repo chạy được và an toàn"** của dự án `ecommerce-system-ai-chatbot`.

---

## 1. Chi tiết các bước thực hiện (BƯỚC 0 → 8)

### BƯỚC 0: Khảo sát, dọn dẹp mã nguồn và rà soát rò rỉ
- Quét toàn bộ repository và git commit history tìm các chuỗi secret, mật khẩu DB, API keys.
- Đảm bảo các script và cấu hình không in/log bất kỳ secret thật nào.
- Thêm `.env*` và các artifact nhạy cảm vào `.gitignore`.

### BƯỚC 1: Chuẩn hóa cơ sở dữ liệu & Flyway baseline
- Tạo migration baseline `V1__baseline_schema.sql` (loại bỏ hoàn toàn DDL auto-generate từ Hibernate).
- Đặt `spring.jpa.hibernate.ddl-auto: validate` để đảm bảo code Entity và DB Schema luôn đồng bộ.
- Chuẩn hóa seed script `scripts/seed-dev.sh` và `scripts/seed-dev.ps1`:
  - Chặn chạy nếu môi trường là `prod` hoặc `production` (`SPRING_PROFILES_ACTIVE` / `APP_ENV`).
  - Sử dụng biến môi trường `PGPASSWORD` / `DB_PASSWORD`, không hardcode mật khẩu.
  - Nạp dữ liệu cấu hình danh mục từ `db/seed/reference_data.sql`.

### BƯỚC 2: Multi-stage Dockerfile cho Backend & Frontend
- **Backend Dockerfile:** Build qua 2 stage (Eclipse Temurin 21 JDK Alpine -> JRE Alpine), chạy dưới user không đặc quyền (`spring:spring`), bổ sung `curl` phục vụ container healthcheck `/actuator/health`.
- **Frontend Dockerfile:** Build Next.js 14 qua multi-stage (`node:20-alpine`), cấu hình `output: "standalone"` và chạy dưới user `nextjs:nodejs`.
- **Cấu hình Security Headers:** Thêm các HTTP header bảo mật trong `next.config.mjs` (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`).

### BƯỚC 3: Chuẩn hóa Docker Compose
- Cấu hình mạng `app-tier` và `data-tier` có isolation.
- Khai báo healthcheck toàn diện cho Postgres, Redis, Backend, Frontend với khoảng thời gian hợp lý (`start_period`, `interval`, `retries`).
- Bổ sung `security_opt: [no-new-privileges:true]`, giới hạn tài nguyên CPU/RAM (`limits`).
- Cung cấp compose profiles (`dev`, `tools`, `infra`) để chạy linh hoạt.

### BƯỚC 4: Externalize Secrets & Fail-fast Startup Validation
- Đồng bộ tên DB/user thành `store_dev` giữa `.env.example`, `application.yml`, và `docker-compose.yml`.
- Tạo `SecurityPropertiesValidator.java` kế thừa `ApplicationRunner`:
  - Bắt buộc kiểm tra `JWT_SECRET` khi ứng dụng khởi động.
  - FAIL-FAST (ném ngoại lệ `IllegalStateException` chặn server khởi động) nếu thiếu secret, secret rỗng, hoặc độ dài dưới 32 bytes (256 bits).
- Cung cấp test suite kiểm chứng khởi động Spring Context cho trường hợp thiếu secret và secret yếu.

### BƯỚC 5: Bảo mật Webhook / IPN Thanh toán VNPay
- **Loại bỏ Bypass:** Xóa hoàn toàn nhánh chấp nhận secret giả định `DEMOHASHSECRET` trong `VNPayService.java`.
- **Xác thực chữ ký số:** Kiểm tra tính toàn vẹn chữ ký HMAC-SHA512 với `vnpay.hashSecret` trước khi đọc bất kỳ dữ liệu nào.
- **Chặn HTTP POST:** Endpoint callback của VNPay IPN chỉ chấp nhận `GET`, từ chối `POST` bằng mã lỗi `403 Forbidden` / `404 Not Found`.
- **Kiểm tra trạng thái & Idempotency:**
  - Nếu đơn hàng hoặc giao dịch đã ở trạng thái thành công (`COMPLETED` / `PAID`), trả mã `02` (Order already confirmed) và không xử lý cộng điểm/cập nhật lại.
  - Ngăn chặn triệt để tấn công replay attack khi IPN được gọi nhiều lần.

### BƯỚC 6: Chống thao túng số tiền (Price Tampering) trong khởi tạo thanh toán
- Trong `PaymentController.createVNPayPayment`:
  - Loại bỏ hoàn toàn việc tin tưởng số tiền `amount` gửi lên từ client request body.
  - Truy vấn trực tiếp từ cơ sở dữ liệu (`OrderRepository` / `PaymentTransaction`) để lấy `totalAmount` thực tế của đơn hàng.
  - Từ chối tạo yêu cầu thanh toán (400 Bad Request) nếu đơn hàng đã được thanh toán hoặc đã hủy.
  - Trả 404 Not Found nếu không tìm thấy mã đơn hàng.

### BƯỚC 7: Xóa Guest Checkout không mật khẩu & Siết chặt phân quyền RBAC
- **Loại bỏ Guest-by-email:**
  - Xóa bỏ logic tự động tạo `Customer` với `password_hash = 'GUEST_NO_PASSWORD'` dựa trên email truyền vào từ client.
  - `POST /checkout`, `GET /checkout/preview`, `POST /flash-sales/checkout`: Bắt buộc người dùng phải đăng nhập, lấy thông tin Customer định danh từ `SecurityContext`. Khách chưa đăng nhập lập tức bị từ chối với `401 Unauthorized`.
  - Endpoint tính phí tạm tính `POST /checkout/calculate` được giữ công khai cho khách xem trước giỏ hàng.
- **Phân quyền RBAC:**
  - Khóa toàn bộ các route quản trị `/dashboard/**`: Yêu cầu các quyền `ADMIN`, `MANAGER`, `ACCOUNTANT`.
  - Giới hạn quyền chỉnh sửa banner `POST/PUT/DELETE /banners/**` cho `ADMIN`, `MANAGER`.
  - Sắp xếp thứ tự matcher trong `SecurityConfig` theo nguyên tắc ưu tiên khớp chính xác trước (như `/products/*/reviews`), tránh bị wildcard nuốt mất quyền.
  - Áp dụng nguyên tắc từ chối mặc định: `.anyRequest().authenticated()`.

### BƯỚC 8: Khóa tài khoản Guest & Migration băm mật khẩu cũ
- **Xóa bỏ Fallback Plaintext:**
  - Xóa toàn bộ nhánh `|| rawPassword.equals(...)` trong `AuthController.java` và `CustomerAccountServiceImpl.java`.
  - Bắt buộc kiểm tra mật khẩu qua `passwordEncoder.matches(...)` sử dụng thuật toán BCrypt.
- **Chặn tài khoản Guest đăng nhập:**
  - Nếu trường `password_hash` bắt đầu bằng ký tự `!` hoặc bằng chuỗi `GUEST_NO_PASSWORD`, hệ thống từ chối đăng nhập ngay lập tức với mã lỗi `401 Unauthorized`.
- **Flyway Migration V2 (`V2__hash_legacy_passwords.sql`):**
  - Kích hoạt extension `pgcrypto`.
  - Chuyển toàn bộ tài khoản có `password_hash = 'GUEST_NO_PASSWORD'` sang `!NO_LOGIN`.
  - Băm toàn bộ các mật khẩu cũ chưa được mã hóa (không bắt đầu bằng `$2a$`) trong các bảng `customers` và `staff` sang chuẩn BCrypt bằng `crypt(password_hash, gen_salt('bf', 10))`.
  - Đảm bảo người dùng cũ vẫn đăng nhập thành công với mật khẩu gốc mà không cần reset.

---

## 2. Kế hoạch đăng nhập xã hội (Social Login) cho các bước tiếp theo

> [!NOTE]
> Chiến dịch tuần này **KHÔNG** thêm dependency `oauth2-client` và **KHÔNG** mở bất kỳ endpoint mạng xã hội nào nhằm đảm bảo an toàn tuyệt đối cho hệ thống cốt lõi.

Khi triển khai đăng nhập xã hội (Google / Zalo / Facebook) trong giai đoạn tiếp theo, cần tuân thủ nghiêm ngặt các nguyên tắc kiến trúc sau:
1. **Kiến trúc Session & Cookie tập trung:**
   - Tạo service duy nhất `AuthCookieService` (chịu trách nhiệm issue và clear HttpOnly cookie `access_token`).
   - Tạo service duy nhất `AuthSessionService.createSession(customer)` để sinh phiên đăng nhập cho `Customer` đã xác thực.
   - Tuyệt đối không rải code `setCookie` hay cấu hình cookie tại nhiều controller rời rạc.
2. **Schema cơ sở dữ liệu `customer_identities`:**
   - Tạo bảng riêng `customer_identities (id, customer_id, provider, provider_user_id, email, created_at)`.
   - Cột `customers.password_hash` sẽ chuyển sang `NULLABLE` (thay thế quy ước `!NO_LOGIN` tạm thời).
3. **Quy tắc gộp tài khoản (Account Linking):**
   - Chỉ được phép tự động gộp theo email khi nhà cung cấp danh tính đảm bảo `email_verified = true`.
   - Nếu `email_verified = false`, bắt buộc yêu cầu người dùng xác nhận mật khẩu hiện tại hoặc xác thực qua OTP trước khi liên kết.
4. **Cô lập phân quyền Staff:**
   - **Tuyệt đối không cho phép** bảng nhân viên (`staff`) đăng nhập bằng nhà cung cấp bên ngoài (OAuth2 xã hội). Toàn bộ nhân viên bắt buộc xác thực qua hệ thống tài khoản nội bộ có giám sát.
5. **Bảo mật giao thức OAuth2:**
   - Bắt buộc sử dụng tham số `state` (chống CSRF) kết hợp cơ chế `PKCE` (Proof Key for Code Exchange) cho luồng Authorization Code Flow.

---

## 3. Việc cần làm sau (Post-launch Backlog)

> [!IMPORTANT]
> - **Chuyển đổi QR thanh toán sang thư viện cục bộ:**
>   - Hiện tại ở màn hình giỏ hàng / thanh toán (`frontend/src/app/cart/CartClient.tsx`), mã QR đang được gọi qua dịch vụ bên thứ ba `https://api.qrserver.com/v1/create-qr-code/`.
>   - Rủi ro: Phụ thuộc vào tính khả dụng của bên thứ ba, tiềm ẩn rủi ro rò rỉ dữ liệu tham số URL giao dịch hoặc bị gián đoạn khi mạng quốc tế có sự cố.
>   - Giải pháp: Chuyển sang sinh mã QR hoàn toàn cục bộ (sử dụng thư viện `qrcode` / `qrcode.react` phía frontend hoặc thư viện ZXing phía backend Java) trong giai đoạn tối ưu cổng thanh toán; không xử lý trong phạm vi tuần này.
> - **Cân nhắc nâng cấp Flyway cho PostgreSQL 17:**
>   - Hiện tại Flyway bản `9.22.3` (đi kèm Spring Boot 3.2 parent) cảnh báo PostgreSQL 17.11 mới hơn phiên bản Flyway được kiểm thử chính thức (mặc dù các migration V1 và V2 chạy hoàn toàn ổn định). Cần lập kế hoạch nâng Flyway lên bản 10.x+ tương thích hoàn toàn khi nâng cấp minor Spring Boot.
> - **Chính sách CSP & HSTS khi có HTTPS:**
>   - Bổ sung header `Content-Security-Policy` (CSP) chặt chẽ và `Strict-Transport-Security` (HSTS: max-age=31536000; includeSubDomains; preload) khi triển khai chứng chỉ SSL/TLS (HTTPS) trên môi trường production.

---

## 4. Chi tiết triển khai ĐỢT 8.6 & BƯỚC 9a (Backend Session & CSRF)

1. **/cart/**:
   - Toàn bộ `/cart/**` yêu cầu xác thực (`authenticated()`).
   - Giỏ hàng của khách vãng lai (ẩn danh) lưu hoàn toàn tại `localStorage` phía frontend ([cartStore.ts](file:///d:/DoAnTotNgiep/frontend/src/store/cartStore.ts#L125-L130)).
2. **GET /payment/order-status/{orderCode}**:
   - Yêu cầu đăng nhập; đơn hàng của khách hàng khác trả về `404 Not Found` (chống lộ thông tin tồn tại qua IDOR).
   - Payload trả về tối thiểu: `{"orderCode": "...", "status": "..."}`, không trả số tiền hay thông tin cá nhân.
3. **POST /auth/register**:
   - Tắt tính năng đăng ký bằng cờ `app.auth.registration-enabled: false` (mặc định trả 404).
   - Triển khai [AccountValidationService](file:///d:/DoAnTotNgiep/backend/src/main/java/com/store/service/AccountValidationService.java) kiểm tra trùng lặp email chéo giữa `staff` và `customers`.
4. **Idempotency xử lý IPN VNPay**:
   - Dùng chung hằng số `PaymentTransaction.STATUS_SUCCESS = "SUCCESS"`, `STATUS_FAILED = "FAILED"`.
   - Cả [PaymentController.handleVnPayIpn](file:///d:/DoAnTotNgiep/backend/src/main/java/com/store/controller/PaymentController.java#L192) và [CheckoutServiceImpl.handlePaymentSuccess](file:///d:/DoAnTotNgiep/backend/src/main/java/com/store/service/impl/CheckoutServiceImpl.java#L790) được bọc trong `@Transactional`.
5. **ClientIpUtil & Login Rate Limiting kép**:
   - [ClientIpUtil](file:///d:/DoAnTotNgiep/backend/src/main/java/com/store/util/ClientIpUtil.java) chỉ tin cậy `X-Forwarded-For` từ proxy tin cậy (`127.0.0.1`, `::1`), mặc định fallback về `remoteAddr`.
   - Giới hạn đăng nhập kép: 5 lần sai/1 phút theo cặp (IP + email) VÀ 20 lần sai/10 phút theo tài khoản email.
6. **Thống nhất PostgreSQL 17**:
   - Dòng 12 trong [V1__baseline_schema.sql](file:///d:/DoAnTotNgiep/backend/src/main/resources/db/migration/V1__baseline_schema.sql#L12) là `SET transaction_timeout = 0;` (chỉ có từ PG17).
   - Thống nhất toàn bộ môi trường về `postgres:17-alpine` trong docker-compose, Testcontainers và README.
7. **Bảo mật phiên đăng nhập Backend (BƯỚC 9a)**:
   - [AuthCookieService](file:///d:/DoAnTotNgiep/backend/src/main/java/com/store/service/AuthCookieService.java): phát hành cookie `access_token` với cờ `HttpOnly=true`, `SameSite=Lax`, `Path=/`, `Max-Age=7200` (theo cấu hình `jwt.expiration`).
   - [AuthSessionService](file:///d:/DoAnTotNgiep/backend/src/main/java/com/store/service/AuthSessionService.java): điểm duy nhất tạo phiên cho `Customer` và `Staff`. Đăng nhập không trả token trong JSON body.
   - [JwtAuthenticationFilter](file:///d:/DoAnTotNgiep/backend/src/main/java/com/store/security/JwtAuthenticationFilter.java): ưu tiên đọc cookie `access_token` trước, fallback về header `Authorization: Bearer <token>`, parse JWT đúng 1 lần/request.
   - `POST /auth/logout` xoá cookie; `GET /auth/me` đọc thông tin từ `SecurityContextHolder`.
   - Kích hoạt phòng thủ CSRF Double-Submit với `CookieCsrfTokenRepository.withHttpOnlyFalse()` cho các request ghi, miễn trừ `/auth/login` và IPN VNPay.

