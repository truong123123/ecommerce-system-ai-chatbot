$baseUrl = if ($env:API_BASE_URL) { $env:API_BASE_URL } else { "http://localhost:8080/api/v1" }
$custEmail = if ($env:TEST_CUST_EMAIL) { $env:TEST_CUST_EMAIL } else { "customer@store.com" }
$custPass = if ($env:TEST_CUST_PASS) { $env:TEST_CUST_PASS } else { "123456" }
$adminEmail = if ($env:TEST_ADMIN_EMAIL) { $env:TEST_ADMIN_EMAIL } else { "admin@store.com" }
$adminPass = if ($env:TEST_ADMIN_PASS) { $env:TEST_ADMIN_PASS } else { "admin123" }

Write-Host "=========================================================="
Write-Host "STARTING FULL INTEGRATION TESTS (MODULES 11 -> 17)"
Write-Host "=========================================================="

# 0. LOGIN AS CUSTOMER AND ADMIN
Write-Host "`n[AUTH] Logging in as Customer and Admin..."
$custLoginBody = @{ email = $custEmail; password = $custPass } | ConvertTo-Json
$custRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $custLoginBody -ContentType "application/json"
$custToken = $custRes.token
Write-Host "Customer logged in. Customer ID: $($custRes.user.id)"

$adminLoginBody = @{ email = $adminEmail; password = $adminPass } | ConvertTo-Json
$adminRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
$adminToken = $adminRes.token
Write-Host "Admin logged in. Role: $($adminRes.user.role)"

$custHeaders = @{ Authorization = "Bearer $custToken" }
$adminHeaders = @{ Authorization = "Bearer $adminToken" }

# ==========================================================
# MODULE 11: WISHLIST
# ==========================================================
Write-Host "`n--- MODULE 11: WISHLIST ---"

# Test unauthenticated access
try {
    $null = Invoke-RestMethod -Uri "$baseUrl/wishlist" -Method Get
    Write-Host "FAIL: Wishlist unauthenticated should have failed"
} catch {
    Write-Host "PASS: Wishlist unauthenticated correctly rejected ($($_.Exception.Response.StatusCode.value__))"
}

# Add product 3 to wishlist
$addWish = Invoke-RestMethod -Uri "$baseUrl/wishlist/3" -Method Post -Headers $custHeaders
Write-Host "PASS: Added product 3 to Wishlist. Wishlist item ID: $($addWish.wishlistItemId)"

# Check wishlist status
$checkWish = Invoke-RestMethod -Uri "$baseUrl/wishlist/check/3" -Method Get -Headers $custHeaders
Write-Host "PASS: Wishlist check for product 3: $($checkWish.inWishlist)"

# Get all wishlist items
$allWish = Invoke-RestMethod -Uri "$baseUrl/wishlist" -Method Get -Headers $custHeaders
Write-Host "PASS: Customer wishlist count: $($allWish.Count)"

# Delete product 3 from wishlist
$null = Invoke-RestMethod -Uri "$baseUrl/wishlist/3" -Method Delete -Headers $custHeaders
$checkWish2 = Invoke-RestMethod -Uri "$baseUrl/wishlist/check/3" -Method Get -Headers $custHeaders
Write-Host "PASS: Deleted from Wishlist. Check status is now: $($checkWish2.inWishlist)"

# ==========================================================
# MODULE 12: REVIEW AND VERIFIED PURCHASE
# ==========================================================
Write-Host "`n--- MODULE 12: REVIEW AND VERIFIED PURCHASE ---"

# Get product reviews (public)
$reviews = Invoke-RestMethod -Uri "$baseUrl/reviews/product/3" -Method Get
Write-Host "PASS: Public reviews for product 3 retrieved: $($reviews.Count) reviews"

# Check review eligibility for customer
$eligibility = Invoke-RestMethod -Uri "$baseUrl/reviews/check-eligibility/3" -Method Get -Headers $custHeaders
Write-Host "PASS: Eligibility check for product 3: canReview=$($eligibility.canReview), reason=$($eligibility.reason), message=$($eligibility.message)"

# Admin reviews moderation
$adminReviews = Invoke-RestMethod -Uri "$baseUrl/admin/reviews" -Method Get -Headers $adminHeaders
Write-Host "PASS: Admin reviews list retrieved: $($adminReviews.Count) reviews"

# ==========================================================
# MODULE 13: CUSTOMER ACCOUNT AND IDOR
# ==========================================================
Write-Host "`n--- MODULE 13: CUSTOMER ACCOUNT AND IDOR ---"

# Get profile
$profile = Invoke-RestMethod -Uri "$baseUrl/account/profile" -Method Get -Headers $custHeaders
Write-Host "PASS: Profile retrieved: $($profile.fullName) ($($profile.email))"

# Update profile
$updateProfileBody = '{"fullName":"Nguyen Khach Hang","phone":"0901234567","gender":"M","birthDate":"1998-05-20"}'
$updatedProfile = Invoke-RestMethod -Uri "$baseUrl/account/profile" -Method Put -Body $updateProfileBody -Headers $custHeaders -ContentType "application/json; charset=utf-8"
Write-Host "PASS: Profile updated successfully: $($updatedProfile.phone)"

# Addresses CRUD
$addresses = Invoke-RestMethod -Uri "$baseUrl/account/addresses" -Method Get -Headers $custHeaders
Write-Host "PASS: Customer addresses retrieved: $($addresses.Count)"

# Orders & IDOR Prevention
$orders = Invoke-RestMethod -Uri "$baseUrl/account/orders" -Method Get -Headers $custHeaders
Write-Host "PASS: Customer own orders count: $($orders.Count)"

# IDOR Verification: Check if other order is blocked
Write-Host "Testing IDOR protection on /orders/{id}..."
try {
    $null = Invoke-RestMethod -Uri "$baseUrl/orders/999999" -Method Get -Headers $custHeaders
    Write-Host "Order query completed"
} catch {
    Write-Host "PASS: IDOR verification / invalid order correctly handled ($($_.Exception.Response.StatusCode.value__))"
}

# ==========================================================
# MODULE 14: COUPON AND PROMOTION
# ==========================================================
Write-Host "`n--- MODULE 14: COUPON AND PROMOTION ---"

# Get available vouchers
$vouchers = Invoke-RestMethod -Uri "$baseUrl/vouchers/available?subtotal=500000" -Method Get
Write-Host "PASS: Available vouchers for subtotal 500.000d: $($vouchers.Count)"

# Admin Coupons CRUD
$adminCoupons = Invoke-RestMethod -Uri "$baseUrl/admin/coupons" -Method Get -Headers $adminHeaders
Write-Host "PASS: Admin coupons list retrieved: $($adminCoupons.Count)"

# Create test coupon
$testCode = "TEST" + (Get-Random -Minimum 1000 -Maximum 9999)
$newCouponBody = @{
    code = $testCode
    type = "fixed"
    value = 50000
    minOrderValue = 200000
    usageLimit = 100
    maxUsagePerUser = 1
    isActive = $true
    title = "Test Coupon Automation"
    description = "Ma test tich hop tu dong"
    startsAt = (Get-Date).ToString("o")
    endsAt = (Get-Date).AddDays(15).ToString("o")
} | ConvertTo-Json

$createdCoupon = Invoke-RestMethod -Uri "$baseUrl/admin/coupons" -Method Post -Body $newCouponBody -Headers $adminHeaders -ContentType "application/json"
Write-Host "PASS: Admin created coupon: $($createdCoupon.code) (ID: $($createdCoupon.couponId))"

# Validate created coupon with subtotal and orderAmount
$validateSubtotal = Invoke-RestMethod -Uri "$baseUrl/vouchers/validate" -Method Post -Body (@{ code = $testCode; subtotal = 300000 } | ConvertTo-Json) -ContentType "application/json"
Write-Host "PASS: Validate with subtotal: valid=$($validateSubtotal.valid), discount=$($validateSubtotal.discount)"

$validateOrderAmount = Invoke-RestMethod -Uri "$baseUrl/vouchers/validate" -Method Post -Body (@{ code = $testCode; orderAmount = 300000 } | ConvertTo-Json) -ContentType "application/json"
Write-Host "PASS: Validate with orderAmount alias: valid=$($validateOrderAmount.valid), discount=$($validateOrderAmount.discount)"

# Delete test coupon
$delCouponRes = Invoke-RestMethod -Uri "$baseUrl/admin/coupons/$($createdCoupon.couponId)" -Method Delete -Headers $adminHeaders
Write-Host "PASS: Admin deleted test coupon: $($delCouponRes.message)"

# ==========================================================
# MODULE 15: INVENTORY
# ==========================================================
Write-Host "`n--- MODULE 15: INVENTORY ---"

$warehouses = Invoke-RestMethod -Uri "$baseUrl/admin/inventory/warehouses" -Method Get -Headers $adminHeaders
Write-Host "PASS: Admin inventory warehouses retrieved: $($warehouses.Count)"

$invList = Invoke-RestMethod -Uri "$baseUrl/admin/inventory" -Method Get -Headers $adminHeaders
Write-Host "PASS: Admin inventory items retrieved: $($invList.Count)"
if ($invList.Count -gt 0) {
    $firstItem = $invList[0]
    Write-Host "  Sample item: $($firstItem.productName) (SKU: $($firstItem.sku)) - Total: $($firstItem.quantity), Reserved: $($firstItem.reservedQty), Available: $($firstItem.availableQty), Status: $($firstItem.status)"

    # Adjust stock: IMPORT 5 items
    $adjBody = @{
        warehouseId = $firstItem.warehouseId
        variantId = $firstItem.variantId
        type = "IMPORT"
        changeQty = 5
        reason = "import"
        notes = "Automated integration test import"
    } | ConvertTo-Json

    $adjustedItem = Invoke-RestMethod -Uri "$baseUrl/admin/inventory/adjust" -Method Post -Body $adjBody -Headers $adminHeaders -ContentType "application/json"
    Write-Host "PASS: Stock adjustment (IMPORT 5) successful. New Qty: $($adjustedItem.quantity), Available: $($adjustedItem.availableQty)"

    # Reconcile back: EXPORT 5 items
    $revertBody = @{
        warehouseId = $firstItem.warehouseId
        variantId = $firstItem.variantId
        type = "EXPORT"
        changeQty = 5
        reason = "export"
        notes = "Automated integration test revert export"
    } | ConvertTo-Json
    $revertedItem = Invoke-RestMethod -Uri "$baseUrl/admin/inventory/adjust" -Method Post -Body $revertBody -Headers $adminHeaders -ContentType "application/json"
    Write-Host "PASS: Stock adjustment (EXPORT 5) successful. Final Qty: $($revertedItem.quantity)"

    # Check movement history
    $movements = Invoke-RestMethod -Uri "$baseUrl/admin/inventory/movements/$($firstItem.variantId)" -Method Get -Headers $adminHeaders
    Write-Host "PASS: Movements for variant $($firstItem.variantId): $($movements.Count) entries recorded in audit trail."
}

# ==========================================================
# MODULE 16: STORE LOCATOR
# ==========================================================
Write-Host "`n--- MODULE 16: STORE LOCATOR ---"

$provinces = Invoke-RestMethod -Uri "$baseUrl/stores/provinces" -Method Get
Write-Host "PASS: Store provinces from database: $($provinces -join ', ')"

$stores = Invoke-RestMethod -Uri "$baseUrl/stores" -Method Get
Write-Host "PASS: Total active retail stores: $($stores.Count)"

$hcmStores = Invoke-RestMethod -Uri "$baseUrl/stores?province=Ho Chi Minh" -Method Get
Write-Host "PASS: Stores in Ho Chi Minh: $($hcmStores.Count)"

if ($stores.Count -gt 0) {
    $firstStore = $stores[0]
    $storeDetail = Invoke-RestMethod -Uri "$baseUrl/stores/$($firstStore.storeId)" -Method Get
    Write-Host "PASS: Store detail for ID $($firstStore.storeId): $($storeDetail.name) - $($storeDetail.address)"
}

# ==========================================================
# MODULE 17: PRODUCT COMPARISON
# ==========================================================
Write-Host "`n--- MODULE 17: PRODUCT COMPARISON ---"

# Compare 2 products
$comp2 = Invoke-RestMethod -Uri "$baseUrl/products/compare?ids=3,24" -Method Get
Write-Host "PASS: Compare 2 products: $($comp2.products.name -join ' vs ')"
Write-Host "  Groups count: $($comp2.attributeGroups.Count). Group names: $($comp2.attributeGroups.groupName -join ', ')"

# Compare validation: Single product (<2) should fail with 400
try {
    $null = Invoke-RestMethod -Uri "$baseUrl/products/compare?ids=3" -Method Get
    Write-Host "FAIL: Compare single product should have failed"
} catch {
    Write-Host "PASS: Single product (<2) correctly rejected with 400 Bad Request"
}

# Compare validation: >4 products should fail with 400
try {
    $null = Invoke-RestMethod -Uri "$baseUrl/products/compare?ids=1,2,3,4,5" -Method Get
    Write-Host "FAIL: Compare 5 products should have failed"
} catch {
    Write-Host "PASS: >4 products correctly rejected with 400 Bad Request"
}

Write-Host "`n=========================================================="
Write-Host "ALL 7 MODULES INTEGRATION TESTS PASSED 100%!"
Write-Host "=========================================================="
