# Kiểm tra môi trường: Chặn tuyệt đối trên PROD
$activeProfile = $env:SPRING_PROFILES_ACTIVE
$appEnv = $env:APP_ENV
if (($activeProfile -match "prod|production") -or ($appEnv -match "prod|production")) {
    Write-Error "[LỖI BẢO MẬT] Script seed-dev.ps1 chỉ được phép chạy trên môi trường Development. Đã phát hiện profile/env là PROD!"
    exit 1
}

$dbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$dbPort = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$dbName = if ($env:DB_NAME) { $env:DB_NAME } else { "store_dev" }
$dbUser = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$dbPass = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } elseif ($env:PGPASSWORD) { $env:PGPASSWORD } else { $null }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir

$psqlPath = "psql"
if (!(Get-Command "psql" -ErrorAction SilentlyContinue)) {
    if (Test-Path "C:\Program Files\PostgreSQL\18\bin\psql.exe") {
        $psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
    } elseif (Test-Path "C:\Program Files\PostgreSQL\17\bin\psql.exe") {
        $psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
    } elseif (Test-Path "C:\Program Files\PostgreSQL\16\bin\psql.exe") {
        $psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
    } elseif (Test-Path "C:\Program Files\PostgreSQL\15\bin\psql.exe") {
        $psqlPath = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
    }
}

Write-Host "==> Bắt đầu nạp dữ liệu mẫu vào database [$dbName] tại ${dbHost}:${dbPort}..." -ForegroundColor Cyan

$seedFiles = @(
    (Join-Path $rootDir "database\seed\reference_data.sql"),
    (Join-Path $rootDir "database\seed\V3__membership_tiers.sql")
)

if ($dbPass) {
    $env:PGPASSWORD = $dbPass
}
foreach ($f in $seedFiles) {
    if (Test-Path $f) {
        $fileName = Split-Path -Leaf $f
        Write-Host " -> Đang nạp $fileName..." -ForegroundColor Gray
        & $psqlPath -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $f *>$null
    } else {
        Write-Host " [CẢNH BÁO] Không tìm thấy $f, bỏ qua." -ForegroundColor Yellow
    }
}

Write-Host "==> Nạp dữ liệu mẫu hoàn tất thành công!" -ForegroundColor Green
