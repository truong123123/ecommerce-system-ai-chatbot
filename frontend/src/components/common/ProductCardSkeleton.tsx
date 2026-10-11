import React from 'react';
import styles from './Common.module.css';

interface ProductCardSkeletonProps {
  className?: string;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ className }) => {
  return (
    <div
      className={`${styles.cardSkeleton} ${className || ''}`}
      aria-hidden="true"
      data-testid="product-card-skeleton"
    >
      <div className={`${styles.badgeSkeleton} ${styles.shimmer}`} />
      <div className={`${styles.imageSkeleton} ${styles.shimmer}`} />
      <div className={`${styles.titleSkeletonLine} ${styles.shimmer}`} />
      <div className={`${styles.titleSkeletonSubline} ${styles.shimmer}`} />
      <div className={`${styles.priceSkeleton} ${styles.shimmer}`} />
      <div className={styles.footerSkeleton}>
        <div className={`${styles.pillSkeleton} ${styles.shimmer}`} />
        <div className={`${styles.pillSkeleton} ${styles.shimmer}`} style={{ width: 20 }} />
      </div>
    </div>
  );
};
