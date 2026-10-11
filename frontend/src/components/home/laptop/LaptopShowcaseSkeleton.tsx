import React from 'react';
import { ProductCardSkeleton } from '@/components/common/ProductCardSkeleton';
import styles from '../LaptopShowcase.module.css';

export function LaptopShowcaseSkeleton() {
  return (
    <section className={styles.sectionWrapper} aria-label="Đang tải chuyên mục Laptop và Máy tính">
      <div className={styles.container}>
        {/* Banner Column Skeleton */}
        <div className={styles.bannerCol}>
          <div
            className={styles.posterCard}
            style={{ minHeight: 240, background: '#f3f4f6' }}
            aria-hidden="true"
          />
          <div
            className={styles.posterCard}
            style={{ minHeight: 240, background: '#f3f4f6' }}
            aria-hidden="true"
          />
        </div>

        {/* Content Column Skeleton */}
        <div className={styles.contentCol}>
          {/* Tabs skeleton */}
          <div className={styles.categoryTabs} style={{ gap: 16 }}>
            <div style={{ height: 24, width: 90, background: '#e5e7eb', borderRadius: 4 }} />
            <div style={{ height: 24, width: 140, background: '#e5e7eb', borderRadius: 4 }} />
            <div style={{ height: 24, width: 60, background: '#e5e7eb', borderRadius: 4 }} />
            <div style={{ height: 24, width: 130, background: '#e5e7eb', borderRadius: 4 }} />
          </div>

          {/* Brands skeleton */}
          <div className={styles.brandsRow} style={{ gap: 8, margin: '8px 0' }}>
            <div style={{ height: 26, width: 60, background: '#f3f4f6', borderRadius: 14 }} />
            <div style={{ height: 26, width: 80, background: '#f3f4f6', borderRadius: 14 }} />
            <div style={{ height: 26, width: 70, background: '#f3f4f6', borderRadius: 14 }} />
            <div style={{ height: 26, width: 75, background: '#f3f4f6', borderRadius: 14 }} />
          </div>

          {/* Products grid skeleton (8 cards) */}
          <div className={styles.productGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
