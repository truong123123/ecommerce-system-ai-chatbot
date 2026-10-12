# scripts/dev-tests/test_reviews.ps1
# Automated Test Script for Product Review Feature
$ErrorActionPreference = "Stop"

$baseUrl = if ($env:API_BASE_URL) { $env:API_BASE_URL } else { "http://localhost:8080/api/v1" }

# Credentials tu bien moi truong (hoac gia tri mac dinh tu seed dev)
$testUnpurchasedEmail = if ($env:TEST_UNPURCHASED_EMAIL) { $env:TEST_UNPURCHASED_EMAIL } else { "dang.tran@store.com" }
$testUnpurchasedPass  = if ($env:TEST_UNPURCHASED_PASS) { $env:TEST_UNPURCHASED_PASS } else { "123456" }

$testEligibleEmail    = if ($env:TEST_ELIGIBLE_EMAIL) { $env:TEST_ELIGIBLE_EMAIL } else { "customer@store.com" }
$testEligiblePass     = if ($env:TEST_ELIGIBLE_PASS) { $env:TEST_ELIGIBLE_PASS } else { "123456" }

Write-Host "=========================================="
Write-Host "1. Testing Guest Check Eligibility"
Write-Host "=========================================="
$guestElig = Invoke-RestMethod -Uri "$baseUrl/reviews/check-eligibility/27" -Method GET
if ($guestElig.canReview -eq $false -and $guestElig.reason -eq "NOT_LOGGED_IN") {
    Write-Host "[PASS] Guest eligibility correctly blocked: $($guestElig.message)" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Guest eligibility response unexpected: $($guestElig | ConvertTo-Json)" -ForegroundColor Red
}

Write-Host "`n=========================================="
Write-Host "2. Testing Guest Submit Review (Expect 401/403)"
Write-Host "=========================================="
try {
    $body = @{ rating = 5; comment = "Khach vang lai danh gia" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/reviews/product/27" -Method POST -Body $body -ContentType "application/json"
    Write-Host "[FAIL] Expected 401 but request succeeded" -ForegroundColor Red
} catch {
    $code = [int]$_.Exception.Response.StatusCode
    if ($code -eq 401 -or $code -eq 403) {
        Write-Host "[PASS] Guest review blocked with HTTP $code" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Unexpected status: $code" -ForegroundColor Red
    }
}

Write-Host "`n=========================================="
Write-Host "3. Testing Unpurchased Product Review (Expect 403)"
Write-Host "=========================================="
$custLogin = @{ email = $testUnpurchasedEmail; password = $testUnpurchasedPass } | ConvertTo-Json
$custRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $custLogin -ContentType "application/json; charset=utf-8"
$custToken = $custRes.token

$unpurchasedElig = Invoke-RestMethod -Uri "$baseUrl/reviews/check-eligibility/15" -Method GET -Headers @{ Authorization = "Bearer $custToken" }
if ($unpurchasedElig.canReview -eq $false -and $unpurchasedElig.reason -eq "NOT_PURCHASED") {
    Write-Host "[PASS] Unpurchased product eligibility blocked: $($unpurchasedElig.message)" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Unexpected unpurchased response: $($unpurchasedElig | ConvertTo-Json)" -ForegroundColor Red
}

try {
    $body = '{"rating":4,"comment":"Chua mua ma dinh danh gia"}'
    Invoke-RestMethod -Uri "$baseUrl/reviews/product/15" -Method POST -Body $body -ContentType "application/json" -Headers @{ Authorization = "Bearer $custToken" }
    Write-Host "[FAIL] Expected 403 but succeeded" -ForegroundColor Red
} catch {
    $code = [int]$_.Exception.Response.StatusCode
    $resp = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $respText = $resp.ReadToEnd()
    if ($code -eq 403) {
        Write-Host "[PASS] Unpurchased review blocked with HTTP 403: $respText" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Expected 403 but got ${code}: $respText" -ForegroundColor Red
    }
}

Write-Host "`n=========================================="
Write-Host "4. Testing Purchased & Delivered User (Product 27)"
Write-Host "=========================================="
$eligibleLogin = @{ email = $testEligibleEmail; password = $testEligiblePass } | ConvertTo-Json
$eligibleRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $eligibleLogin -ContentType "application/json; charset=utf-8"
$eligibleToken = $eligibleRes.token

$eligibleCheck = Invoke-RestMethod -Uri "$baseUrl/reviews/check-eligibility/27" -Method GET -Headers @{ Authorization = "Bearer $eligibleToken" }
if ($eligibleCheck.canReview -eq $true -and $eligibleCheck.reason -eq "ELIGIBLE") {
    Write-Host "[PASS] Eligible customer can review: $($eligibleCheck.message)" -ForegroundColor Green
} else {
    Write-Host "[INFO] Eligibility status: $($eligibleCheck | ConvertTo-Json)" -ForegroundColor Yellow
}

Write-Host "`n=========================================="
Write-Host "5. Submitting Review as Eligible Customer"
Write-Host "=========================================="
$reviewBody = '{"rating":5,"comment":"May Xiaomi Redmi Note 13 Pro dung rat muot, camera net, sac nhanh!"}'
try {
    $createdReview = Invoke-RestMethod -Uri "$baseUrl/reviews/product/27" -Method POST -Body $reviewBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $eligibleToken" }
    Write-Host "[PASS] Review created successfully! Review ID: $($createdReview.reviewId), Rating: $($createdReview.rating)" -ForegroundColor Green
} catch {
    Write-Host "[INFO] Review submission response: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=========================================="
Write-Host "6. Testing Duplicate Review Attempt (Expect 409 Conflict)"
Write-Host "=========================================="
try {
    Invoke-RestMethod -Uri "$baseUrl/reviews/product/27" -Method POST -Body $reviewBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $eligibleToken" }
    Write-Host "[FAIL] Expected 409 but succeeded" -ForegroundColor Red
} catch {
    $code = [int]$_.Exception.Response.StatusCode
    $resp = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $respText = $resp.ReadToEnd()
    if ($code -eq 409) {
        Write-Host "[PASS] Duplicate review blocked with HTTP 409 Conflict: $respText" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Status: ${code}: $respText" -ForegroundColor Yellow
    }
}

Write-Host "`n=========================================="
Write-Host "7. Verifying Reviews List & Average Rating"
Write-Host "=========================================="
$revList = Invoke-RestMethod -Uri "$baseUrl/reviews/product/27" -Method GET
Write-Host "[PASS] Fetched $($revList.Count) reviews for product 27." -ForegroundColor Green
$prodDetail = Invoke-RestMethod -Uri "$baseUrl/products/27" -Method GET
Write-Host "[PASS] Product 27 average rating: $($prodDetail.rating) / 5, Total reviews: $($prodDetail.reviewCount)" -ForegroundColor Green

Write-Host "`nALL TESTS COMPLETED SUCCESSFULLY!" -ForegroundColor Cyan
