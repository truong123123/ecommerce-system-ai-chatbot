'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Banner } from '../../types/banner';
import styles from './HeroBanner.module.css';
import { API_BASE_URL } from '@/lib/env';

const DEFAULT_BANNERS: Banner[] = [
  {
    id: 1,
    title: 'Galaxy S26 Ultra',
    headline: 'Đặt trước nhận quà khủng',
    subHeadline: 'Thu cũ lên đời trợ giá tới 5 Triệu - Trả góp 0%',
    imageUrl: 'https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859058/banners/471331_S26-Series-1200x375.webp',
    primaryBtnText: 'Đặt ngay',
    primaryBtnLink: '/products/samsung-galaxy-s26-ultra',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 2,
    title: 'iPhone 18 Series',
    headline: 'Sẵn hàng giá tốt',
    subHeadline: 'Ưu đãi thanh toán ngân hàng - Trả góp 0%',
    imageUrl: 'https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859066/banners/iphone-18-web-082925157.webp',
    primaryBtnText: 'Mua ngay',
    primaryBtnLink: '/products/iphone-17-pro-256gb',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 3,
    title: 'Huawei Watch GT 7',
    headline: 'Đỉnh cao pin 2 tuần',
    subHeadline: 'Thiết kế thể thao sang trọng - Theo dõi sức khỏe chuyên sâu',
    imageUrl: 'https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859060/banners/666649_KV-HUAWEI-WATCH-GT-7-Series-1200x375.webp',
    primaryBtnText: 'Khám phá',
    primaryBtnLink: '/products?category=dong-ho',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 4,
    title: 'Galaxy A18 & A08',
    headline: 'Siêu pin 25W - Giá hời',
    subHeadline: 'Màn hình 90Hz mượt mà - Pin 5000mAh bền bỉ',
    imageUrl: 'https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859062/banners/702904_KV-SS-A18-_-A08-1200x375-25w.webp',
    primaryBtnText: 'Xem chi tiết',
    primaryBtnLink: '/products?category=dien-thoai',
    displayOrder: 4,
    isActive: true,
  },
  {
    id: 5,
    title: 'OPPO Find X10 Series',
    headline: 'Nhiếp ảnh bậc thầy',
    subHeadline: 'Camera Hasselblad cao cấp - Sạc siêu tốc 100W',
    imageUrl: 'https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859063/banners/860851_OPPO-Find-X10-Series-web.webp',
    primaryBtnText: 'Tìm hiểu thêm',
    primaryBtnLink: '/products?category=dien-thoai',
    displayOrder: 5,
    isActive: true,
  },
  {
    id: 6,
    title: 'iPhone Duo Siêu Phẩm',
    headline: 'Đăng ký sớm có lợi thế',
    subHeadline: 'Đột phá thiết kế kép - Màn hình tràn viền',
    imageUrl: 'https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859067/banners/iphone-duo-web-084156526.webp',
    primaryBtnText: 'Đăng ký nhận tin',
    primaryBtnLink: '/products/iphone-air',
    displayOrder: 6,
    isActive: true,
  },
  {
    id: 7,
    title: 'Astra 2 AI',
    headline: 'Tương lai công nghệ AI',
    subHeadline: 'Xử lý AI tức thì on-device - Trải nghiệm thông minh đỉnh cao',
    imageUrl: 'https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859064/banners/astra-2-web-083724546.webp',
    primaryBtnText: 'Trải nghiệm ngay',
    primaryBtnLink: '/products',
    displayOrder: 7,
    isActive: true,
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
        const res = await fetch(`${API_BASE_URL}/banners`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // Lọc đúng các banner thuộc Hero Slider (không lấy banner đứng chuyên mục)
            const heroOnly = data.filter((b: any) => b.bgColor !== 'category_phone' && b.bgColor !== 'category_laptop' && b.bgColor !== 'category_watch');
            if (heroOnly.length > 0) {
              setBanners(heroOnly);
            }
          }
        }
      } catch (err) {
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
      {/* Khung Banner Chính (CellphoneS Style - Tỉ lệ chuẩn 1200x375) */}
      <div
        className={styles.bannerWrapper}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <Link
          href={currentBanner.primaryBtnLink || '/products'}
          className={styles.bannerLink}
          title={currentBanner.title}
        >
          <div key={currentBanner.id} className={styles.bannerSlide}>
            {currentBanner.imageUrl ? (
              <img
                src={currentBanner.imageUrl}
                alt={currentBanner.title}
                className={styles.bannerImg}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859058/banners/471331_S26-Series-1200x375.webp';
                }}
              />
            ) : (
              <div className={styles.fallbackCard}>
                <span className={styles.fallbackBadge}>{currentBanner.title}</span>
                <h1 className={styles.fallbackHeadline}>{currentBanner.headline}</h1>
                <p className={styles.fallbackSubHeadline}>{currentBanner.subHeadline}</p>
                {currentBanner.primaryBtnText && (
                  <span className={styles.fallbackBtn}>{currentBanner.primaryBtnText}</span>
                )}
              </div>
            )}
          </div>
        </Link>

        {/* Nút điều hướng mũi tên bán nguyệt (CellphoneS Signature Style) */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.arrowBtn} ${styles.prevBtn}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
              }}
              aria-label="Banner trước"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.arrowBtn} ${styles.nextBtn}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentIndex((prev) => (prev + 1) % banners.length);
              }}
              aria-label="Banner tiếp theo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thanh Tabs Tiêu Đề Dưới Banner (Phong cách CellphoneS đặc trưng) */}
      {banners.length > 1 && (
        <div
          className={styles.tabsContainer}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {banners.map((item, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={item.id || idx}
                type="button"
                className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}
                onClick={() => setCurrentIndex(idx)}
                title={item.title}
              >
                <div className={styles.tabTitle}>{item.title}</div>
                <div className={styles.tabSub}>{item.headline || item.subHeadline || 'Giá cực tốt'}</div>
                {isActive && <div className={styles.activeBar} />}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
