'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Banner } from '../../types/banner';
import styles from './HeroBanner.module.css';

const DEFAULT_BANNERS: Banner[] = [
  {
    id: 1,
    title: 'iPhone 16 Pro Max',
    headline: 'Titan Tự Nhiên. Sức Mạnh A18 Pro.',
    subHeadline: 'Camera Fusion 48MP với nút Điều khiển Camera hoàn toàn mới. Viền mỏng nhất trên iPhone.',
    primaryBtnText: 'Mua ngay',
    primaryBtnLink: '/products',
    secondaryBtnText: 'Khám phá thêm',
    secondaryBtnLink: '/products',
    bgColor: '#0a0a0c',
    textColor: '#f5f5f7',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1600&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'MacBook Pro M3 Max',
    headline: 'Bứt phá mọi giới hạn hiệu năng.',
    subHeadline: 'Màn hình Liquid Retina XDR cực đỉnh. Pin lên đến 22 giờ liên tục cho công việc chuyên nghiệp.',
    primaryBtnText: 'Tìm hiểu thêm',
    primaryBtnLink: '/products',
    secondaryBtnText: 'Xem tùy chọn',
    secondaryBtnLink: '/products',
    bgColor: '#0d0d11',
    textColor: '#ffffff',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'Apple Watch Ultra 2',
    headline: 'Mỏng hơn. Bền bỉ hơn. Đột phá.',
    subHeadline: 'Vỏ titan đen mới cùng dây đeo Milanese titan. Màn hình sáng nhất từ trước tới nay.',
    primaryBtnText: 'Trải nghiệm ngay',
    primaryBtnLink: '/products',
    secondaryBtnText: 'Đặt mua',
    secondaryBtnLink: '/products',
    bgColor: '#161617',
    textColor: '#f5f5f7',
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1600&auto=format&fit=crop&q=80',
  },
];

export const HeroBanner: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch banners from Spring Boot Backend (PostgreSQL)
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        const res = await fetch(`${apiUrl}/banners`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setBanners(data);
          }
        }
      } catch (err) {
        // Fallback silently to DEFAULT_BANNERS if backend is unreachable
        console.warn('Backend banners API unavailable, using fallback data.', err);
      }
    };

    fetchBanners();
  }, []);

  // Auto slide interval
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, isPaused, currentIndex]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex] || banners[0];

  return (
    <section className={styles.sectionContainer} aria-label="Khuyến mãi nổi bật">
      <div
        className={styles.bannerWrapper}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div key={currentBanner.id} className={styles.bannerSlide}>
          <div className={styles.textCol}>
            <span className={styles.productBadge}>{currentBanner.title}</span>
            <h1 className={styles.headline}>{currentBanner.headline}</h1>
            <p className={styles.subHeadline}>{currentBanner.subHeadline}</p>

            <div className={styles.buttonGroup}>
              {currentBanner.primaryBtnText && (
                <Link
                  href={currentBanner.primaryBtnLink || '#'}
                  className={styles.btnPrimary}
                >
                  {currentBanner.primaryBtnText}
                </Link>
              )}
              {currentBanner.secondaryBtnText && (
                <Link
                  href={currentBanner.secondaryBtnLink || '#'}
                  className={styles.btnSecondary}
                >
                  {currentBanner.secondaryBtnText}
                </Link>
              )}
            </div>
          </div>

          {currentBanner.imageUrl && (
            <div className={styles.imageCol}>
              <img
                src={currentBanner.imageUrl}
                alt={currentBanner.title}
                className={styles.bannerImg}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1600&auto=format&fit=crop&q=80';
                }}
              />
            </div>
          )}
        </div>

        {/* Slide Indicators & Navigation Buttons */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.arrowBtn} ${styles.prevBtn}`}
              onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
              aria-label="Previous slide"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.arrowBtn} ${styles.nextBtn}`}
              onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
              aria-label="Next slide"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <div className={styles.indicators}>
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
