# BÁO CÁO TOÀN DIỆN AUDIT & KẾ HOẠCH DỌN DẸP DỰ ÁN (CLEANUP AUDIT)

> **Dự án**: Website Thương mại Điện tử Bán thiết bị Công nghệ (Mô hình CellphoneS)  
> **Kiến trúc**: Next.js 14 App Router, TypeScript, Spring Boot 3.2, Java 21, PostgreSQL, Redis  
> **Người thực hiện audit**: Senior Software Engineer / Codebase Auditor  
> **Ngày lập báo cáo**: 05/11/2026  
> **Trạng thái**: Chờ phê duyệt (CHƯA THỰC HIỆN XÓA / SỬA BẤT KỲ FILE NÀO)

---

## I. CẤU TRÚC TỔNG QUAN PROJECT

Dự án là một hệ thống thương mại điện tử hoàn chỉnh theo mô hình micro-repo gồm 2 khối chính (Frontend Next.js và Backend Spring Boot), cùng các thư mục tài nguyên và kịch bản hỗ trợ phát triển:

```text
D:\DoAnTotNgiep
├── .agents/                 # Cấu hình AI agent skills và instructions
├── .continue/               # Cấu hình trợ lý lập trình Continue
├── .github/                 # GitHub workflows & CI/CD
├── .vscode/                 # Workspace settings
├── backend/                 # Spring Boot 3.2 (Java 21, Maven, PostgreSQL, Redis)
│   ├── src/main/java/com/store/
│   │   ├── chat/            # Trợ lý AI tư vấn bán hàng (Gemini LLM, tools, rate limit)
│   │   ├── config/          # SecurityConfig, DataInitializer, LlmProperties, v.v.
│   │   ├── controller/      # REST API Controllers (Storefront & Admin 15 phân hệ)
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entity/          # JPA Entities (3NF Data Model)
│   │   ├── repository/      # Spring Data JPA Repositories
│   │   ├── scheduler/       # Scheduled jobs (giữ chỗ tồn kho, retention log)
│   │   ├── security/        # JWT Authentication, Rate Limiters
│   │   ├── service/         # Business logic interfaces & ServiceImpl
│   │   └── util/            # ClientIpUtil, v.v.
│   ├── src/main/resources/
│   │   ├── chat/            # System prompt & chính sách bán hàng (JSON/TXT)
│   │   ├── data/            # 34 đơn vị hành chính cấp tỉnh chuẩn Việt Nam
│   │   └── db/              # Flyway baseline schema & migrations
│   └── target/              # [CACHE/BUILD] Thư mục output của Maven
├── frontend/                # Next.js 14 App Router (TypeScript, Zustand, Vanilla CSS Modules)
│   ├── src/
│   │   ├── actions/         # Next.js Server Actions (Revalidate Showcase cache)
│   │   ├── app/             # App Router: Storefront routes & Admin 15 phân hệ routes
│   │   ├── components/      # React Components (Admin, Chat, Home, Product, Navigation...)
│   │   ├── config/          # Cấu hình Showcase, Chat, Search
│   │   ├── data/            # Dữ liệu nội bộ frontend
│   │   ├── hooks/           # Custom React hooks (useFavorites)
│   │   ├── lib/             # RBAC logic, Server-side API fetching (lib/api), Mappers
│   │   ├── services/        # Client-side API services (Axios apiClient, Auth, Cart...)
│   │   ├── store/           # Zustand state management (Auth, Cart, Chat, Compare, Wishlist)
│   │   ├── tests/           # Vitest unit test suites
│   │   ├── types/           # TypeScript interfaces & types
│   │   └── utils/           # Tiện ích format tiền tệ, múi giờ Việt Nam, flash sale
│   ├── .next/               # [CACHE/BUILD] Build cache của Next.js
│   └── node_modules/        # [CACHE] Thư viện phụ thuộc Node.js
├── database/                # Dữ liệu mẫu khởi tạo DB & schema tham chiếu
│   ├── legacy/              # [LEGACY] Schema sơ khai ban đầu (đã lỗi thời)
│   └── seed/                # Dữ liệu mẫu (reference_data.sql chuẩn & các file cũ)
├── backup/                  # [BACKUP] Các bản sao lưu DB PostgreSQL (.dump, .sql)
├── sanpham/                 # [DEV TOOL] Script tải/upload ảnh Cloudinary và file ảnh gốc
├── scratch/                 # [TEMP] Các script node test thử nghiệm API ad-hoc
├── scripts/                 # Kịch bản vận hành dev (run-backend-env, seed-dev, v.v.)
├── docs/                    # Tài liệu kiến trúc, báo cáo tiến độ, ERD
├── docker-compose.yml       # Docker compose chạy PostgreSQL 16 & Redis 7
├── README.md                # Tài liệu hướng dẫn cài đặt dự án
└── .env                     # Biến môi trường local (chứa secret)
```

---

## II. DANH SÁCH FILE PHÂN LOẠI CHI TIẾT

### NHÓM A: SAFE TO DELETE (Chắc chắn không còn sử dụng)
*Những file này hoàn toàn thừa, không có bất kỳ liên kết hay phụ thuộc nào từ code, build tool, hay runtime hệ thống. Đã kiểm tra 100% bằng chứng.*

| STT | Đường dẫn chính xác | Loại file | Lý do phân loại | Bằng chứng kiểm tra | Rủi ro / Thành phần ảnh hưởng |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `frontend/src/components/admin/AdminComingSoon.tsx` | React Component | Component placeholder hiển thị *"Phân hệ đang được hoàn thiện"* được tạo tạm ở Phase 1. Nay toàn bộ 15 phân hệ đã được xây dựng giao diện CRUD hoàn chỉnh. | Tìm kiếm toàn bộ `frontend/src`: 0 import, 0 reference, không có trong `components/admin/index.ts`. | **Không có (0%)**. Không có trang hay component nào gọi đến. |
| **2** | `frontend/src/components/admin/AdminComingSoon.module.css` | CSS Module | CSS định kiểu đi kèm độc quyền của `AdminComingSoon.tsx`. | Chỉ được import bởi `AdminComingSoon.tsx`. | **Không có (0%)**. |
| **3** | `frontend/src/components/admin/ProductPickerModal.tsx` | React Component | Modal chọn nhanh sản phẩm thử nghiệm cũ trong admin. Hiện tại các trang Showcase, Flash Sale và Sản phẩm đều có modal form/picker chuyên biệt hoặc xử lý trực tiếp. | Tìm kiếm toàn bộ `frontend/src`: 0 import, 0 reference, không có trong `components/admin/index.ts`. | **Không có (0%)**. |
| **4** | `frontend/src/components/admin/ProductPickerModal.module.css` | CSS Module | CSS định kiểu đi kèm độc quyền của `ProductPickerModal.tsx`. | Chỉ được import bởi `ProductPickerModal.tsx`. | **Không có (0%)**. |
| **5** | `frontend/src/data/products.cloudinary.json` | JSON Data | Bản sao chép thủ công từ `sanpham/products.cloudinary.json` vào thư mục frontend, nhưng frontend không hề có code đọc file JSON này (frontend lấy sản phẩm từ API Spring Boot). | Tìm kiếm toàn bộ `frontend/src`: 0 reference tới file này. | **Không có (0%)**. |
| **6** | `sanpham/products (1).json` | JSON Data | File trùng lặp được sinh ra do thao tác copy/paste trong Windows Explorer từ file `products.json`. | Check SHA-256 hash bằng lệnh `Get-FileHash`: Trùng khớp 100% mã băm SHA-256 với `sanpham/products.json` (`0D03688876C3A23606F3CA2BB2CB85E98CD94269B35F2E8721F8198E10111D57`). | **Không có (0%)**. File gốc `products.json` vẫn tồn tại nguyên vẹn. |
| **7** | `sanpham/anhwweb` | Windows Junction | Liên kết tượng trưng (Junction) trỏ tới `sanpham/annhsp`, được tạo do gõ sai chính tả tên thư mục ảnh. | Lệnh `dir sanpham` xác nhận đây là Junction `<JUNCTION> anhwweb [d:\DoAnTotNgiep\sanpham\annhsp]`. Không có script hay code nào tham chiếu `anhwweb`. | **Không có (0%)**. Thư mục thật `sanpham/annhsp` vẫn được giữ nguyên. |
| **8** | `scratch/check_models.js` | Node.js Script | Script ad-hoc chạy thử độc lập để kiểm tra danh sách model Gemini API khi phát triển Chatbot. | Nằm ở thư mục scratch ngoài root, không nằm trong package.json hay pipeline build. | **Không có (0%)**. |
| **9** | `scratch/test_all_models.js` | Node.js Script | Script ad-hoc thử nghiệm latency và hạn mức các model AI. | Nằm ở thư mục scratch ngoài root, không có liên kết hệ thống. | **Không có (0%)**. |
| **10** | `scratch/test_func_role.js` | Node.js Script | Script ad-hoc thử nghiệm payload function calling của Gemini. | Nằm ở thư mục scratch ngoài root, không có liên kết hệ thống. | **Không có (0%)**. |
| **11** | `scratch/test_generate.js` | Node.js Script | Script ad-hoc sinh phản hồi AI mẫu. | Nằm ở thư mục scratch ngoài root, không có liên kết hệ thống. | **Không có (0%)**. |
| **12** | `scratch/test_policy.js` | Node.js Script | Script ad-hoc kiểm tra định dạng chính sách bán hàng. | Nằm ở thư mục scratch ngoài root, không có liên kết hệ thống. | **Không có (0%)**. |
| **13** | `scratch/test_tool_flow.js` | Node.js Script | Script ad-hoc chạy thử chu trình gọi công cụ (tool calling). | Nằm ở thư mục scratch ngoài root, không có liên kết hệ thống. | **Không có (0%)**. |

---

### NHÓM B: POSSIBLY UNUSED (Có dấu hiệu không dùng, cần xác nhận của User)
*Những file này là code cũ, seed dữ liệu lỗi thời hoặc bản backup lịch sử. Dự án hiện tại không còn chạy chúng trong chu trình chính, nhưng cần xác nhận của User trước khi loại bỏ.*

| STT | Đường dẫn chính xác | Loại file | Lý do & Bằng chứng kiểm tra | Phân tích rủi ro & Khuyến nghị |
| :---: | :--- | :--- | :--- | :--- |
| **1** | `database/legacy/V1__init_schema.sql` | SQL Schema | Schema sơ khai ban đầu của đồ án. `database/legacy/README.md` ghi rõ: *"Tệp này không còn được sử dụng và đã được thay thế hoàn toàn bởi V1__baseline_schema.sql"*. | **Rủi ro rất thấp**. Không ảnh hưởng đến Flyway hay DB hiện tại. Khuyến nghị: Có thể xóa hoặc nén vào tài liệu lưu trữ. |
| **2** | `database/seed/V2__seed_data.sql` | SQL Seed | File seed cũ từ phiên bản sơ khai (sử dụng cột `sku`, `price`, `brand` trực tiếp trên bảng `products`, không qua `product_variants`). Khối này chạy sẽ gây lỗi SQL trên schema mới. | **Rủi ro rất thấp**. Khuyến nghị: Xóa vì đã có `reference_data.sql` thay thế. |
| **3** | `database/seed/full_seed_data.sql` | SQL Seed | File seed cũ thiếu cột `order_code` ở bảng `orders` (vi phạm ràng buộc `NOT NULL UNIQUE`). | **Rủi ro rất thấp**. Khuyến nghị: Xóa để tránh lập trình viên khác chạy nhầm làm hỏng DB. |
| **4** | `database/seed/seed_laptops.sql`<br>`database/seed/seed_phones.sql`<br>`database/seed/seed_watch_audio.sql`<br>`database/seed/seed_banners.sql`<br>`database/seed/update_banners.sql` | SQL Seed | Các file seed sản phẩm và banner riêng lẻ cũ. Các câu lệnh `INSERT INTO brands` trong các file này thiếu cột `slug` (`NOT NULL UNIQUE`). Toàn bộ dữ liệu này đã được chuẩn hóa vào `reference_data.sql`. | **Rủi ro rất thấp**. Đã được tài liệu hóa trong `database/seed/README.md` là bị thay thế bởi `reference_data.sql`. |
| **5** | `backend/src/main/resources/db/migration-archive/` (gồm 7 files từ `V3` đến `V9`) | SQL Migration Archive | Các tệp migration cũ từ lúc phát triển đồ án (checkout, flash sale, reviews). Toàn bộ cấu trúc đã được gộp (squash) hoàn chỉnh vào `V1__baseline_schema.sql` ngày 11/10/2026. `application.yml` chỉ định `flyway.locations: classpath:db/migration`. | **Rủi ro rất thấp**. Flyway không đọc thư mục `migration-archive`. Khuyến nghị: Giữ lại nếu muốn xem lịch sử tiến hóa schema, hoặc chuyển ra ngoài thư mục `docs/`. |
| **6** | `backend/src/main/resources/db/rollback/V3__checkout_rollback.sql` | SQL Rollback Script | File rollback của bản migration cũ V3. Không nằm trong classpath đọc của Flyway. | **Rủi ro rất thấp**. |
| **7** | `backup/` (5 files: `.dump` và `.sql`, ~1.5 MB) | PostgreSQL Dumps | Các bản dump database chụp nhanh trong tháng 10/2026 trước khi nâng cấp chức năng review và import sản phẩm. | **Rủi ro rất thấp**. Không phục vụ build hay runtime. Khuyến nghị: Lưu trữ ra ổ cứng ngoài hoặc Google Drive, không cần commit trong Git repo. |
| **8** | `sanpham/products_cloudinary.json` (95 KB, 97 sản phẩm) & `scripts/import_97_products.py` | Data & Python Script | Phiên bản nạp 97 sản phẩm trước đây. Sau đó dự án đã chuẩn hóa lại với bộ 53 sản phẩm đầy đủ thông số hơn (`sanpham/products.cloudinary.json` và `scripts/import_53_products.py`). Ngoài ra script này chứa hardcoded DB password. | **Rủi ro thấp**. Khuyến nghị: Giữ lại `import_53_products.py` và lưu trữ file 97 sản phẩm này. |
| **9** | `scripts/generate_preview_html.py` | Python Script | Script tự sinh mã HTML để xem trước giao diện các showcase sản phẩm trong trình duyệt offline. | **Rủi ro rất thấp**. Không ảnh hưởng đến ứng dụng web chính. |
| **10** | `backend/src/main/java/com/store/entity/PaymentMethod.java` | Java Enum | Enum định nghĩa: `cod, bank_transfer, credit_card, momo, zalopay, vnpay`. Trong toàn bộ code hiện tại, phương thức thanh toán đều lưu và truyền tải dưới dạng `String` (`"VNPAY"`, `"STORE"`, `"COD"`) và quản lý qua bảng `PaymentMethodConfig`. Enum này không được import ở đâu. | **Rủi ro trung bình**. Cần kiểm tra xem có mapping ngầm Hibernate enum ở migration cũ nào không. Hiện tại baseline schema dùng cột `varchar(50)`. |
| **11** | `backend/src/main/java/com/store/entity/PaymentStatus.java` | Java Enum | Enum định nghĩa: `unpaid, paid, failed, refunded`. Hiện tại trạng thái thanh toán trong `PaymentTransaction` sử dụng các hằng số chuỗi (`STATUS_INITIATED`, `STATUS_SUCCESS`, `STATUS_FAILED`) và `OrderStatus`. | **Rủi ro trung bình**. Cần đối chiếu với cấu trúc enum PostgreSQL nếu có. |
| **12** | `backend/src/main/java/com/store/entity/Supplier.java` | JPA Entity | Ánh xạ bảng `suppliers` trong database. Tuy nhiên hiện tại backend chưa có repository hay controller quản lý nhà cung cấp. | **Rủi ro trung bình**. Nếu Hibernate chạy ở chế độ `ddl-auto: validate`, việc giữ entity này giúp validate đúng bảng `suppliers` đã có trong database. Khuyến nghị: **Nên GIỮ LẠI (KEEP)** để phục vụ mở rộng tính năng quản lý nhà cung cấp sau này. |

---

### NHÓM C: KEEP (Tuyệt đối giữ lại, đang được sử dụng hoặc có vai trò cốt lõi)
*Những file này đang trực tiếp phục vụ giao diện, nghiệp vụ, API, bảo mật, hoặc kiểm thử tự động.*

#### 1. Frontend Core & Pages
- `frontend/src/app/page.tsx` & `globals.css`: Trang chủ chính thức tích hợp 6 Showcase lớn và Banner.
- `frontend/src/app/admin/*` (toàn bộ 16 trang quản trị): `layout.tsx`, `page.tsx` (Dashboard), `products`, `categories`, `brands`, `orders`, `payments`, `customers`, `inventory`, `stores`, `coupons`, `flash-sale`, `banners`, `category-showcase`, `laptop-showcase`, `watch-showcase`, `reviews`, `support`, `staff`, `settings`.
- `frontend/src/app/product/[slug]/page.tsx`: **Đặc biệt lưu ý** - File này dài 72 bytes nhưng là **Route Alias** quan trọng re-export từ `products/[slug]/page.tsx` để người dùng hoặc SEO truy cập `/product/...` hay `/products/...` đều không bị lỗi 404.
- `frontend/src/app/products/*`, `category/*`, `cart/*`, `checkout/*`, `account/*`, `compare/*`, `login/*`, `search/*`, `stores/*`: Các trang nghiệp vụ khách hàng Storefront.
- `frontend/src/app/api/flash-sale/route.ts` & `revalidate-showcase/route.ts`: Các Next.js Route Handlers phục vụ API nội bộ và xóa cache On-demand ISR.

#### 2. Frontend Components & Two-layer API Architecture
- Toàn bộ 53 components trong `frontend/src/components/`:
  - `admin/`: `AdminDataTable.tsx`, `StatusBadge.tsx`, `ConfirmDialog.tsx`.
  - `home/`: `HeroBanner.tsx`, `FlashSale.tsx`, `CategoryShowcase.tsx`, `AccessoryShowcase.tsx`, `LaptopShowcase.tsx`, `WatchAudioShowcase.tsx`, `Experience5T.tsx`.
  - `navigation/`: `Navbar.tsx` (Popup tỉnh/thành, menu phân cấp), `Footer.tsx`, `LayoutShell.tsx`.
  - `product/`: Toàn bộ 16 component trang chi tiết sản phẩm (Gallery, Specs, Pricing, Promotions, Reviews, Warranty, Commitments, Bundles, v.v.).
  - `chat/`: Toàn bộ 5 component khung chat AI tư vấn thông minh (`AiChatbox.tsx`, `ChatInput.tsx`, `ChatMessageList.tsx`...).
- **Kiến trúc API 2 tầng không được xóa nhầm**:
  - Tầng 1 - Server-side Data Fetching (`frontend/src/lib/api/*.ts`): Chạy trên Node.js server của Next.js với native `fetch()`, gắn tag revalidate và schema validation qua `zod`.
  - Tầng 2 - Client-side Data Fetching (`frontend/src/services/*.ts`): Chạy trên trình duyệt với Axios `apiClient`, tự động gửi kèm cookie JWT, `XSRF-TOKEN` và xử lý refresh token.
- Toàn bộ 5 Zustand Store (`authStore`, `cartStore`, `chatStore`, `compareStore`, `wishlistStore`).
- Toàn bộ 13 file kiểm thử Vitest trong `frontend/src/tests/` (chạy qua `npm test`).

#### 3. Backend Spring Boot Core & Dynamic Components
*Lưu ý nguyên tắc Rule III: Các class dưới đây không có import tĩnh từ class khác vì được Spring Boot quản lý qua Reflection, Component Scanning và Dependency Injection.*
- Toàn bộ 24 Controller trong `backend/src/main/java/com/store/controller/`: Được phát hiện tự động bởi `@RestController`, là cổng giao tiếp API của hệ thống.
- Toàn bộ 11 Service Implementations (`*ServiceImpl.java`): Được gán `@Service`, Controller chỉ inject qua Interface (`BrandService`, `CheckoutService`...). Xóa ServiceImpl sẽ làm gãy Dependency Injection khiến Spring Boot không khởi động được.
- `com.store.chat.llm.LlmConfig.java`: Class `@Configuration` khởi tạo `@Bean @Primary LlmClient` cho AI Chatbot.
- `com.store.scheduler.CheckoutTimeoutScheduler.java`: Chạy định kỳ `@Scheduled(fixedDelay = 60000)` để giải phóng tồn kho đơn hàng hết hạn.
- `com.store.scheduler.ChatLogRetentionScheduler.java`: Chạy định kỳ dọn log hội thoại AI quá hạn lưu trữ.
- Toàn bộ Repositories và Entities phục vụ cơ sở dữ liệu quan hệ 3NF.
- Các tài nguyên tĩnh:
  - `backend/src/main/resources/data/vietnam_locations.json`: Cung cấp 34 tỉnh/thành phố hành chính Việt Nam.
  - `backend/src/main/resources/chat/policies.vi.json` & `system-prompt.vi.txt`: Tri thức và lời nhắc cho AI Chatbot.
  - `backend/src/main/resources/db/migration/` (`V1__baseline_schema.sql`, `V2`, `V3`): File migration chạy bởi Flyway.
  - `database/seed/reference_data.sql` & `V3__membership_tiers.sql`: Được nạp tự động bởi `scripts/seed-dev.ps1`.

#### 4. Kịch bản & Môi trường vận hành
- `scripts/run-backend-env.ps1`: Kịch bản nạp biến môi trường từ `.env` và khởi chạy Spring Boot.
- `scripts/seed-dev.ps1` & `scripts/seed-dev.sh`: Kịch bản nạp dữ liệu mẫu an toàn trên môi trường dev.
- `scripts/import_53_products.py`: Script nạp 53 sản phẩm chính thức vào PostgreSQL.
- `scripts/seed_flash_sale.py`: Script tạo dữ liệu chiến dịch Flash Sale mẫu.
- `.env`, `.env.example`, `.env.local`, `docker-compose.yml`, `README.md`.

---

### NHÓM D: GENERATED / CACHE (Có thể xóa an toàn và tái tạo tự động)
*Các thư mục này chứa mã biên dịch và bộ nhớ đệm. Có thể dọn dẹp để giải phóng dung lượng ổ đĩa bất kỳ lúc nào.*

| STT | Đường dẫn chính xác | Dung lượng ước tính | Lệnh tạo lại khi cần |
| :---: | :--- | :--- | :--- |
| **1** | `backend/target/` | ~80 - 150 MB | `cd backend; .\mvnw.cmd clean package -DskipTests` |
| **2** | `frontend/.next/` | ~150 - 300 MB | `cd frontend; npm run build` hoặc `npm run dev` |
| **3** | `frontend/tsconfig.tsbuildinfo` | ~120 KB | Tự động sinh khi Next.js / TypeScript biên dịch |
| **4** | `sanpham/node_modules/` | ~15 MB | Thư mục node_modules phát sinh riêng trong folder `sanpham`, có thể cài lại bằng `cd sanpham; npm install` nếu cần dùng `upload.js` |
| **5** | `frontend/node_modules/` | ~350 MB | `cd frontend; npm install` (Chỉ xóa khi cần dọn sạch hoàn toàn dependency) |

---

## III. PHÂN TÍCH TRÙNG LẶP & DEPENDENCY

### 1. Phân tích Trùng lặp Component & Service
- **Components**:
  - Không phát hiện trùng lặp giữa các component giao diện người dùng (Storefront).
  - Hai component admin cũ `AdminComingSoon` và `ProductPickerModal` đã bị thay thế hoàn toàn bởi các phân hệ CRUD chuyên biệt (Đã xếp vào Nhóm A - Safe to Delete).
- **Service/API Clients**:
  - Không có sự trùng lặp lãng phí. `lib/api/` là tầng Server Fetching (SSR) dùng native `fetch` với cơ chế revalidation của Next.js 14, trong khi `services/` là tầng Client Fetching (CSR) dùng Axios interceptors gửi cookie HttpOnly. Đây là thiết kế chuẩn theo khuyến nghị của Next.js App Router.

### 2. Phân tích Dependencies (Dependencies có thể tối ưu)
- **Frontend (`frontend/package.json`)**:
  - `axios`: Sử dụng tích cực trong `services/api.ts` và toàn bộ client services.
  - `zustand`: Sử dụng tích cực trong 5 store trạng thái.
  - `zod`: Sử dụng tích cực trong `lib/api/` và `types/showcase.ts` để kiểm thực schema dữ liệu SSR.
  - `lucide-react`: Sử dụng cho hệ thống icon toàn sàn.
  - `vite` & `vitest`: Phục vụ chạy bộ unit test trong `src/tests/`.
  - **Kết luận**: Tất cả 13 dependencies và devDependencies trong `frontend/package.json` đều đang được sử dụng, không có package thừa.
- **Backend (`backend/pom.xml`)**:
  - Tất cả starter (Web, Security, Data JPA, Redis, Validation, Actuator, PostgreSQL, Flyway, JJWT, Lombok, SpringDoc OpenAPI, Caffeine Cache, Testcontainers) đều có class sử dụng tương ứng trong mã nguồn.

---

## IV. NHỮNG RỦI RO KHI DỌN DẸP & BIỆN PHÁP PHÒNG NGỪA

1. **Rủi ro xóa nhầm Controller / ServiceImpl của Spring Boot**:
   - *Mô tả*: Các class `@RestController` và `@Service` không có import tĩnh trong Java. Nếu dùng công cụ quét import đơn thuần sẽ kết luận nhầm là code thừa.
   - *Phòng ngừa*: Giữ nguyên 100% các class backend trong Nhóm C; chỉ xem xét các enum độc lập không có ràng buộc DB (`PaymentMethod`, `PaymentStatus`).
2. **Rủi ro xóa Route Alias `frontend/src/app/product/[slug]/page.tsx`**:
   - *Mô tả*: File chỉ có 1 dòng re-export nhưng đảm bảo các liên kết cũ hoặc truy cập URL số ít `/product/...` không bị 404.
   - *Phòng ngừa*: Tuyệt đối giữ lại file này theo quy định Nhóm C.
3. **Rủi ro xóa Junction `sanpham/anhwweb` bằng lệnh xóa đệ quy sai**:
   - *Mô tả*: Trong Windows, nếu dùng lệnh xóa thư mục đệ quy không đúng cách trên một Junction, hệ điều hành có thể xóa luôn dữ liệu trong thư mục đích (`sanpham/annhsp`).
   - *Phòng ngừa*: Khi dọn dẹp Junction trên Windows, phải dùng lệnh chuyên dụng `cmd /c rmdir "sanpham\anhwweb"` (chỉ gỡ liên kết, không xóa file gốc trong `annhsp`).
4. **Rủi ro làm hỏng kịch bản nạp dữ liệu mẫu**:
   - *Mô tả*: `scripts/seed-dev.ps1` phụ thuộc vào `database/seed/reference_data.sql` và `V3__membership_tiers.sql`.
   - *Phòng ngừa*: Giữ nguyên 2 file này trong Nhóm C, chỉ xử lý các file seed cũ đã được ghi chú trong `README.md`.

---

## V. KẾ HOẠCH & THỨ TỰ DỌN DẸP ĐỀ XUẤT (4 BƯỚC AN TOÀN)

Việc dọn dẹp sẽ chỉ được thực hiện sau khi có sự chấp thuận của bạn, theo trình tự từng bước có kiểm tra đối soát sau mỗi bước:

### Bước 1: Dọn dẹp các file rác và file thừa chắc chắn 100% (Nhóm A)
Xóa các file không còn sử dụng trong Frontend và các script thử nghiệm:
1. Xóa `frontend/src/components/admin/AdminComingSoon.tsx` và `AdminComingSoon.module.css`.
2. Xóa `frontend/src/components/admin/ProductPickerModal.tsx` và `ProductPickerModal.module.css`.
3. Xóa `frontend/src/data/products.cloudinary.json`.
4. Xóa `sanpham/products (1).json`.
5. Gỡ bỏ Junction `sanpham/anhwweb` bằng lệnh `rmdir`.
6. Xóa các script ad-hoc trong thư mục `scratch/` (`check_models.js`, `test_all_models.js`, `test_func_role.js`, `test_generate.js`, `test_policy.js`, `test_tool_flow.js`).

### Bước 2: Dọn dẹp thư mục Build Cache (Nhóm D)
1. Xóa `backend/target/` (giải phóng dung lượng build cũ).
2. Xóa `frontend/.next/` và `frontend/tsconfig.tsbuildinfo`.
3. Xóa `sanpham/node_modules/`.

### Bước 3: Lưu trữ và xử lý các file cũ / bản sao lưu (Nhóm B - Tùy chọn)
1. Di chuyển các file `.dump` và `.sql` trong `backup/` vào kho lưu trữ ngoài hoặc nén lại thành 1 file zip.
2. Xóa các file seed lỗi thời không tương thích schema trong `database/seed/` (`V2__seed_data.sql`, `full_seed_data.sql`, `seed_laptops.sql`, `seed_phones.sql`, `seed_watch_audio.sql`, `seed_banners.sql`, `update_banners.sql`).
3. Đóng gói thư mục `database/legacy/` và `backend/src/main/resources/db/migration-archive/` vào thư mục lưu trữ tài liệu tham khảo nếu không còn nhu cầu tra cứu.

### Bước 4: Kiểm tra và xác minh toàn diện hệ thống (Verification)
Chạy các bộ lệnh kiểm thử hồi quy để xác nhận hệ thống hoạt động 100% bình thường.

---

## VI. CÁC LỆNH KIỂM TRA HỆ THỐNG SAU KHI DỌN DẸP

Sau khi thực hiện dọn dẹp, chạy các lệnh kiểm tra độc lập sau để xác nhận không có bất kỳ chức năng nào bị ảnh hưởng:

### 1. Kiểm tra biên dịch Backend (Spring Boot 3.2, Java 21)
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
cd backend
.\mvnw.cmd clean package -DskipTests
```
*Kỳ vọng*: `BUILD SUCCESS`, tạo file jar mới thành công không có lỗi biên dịch.

### 2. Kiểm tra biên dịch Frontend (Next.js 14 App Router)
```powershell
cd frontend
npm run build
```
*Kỳ vọng*: Biên dịch hoàn tất thành công tất cả static và dynamic routes, không có lỗi thiếu import hay type error.

### 3. Chạy toàn bộ Unit Tests Frontend
```powershell
cd frontend
npm run test
```
*Kỳ vọng*: Toàn bộ 13 test suites (Category mapper, Chat security, Auth redirect, Format currency, Showcase mapper...) đều PASS.

### 4. Chạy kiểm thử tự động toàn diện 15 phân hệ Admin & RBAC
```powershell
node "C:\Users\ADMIN\.gemini\antigravity\brain\9eb55163-fc8d-4bac-b92e-361683baf67a\scratch\test_admin_full_crud.js"
```
*Kỳ vọng*: Đạt kết quả 55/55 bài kiểm thử thành công (100% PASS), bao gồm cả 16 trang Next.js, API CRUD, bảo mật RBAC và Storefront regression.

---

*Báo cáo được hoàn thành vào lúc 01:45 ngày 05/11/2026. Mọi hành động xóa file đang được tạm dừng để chờ chỉ đạo phê duyệt tiếp theo từ bạn.*

