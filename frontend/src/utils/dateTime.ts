/**
 * Tiện ích xử lý múi giờ chuẩn xác cho hệ thống
 * Đảm bảo mọi luồng nhập, hiển thị đều theo giờ Asia/Ho_Chi_Minh (GMT+7)
 * và lưu trữ/truyền tải theo chuẩn UTC ISO-8601
 */

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Chuyển chuỗi ISO từ server (UTC) sang định dạng YYYY-MM-DDTHH:mm để gán vào <input type="datetime-local">
 * Đảm bảo luôn trích xuất giờ theo Asia/Ho_Chi_Minh, không phụ thuộc múi giờ máy khách.
 */
export function isoToVietnamDateTimeInput(isoStr: string | undefined | null): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';

    // Dùng Intl.DateTimeFormat để lấy các phần ngày giờ theo múi giờ Việt Nam
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: VIETNAM_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(d);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '00';

    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    let hour = getPart('hour');
    if (hour === '24') hour = '00';
    const minute = getPart('minute');

    return `${year}-${month}-${day}T${hour}:${minute}`;
  } catch (err) {
    console.error('Lỗi chuyển đổi isoToVietnamDateTimeInput:', err);
    return '';
  }
}

/**
 * Chuyển giá trị từ <input type="datetime-local"> (YYYY-MM-DDTHH:mm người dùng nhập theo giờ VN)
 * sang chuỗi ISO-8601 UTC chuẩn để gửi lên Backend.
 * Không dùng new Date(inputStr).toISOString() vì sẽ bị phụ thuộc vào múi giờ của máy khách.
 */
export function vietnamDateTimeInputToIso(inputStr: string): string {
  if (!inputStr || !inputStr.includes('T')) return '';
  try {
    // inputStr có dạng "2026-10-03T13:13"
    // Gắn tường minh múi giờ Việt Nam +07:00
    const [datePart, timePart] = inputStr.split('T');
    const fullTime = timePart.length === 5 ? `${timePart}:00` : timePart;
    const vnIsoString = `${datePart}T${fullTime}+07:00`;

    const d = new Date(vnIsoString);
    if (isNaN(d.getTime())) return '';
    return d.toISOString();
  } catch (err) {
    console.error('Lỗi chuyển đổi vietnamDateTimeInputToIso:', err);
    return '';
  }
}

/**
 * Hiển thị ngày giờ 24h theo chuẩn Việt Nam: dd/MM/yyyy HH:mm
 */
export function formatVietnamDateTime(isoStr: string | undefined | null): string {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return String(isoStr);

    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: VIETNAM_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return String(isoStr);
  }
}
