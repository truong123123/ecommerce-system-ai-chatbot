'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import styles from './FlashSale.module.css';
import {
  FlashSaleCampaign,
  FlashSaleItem,
  FlashSaleTimeSlot,
} from '../../types/flashSale';
import { flashSaleService } from '../../services/flashSaleService';
import { FlashSaleCountdown } from './FlashSaleCountdown';

export const FlashSale: React.FC = () => {
  const [campaign, setCampaign] = useState<FlashSaleCampaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [serverOffset, setServerOffset] = useState<number>(0);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  // Carousel scroll ref and arrow states
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  // Helper: Chuyển đổi múi giờ UTC sang Asia/Ho_Chi_Minh (GMT+7)
  const formatVNDate = useCallback((dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
      }).format(d);
    } catch {
      return '';
    }
  }, []);

  const formatSlotPillLabel = useCallback((startUtc: string, endUtc: string): string => {
    try {
      const start = new Date(startUtc);
      const end = new Date(endUtc);
      const tfHour = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: 'numeric',
        hour12: false,
      });
      const tfDate = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
      });
      return `${tfHour.format(start)}-${tfHour.format(end)}h ${tfDate.format(start)}`;
    } catch {
      return '';
    }
  }, []);

  // 1. Tải chiến dịch Flash Sale ĐANG HOẠT ĐỘNG từ API /flash-sales/active
  // TUYỆT ĐỐI KHÔNG dùng mock data / localStorage fallback
  const loadActiveCampaign = useCallback(async () => {
    try {
      setLoading(true);
      const data = await flashSaleService.getActiveCampaign();
      if (!data || !data.products || data.products.length === 0) {
        setCampaign(null);
        return;
      }

      const offset = data.serverNow
        ? new Date(data.serverNow).getTime() - Date.now()
        : 0;
      setServerOffset(offset);
      setCampaign(data);

      const slots = data.timeSlots || [];
      if (slots.length > 0) {
        // Ưu tiên chọn: 1. LIVE -> 2. UPCOMING gần nhất -> 3. ENDED cuối cùng
        const liveSlot = slots.find((s) => s.status === 'live');
        if (liveSlot) {
          setSelectedDate(formatVNDate(liveSlot.startTime));
          setSelectedSlotId(liveSlot.id);
        } else {
          const upcomingSlot = slots.find((s) => s.status === 'upcoming');
          if (upcomingSlot) {
            setSelectedDate(formatVNDate(upcomingSlot.startTime));
            setSelectedSlotId(upcomingSlot.id);
          } else {
            const endedSlots = slots.filter((s) => s.status === 'ended');
            if (endedSlots.length > 0) {
              const lastEnded = endedSlots[endedSlots.length - 1];
              setSelectedDate(formatVNDate(lastEnded.startTime));
              setSelectedSlotId(lastEnded.id);
            } else {
              setSelectedDate(formatVNDate(slots[0].startTime));
              setSelectedSlotId(slots[0].id);
            }
          }
        }
      } else {
        setSelectedDate('');
        setSelectedSlotId(null);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải Flash Sale active:', err);
      // Khi API lỗi: ẩn hoàn toàn khối Flash Sale, không dùng bất kỳ dữ liệu giả nào
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  }, [formatVNDate]);

  useEffect(() => {
    loadActiveCampaign();
  }, [loadActiveCampaign]);

  const slots = useMemo(() => campaign?.timeSlots || [], [campaign]);

  // Nhóm các Ngày duy nhất (VD: 03/10, 04/10) sắp xếp tăng dần
  const availableDates = useMemo(() => {
    const datesSet = new Set<string>();
    slots.forEach((s) => {
      const dateStr = formatVNDate(s.startTime);
      if (dateStr) datesSet.add(dateStr);
    });
    return Array.from(datesSet);
  }, [slots, formatVNDate]);

  // Các slots thuộc ngày đang chọn
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return slots;
    return slots.filter((s) => formatVNDate(s.startTime) === selectedDate);
  }, [slots, selectedDate, formatVNDate]);

  // Khi click chọn Date tab
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    const dateSlots = slots.filter((s) => formatVNDate(s.startTime) === date);
    if (dateSlots.length > 0) {
      const live = dateSlots.find((s) => s.status === 'live');
      if (live) {
        setSelectedSlotId(live.id);
      } else {
        const upcoming = dateSlots.find((s) => s.status === 'upcoming');
        setSelectedSlotId(upcoming ? upcoming.id : dateSlots[0].id);
      }
    } else {
      setSelectedSlotId(null);
    }
  };

  // Slot hiện đang được chọn
  const currentSlot: FlashSaleTimeSlot | undefined = useMemo(() => {
    if (!selectedSlotId) return slots[0];
    return slots.find((s) => s.id === selectedSlotId) || slots[0];
  }, [slots, selectedSlotId]);

  // Sản phẩm thuộc slot đang chọn (hoặc tất cả sản phẩm của campaign nếu chưa có slotId)
  const currentProducts: FlashSaleItem[] = useMemo(() => {
    if (!campaign?.products) return [];
    if (!selectedSlotId) return campaign.products;
    return campaign.products.filter((p) => p.slotId === selectedSlotId || !p.slotId);
  }, [campaign, selectedSlotId]);

  // Kiểm tra scroll arrows của Carousel
  const updateScrollArrows = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  useEffect(() => {
    updateScrollArrows();
    const el = viewportRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollArrows, { passive: true });
      window.addEventListener('resize', updateScrollArrows);
      return () => {
        el.removeEventListener('scroll', updateScrollArrows);
        window.removeEventListener('resize', updateScrollArrows);
      };
    }
  }, [updateScrollArrows, currentProducts]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!viewportRef.current) return;
    const scrollAmount = 240 * 2;
    viewportRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleCountdownFinish = useCallback(() => {
    loadActiveCampaign();
  }, [loadActiveCampaign]);

  const formatPrice = (p?: number) => {
    if (p == null) return '0đ';
    return p.toLocaleString('vi-VN') + 'đ';
  };

  // NẾU KHÔNG CÓ DỮ LIỆU HOẶC API LỖI: ẨN KHỐI FLASH SALE HOÀN TOÀN
  if (loading) {
    return null;
  }

  if (!campaign || !campaign.products || campaign.products.length === 0) {
    return null;
  }

  const slotStatus = currentSlot?.status || 'live';
  const countdownTarget =
    slotStatus === 'upcoming'
      ? currentSlot?.startTime
      : slotStatus === 'live'
      ? currentSlot?.endTime
      : undefined;

  return (
    <section className={styles.flashSaleSection}>
      <div className={styles.container}>
        {/* 2 Voucher 3D hai bên góc trên */}
        <div className={styles.voucherTagLeft}>%</div>
        <div className={styles.voucherTagRight}>%</div>

        {/* 1. Date Tabs (03/10, 04/10) */}
        {availableDates.length > 1 && (
          <div className={styles.topDateTabs}>
            {availableDates.map((date) => {
              const isActive = selectedDate === date;
              return (
                <button
                  key={date}
                  className={`${styles.dateTab} ${
                    isActive ? styles.dateTabActive : styles.dateTabInactive
                  }`}
                  onClick={() => handleSelectDate(date)}
                >
                  {date}
                </button>
              );
            })}
          </div>
        )}

        {/* 2. Sub-Header: Khung giờ bên trái + Countdown Timer bên phải */}
        <div className={styles.subHeaderRow}>
          {slotsForSelectedDate.length > 0 ? (
            <div className={styles.timeSlotTabs}>
              {slotsForSelectedDate.map((slot) => {
                const label = formatSlotPillLabel(slot.startTime, slot.endTime);
                const isSelected = slot.id === selectedSlotId;
                const isEnded = slot.status === 'ended';

                return (
                  <button
                    key={slot.id}
                    className={`${styles.slotTab} ${
                      isSelected ? styles.slotTabActive : styles.slotTabInactive
                    } ${isEnded ? styles.slotTabEnded : ''}`}
                    onClick={() => setSelectedSlotId(slot.id)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '16px' }}>
              ⚡ {campaign.title || 'FLASHSALE'}
            </div>
          )}

          {/* Countdown Clock */}
          {currentSlot && countdownTarget && (
            <FlashSaleCountdown
              status={slotStatus}
              targetTime={countdownTarget}
              serverOffset={serverOffset}
              onFinish={handleCountdownFinish}
            />
          )}
        </div>

        {/* 3. Product Carousel */}
        <div className={styles.productWrapper}>
          {canScrollLeft && (
            <button
              className={`${styles.arrowBtn} ${styles.arrowLeft}`}
              onClick={() => handleScroll('left')}
              aria-label="Cuộn trái"
            >
              ‹
            </button>
          )}

          <div className={styles.carouselViewport} ref={viewportRef}>
            {currentProducts.length === 0 ? (
              <div className={styles.emptyStateContainer}>
                <p className={styles.emptyStateText}>
                  Chưa có sản phẩm trong khung giờ này
                </p>
              </div>
            ) : (
              <div className={styles.carouselTrack}>
                {currentProducts.map((product) => {
                  const sold = product.soldCount || 0;
                  const stock = product.totalStock || 1;
                  const percentSold = Math.min((sold / stock) * 100, 100);
                  const isSoldOut = sold >= stock;
                  const isEnded = slotStatus === 'ended';
                  const isUpcoming = slotStatus === 'upcoming';

                  const productHref = product.productSlug
                    ? `/products/${product.productSlug}`
                    : `/products/${product.productId}`;

                  return (
                    <Link
                      key={product.id}
                      href={productHref}
                      className={styles.productCard}
                    >
                      {/* Ảnh vuông */}
                      <div className={styles.imageWrapper}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            product.imageUrl ||
                            'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80'
                          }
                          alt={product.name}
                          className={`${styles.productImg} ${
                            isEnded ? styles.imageEnded : ''
                          }`}
                          loading="lazy"
                        />
                      </div>

                      {/* Thông tin sản phẩm */}
                      <div className={styles.productInfo}>
                        <h3 className={styles.productName} title={product.name}>
                          {product.name}
                        </h3>

                        {/* Hàng giá */}
                        <div className={styles.priceRow}>
                          <span className={styles.salePrice}>
                            {formatPrice(product.salePrice)}
                          </span>
                          {product.originalPrice > product.salePrice && (
                            <span className={styles.originalPrice}>
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Thanh tiến độ */}
                        <div className={styles.progressContainer}>
                          <div
                            className={styles.progressBar}
                            style={{ width: `${percentSold}%` }}
                          />
                          <div className={styles.progressContent}>
                            <span className={styles.mascotIcon}>🔥</span>
                            <span className={styles.progressText}>
                              {isSoldOut
                                ? 'Hết suất'
                                : isUpcoming
                                ? 'Sắp mở bán'
                                : `Đã bán ${sold}/${stock} suất`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {canScrollRight && (
            <button
              className={`${styles.arrowBtn} ${styles.arrowRight}`}
              onClick={() => handleScroll('right')}
              aria-label="Cuộn phải"
            >
              ›
            </button>
          )}
        </div>

        {/* Footer ghi chú chính sách theo chiến dịch thật */}
        <div className={styles.bottomDisclaimer}>
          {campaign.disclaimer ||
            'Chỉ áp dụng thanh toán online thành công — Mỗi SĐT chỉ được mua 1 sản phẩm cùng loại - Không áp dụng cùng ưu đãi S-Student'}
        </div>
      </div>
    </section>
  );
};
