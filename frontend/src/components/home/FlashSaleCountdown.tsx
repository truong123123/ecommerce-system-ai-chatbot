'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './FlashSale.module.css';

interface FlashSaleCountdownProps {
  status: 'upcoming' | 'live' | 'ended';
  targetTime?: string;
  serverOffset: number;
  onFinish?: () => void;
}

export const FlashSaleCountdown: React.FC<FlashSaleCountdownProps> = React.memo(
  ({ status, targetTime, serverOffset, onFinish }) => {
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

    useEffect(() => {
      hasTriggeredRef.current = false;

      if (status === 'ended' || !targetTime) {
        return;
      }

      const targetMs = new Date(targetTime).getTime();
      if (isNaN(targetMs)) {
        return;
      }

      const calculateAndSet = () => {
        const nowServerMs = Date.now() + serverOffset;
        const diffMs = targetMs - nowServerMs;

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

      calculateAndSet();
      const interval = setInterval(calculateAndSet, 1000);

      return () => clearInterval(interval);
    }, [status, targetTime, serverOffset, onFinish]);

    if (status === 'ended') {
      return (
        <div className={styles.countdownContainer}>
          <span className={styles.endedLabel}>FLASH SALE ĐÃ KẾT THÚC</span>
        </div>
      );
    }

    const label = status === 'upcoming' ? 'BẮT ĐẦU SAU' : 'KẾT THÚC SAU';

    return (
      <div className={styles.countdownContainer}>
        <span className={styles.countdownLabel}>{label}</span>
        <div className={styles.countdownBoxes}>
          <span className={styles.countdownDigit}>{timeLeft.days}</span>
          <span className={styles.countdownSeparator}>:</span>
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
