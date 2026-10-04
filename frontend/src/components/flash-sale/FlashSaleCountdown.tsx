'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './FlashSale.module.css';

interface FlashSaleCountdownProps {
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED';
  targetIso?: string;
  serverOffset: number;
  onFinish?: () => void;
}

export const FlashSaleCountdown: React.FC<FlashSaleCountdownProps> = React.memo(
  ({ status, targetIso, serverOffset, onFinish }) => {
    const [mounted, setMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState<{
      days: string;
      hours: string;
      minutes: string;
      seconds: string;
    }>({
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00',
    });

    const hasTriggeredRef = useRef(false);

    // Quy tắc: Countdown là Client Component; tránh hydration mismatch bằng cách chỉ tính thời gian sau khi mount
    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!mounted) return;

      hasTriggeredRef.current = false;

      if (status === 'ENDED' || !targetIso) {
        return;
      }

      const targetMs = new Date(targetIso).getTime();
      if (isNaN(targetMs)) {
        return;
      }

      const updateClock = () => {
        let currentMs = Date.now() + serverOffset;

        // Hỗ trợ dev mockTime nếu có
        if (typeof window !== 'undefined') {
          const win = window as any;
          if (win.__FLASH_SALE_MOCK_TIME__) {
            const p = new Date(win.__FLASH_SALE_MOCK_TIME__).getTime();
            if (!isNaN(p)) currentMs = p;
          } else {
            const params = new URLSearchParams(window.location.search);
            const m = params.get('mockTime');
            if (m) {
              const p = new Date(m).getTime();
              if (!isNaN(p)) currentMs = p;
            }
          }
        }

        const diffMs = targetMs - currentMs;

        if (diffMs <= 0) {
          setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
          if (!hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            if (onFinish) {
              onFinish();
            }
          }
          return;
        }

        const totalSeconds = Math.floor(diffMs / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        setTimeLeft({
          days: String(days).padStart(2, '0'),
          hours: String(hours).padStart(2, '0'),
          minutes: String(minutes).padStart(2, '0'),
          seconds: String(seconds).padStart(2, '0'),
        });
      };

      updateClock();
      const timer = setInterval(updateClock, 1000);
      return () => clearInterval(timer);
    }, [mounted, status, targetIso, serverOffset, onFinish]);

    if (!mounted) {
      // Trước khi mount (SSR): Render placeholder tĩnh an toàn chống hydration mismatch
      return (
        <div className={styles.countdownContainer} suppressHydrationWarning>
          <span className={styles.countdownLabel}>
            {status === 'UPCOMING' ? 'BẮT ĐẦU SAU' : 'KẾT THÚC SAU'}
          </span>
          <div className={styles.countdownBoxes}>
            <span className={styles.countdownDigit}>00</span>
            <span className={styles.countdownSeparator}>:</span>
            <span className={styles.countdownDigit}>00</span>
            <span className={styles.countdownSeparator}>:</span>
            <span className={styles.countdownDigit}>00</span>
          </div>
        </div>
      );
    }

    if (status === 'ENDED') {
      return (
        <div className={styles.countdownContainer}>
          <span className={styles.endedLabel}>FLASH SALE ĐÃ KẾT THÚC</span>
        </div>
      );
    }

    const label = status === 'UPCOMING' ? 'BẮT ĐẦU SAU' : 'KẾT THÚC SAU';

    return (
      <div className={styles.countdownContainer} aria-live="polite">
        <span className={styles.countdownLabel}>{label}</span>
        <div className={styles.countdownBoxes}>
          {Number(timeLeft.days) > 0 && (
            <>
              <span className={styles.countdownDigit}>{timeLeft.days}</span>
              <span className={styles.countdownSeparator}>:</span>
            </>
          )}
          <span className={styles.countdownDigit}>{timeLeft.hours}</span>
          <span className={styles.countdownSeparator}>:</span>
          <span className={styles.countdownDigit}>{timeLeft.minutes}</span>
          <span className={styles.countdownSeparator}>:</span>
          <span className={styles.countdownDigit}>{timeLeft.seconds}</span>
        </div>
      </div>
    );
  }
);

FlashSaleCountdown.displayName = 'FlashSaleCountdown';
