# scripts/dev-tests/check_db_count.ps1
# Kiem tra so luong ban ghi cac bang chinh trong PostgreSQL

param (
    [string]$DbName = $(if ($env:PGDATABASE) { $env:PGDATABASE } else { "LNT_Doantotnghiep" }),
    [string]$DbUser = $(if ($env:PGUSER) { $env:PGUSER } else { "postgres" }),
    [string]$DbHost = $(if ($env:PGHOST) { $env:PGHOST } else { "localhost" }),
    [string]$DbPort = $(if ($env:PGPORT) { $env:PGPORT } else { "5432" })
)

if (-not $env:PGPASSWORD -and -not $env:PGPASSFILE) {
    Write-Warning "Bien moi truong PGPASSWORD chua duoc thiet lap. Ban co the can nhap mat khau khi psql yeu cau."
}

# Tim psql executable
$psqlExe = if ($env:PSQL_PATH -and (Test-Path $env:PSQL_PATH)) {
    $env:PSQL_PATH
} elseif (Get-Command psql -ErrorAction SilentlyContinue) {
    "psql"
} elseif (Test-Path "C:\Program Files\PostgreSQL\18\bin\psql.exe") {
    "C:\Program Files\PostgreSQL\18\bin\psql.exe"
} elseif (Test-Path "C:\Program Files\PostgreSQL\17\bin\psql.exe") {
    "C:\Program Files\PostgreSQL\17\bin\psql.exe"
} elseif (Test-Path "C:\Program Files\PostgreSQL\16\bin\psql.exe") {
    "C:\Program Files\PostgreSQL\16\bin\psql.exe"
} else {
    "psql"
}

$query = @"
SELECT 'products (san pham)' AS bang, count(*) AS so_luong FROM products
UNION ALL SELECT 'product_variants (bien the)', count(*) FROM product_variants
UNION ALL SELECT 'warehouses (cua hang/kho)', count(*) FROM warehouses
UNION ALL SELECT 'inventory (ton kho)', count(*) FROM inventory
UNION ALL SELECT 'coupons (ma giam gia)', count(*) FROM coupons
UNION ALL SELECT 'orders (don hang)', count(*) FROM orders
UNION ALL SELECT 'customers (khach hang)', count(*) FROM customers
UNION ALL SELECT 'reviews (danh gia)', count(*) FROM reviews
UNION ALL SELECT 'wishlist_items (yeu thich)', count(*) FROM wishlist_items;
"@

& $psqlExe -h $DbHost -p $DbPort -U $DbUser -d $DbName -c $query
