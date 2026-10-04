'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from '../flash-sale/FlashSale.module.css';
import { FlashSaleCampaign, FlashSaleSlot, FlashSaleProduct } from '../../types/flashSale';
import { flashSaleService } from '../../services/flashSaleService';
import {
  formatVNDate,
  computeSlotStatus,
  getEffectiveNow,
  groupSlotsByStartDate,
  selectDefaultSlot,
} from '../../utils/flashSaleTime';
import {
  FlashSaleDays,
  FlashSaleSlots,
  FlashSaleCountdown,
  FlashSaleProducts,
} from '../flash-sale';

/**
 * ============================================================================
 * FLASH SALE MODULE - CELLPHONES UX/UI STYLE
 * ============================================================================
 * - Nền đỏ rực rỡ, viền vàng nhạt, bo góc 20px, 2 icon % 3D ở hai góc
 * - Countdown realtime (Ngày : Giờ : Phút : Giây), tự chuyển UPCOMING -> ACTIVE -> ENDED
 * - Tab ngày tự động nhóm theo ngày của start (Asia/Ho_Chi_Minh)
 * - Tự động chọn slot mặc định (ACTIVE sớm nhất -> UPCOMING gần nhất -> ENDED gần nhất)
 * - Xử lý đúng slot qua nửa đêm và slot chồng giờ
 * - Polling realtime mỗi 30 giây + cập nhật lại khi quay lại tab (visibilitychange / window focus)
 * - Tuyệt đối không hardcode dữ liệu
 */
export const FlashSale: React.FC = () => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [campaign, setCampaign] = useState<FlashSaleCampaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [serverOffset, setServerOffset] = useState<number>(0);

  // Tab & Slot đang được chọn
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  // Tick để re-evaluate trạng thái mỗi 10 giây hoặc khi countdown kết thúc
  const [tick, setTick] = useState<number>(0);

  // Tính toán thời gian thực theo serverTime + bù độ lệch (hoặc mockTime cho dev/test)
  const currentNowMs = useMemo(() => {
    return getEffectiveNow(serverOffset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverOffset, tick]);

  // ==========================================================================
  // 1. TẢI DỮ LIỆU TỪ API THẬT (KHÔNG HARDCODE DATA)
  // ==========================================================================
  const loadCampaign = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const data = await flashSaleService.getActiveCampaign();

      if (!data || !data.slots || data.slots.length === 0) {
        setCampaign(null);
        return;
      }

      // Tính độ lệch serverTime vs local time (Section 6)
      const serverTimeStr = data.serverNow || (data as any).serverTime;
      const offset = serverTimeStr
        ? new Date(serverTimeStr).getTime() - Date.now()
        : 0;
      setServerOffset(offset);
      setCampaign(data);

      const effectiveNow = getEffectiveNow(offset);

      // Nếu lần đầu tải hoặc slot đang chọn không còn tồn tại -> chọn slot mặc định theo Section 8
      setSelectedSlotId((prevSlotId) => {
        const slotExists = data.slots.some((s) => s.id === prevSlotId);
        if (isInitial || !prevSlotId || !slotExists) {
          const defaultPick = selectDefaultSlot(data.slots, effectiveNow);
          setSelectedDate(defaultPick.selectedDate);
          return defaultPick.selectedSlotId;
        }
        return prevSlotId;
      });
    } catch (err: any) {
      console.error('Lỗi khi tải Flash Sale:', err);
      // Khi API lỗi: ẩn khối Flash Sale hoặc hiển thị an toàn, không làm crash trang (Section 20)
      if (isInitial) setCampaign(null);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  // Gọi lần đầu khi mount
  useEffect(() => {
    setMounted(true);
    loadCampaign(true);
  }, [loadCampaign]);

  // ==========================================================================
  // 2. REALTIME POLLING (30-60 GIÂY) & VISIBILITY CHANGE (Section 19)
  // ==========================================================================
  useEffect(() => {
    // Polling định kỳ mỗi 30 giây để cập nhật sold, quota, slots mới nhất
    const pollingInterval = setInterval(() => {
      loadCampaign(false);
    }, 30000);

    // Timer re-evaluate trạng thái khung giờ mỗi 5 giây
    const tickInterval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 5000);

    // Khi người dùng quay lại tab (window focus hoặc tab visibilitychange) -> tải lại ngay
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadCampaign(false);
        setTick((prev) => prev + 1);
      }
    };

    const handleWindowFocus = () => {
      loadCampaign(false);
      setTick((prev) => prev + 1);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(pollingInterval);
      clearInterval(tickInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [loadCampaign]);

  // ==========================================================================
  // 3. XỬ LÝ NHÓM NGÀY & KHUNG GIỜ THEO MÚI GIỜ VIỆT NAM (Section 7, 9, 10, 11)
  // ==========================================================================
  const allSlots: FlashSaleSlot[] = useMemo(() => {
    return campaign?.slots || [];
  }, [campaign]);

  // Nhóm slots theo ngày bắt đầu (Asia/Ho_Chi_Minh)
  const groupedDates = useMemo(() => {
    return groupSlotsByStartDate(allSlots, currentNowMs);
  }, [allSlots, currentNowMs]);

  const dateTabsData = useMemo(() => {
    return groupedDates.map((g) => ({ date: g.date, isEnded: g.isEnded }));
  }, [groupedDates]);

  // Các slot thuộc ngày đang chọn (được sắp xếp theo start tăng dần)
  const slotsForSelectedDate: FlashSaleSlot[] = useMemo(() => {
    if (!selectedDate) {
      return groupedDates[0]?.slots || [];
    }
    const found = groupedDates.find((g) => g.date === selectedDate);
    return found ? found.slots : [];
  }, [groupedDates, selectedDate]);

  // Khi người dùng click chọn 1 Tab Ngày
  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date);
    const dayGroup = groupedDates.find((g) => g.date === date);
    if (dayGroup && dayGroup.slots.length > 0) {
      // Ưu tiên chọn: 1. LIVE -> 2. UPCOMING gần nhất -> 3. Slot đầu tiên của ngày đó
      const live = dayGroup.slots.find((s) => {
        const start = s.start || s.startTime || '';
        const end = s.end || s.endTime || '';
        return computeSlotStatus(start, end, currentNowMs) === 'ACTIVE';
      });
      if (live) {
        setSelectedSlotId(live.id);
      } else {
        const upcoming = dayGroup.slots
          .filter((s) => {
            const start = s.start || s.startTime || '';
            const end = s.end || s.endTime || '';
            return computeSlotStatus(start, end, currentNowMs) === 'UPCOMING';
          })
          .sort((a, b) => {
            const aStart = new Date(a.start || a.startTime || '').getTime();
            const bStart = new Date(b.start || b.startTime || '').getTime();
            return aStart - bStart;
          });
        setSelectedSlotId(upcoming.length > 0 ? upcoming[0].id : dayGroup.slots[0].id);
      }
    } else {
      setSelectedSlotId(null);
    }
  }, [groupedDates, currentNowMs]);

  // Slot hiện đang được chọn
  const currentSlot: FlashSaleSlot | undefined = useMemo(() => {
    if (!selectedSlotId) return slotsForSelectedDate[0];
    return slotsForSelectedDate.find((s) => s.id === selectedSlotId) || slotsForSelectedDate[0];
  }, [slotsForSelectedDate, selectedSlotId]);

  // Trạng thái khung giờ hiện tại
  const currentSlotStatus = useMemo(() => {
    if (!currentSlot) return 'ENDED';
    const start = currentSlot.start || currentSlot.startTime || '';
    const end = currentSlot.end || currentSlot.endTime || '';
    return computeSlotStatus(start, end, currentNowMs);
  }, [currentSlot, currentNowMs]);

  // Danh sách sản phẩm của slot đang chọn
  const currentProducts: FlashSaleProduct[] = useMemo(() => {
    if (!currentSlot) return [];
    if (currentSlot.products && currentSlot.products.length > 0) {
      return currentSlot.products;
    }
    // Fallback: nếu slot chưa gắn trực tiếp sản phẩm, lọc từ campaign.products theo slotId
    if (campaign?.products) {
      return campaign.products.filter(
        (p: any) => p.slotId === currentSlot.id || !p.slotId
      );
    }
    return [];
  }, [currentSlot, campaign]);

  // Mốc thời gian mục tiêu đếm ngược
  const countdownTarget = useMemo(() => {
    if (!currentSlot) return undefined;
    if (currentSlotStatus === 'UPCOMING') {
      return currentSlot.start || currentSlot.startTime;
    }
    if (currentSlotStatus === 'ACTIVE') {
      return currentSlot.end || currentSlot.endTime;
    }
    return undefined;
  }, [currentSlot, currentSlotStatus]);

  // Khi countdown về 0: re-evaluate và tải lại dữ liệu mà không reload trang (Section 13)
  const handleCountdownFinish = useCallback(() => {
    setTick((prev) => prev + 1);
    loadCampaign(false);
  }, [loadCampaign]);

  // ==========================================================================
  // RENDER FALLBACK & XỬ LÝ KHÔNG CÓ DỮ LIỆU (Section 20 & 21)
  // ==========================================================================
  if (!mounted || loading) {
    return null;
  }

  if (!campaign || allSlots.length === 0) {
    return null;
  }

  return (
    <section className={styles.flashSaleSection} aria-label="Chương trình Flash Sale">
      <div className={styles.container}>
        {/* 2 Voucher % 3D ở hai góc trên */}
        <div className={styles.voucherTagLeft}>%</div>
        <div className={styles.voucherTagRight}>%</div>

        {/* 1. Date Tabs (dd/MM) */}
        <FlashSaleDays
          dates={dateTabsData}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
        />

        {/* 2. Sub-Header: Khung giờ + Đồng hồ đếm ngược Countdown */}
        <div className={styles.subHeaderRow}>
          {slotsForSelectedDate.length > 0 ? (
            <FlashSaleSlots
              slots={slotsForSelectedDate}
              selectedSlotId={selectedSlotId}
              onSelectSlot={(id) => setSelectedSlotId(id)}
              nowMs={currentNowMs}
            />
          ) : (
            <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '16px' }}>
              ⚡ {campaign.title || 'FLASHSALE'}
            </div>
          )}

          {/* Countdown Timer */}
          {currentSlot && (
            <FlashSaleCountdown
              status={currentSlotStatus}
              targetIso={countdownTarget}
              serverOffset={serverOffset}
              onFinish={handleCountdownFinish}
            />
          )}
        </div>

        {/* 3. Product Carousel (5 sản phẩm desktop, vuốt ngang mobile) */}
        <FlashSaleProducts
          products={currentProducts}
          slotStatus={currentSlotStatus}
        />

        {/* 4. Footer Note / Ghi chú chính sách của Admin (Section 18) */}
        {(campaign.note || campaign.disclaimer) && (
          <div className={styles.bottomDisclaimer}>
            {campaign.note || campaign.disclaimer}
          </div>
        )}
      </div>
    </section>
  );
};
