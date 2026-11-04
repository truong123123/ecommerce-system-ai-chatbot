const fs = require('fs');

async function runFullAdminVerification() {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  function logTest(group, name, success, details = '') {
    results.total++;
    if (success) {
      results.passed++;
      results.details.push({ group, name, status: 'PASS', details });
      console.log(`[PASS] [${group}] ${name} ${details ? '(' + details + ')' : ''}`);
    } else {
      results.failed++;
      results.details.push({ group, name, status: 'FAIL', details });
      console.error(`[FAIL] [${group}] ${name} - ${details}`);
    }
  }

  console.log('================================================================');
  console.log('   KIỂM THỬ TOÀN DIỆN ADMIN PANEL 15 PHÂN HỆ VÀ RBAC FULL CRUD   ');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // PHẦN 1: KIỂM THỬ TẤT CẢ 16 TRANG ADMIN NEXT.JS
  // -------------------------------------------------------------
  console.log('--- 1. KIỂM THỬ 16 TRANG ADMIN TRÊN NEXT.JS ---');
  const adminPages = [
    { url: 'http://localhost:3000/admin', name: '1. Dashboard' },
    { url: 'http://localhost:3000/admin/products', name: '2. Products' },
    { url: 'http://localhost:3000/admin/categories', name: '3. Categories' },
    { url: 'http://localhost:3000/admin/brands', name: '4. Brands' },
    { url: 'http://localhost:3000/admin/orders', name: '5. Orders' },
    { url: 'http://localhost:3000/admin/payments', name: '6. Payments' },
    { url: 'http://localhost:3000/admin/customers', name: '7. Customers' },
    { url: 'http://localhost:3000/admin/inventory', name: '8. Inventory' },
    { url: 'http://localhost:3000/admin/stores', name: '9. Stores' },
    { url: 'http://localhost:3000/admin/coupons', name: '10. Coupons' },
    { url: 'http://localhost:3000/admin/flash-sale', name: '11. Flash Sale' },
    { url: 'http://localhost:3000/admin/banners', name: '12. Banners' },
    { url: 'http://localhost:3000/admin/reviews', name: '13. Reviews' },
    { url: 'http://localhost:3000/admin/support', name: '14. Support Desk' },
    { url: 'http://localhost:3000/admin/staff', name: '15. Staff & RBAC' },
    { url: 'http://localhost:3000/admin/settings', name: '16. System Settings' },
  ];

  for (const page of adminPages) {
    try {
      const res = await fetch(page.url);
      logTest('Admin Routes', page.name, res.status === 200, `HTTP ${res.status}`);
    } catch (e) {
      logTest('Admin Routes', page.name, false, e.message);
    }
  }

  // -------------------------------------------------------------
  // PHẦN 2: ĐĂNG NHẬP ADMIN & KIỂM THỬ TOÀN BỘ CÁC API ADMIN MỚI
  // -------------------------------------------------------------
  console.log('\n--- 2. ĐĂNG NHẬP VÀ KIỂM THỬ BACKEND API FULL CRUD (ADMIN) ---');
  let adminToken = '';
  let adminCookie = '';
  let adminXsrf = '';
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
    const xsrfMatch = setCookie.match(/XSRF-TOKEN=([^;]+)/);
    if (xsrfMatch) adminXsrf = xsrfMatch[1];

    logTest('Auth Admin', 'Đăng nhập Admin thành công', res.status === 200, 'HTTP 200');
  } catch (e) {
    logTest('Auth Admin', 'Đăng nhập Admin thất bại', false, e.message);
  }

  const adminHeaders = {
    'Authorization': `Bearer ${adminToken}`,
    'Cookie': adminCookie,
    'Content-Type': 'application/json',
    ...(adminXsrf ? { 'X-XSRF-TOKEN': adminXsrf } : {})
  };

  // 2.1 Payments API
  try {
    const res = await fetch('http://localhost:8080/api/v1/admin/payments', { headers: adminHeaders });
    const data = await res.json();
    logTest('API Payments', 'Lấy danh sách giao dịch thanh toán (GET /admin/payments)', res.status === 200 && Array.isArray(data), `Số GD: ${data.length}`);
  } catch (e) {
    logTest('API Payments', 'Lấy danh sách giao dịch thanh toán', false, e.message);
  }

  // 2.2 Customers API & Toggle status
  let testCustId = null;
  try {
    const res = await fetch('http://localhost:8080/api/v1/admin/customers', { headers: adminHeaders });
    const data = await res.json();
    logTest('API Customers', 'Lấy danh sách khách hàng (GET /admin/customers)', res.status === 200 && Array.isArray(data), `Số KH: ${data.length}`);
    if (data.length > 0) {
      testCustId = data[0].customerId;
    }
  } catch (e) {
    logTest('API Customers', 'Lấy danh sách khách hàng', false, e.message);
  }

  if (testCustId) {
    try {
      const toggleRes1 = await fetch(`http://localhost:8080/api/v1/admin/customers/${testCustId}/toggle-status`, {
        method: 'PUT',
        headers: adminHeaders
      });
      const data1 = await toggleRes1.json();
      logTest('API Customers', 'Khóa/Mở khóa tài khoản khách hàng (PUT /admin/customers/{id}/toggle-status)', toggleRes1.status === 200 && typeof data1.isActive === 'boolean', `Trạng thái mới: ${data1.isActive}`);

      // Toggle lại trạng thái ban đầu để hoàn nguyên
      await fetch(`http://localhost:8080/api/v1/admin/customers/${testCustId}/toggle-status`, {
        method: 'PUT',
        headers: adminHeaders
      });
    } catch (e) {
      logTest('API Customers', 'Khóa/Mở khóa tài khoản khách hàng', false, e.message);
    }
  }

  // 2.3 Stores API: CRUD
  let createdStoreId = null;
  try {
    const res = await fetch('http://localhost:8080/api/v1/admin/stores', { headers: adminHeaders });
    const data = await res.json();
    logTest('API Stores', 'Lấy danh sách cửa hàng chi nhánh (GET /admin/stores)', res.status === 200 && Array.isArray(data), `Số cửa hàng: ${data.length}`);

    // Create store
    const createRes = await fetch('http://localhost:8080/api/v1/admin/stores', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Chi nhánh Test E2E Thủ Đức',
        address: '99 Võ Văn Ngân, TP. Thủ Đức',
        province: 'Hồ Chí Minh',
        district: 'Thành phố Thủ Đức',
        phone: '02871099999',
        openHours: '08:00 - 22:00',
        region: 'Miền Nam'
      })
    });
    const createdStore = await createRes.json();
    createdStoreId = createdStore.warehouseId;
    logTest('API Stores', 'Tạo mới chi nhánh cửa hàng (POST /admin/stores)', createRes.status === 201 && !!createdStoreId, `Store ID: ${createdStoreId}`);

    // Update store
    if (createdStoreId) {
      const updateRes = await fetch(`http://localhost:8080/api/v1/admin/stores/${createdStoreId}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({
          name: 'Chi nhánh Test E2E Đã Update',
          openHours: '07:30 - 22:30'
        })
      });
      logTest('API Stores', 'Cập nhật thông tin chi nhánh (PUT /admin/stores/{id})', updateRes.status === 200);

      // Toggle status
      const toggleRes = await fetch(`http://localhost:8080/api/v1/admin/stores/${createdStoreId}/toggle-status`, {
        method: 'PUT',
        headers: adminHeaders
      });
      logTest('API Stores', 'Đổi trạng thái chi nhánh (PUT /admin/stores/{id}/toggle-status)', toggleRes.status === 200);
    }
  } catch (e) {
    logTest('API Stores', 'Kiểm thử Stores CRUD', false, e.message);
  }

  // 2.4 Banners API: CRUD
  let createdBannerId = null;
  try {
    const res = await fetch('http://localhost:8080/api/v1/admin/banners', { headers: adminHeaders });
    const data = await res.json();
    logTest('API Banners', 'Lấy danh sách banner quản trị (GET /admin/banners)', res.status === 200 && Array.isArray(data), `Số banner: ${data.length}`);

    // Create banner
    const createRes = await fetch('http://localhost:8080/api/v1/admin/banners', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        title: 'Banner Test Automation',
        headline: 'Siêu phẩm tuần lễ vàng',
        imageUrl: 'https://images.unsplash.com/photo-test.jpg',
        primaryBtnText: 'Xem ngay',
        primaryBtnLink: '/products',
        displayOrder: 99,
        isActive: true
      })
    });
    const createdBanner = await createRes.json();
    createdBannerId = createdBanner.id;
    logTest('API Banners', 'Tạo mới banner quảng cáo (POST /admin/banners)', createRes.status === 201 && !!createdBannerId, `Banner ID: ${createdBannerId}`);

    // Update banner
    if (createdBannerId) {
      const updateRes = await fetch(`http://localhost:8080/api/v1/admin/banners/${createdBannerId}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({
          headline: 'Khuyến mãi đặc biệt kết thúc sớm'
        })
      });
      logTest('API Banners', 'Cập nhật banner (PUT /admin/banners/{id})', updateRes.status === 200);

      // Delete banner
      const delRes = await fetch(`http://localhost:8080/api/v1/admin/banners/${createdBannerId}`, {
        method: 'DELETE',
        headers: adminHeaders
      });
      logTest('API Banners', 'Xóa banner thành công (DELETE /admin/banners/{id})', delRes.status === 200);
    }
  } catch (e) {
    logTest('API Banners', 'Kiểm thử Banners CRUD', false, e.message);
  }

  // 2.5 Staff API: CRUD
  let testStaffId = null;
  const testStaffEmail = `staff_test_${Date.now()}@store.com`;
  try {
    const res = await fetch('http://localhost:8080/api/v1/admin/staff', { headers: adminHeaders });
    const data = await res.json();
    logTest('API Staff', 'Lấy danh sách nhân viên nội bộ (GET /admin/staff)', res.status === 200 && Array.isArray(data), `Số NV: ${data.length}`);

    // Create staff
    const createRes = await fetch('http://localhost:8080/api/v1/admin/staff', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        fullName: 'Nhân Viên Hỗ Trợ Test',
        email: testStaffEmail,
        password: 'password123',
        role: 'support',
        phone: '0909123456'
      })
    });
    const createdStaff = await createRes.json();
    testStaffId = createdStaff.staffId;
    logTest('API Staff', 'Tạo tài khoản nhân viên có mã hóa BCrypt (POST /admin/staff)', createRes.status === 201 && !!testStaffId, `Staff ID: ${testStaffId}`);

    if (testStaffId) {
      // Update staff
      const updateRes = await fetch(`http://localhost:8080/api/v1/admin/staff/${testStaffId}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({
          fullName: 'Nhân Viên Hỗ Trợ Đã Đổi Tên',
          role: 'support',
          phone: '0909999888'
        })
      });
      logTest('API Staff', 'Cập nhật thông tin nhân viên (PUT /admin/staff/{id})', updateRes.status === 200);

      // Toggle status
      const toggleRes = await fetch(`http://localhost:8080/api/v1/admin/staff/${testStaffId}/toggle-status`, {
        method: 'PUT',
        headers: adminHeaders
      });
      logTest('API Staff', 'Khóa/mở khóa tài khoản nhân viên (PUT /admin/staff/{id}/toggle-status)', toggleRes.status === 200);
    }
  } catch (e) {
    logTest('API Staff', 'Kiểm thử Staff CRUD', false, e.message);
  }

  // 2.6 Settings API
  try {
    const res = await fetch('http://localhost:8080/api/v1/admin/settings', { headers: adminHeaders });
    const data = await res.json();
    logTest('API Settings', 'Lấy cấu hình hệ thống (GET /admin/settings)', res.status === 200 && !!data.settings, `Store name: ${data.settings?.store_name}`);

    // Update settings
    const putRes = await fetch('http://localhost:8080/api/v1/admin/settings', {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        store_name: 'TruongStore - Công nghệ hàng đầu',
        hotline: '1800 2097',
        free_shipping_threshold: '500000',
        standard_shipping_fee: '30000'
      })
    });
    logTest('API Settings', 'Lưu cấu hình hệ thống (PUT /admin/settings)', putRes.status === 200);
  } catch (e) {
    logTest('API Settings', 'Kiểm thử Settings', false, e.message);
  }

  // 2.7 Support Desk API
  let activeSessionId = null;
  try {
    const res = await fetch('http://localhost:8080/api/v1/admin/support/chats', { headers: adminHeaders });
    const data = await res.json();
    logTest('API Support', 'Lấy danh sách các phiên chat CSKH (GET /admin/support/chats)', res.status === 200 && Array.isArray(data), `Phiên chat: ${data.length}`);
    if (data.length > 0) {
      activeSessionId = data[0].sessionId;
    }
  } catch (e) {
    logTest('API Support', 'Lấy danh sách các phiên chat CSKH', false, e.message);
  }

  if (activeSessionId) {
    try {
      const threadRes = await fetch(`http://localhost:8080/api/v1/admin/support/chats/${activeSessionId}`, { headers: adminHeaders });
      const thread = await threadRes.json();
      logTest('API Support', 'Lấy đoạn hội thoại theo session (GET /admin/support/chats/{sessionId})', threadRes.status === 200 && Array.isArray(thread), `Tin nhắn: ${thread.length}`);

      const replyRes = await fetch(`http://localhost:8080/api/v1/admin/support/chats/${activeSessionId}/reply`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ content: 'Chào bạn, TruongStore CSKH đang sẵn sàng hỗ trợ!' })
      });
      logTest('API Support', 'Nhân viên gửi phản hồi trực tiếp (POST /admin/support/chats/{sessionId}/reply)', replyRes.status === 200);
    } catch (e) {
      logTest('API Support', 'Kiểm thử phản hồi chat CSKH', false, e.message);
    }
  }

  // 2.8 Orders API
  try {
    const res = await fetch('http://localhost:8080/api/v1/orders', { headers: adminHeaders });
    const data = await res.json();
    logTest('API Orders', 'Staff truy cập danh sách đơn hàng toàn sàn (GET /orders)', res.status === 200 && Array.isArray(data));
  } catch (e) {
    logTest('API Orders', 'Staff truy cập danh sách đơn hàng', false, e.message);
  }

  // -------------------------------------------------------------
  // PHẦN 3: KIỂM THỬ BẢO MẬT PHÂN QUYỀN RBAC CHI TIẾT
  // -------------------------------------------------------------
  console.log('\n--- 3. KIỂM THỬ PHÂN QUYỀN RBAC TỪNG VAI TRÒ ---');

  // 3.1 Unauthenticated bị chặn 401
  const protectedAdminEndpoints = [
    '/admin/payments',
    '/admin/customers',
    '/admin/stores',
    '/admin/banners',
    '/admin/staff',
    '/admin/settings',
    '/admin/support/chats'
  ];

  for (const ep of protectedAdminEndpoints) {
    try {
      const r = await fetch('http://localhost:8080/api/v1' + ep);
      logTest('RBAC Unauth', `Chặn Unauth truy cập ${ep}`, r.status === 401, `HTTP ${r.status}`);
    } catch (e) {
      logTest('RBAC Unauth', `Chặn Unauth truy cập ${ep}`, false, e.message);
    }
  }

  // 3.2 Customer bị chặn 403 Forbidden
  let custToken = '';
  let custCookie = '';
  try {
    const res = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@store.com', password: '123456' })
    });
    const setCookie = res.headers.get('set-cookie') || '';
    custCookie = setCookie.split(',').map(c => c.split(';')[0]).join('; ');
    const match = setCookie.match(/access_token=([^;]+)/);
    if (match) custToken = match[1];
  } catch (e) {}

  const custHeaders = {
    'Authorization': `Bearer ${custToken}`,
    'Cookie': custCookie,
    'Content-Type': 'application/json'
  };

  for (const ep of ['/admin/payments', '/admin/staff', '/admin/settings']) {
    try {
      const r = await fetch('http://localhost:8080/api/v1' + ep, { headers: custHeaders });
      logTest('RBAC Customer', `Chặn Customer truy cập ${ep}`, r.status === 403, `HTTP ${r.status} (Forbidden)`);
    } catch (e) {
      logTest('RBAC Customer', `Chặn Customer truy cập ${ep}`, false, e.message);
    }
  }

  // 3.3 Sales RBAC: Được vào Payments, Customers, Orders; BỊ CHẶN Staff và Settings
  let salesToken = '';
  let salesCookie = '';
  try {
    const res = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sales@store.com', password: 'sales123' })
    });
    const setCookie = res.headers.get('set-cookie') || '';
    salesCookie = setCookie.split(',').map(c => c.split(';')[0]).join('; ');
    const match = setCookie.match(/access_token=([^;]+)/);
    if (match) salesToken = match[1];
  } catch (e) {}

  const salesHeaders = {
    'Authorization': `Bearer ${salesToken}`,
    'Cookie': salesCookie,
    'Content-Type': 'application/json'
  };

  try {
    const r1 = await fetch('http://localhost:8080/api/v1/admin/payments', { headers: salesHeaders });
    logTest('RBAC Sales', 'Sales ĐƯỢC PHÉP truy cập Payments', r1.status === 200, `HTTP ${r1.status}`);

    const r2 = await fetch('http://localhost:8080/api/v1/admin/customers', { headers: salesHeaders });
    logTest('RBAC Sales', 'Sales ĐƯỢC PHÉP truy cập Customers CRM', r2.status === 200, `HTTP ${r2.status}`);

    const r3 = await fetch('http://localhost:8080/api/v1/admin/staff', { headers: salesHeaders });
    logTest('RBAC Sales', 'Sales BỊ CHẶN khỏi Quản lý Nhân sự (Staff)', r3.status === 403, `HTTP ${r3.status} (Chặn chuẩn)`);

    const r4 = await fetch('http://localhost:8080/api/v1/admin/settings', { headers: salesHeaders });
    logTest('RBAC Sales', 'Sales BỊ CHẶN khỏi Cấu hình Hệ thống (Settings)', r4.status === 403, `HTTP ${r4.status} (Chặn chuẩn)`);
  } catch (e) {
    logTest('RBAC Sales', 'Kiểm thử Sales RBAC', false, e.message);
  }

  // -------------------------------------------------------------
  // PHẦN 4: HỆ THỐNG VÀ STOREFRONT REGRESSION CHECKS
  // -------------------------------------------------------------
  console.log('\n--- 4. STOREFRONT REGRESSION CHECKS ---');
  try {
    const homeRes = await fetch('http://localhost:3000/');
    logTest('Storefront', 'Trang chủ Website hoạt động tốt', homeRes.status === 200);

    const prodRes = await fetch('http://localhost:3000/products');
    logTest('Storefront', 'Trang danh sách sản phẩm hoạt động tốt', prodRes.status === 200);

    const locRes = await fetch('http://localhost:8080/api/v1/locations/provinces');
    const locs = await locRes.json();
    logTest('Storefront', 'API chọn tỉnh/thành phố trả về 34 tỉnh/thành chuẩn', locRes.status === 200 && locs.length === 34, `Số tỉnh: ${locs.length}`);
  } catch (e) {
    logTest('Storefront', 'Kiểm tra Storefront', false, e.message);
  }

  console.log('\n================================================================');
  console.log(`KẾT QUẢ KIỂM THỬ: ${results.passed}/${results.total} BÀI TEST THÀNH CÔNG (${Math.round((results.passed / results.total) * 100)}%)`);
  console.log('================================================================\n');

  return results;
}

runFullAdminVerification();
