@echo off
setlocal enabledelayedexpansion

:: ==============================================================================
:: PostgreSQL Helper Utility (db-tools.bat)
:: Vi tri: scripts/db-tools/db-tools.bat
:: ==============================================================================

:: 1. Cau hinh co so du lieu (uu tien doc tu bien moi truong)
if "%PGDATABASE%"=="" set PGDATABASE=LNT_Doantotnghiep
if "%PGUSER%"=="" set PGUSER=postgres
if "%PGHOST%"=="" set PGHOST=localhost
if "%PGPORT%"=="" set PGPORT=5432
chcp 65001 >nul
set PGCLIENTENCODING=UTF8

:: 2. Tim kiem duong dan thuc thi psql.exe
if not "%PSQL_PATH%"=="" (
    set PSQL_CMD="%PSQL_PATH%"
) else if exist "C:\Program Files\PostgreSQL\18\bin\psql.exe" (
    set PSQL_CMD="C:\Program Files\PostgreSQL\18\bin\psql.exe"
) else if exist "C:\Program Files\PostgreSQL\17\bin\psql.exe" (
    set PSQL_CMD="C:\Program Files\PostgreSQL\17\bin\psql.exe"
) else if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" (
    set PSQL_CMD="C:\Program Files\PostgreSQL\16\bin\psql.exe"
) else (
    set PSQL_CMD=psql
)

:: 3. Kiem tra bien PGPASSWORD
if "%PGPASSWORD%"=="" (
    if "%PGPASSFILE%"=="" (
        echo [INFO] PGPASSWORD chua duoc set. Ban co the can nhap mat khau khi psql yeu cau.
    )
)

:: 4. Dieu huong lenh theo tham so %1
set ACTION=%1
if "%ACTION%"=="" goto usage

if /I "%ACTION%"=="tables" goto list_tables
if /I "%ACTION%"=="views" goto list_views
if /I "%ACTION%"=="promo" goto check_promo
if /I "%ACTION%"=="describe" goto describe_target
if /I "%ACTION%"=="help" goto usage

echo [ERROR] Lenh khong hop le: %ACTION%
goto usage

:list_tables
echo === DANH SACH BANG TRONG CSDL: %PGDATABASE% ===
%PSQL_CMD% -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "\dt"
goto end

:list_views
echo === DANH SACH VIEWS TRONG CSDL: %PGDATABASE% ===
%PSQL_CMD% -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "\dv"
goto end

:check_promo
echo === KIEM TRA DU LIEU UU DAI (PROMOTION / OFFERS) ===
echo.
echo --- PAYMENT OFFERS ---
%PSQL_CMD% -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "SELECT offer_id, partner_name, title, discount_text, tag FROM payment_offers;"
echo.
echo --- INSTALLMENT PLANS ---
%PSQL_CMD% -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "SELECT plan_id, partner_name, tenor_months, prepaid_pct, interest_rate, is_zero_interest FROM installment_plans;"
echo.
echo --- PRODUCT BUNDLES ---
%PSQL_CMD% -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "SELECT count(*) AS total_bundles FROM product_bundles;"
echo.
echo --- MEMBERSHIP TIERS ---
%PSQL_CMD% -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "SELECT tier_id, name, discount_rate FROM membership_tiers;"
goto end

:describe_target
set TARGET=%2
if "%TARGET%"=="" (
    echo [INFO] Khong chi dinh bang/view cu the. Mac dinh describe cac bang uu dai:
    echo.
    echo --- \d payment_offers ---
    %PSQL_CMD% -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "\d payment_offers"
    echo --- \d installment_plans ---
    %PSQL_CMD% -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "\d installment_plans"
    echo --- \d membership_tiers ---
    %PSQL_CMD% -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "\d membership_tiers"
    echo --- \d product_bundles ---
    %PSQL_CMD% -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "\d product_bundles"
) else (
    echo --- \d %TARGET% ---
    %PSQL_CMD% -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "\d %TARGET%"
)
goto end

:usage
echo.
echo ==============================================================================
echo HUONG DAN SU DUNG: db-tools.bat ^<lenh^> [tuy chon]
echo ==============================================================================
echo   db-tools.bat tables              : Liet ke toan bo bang (\dt)
echo   db-tools.bat views               : Liet ke toan bo views (\dv)
echo   db-tools.bat promo               : Xem du lieu uu dai, tra gop, membership
echo   db-tools.bat describe            : Xem cau truc cac bang uu dai chinh
echo   db-tools.bat describe ^<ten_bang^> : Xem cau truc bang/view cu the (\d ^<ten^>)
echo.
echo Cac bien moi truong co the thiet lap truoc khi chay:
echo   set PGDATABASE=LNT_Doantotnghiep
echo   set PGUSER=postgres
echo   set PGPASSWORD=your_password
echo   set PSQL_PATH=C:\Program Files\PostgreSQL\18\bin\psql.exe
echo ==============================================================================
echo.

:end
endlocal
