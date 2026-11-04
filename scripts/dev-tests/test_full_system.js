const fs = require('fs');

async function runFullComprehensiveTest() {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };

  function logTest(group, name, success, details = '', isWarn = false) {
    results.total++;
    if (success) {
      results.passed++;
      results.details.push({ group, name, status: 'PASS', details });
      console.log(`[PASS] [${group}] ${name} ${details ? '(' + details + ')' : ''}`);
    } else if (isWarn) {
      results.warnings++;
      results.details.push({ group, name, status: 'WARN', details });
      console.log(`[WARN] [${group}] ${name} - ${details}`);
    } else {
      results.failed++;
      results.details.push({ group, name, status: 'FAIL', details });
      console.error(`[FAIL] [${group}] ${name} - ${details}`);
    }
  }

  console.log('================================================================');
  console.log('   BẮT ĐẦU KIỂM THỬ TOÀN DIỆN HỆ THỐNG FULLSTACK E-COMMERCE     ');
  console.log('================================================================\n');

  // =============================================================
  // PHẦN 1: KIỂM THỬ GIAO DIỆN STOREFRONT & ADMIN TRÊN NEXT.JS
  // =============================================================
  console.log('--- PHẦN 1: STOREFRONT & ADMIN TRÊN NEXT.JS (PORT 3000) ---');
  const pages = [
    { url: 'http://localhost:3000/', name: 'Trang chủ Storefront' },
    { url: 'http://localhost:3000/category/dien-thoai-tablet', name: 'Danh mục Điện thoại & Tablet' },
    { url: 'http://localhost:3000/category/laptop', name: 'Danh mục Laptop' },
    { url: 'http://localhost:3000/category/am-thanh-mic', name: 'Danh mục Âm thanh & Micro' },
    { url: 'http://localhost:3000/category/dong-ho-camera', name: 'Danh mục Đồng hồ & Camera' },
    { url: 'http://localhost:3000/category/phu-kien', name: 'Danh mục Phụ kiện' },
    { url: 'http://localhost:3000/category/pc-man-hinh-may-in', name: 'Danh mục PC & Màn hình' },
    { url: 'http://localhost:3000/category/tivi-dien-may', name: 'Danh mục Tivi & Điện máy' },
    { url: 'http://localhost:3000/products/iphone-17-pro-256gb', name: 'Trang chi tiết sản phẩm iPhone 17 Pro' },
    { url: 'http://localhost:3000/search?q=iphone', name: 'Trang tìm kiếm từ khóa "iphone"' },
    { url: 'http://localhost:3000/cart', name: 'Trang Giỏ hàng' },
    { url: 'http://localhost:3000/admin', name: 'Admin: Dashboard tổng quan' },
    { url: 'http://localhost:3000/admin/products', name: 'Admin: Quản lý sản phẩm' },
    { url: 'http://localhost:3000/admin/categories', name: 'Admin: Quản lý danh mục' },
    { url: 'http://localhost:3000/admin/brands', name: 'Admin: Quản lý thương hiệu' },
    { url: 'http://localhost:3000/admin/flash-sale', name: 'Admin: Quản lý Flash Sale' },
    { url: 'http://localhost:3000/admin/coupons', name: 'Admin: Quản lý mã giảm giá' },
    { url: 'http://localhost:3000/admin/inventory', name: 'Admin: Quản lý tồn kho' },
    { url: 'http://localhost:3000/admin/reviews', name: 'Admin: Quản lý đánh giá' },
    { url: 'http://localhost:3000/admin/category-showcase', name: 'Admin: Showcase Điện thoại' },
    { url: 'http://localhost:3000/admin/laptop-showcase', name: 'Admin: Showcase Laptop' },
    { url: 'http://localhost:3000/admin/watch-showcase', name: 'Admin: Showcase Đồng hồ' },
  ];

  for (const page of pages) {
    try {
      const res = await fetch(page.url);
      const ok = res.status >= 200 && res.status < 400;
      logTest('Storefront & Admin Web', page.name, ok, `HTTP ${res.status}`);
    } catch (e) {
      logTest('Storefront & Admin Web', page.name, false, e.message);
    }
  }

  // =============================================================
  // PHẦN 2: KIỂM THỬ CÁC PUBLIC API BACKEND (SPRING BOOT)
  // =============================================================
  console.log('\n--- PHẦN 2: CÁC API PUBLIC TỪ SPRING BOOT (PORT 8080) ---');
  let csrfToken = '';

  // 2.1 Location Provinces (34 tỉnh thành)
  try {
    const res = await fetch('http://localhost:8080/api/v1/locations/provinces');
    const setCookie = res.headers.get('set-cookie') || '';
    const matchCsrf = setCookie.match(/XSRF-TOKEN=([^;]+)/);
    if (matchCsrf) csrfToken = matchCsrf[1];

    const data = await res.json();
    const is34 = Array.isArray(data) && data.length === 34;
    const all2Digits = is34 && data.every(p => /^\d{2}$/.test(p.code));
    logTest('API Tỉnh/Thành', 'Lấy danh sách 34 tỉnh/thành', is34 && all2Digits, `Đủ 34 tỉnh, mã chuẩn 2 chữ số`);
  } catch (e) {
    logTest('API Tỉnh/Thành', 'Lấy danh sách 34 tỉnh/thành', false, e.message);
  }

  // 2.2 Danh mục & Cây danh mục
  try {
    const res = await fetch('http://localhost:8080/api/v1/categories/tree');
    const data = await res.json();
    const ok = Array.isArray(data) && data.length > 0 && Array.isArray(data[0].children);
    logTest('API Danh mục', 'Cây danh mục phân cấp (/categories/tree)', ok, `Số danh mục gốc: ${data?.length}`);
  } catch (e) {
    logTest('API Danh mục', 'Cây danh mục phân cấp (/categories/tree)', false, e.message);
  }

  // 2.3 Thương hiệu
  try {
    const res = await fetch('http://localhost:8080/api/v1/brands');
    const data = await res.json();
    const ok = Array.isArray(data) && data.length > 0;
    logTest('API Thương hiệu', 'Danh sách thương hiệu (/brands)', ok, `Số thương hiệu: ${data?.length}`);
  } catch (e) {
    logTest('API Thương hiệu', 'Danh sách thương hiệu (/brands)', false, e.message);
  }

  // 2.4 Sản phẩm & Phân trang
  try {
    const res = await fetch('http://localhost:8080/api/v1/products?limit=5');
    const data = await res.json();
    const ok = Array.isArray(data) && data.length > 0;
    logTest('API Sản phẩm', 'Danh sách sản phẩm (/products)', ok, `Lấy ${data?.length} sản phẩm`);
  } catch (e) {
    logTest('API Sản phẩm', 'Danh sách sản phẩm (/products)', false, e.message);
  }

  try {
    const res = await fetch('http://localhost:8080/api/v1/products/paged?page=0&size=10');
    const data = await res.json();
    const ok = data && (data.content || data.items || Array.isArray(data));
    logTest('API Sản phẩm', 'Danh sách phân trang (/products/paged)', !!ok, `Trang 0, size 10`);
  } catch (e) {
    logTest('API Sản phẩm', 'Danh sách phân trang (/products/paged)', false, e.message);
  }

  try {
    const res = await fetch('http://localhost:8080/api/v1/products/slug/iphone-17-pro-256gb');
    const data = await res.json();
    const ok = data && data.slug === 'iphone-17-pro-256gb';
    logTest('API Sản phẩm', 'Chi tiết sản phẩm theo slug', ok, `Sản phẩm: ${data?.name}`);
  } catch (e) {
    logTest('API Sản phẩm', 'Chi tiết sản phẩm theo slug', false, e.message);
  }

  // 2.5 So sánh sản phẩm
  try {
    const res = await fetch('http://localhost:8080/api/v1/products/compare?ids=1,2');
    const data = await res.json();
    const ok = res.status === 200 && data.products && data.attributeGroups;
    logTest('API So sánh', 'So sánh thông số 2 sản phẩm (/products/compare)', ok, `HTTP 200, Groups: ${data?.attributeGroups?.length}`);
  } catch (e) {
    logTest('API So sánh', 'So sánh thông số 2 sản phẩm (/products/compare)', false, e.message);
  }

  // 2.6 Đánh giá sản phẩm công khai
  try {
    const res = await fetch('http://localhost:8080/api/v1/products/1/reviews/summary');
    const data = await res.json();
    const ok = res.status === 200 && data.averageRating !== undefined;
    logTest('API Đánh giá', 'Thống kê đánh giá sản phẩm (/reviews/summary)', ok, `Rating TB: ${data?.averageRating}`);
  } catch (e) {
    logTest('API Đánh giá', 'Thống kê đánh giá sản phẩm (/reviews/summary)', false, e.message);
  }

  // 2.7 Banners, Cửa hàng & Phương thức thanh toán
  try {
    const res = await fetch('http://localhost:8080/api/v1/banners');
    const data = await res.json();
    logTest('API Banners', 'Danh sách banner quảng cáo (/banners)', Array.isArray(data), `Banners: ${data?.length}`);
  } catch (e) {
    logTest('API Banners', 'Danh sách banner quảng cáo (/banners)', false, e.message);
  }

  try {
    const res = await fetch('http://localhost:8080/api/v1/stores');
    const data = await res.json();
    logTest('API Cửa hàng', 'Danh sách chi nhánh cửa hàng (/stores)', Array.isArray(data) && data.length > 0, `Stores: ${data?.length}`);
  } catch (e) {
    logTest('API Cửa hàng', 'Danh sách chi nhánh cửa hàng (/stores)', false, e.message);
  }

  try {
    const res = await fetch('http://localhost:8080/api/v1/payment-methods');
    const data = await res.json();
    logTest('API Thanh toán', 'Phương thức thanh toán (/payment-methods)', Array.isArray(data) && data.length > 0, `Methods: ${data?.length}`);
  } catch (e) {
    logTest('API Thanh toán', 'Phương thức thanh toán (/payment-methods)', false, e.message);
  }

  // 2.8 Flash Sale Public API
  try {
    const res = await fetch('http://localhost:8080/api/v1/flash-sales/slots');
    const data = await res.json();
    const ok = res.status === 200 && Array.isArray(data.slots);
    logTest('API Flash Sale', 'Danh sách khung giờ Flash Sale (/flash-sales/slots)', ok, `Slots: ${data?.slots?.length}`);
  } catch (e) {
    logTest('API Flash Sale', 'Danh sách khung giờ Flash Sale (/flash-sales/slots)', false, e.message);
  }

  try {
    const res = await fetch('http://localhost:8080/api/v1/flash-sales/active');
    const data = await res.json();
    const ok = res.status === 200 && data.serverTime !== undefined;
    logTest('API Flash Sale', 'Chiến dịch Flash Sale đang chạy (/flash-sales/active)', ok, `ServerTime: ${data?.serverTime}`);
  } catch (e) {
    logTest('API Flash Sale', 'Chiến dịch Flash Sale đang chạy (/flash-sales/active)', false, e.message);
  }

  // 2.9 Public POST APIs với CSRF Protection
  try {
    const res = await fetch('http://localhost:8080/api/v1/vouchers/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `XSRF-TOKEN=${csrfToken}`,
        'X-XSRF-TOKEN': csrfToken
      },
      body: JSON.stringify({ code: 'INVALID_CODE', orderTotal: 1000000 })
    });
    const ok = res.status === 400 || res.status === 200;
    logTest('API Khuyến mãi', 'Kiểm tra mã giảm giá (/vouchers/validate)', ok, `HTTP ${res.status} (Xử lý hợp lệ có CSRF)`);
  } catch (e) {
    logTest('API Khuyến mãi', 'Kiểm tra mã giảm giá (/vouchers/validate)', false, e.message);
  }

  try {
    const res = await fetch('http://localhost:8080/api/v1/checkout/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `XSRF-TOKEN=${csrfToken}`,
        'X-XSRF-TOKEN': csrfToken
      },
      body: JSON.stringify({ items: [{ variantId: 1, quantity: 1 }], shippingMethod: 'STANDARD' })
    });
    const data = await res.json();
    const ok = res.status === 200 && data.totalAmount !== undefined;
    logTest('API Checkout', 'Tính toán tạm tính Checkout (/checkout/calculate)', ok, `Tạm tính: ${data?.totalAmount} đ`);
  } catch (e) {
    logTest('API Checkout', 'Tính toán tạm tính Checkout (/checkout/calculate)', false, e.message);
  }

  // =============================================================
  // PHẦN 3: KIỂM THỬ TÀI KHOẢN KHÁCH HÀNG & GIỎ HÀNG
  // =============================================================
  console.log('\n--- PHẦN 3: TÀI KHOẢN KHÁCH HÀNG & GIỎ HÀNG (CUSTOMER WORKFLOW) ---');
  let customerToken = '';
  let customerCookie = '';

  try {
    const res = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@store.com', password: '123456' })
    });
    const setCookie = res.headers.get('set-cookie') || '';
    customerCookie = setCookie.split(',').map(c => c.split(';')[0]).join('; ');
    const match = setCookie.match(/access_token=([^;]+)/);
    if (match) customerToken = match[1];
    const matchCsrf = setCookie.match(/XSRF-TOKEN=([^;]+)/);
    if (matchCsrf) csrfToken = matchCsrf[1];

    const data = await res.json();
    const ok = res.status === 200 && data.user && data.user.role === 'customer';
    logTest('Auth Khách hàng', 'Đăng nhập tài khoản khách hàng (customer@store.com)', ok, `Role: ${data?.user?.role}`);
  } catch (e) {
    logTest('Auth Khách hàng', 'Đăng nhập tài khoản khách hàng (customer@store.com)', false, e.message);
  }

  const custHeaders = {
    'Authorization': `Bearer ${customerToken}`,
    'Cookie': customerCookie,
    'X-XSRF-TOKEN': csrfToken,
    'Content-Type': 'application/json'
  };

  // Xác thực session me
  try {
    const res = await fetch('http://localhost:8080/api/v1/auth/me', { headers: custHeaders });
    const data = await res.json();
    const ok = res.status === 200 && data.email === 'customer@store.com';
    logTest('Auth Khách hàng', 'Kiểm tra thông tin cá nhân (/auth/me)', ok, `Email: ${data?.email}`);
  } catch (e) {
    logTest('Auth Khách hàng', 'Kiểm tra thông tin cá nhân (/auth/me)', false, e.message);
  }

  // Xem giỏ hàng
  try {
    const res = await fetch('http://localhost:8080/api/v1/cart', { headers: custHeaders });
    const data = await res.json();
    const ok = res.status === 200 && data.items !== undefined;
    logTest('Giỏ hàng', 'Lấy thông tin giỏ hàng khách hàng (/cart)', ok, `Món trong giỏ: ${data?.items?.length || 0}`);
  } catch (e) {
    logTest('Giỏ hàng', 'Lấy thông tin giỏ hàng khách hàng (/cart)', false, e.message);
  }

  // Thêm sản phẩm vào giỏ hàng
  try {
    const res = await fetch('http://localhost:8080/api/v1/cart/items', {
      method: 'POST',
      headers: custHeaders,
      body: JSON.stringify({ variantId: 1, quantity: 1 })
    });
    const data = await res.json();
    const ok = res.status === 200 && data.items !== undefined;
    logTest('Giỏ hàng', 'Thêm sản phẩm vào giỏ hàng (/cart/items)', ok, `HTTP ${res.status}`);
  } catch (e) {
    logTest('Giỏ hàng', 'Thêm sản phẩm vào giỏ hàng (/cart/items)', false, e.message);
  }

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  try {
    const res = await fetch('http://localhost:8080/api/v1/cart/items/1', {
      method: 'PUT',
      headers: custHeaders,
      body: JSON.stringify({ quantity: 2 })
    });
    const data = await res.json();
    const ok = res.status === 200 && data.items !== undefined;
    logTest('Giỏ hàng', 'Cập nhật số lượng món trong giỏ (/cart/items/1)', ok, `HTTP ${res.status}`);
  } catch (e) {
    logTest('Giỏ hàng', 'Cập nhật số lượng món trong giỏ (/cart/items/1)', false, e.message);
  }

  // Xóa sản phẩm khỏi giỏ hàng
  try {
    const res = await fetch('http://localhost:8080/api/v1/cart/items/1', {
      method: 'DELETE',
      headers: custHeaders
    });
    const data = await res.json();
    const ok = res.status === 200 && data.items !== undefined;
    logTest('Giỏ hàng', 'Xóa sản phẩm khỏi giỏ hàng (/cart/items/1)', ok, `HTTP ${res.status}`);
  } catch (e) {
    logTest('Giỏ hàng', 'Xóa sản phẩm khỏi giỏ hàng (/cart/items/1)', false, e.message);
  }

  // Xem trang Checkout Preview của khách hàng
  try {
    const res = await fetch('http://localhost:8080/api/v1/checkout/preview?variantIds=1', { headers: custHeaders });
    const data = await res.json();
    const ok = res.status === 200 && data.pricing && data.items;
    logTest('Checkout', 'Xem trang xem trước thanh toán (/checkout/preview)', ok, `Tổng tiền preview: ${data?.pricing?.totalAmount} đ`);
  } catch (e) {
    logTest('Checkout', 'Xem trang xem trước thanh toán (/checkout/preview)', false, e.message);
  }

  // Danh sách yêu thích (Wishlist)
  try {
    const res = await fetch('http://localhost:8080/api/v1/wishlist', { headers: custHeaders });
    const data = await res.json();
    const ok = res.status === 200 && Array.isArray(data);
    logTest('Wishlist', 'Lấy danh sách yêu thích (/wishlist)', ok, `Mục: ${data?.length}`);
  } catch (e) {
    logTest('Wishlist', 'Lấy danh sách yêu thích (/wishlist)', false, e.message);
  }

  // Lịch sử đơn hàng cá nhân
  try {
    const res = await fetch('http://localhost:8080/api/v1/orders', { headers: custHeaders });
    const data = await res.json();
    const ok = res.status === 200 && Array.isArray(data);
    logTest('Đơn hàng KH', 'Lấy lịch sử đơn hàng cá nhân (/orders)', ok, `Số đơn: ${data?.length}`);
  } catch (e) {
    logTest('Đơn hàng KH', 'Lấy lịch sử đơn hàng cá nhân (/orders)', false, e.message);
  }

  // =============================================================
  // PHẦN 4: KIỂM THỬ BẢO MẬT PHÂN QUYỀN RBAC & ADMIN WORKFLOW
  // =============================================================
  console.log('\n--- PHẦN 4: BẢO MẬT PHÂN QUYỀN RBAC & ADMIN API ---');

  // Chặn không cho khách hàng truy cập API Admin Dashboard
  try {
    const res = await fetch('http://localhost:8080/api/v1/dashboard/overview', { headers: custHeaders });
    const ok = res.status === 403;
    logTest('Security RBAC', 'Chặn tài khoản Customer truy cập API Admin Dashboard', ok, `HTTP ${res.status} (Forbidden chuẩn)`);
  } catch (e) {
    logTest('Security RBAC', 'Chặn tài khoản Customer truy cập API Admin Dashboard', false, e.message);
  }

  // Đăng nhập tài khoản Admin
  let adminToken = '';
  let adminCookie = '';
  try {
    const res = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@store.com', password: 'admin123' })
    });
    const setCookie = res.headers.get('set-cookie') || '';
    adminCookie = setCookie.split(',').map(c => c.split(';')[0]).join('; ');
    const match = setCookie.match(/access_token=([^;]+)/);
    if (match) adminToken = match[1];
    const matchCsrf = setCookie.match(/XSRF-TOKEN=([^;]+)/);
    if (matchCsrf) csrfToken = matchCsrf[1];

    const data = await res.json();
    const ok = res.status === 200 && data.user && data.user.role === 'admin';
    logTest('Admin Auth', 'Đăng nhập tài khoản Admin (admin@store.com)', ok, `Role: ${data?.user?.role}`);
  } catch (e) {
    logTest('Admin Auth', 'Đăng nhập tài khoản Admin (admin@store.com)', false, e.message);
  }

  const adminHeaders = {
    'Authorization': `Bearer ${adminToken}`,
    'Cookie': adminCookie,
    'X-XSRF-TOKEN': csrfToken,
    'Content-Type': 'application/json'
  };

  // Admin Dashboard Overview
  try {
    const res = await fetch('http://localhost:8080/api/v1/dashboard/overview', { headers: adminHeaders });
    const data = await res.json();
    const ok = res.status === 200 && data.today !== undefined;
    logTest('Admin Dashboard', 'Thống kê tổng quan kinh doanh (/dashboard/overview)', ok, `Doanh thu hôm nay: ${data?.today?.revenue || 0} đ`);
  } catch (e) {
    logTest('Admin Dashboard', 'Thống kê tổng quan kinh doanh (/dashboard/overview)', false, e.message);
  }

  // Admin Quản lý toàn bộ Đơn hàng
  try {
    const res = await fetch('http://localhost:8080/api/v1/orders', { headers: adminHeaders });
    const data = await res.json();
    const ok = res.status === 200 && Array.isArray(data);
    logTest('Admin Orders', 'Truy vấn danh sách đơn hàng toàn hệ thống (/orders)', ok, `Tổng đơn: ${data?.length}`);
  } catch (e) {
    logTest('Admin Orders', 'Truy vấn danh sách đơn hàng toàn hệ thống (/orders)', false, e.message);
  }

  // Admin Quản lý Tồn kho
  try {
    const res = await fetch('http://localhost:8080/api/v1/admin/inventory', { headers: adminHeaders });
    const data = await res.json();
    const ok = res.status === 200 && Array.isArray(data);
    logTest('Admin Kho hàng', 'Truy vấn danh mục tồn kho (/admin/inventory)', ok, `Tổng sản phẩm theo dõi: ${data?.length}`);
  } catch (e) {
    logTest('Admin Kho hàng', 'Truy vấn danh mục tồn kho (/admin/inventory)', false, e.message);
  }

  // Admin Quản lý Mã giảm giá (Coupons)
  try {
    const res = await fetch('http://localhost:8080/api/v1/admin/coupons', { headers: adminHeaders });
    const data = await res.json();
    const ok = res.status === 200 && Array.isArray(data);
    logTest('Admin Coupons', 'Truy vấn danh sách mã giảm giá (/admin/coupons)', ok, `Số voucher: ${data?.length}`);
  } catch (e) {
    logTest('Admin Coupons', 'Truy vấn danh sách mã giảm giá (/admin/coupons)', false, e.message);
  }

  // Admin Quản lý Chiến dịch Flash Sale
  try {
    const res = await fetch('http://localhost:8080/api/v1/admin/flash-sales/all', { headers: adminHeaders });
    const data = await res.json();
    const ok = res.status === 200 && (Array.isArray(data) || data.campaignId);
    logTest('Admin Flash Sale', 'Truy vấn chiến dịch Flash Sale (/admin/flash-sales/all)', ok, `HTTP 200`);
  } catch (e) {
    logTest('Admin Flash Sale', 'Truy vấn chiến dịch Flash Sale (/admin/flash-sales/all)', false, e.message);
  }

  // Admin Quản lý Đánh giá sản phẩm
  try {
    const res = await fetch('http://localhost:8080/api/v1/admin/reviews', { headers: adminHeaders });
    const data = await res.json();
    const ok = res.status === 200 && Array.isArray(data);
    logTest('Admin Reviews', 'Truy vấn danh sách đánh giá chờ duyệt (/admin/reviews)', ok, `HTTP 200`);
  } catch (e) {
    logTest('Admin Reviews', 'Truy vấn danh sách đánh giá chờ duyệt (/admin/reviews)', false, e.message);
  }

  console.log('\n================================================================');
  console.log(`TỔNG KẾT: TỔNG SỐ TEST: ${results.total} | PASSED: ${results.passed} | FAILED: ${results.failed} | WARN: ${results.warnings}`);
  console.log('================================================================');

  fs.writeFileSync('C:/Users/ADMIN/.gemini/antigravity/brain/9eb55163-fc8d-4bac-b92e-361683baf67a/scratch/test_summary_v2.json', JSON.stringify(results, null, 2), 'utf8');
}

runFullComprehensiveTest();
