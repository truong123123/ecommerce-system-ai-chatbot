import React from 'react';
import { ProductCardSkeleton } from '@/components/common/ProductCardSkeleton';
import styles from '@/components/category/CategoryListingPage.module.css';

export default function CategoryLoading() {
  return (
    <div className={styles.pageWrapper} aria-busy="true" aria-label="Đang tải danh sách sản phẩm">
      {/* Breadcrumb Skeleton */}
      <div className={styles.breadcrumb} style={{ minHeight: 24, width: '40%' }}>
        <div className={styles.skeletonLine} style={{ width: '100%', height: 16 }} />
      </div>

      {/* Header Skeleton */}
      <div className={styles.headerSection} style={{ marginBottom: 20 }}>
        <div className={styles.skeletonLine} style={{ width: 220, height: 32 }} />
      </div>

      {/* Product Grid Skeletons */}
      <div className={styles.productGrid}>
        {Array.from({ length: 8 }).map((_, idx) => (
          <ProductCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}
