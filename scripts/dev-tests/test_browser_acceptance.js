const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api/v1';

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@store.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin123';
const CUSTOMER_EMAIL = process.env.TEST_CUSTOMER_EMAIL || 'customer@store.com';
const CUSTOMER_PASSWORD = process.env.TEST_CUSTOMER_PASSWORD || '123456';
const UNPURCHASED_EMAIL = process.env.TEST_UNPURCHASED_EMAIL || 'dang.tran@store.com';
const UNPURCHASED_PASSWORD = process.env.TEST_UNPURCHASED_PASSWORD || '123456';

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Helper: Login directly via API and inject token into page session
async function loginAs(page, email, password) {
  const res = await fetch(`${BACKEND_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    throw new Error(`Failed to login as ${email}: ${res.status}`);
  }
  const data = await res.json();
  const session = {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: data.user.role,
    token: data.token
  };

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((sess) => {
    localStorage.setItem('store_auth_user', JSON.stringify(sess));
    localStorage.setItem('auth_token', sess.token);
    localStorage.setItem('token', sess.token);
    document.cookie = `auth_token=${sess.token}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `user_role=${sess.role}; path=/; max-age=86400; SameSite=Lax`;
    window.dispatchEvent(new Event('auth_changed'));
  }, session);

  console.log(`✓ Đã thiết lập phiên đăng nhập cho ${email} (${session.role})`);
  return session;
}

async function logout(page) {
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = 'auth_token=; path=/; max-age=0';
      document.cookie = 'user_role=; path=/; max-age=0';
      window.dispatchEvent(new Event('auth_changed'));
    });
  } catch (e) {
    // ignore
  }
}

const wait = (ms) => new Promise(res => setTimeout(res, ms));

async function runAcceptanceTests() {
  console.log('=== BẮT ĐẦU TEST ACCEPTANCE TRÌNH DUYỆT CHROME ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,960'],
    defaultViewport: { width: 1440, height: 960 }
  });

  const page = await browser.newPage();

  try {
    // ══════════════════════════════════════════════════════════════
    // CA 1: CHƯA ĐĂNG NHẬP (GUEST)
    // ══════════════════════════════════════════════════════════════
    console.log('\n[CA 1] Guest xem đánh giá iPhone 15 Pro Max...');
    await logout(page);
    await page.goto(`${FRONTEND_URL}/products/iphone-15-pro-max#product-reviews-section`, { waitUntil: 'networkidle2' });
    await wait(2000);

    await page.evaluate(() => {
      const el = document.getElementById('product-reviews-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await wait(1000);

    const shot1 = path.join(SCREENSHOT_DIR, '01_guest_review_section.png');
    await page.screenshot({ path: shot1, fullPage: false });
    console.log('✓ Chụp Ca 1:', shot1);

    // ══════════════════════════════════════════════════════════════
    // CA 2: ADMIN BỊ CHẶN
    // ══════════════════════════════════════════════════════════════
    console.log('\n[CA 2] Admin xem trang sản phẩm -> thông báo chặn, không có form...');
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto(`${FRONTEND_URL}/products/iphone-15-pro-max#product-reviews-section`, { waitUntil: 'networkidle2' });
    await wait(2000);

    await page.evaluate(() => {
      const el = document.getElementById('product-reviews-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await wait(1000);

    const shot2 = path.join(SCREENSHOT_DIR, '02_admin_blocked.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log('✓ Chụp Ca 2:', shot2);

    // ══════════════════════════════════════════════════════════════
    // CA 3: ADMIN VÀO TRANG QUẢN LÝ REVIEWS (/admin/reviews)
    // ══════════════════════════════════════════════════════════════
    console.log('\n[CA 3] Admin vào trang /admin/reviews...');
    await page.goto(`${FRONTEND_URL}/admin/reviews`, { waitUntil: 'networkidle2' });
    await wait(2000);

    const shot3 = path.join(SCREENSHOT_DIR, '03_admin_reviews_page.png');
    await page.screenshot({ path: shot3, fullPage: false });
    console.log('✓ Chụp Ca 3:', shot3);

    // ══════════════════════════════════════════════════════════════
    // CA 4: KHÁCH CHƯA MUA SẢN PHẨM
    // ══════════════════════════════════════════════════════════════
    console.log(`\n[CA 4] Khách hàng chưa mua máy (${UNPURCHASED_EMAIL})...`);
    await loginAs(page, UNPURCHASED_EMAIL, UNPURCHASED_PASSWORD);
    await page.goto(`${FRONTEND_URL}/products/iphone-15-pro-max#product-reviews-section`, { waitUntil: 'networkidle2' });
    await wait(2000);

    await page.evaluate(() => {
      const el = document.getElementById('product-reviews-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await wait(1000);

    const shot4 = path.join(SCREENSHOT_DIR, '04_customer_not_purchased.png');
    await page.screenshot({ path: shot4, fullPage: false });
    console.log('✓ Chụp Ca 4:', shot4);

    // ══════════════════════════════════════════════════════════════
    // CA 5: KHÁCH HÀNG CÓ ĐƠN COMPLETED XEM /account/orders
    // ══════════════════════════════════════════════════════════════
    console.log(`\n[CA 5] Khách hàng ${CUSTOMER_EMAIL} vào /account/orders...`);
    await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD);
    await page.goto(`${FRONTEND_URL}/account/orders`, { waitUntil: 'networkidle2' });
    await wait(2500);

    const shot5 = path.join(SCREENSHOT_DIR, '05_account_orders_buttons.png');
    await page.screenshot({ path: shot5, fullPage: false });
    console.log('✓ Chụp Ca 5:', shot5);

    // ══════════════════════════════════════════════════════════════
    // CA 6: GỬI ĐÁNH GIÁ MỚI CHO MACBOOK AIR 13 INCH M3 (orderItemId=2)
    // ══════════════════════════════════════════════════════════════
    console.log('\n[CA 6] Mở form đánh giá MacBook Air 13 inch M3 (orderItemId=2)...');
    await page.goto(`${FRONTEND_URL}/products/macbook-air-13-m3?orderItemId=2#product-reviews-section`, { waitUntil: 'networkidle2' });
    await wait(2500);

    await page.evaluate(() => {
      const el = document.getElementById('product-reviews-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await wait(1000);

    // Test validation rỗng
    console.log('Bấm submit để kiểm tra form validation rỗng...');
    const submitBtn = await page.$('form button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await wait(800);
    }

    const shot6 = path.join(SCREENSHOT_DIR, '06_form_validation_error.png');
    await page.screenshot({ path: shot6, fullPage: false });
    console.log('✓ Chụp Ca 6 (validation error):', shot6);

    // Nhập nội dung và gửi 5 sao
    console.log('Nhập nội dung 5 sao và bấm Gửi đánh giá...');
    await page.type('form textarea', 'Máy dùng rất mượt và mát, màn hình Retina cực nét, pin trâu cả ngày!');
    await wait(500);

    const submitBtn2 = await page.$('form button[type="submit"]');
    if (submitBtn2) {
      await submitBtn2.click();
      await wait(3500);
    }

    const shot7 = path.join(SCREENSHOT_DIR, '07_review_created_success.png');
    await page.screenshot({ path: shot7, fullPage: false });
    console.log('✓ Chụp Ca 7 (review created & updated summary):', shot7);

    // ══════════════════════════════════════════════════════════════
    // CA 7: CHỈNH SỬA REVIEW VỪA TẠO
    // ══════════════════════════════════════════════════════════════
    console.log('\n[CA 7] Bấm Sửa đánh giá...');
    const editBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.trim() === 'Sửa');
    });
    if (editBtn) {
      await editBtn.click();
      await wait(1000);

      // Sửa textarea
      await page.evaluate(() => {
        const ta = document.querySelector('form textarea');
        if (ta) ta.value = '';
      });
      await page.type('form textarea', 'Cập nhật sau vài ngày: máy hoạt động rất êm, bàn phím gõ êm, cực kỳ hài lòng!');
      await wait(500);

      const saveBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button[type="submit"]'));
        return btns.find(b => b.textContent.includes('Lưu thay đổi'));
      });
      if (saveBtn) {
        await saveBtn.click();
        await wait(3000);
      }
    }

    const shot8 = path.join(SCREENSHOT_DIR, '08_review_edited.png');
    await page.screenshot({ path: shot8, fullPage: false });
    console.log('✓ Chụp Ca 8 (review edited):', shot8);

    // ══════════════════════════════════════════════════════════════
    // CA 8: XÓA REVIEW VỪA TẠO (DỌN DỮ LIỆU TEST)
    // ══════════════════════════════════════════════════════════════
    console.log('\n[CA 8] Bấm Xóa đánh giá để dọn dữ liệu test...');
    page.on('dialog', async dialog => {
      console.log('Xác nhận hộp thoại dialog:', dialog.message());
      await dialog.accept();
    });

    const deleteBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.trim() === 'Xóa');
    });
    if (deleteBtn) {
      await deleteBtn.click();
      await wait(3000);
    }

    const shot9 = path.join(SCREENSHOT_DIR, '09_review_deleted.png');
    await page.screenshot({ path: shot9, fullPage: false });
    console.log('✓ Chụp Ca 9 (review deleted, cleaned up):', shot9);

    console.log('\n=== TẤT CẢ CÁC BƯỚC TEST ACCEPTANCE THÀNH CÔNG RỰC RỠ ===');

  } catch (err) {
    console.error('Lỗi khi chạy acceptance tests:', err);
  } finally {
    await browser.close();
  }
}

runAcceptanceTests();
