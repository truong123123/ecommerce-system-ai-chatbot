const fs = require('fs');

async function testProductSpecsLive() {
  console.log('================================================================');
  console.log('    KIỂM THỬ THỰC TẾ API CRUD SẢN PHẨM & MAPPING SPECS JSONB    ');
  console.log('================================================================\n');

  // 1. Đăng nhập Admin lấy Token & Cookie CSRF
  const loginRes = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@store.com', password: 'admin123' })
  });
  const setCookie = loginRes.headers.get('set-cookie') || '';
  const adminCookie = setCookie.split(',').map(c => c.split(';')[0]).join('; ');
  const tokenMatch = setCookie.match(/access_token=([^;]+)/);
  const adminToken = tokenMatch ? tokenMatch[1] : '';
  const xsrfMatch = setCookie.match(/XSRF-TOKEN=([^;]+)/);
  const adminXsrf = xsrfMatch ? xsrfMatch[1] : '';

  const headers = {
    'Authorization': `Bearer ${adminToken}`,
    'Cookie': adminCookie,
    'Content-Type': 'application/json',
    ...(adminXsrf ? { 'X-XSRF-TOKEN': adminXsrf } : {})
  };

  const results = [];

  // TEST 1: Tạo sản phẩm với specs có nhiều thuộc tính (Map/Object)
  const slug1 = `test-flagship-pro-${Date.now()}`;
  const specs1 = {
    chip: 'Apple M4 Extreme',
    ram: '32GB Unified Memory',
    storage: '1TB NVMe SSD',
    screen: '16 inch Liquid Retina XDR 120Hz',
    battery: '100Wh',
    ports: '3x Thunderbolt 5, HDMI, SDXC',
    weight_kg: 2.14
  };

  let prodId1 = null;
  try {
    const res1 = await fetch('http://localhost:8080/api/v1/products', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'MacBook Pro 16 M4 Extreme Test',
        slug: slug1,
        categoryId: 2, // MacBook
        brandId: 1, // Apple
        modelCode: 'MBP-M4-EXT',
        description: 'Máy trạm di động mạnh nhất lịch sử kiểm thử automated',
        price: 89990000,
        costPrice: 75000000,
        specs: specs1,
        isHot: true,
        isNew: true
      })
    });
    const data1 = await res1.json();
    prodId1 = data1.id || data1.productId;
    const ok1 = res1.status === 200 || res1.status === 201;
    console.log(`[TEST 1] Tạo SP với specs nhiều thuộc tính: HTTP ${res1.status}, ID: ${prodId1}`);
    results.push({ test: 'Tạo SP với specs nhiều thuộc tính', status: ok1 ? 'PASS' : 'FAIL', details: `HTTP ${res1.status}` });
  } catch (e) {
    console.error('[TEST 1] Lỗi:', e.message);
    results.push({ test: 'Tạo SP với specs nhiều thuộc tính', status: 'FAIL', details: e.message });
  }

  // TEST 2: Đọc lại sản phẩm vừa lưu qua GET /products/{id} & GET /products/slug/{slug}
  if (prodId1) {
    try {
      const getDetailRes = await fetch(`http://localhost:8080/api/v1/products/slug/${slug1}`);
      const detail = await getDetailRes.json();
      const hasChip = detail.specs && detail.specs.chip === 'Apple M4 Extreme';
      const hasPorts = detail.specs && detail.specs.ports === '3x Thunderbolt 5, HDMI, SDXC';
      console.log(`[TEST 2] Đọc lại SP từ API: HTTP ${getDetailRes.status}, Chip: ${detail.specs?.chip}, Ports: ${detail.specs?.ports}`);
      results.push({ test: 'Đọc lại SP kiểm tra cấu trúc specs', status: hasChip && hasPorts ? 'PASS' : 'FAIL', details: `Chip: ${detail.specs?.chip}` });
    } catch (e) {
      console.error('[TEST 2] Lỗi:', e.message);
      results.push({ test: 'Đọc lại SP kiểm tra cấu trúc specs', status: 'FAIL', details: e.message });
    }
  }

  // TEST 3: Cập nhật specs (PUT /products/{id})
  if (prodId1) {
    try {
      const updatedSpecs = {
        ...specs1,
        ram: '64GB Unified Memory (Đã nâng cấp)',
        storage: '2TB NVMe SSD'
      };
      const putRes = await fetch(`http://localhost:8080/api/v1/products/${prodId1}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: 'MacBook Pro 16 M4 Extreme (Bản 64GB)',
          specs: updatedSpecs,
          price: 99990000
        })
      });
      const putData = await putRes.json();
      console.log(`[TEST 3] Cập nhật specs qua PUT /products/{id}: HTTP ${putRes.status}`);

      // Kiểm tra đọc lại sau cập nhật
      const verifyRes = await fetch(`http://localhost:8080/api/v1/products/slug/${slug1}`);
      const verifyDetail = await verifyRes.json();
      const isUpdated = verifyDetail.specs && verifyDetail.specs.ram === '64GB Unified Memory (Đã nâng cấp)';
      console.log(`[TEST 3] Xác thực specs sau update: RAM mới = ${verifyDetail.specs?.ram}`);
      results.push({ test: 'Cập nhật specs qua PUT và đọc lại', status: isUpdated ? 'PASS' : 'FAIL', details: `RAM: ${verifyDetail.specs?.ram}` });
    } catch (e) {
      console.error('[TEST 3] Lỗi:', e.message);
      results.push({ test: 'Cập nhật specs qua PUT và đọc lại', status: 'FAIL', details: e.message });
    }
  }

  // TEST 4: Tạo SP với specs rỗng ({})
  const slug2 = `test-empty-specs-${Date.now()}`;
  let prodId2 = null;
  try {
    const res2 = await fetch('http://localhost:8080/api/v1/products', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Sản Phẩm Specs Rỗng Test',
        slug: slug2,
        categoryId: 1,
        brandId: 1,
        price: 15000000,
        specs: {}
      })
    });
    const data2 = await res2.json();
    prodId2 = data2.id || data2.productId;
    const ok2 = (res2.status === 200 || res2.status === 201) && prodId2;
    console.log(`[TEST 4] Tạo SP với specs rỗng: HTTP ${res2.status}, ID: ${prodId2}`);
    results.push({ test: 'Tạo SP với specs rỗng ({})', status: ok2 ? 'PASS' : 'FAIL', details: `HTTP ${res2.status}` });
  } catch (e) {
    console.error('[TEST 4] Lỗi:', e.message);
    results.push({ test: 'Tạo SP với specs rỗng ({})', status: 'FAIL', details: e.message });
  }

  // TEST 5: Tạo SP với specs null
  const slug3 = `test-null-specs-${Date.now()}`;
  let prodId3 = null;
  try {
    const res3 = await fetch('http://localhost:8080/api/v1/products', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Sản Phẩm Specs Null Test',
        slug: slug3,
        categoryId: 1,
        brandId: 1,
        price: 12000000,
        specs: null
      })
    });
    const data3 = await res3.json();
    prodId3 = data3.id || data3.productId;
    const ok3 = (res3.status === 200 || res3.status === 201) && prodId3;
    console.log(`[TEST 5] Tạo SP với specs null: HTTP ${res3.status}, ID: ${prodId3}`);
    results.push({ test: 'Tạo SP với specs null', status: ok3 ? 'PASS' : 'FAIL', details: `HTTP ${res3.status}` });
  } catch (e) {
    console.error('[TEST 5] Lỗi:', e.message);
    results.push({ test: 'Tạo SP với specs null', status: 'FAIL', details: e.message });
  }

  // Dọn dẹp an toàn các sản phẩm test vừa tạo
  for (const id of [prodId1, prodId2, prodId3].filter(Boolean)) {
    try {
      await fetch(`http://localhost:8080/api/v1/products/${id}`, {
        method: 'DELETE',
        headers
      });
      console.log(`[CLEANUP] Đã xóa sản phẩm test ID: ${id}`);
    } catch (e) {}
  }

  console.log('\n================================================================');
  console.log(`TỔNG KẾT: ${results.filter(r => r.status === 'PASS').length}/${results.length} TESTS PASS`);
  console.log('================================================================');
  return results;
}

testProductSpecsLive();
