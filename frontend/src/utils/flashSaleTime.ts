import { FlashSaleSlot } from '../types/flashSale';

/**
 * 1. Định dạng ngày DD/MM theo múi giờ Việt Nam Asia/Ho_Chi_Minh (UTC+7)
 * Tuyệt đối không dùng toISOString() hoặc cắt chuỗi thủ công để tránh lệch múi giờ.
 */
export const formatVNDate = (dateInput: Date | number | string): string => {
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number'
      ? new Date(dateInput)
      : dateInput;
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
    }).format(d);
  } catch {
    return '';
  }
};

/**
 * 2. Định dạng nhãn khung giờ: "12-14h 04/10" hoặc "12:30-14h 04/10"
 * Tự động tính toán từ datetime ISO, không hardcode.
 */
export const formatSlotLabel = (startIso: string, endIso: string): string => {
  try {
    const start = new Date(startIso);
    const end = new Date(endIso);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';

    const formatHourMinute = (d: Date) => {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      }).formatToParts(d);

      const hour = parts.find((p) => p.type === 'hour')?.value || '0';
      const minute = parts.find((p) => p.type === 'minute')?.value || '00';
      return minute !== '00' ? `${hour}:${minute}` : `${hour}`;
    };

    const dateStr = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
    }).format(start);

    return `${formatHourMinute(start)}-${formatHourMinute(end)}h ${dateStr}`;
  } catch {
    return '';
  }
};

/**
 * 3. Tính toán trạng thái khung giờ theo datetime start & end:
 * - now < start         → "UPCOMING" (BẮT ĐẦU SAU)
 * - start <= now <= end → "ACTIVE"   (KẾT THÚC SAU)
 * - now > end           → "ENDED"    (ĐÃ KẾT THÚC)
 */
export const computeSlotStatus = (
  startIso?: string,
  endIso?: string,
  nowMs: number = Date.now()
): 'UPCOMING' | 'ACTIVE' | 'ENDED' => {
  if (!startIso || !endIso) return 'ENDED';
  const startMs = new Date(startIso).getTime();
  const endMs = new Date(endIso).getTime();
  if (isNaN(startMs) || isNaN(endMs)) return 'ENDED';

  if (nowMs < startMs) {
    return 'UPCOMING';
  } else if (nowMs <= endMs) {
    return 'ACTIVE';
  } else {
    return 'ENDED';
  }
};

/**
 * 4. Tính toán thời gian thực với bù trừ chênh lệch serverTime hoặc test mockTime
 */
export const getEffectiveNow = (serverOffset: number = 0): number => {
  if (typeof window !== 'undefined') {
    const win = window as any;
    if (win.__FLASH_SALE_MOCK_TIME__) {
      const parsed = new Date(win.__FLASH_SALE_MOCK_TIME__).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    const params = new URLSearchParams(window.location.search);
    const mock = params.get('mockTime');
    if (mock) {
      const parsed = new Date(mock).getTime();
      if (!isNaN(parsed)) return parsed;
    }
  }
  return Date.now() + serverOffset;
};

/**
 * 5. Nhóm các slots theo ngày bắt đầu (start) theo múi giờ Việt Nam
 * Cho phép các slot chồng giờ, slot qua nửa đêm được gán vào ngày bắt đầu.
 */
export const groupSlotsByStartDate = (
  slots: FlashSaleSlot[],
  nowMs: number
): Array<{ date: string; slots: FlashSaleSlot[]; isEnded: boolean }> => {
  const map = new Map<string, { firstStartMs: number; slots: FlashSaleSlot[] }>();

  slots.forEach((slot) => {
    const startIso = slot.start || slot.startTime || '';
    const dateStr = formatVNDate(startIso);
    if (!dateStr) return;

    const startMs = new Date(startIso).getTime();
    if (!map.has(dateStr)) {
      map.set(dateStr, { firstStartMs: startMs, slots: [] });
    }
    const entry = map.get(dateStr)!;
    entry.slots.push(slot);
    if (startMs < entry.firstStartMs) {
      entry.firstStartMs = startMs;
    }
  });

  // Sắp xếp các ngày tăng dần
  const sortedDates = Array.from(map.entries()).sort(
    (a, b) => a[1].firstStartMs - b[1].firstStartMs
  );

  return sortedDates.map(([date, { slots: daySlots }]) => {
    // Sắp xếp các slot trong cùng 1 ngày theo start tăng dần (kể cả slot chồng giờ)
    const sortedDaySlots = [...daySlots].sort((a, b) => {
      const aStart = new Date(a.start || a.startTime || '').getTime();
      const bStart = new Date(b.start || b.startTime || '').getTime();
      return aStart - bStart;
    });

    const isEnded =
      sortedDaySlots.length > 0 &&
      sortedDaySlots.every((s) => {
        const start = s.start || s.startTime || '';
        const end = s.end || s.endTime || '';
        return computeSlotStatus(start, end, nowMs) === 'ENDED';
      });

    return {
      date,
      slots: sortedDaySlots,
      isEnded,
    };
  });
};

/**
 * 6. Thuật toán chọn slot mặc định chuẩn Section 8:
 * - Ưu tiên 1: Slot đang diễn ra (ACTIVE: start <= now <= end), nếu có nhiều thì ưu tiên slot start sớm nhất.
 * - Ưu tiên 2: Nếu không có slot đang diễn ra -> chọn slot sắp diễn ra gần nhất (UPCOMING).
 * - Ưu tiên 3: Nếu không còn slot sắp diễn ra -> chọn slot đã kết thúc gần nhất (ENDED có end lớn nhất).
 * Tab ngày mặc định phải là ngày chứa slot được chọn.
 */
export const selectDefaultSlot = (
  slots: FlashSaleSlot[],
  nowMs: number
): { selectedDate: string; selectedSlotId: number | null } => {
  if (!slots || slots.length === 0) {
    return { selectedDate: '', selectedSlotId: null };
  }

  // 1. Tìm tất cả slot ACTIVE
  const activeSlots = slots
    .filter((s) => {
      const start = s.start || s.startTime || '';
      const end = s.end || s.endTime || '';
      return computeSlotStatus(start, end, nowMs) === 'ACTIVE';
    })
    .sort((a, b) => {
      const aStart = new Date(a.start || a.startTime || '').getTime();
      const bStart = new Date(b.start || b.startTime || '').getTime();
      return aStart - bStart;
    });

  if (activeSlots.length > 0) {
    const chosen = activeSlots[0];
    const date = formatVNDate(chosen.start || chosen.startTime || '');
    return { selectedDate: date, selectedSlotId: chosen.id };
  }

  // 2. Tìm slot UPCOMING gần nhất (start > now, min start)
  const upcomingSlots = slots
    .filter((s) => {
      const start = s.start || s.startTime || '';
      const end = s.end || s.endTime || '';
      return computeSlotStatus(start, end, nowMs) === 'UPCOMING';
    })
    .sort((a, b) => {
      const aStart = new Date(a.start || a.startTime || '').getTime();
      const bStart = new Date(b.start || b.startTime || '').getTime();
      return aStart - bStart;
    });

  if (upcomingSlots.length > 0) {
    const chosen = upcomingSlots[0];
    const date = formatVNDate(chosen.start || chosen.startTime || '');
    return { selectedDate: date, selectedSlotId: chosen.id };
  }

  // 3. Tìm slot ENDED gần nhất (end < now, max end)
  const endedSlots = slots
    .filter((s) => {
      const start = s.start || s.startTime || '';
      const end = s.end || s.endTime || '';
      return computeSlotStatus(start, end, nowMs) === 'ENDED';
    })
    .sort((a, b) => {
      const aEnd = new Date(a.end || a.endTime || '').getTime();
      const bEnd = new Date(b.end || b.endTime || '').getTime();
      return bEnd - aEnd; // Max end
    });

  if (endedSlots.length > 0) {
    const chosen = endedSlots[0];
    const date = formatVNDate(chosen.start || chosen.startTime || '');
    return { selectedDate: date, selectedSlotId: chosen.id };
  }

  // Fallback
  const fallback = slots[0];
  return {
    selectedDate: formatVNDate(fallback.start || fallback.startTime || ''),
    selectedSlotId: fallback.id,
  };
};

/**
 * 7. Định dạng tiền tệ Việt Nam VNĐ bằng Intl.NumberFormat
 */
export const formatPrice = (v?: number): string => {
  if (v == null || isNaN(v)) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(v) + 'đ';
};
