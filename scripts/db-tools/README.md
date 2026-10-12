# Database Helper Tools

Thư mục chứa các script hỗ trợ thao tác, kiểm tra và bảo trì cơ sở dữ liệu PostgreSQL cho dự án.

## Danh sách công cụ

| Tên script | Mô tả | Cách dùng |
| :--- | :--- | :--- |
| `db-tools.bat` | Script hợp nhất kiểm tra cấu trúc bảng, views và dữ liệu ưu đãi | `db-tools.bat <tables\|views\|promo\|describe>` |
| `cleanup_staff_customer.sql` | Script SQL dọn dẹp dữ liệu test staff/customer | Chạy qua psql hoặc DBeaver / pgAdmin |

## Hướng dẫn sử dụng `db-tools.bat`

```cmd
:: Xem danh sách bảng
scripts\db-tools\db-tools.bat tables

:: Xem danh sách views
scripts\db-tools\db-tools.bat views

:: Xem dữ liệu ưu đãi, trả góp, membership
scripts\db-tools\db-tools.bat promo

:: Xem cấu trúc một bảng cụ thể
scripts\db-tools\db-tools.bat describe products
```

### Các biến môi trường tùy chỉnh:
- `PGDATABASE`: Tên cơ sở dữ liệu (mặc định: `LNT_Doantotnghiep`)
- `PGUSER`: Tên tài khoản kết nối (mặc định: `postgres`)
- `PGPASSWORD`: Mật khẩu kết nối DB (tùy chọn)
- `PGHOST`: Host kết nối (mặc định: `localhost`)
- `PGPORT`: Cổng kết nối (mặc định: `5432`)
- `PSQL_PATH`: Đường dẫn chỉ định file thực thi `psql.exe`
