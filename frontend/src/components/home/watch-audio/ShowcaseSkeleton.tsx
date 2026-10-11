import React from 'react';
import styles from '../WatchAudioShowcase.module.css';

/**
 * ShowcaseSkeleton: Zero-CLS skeleton matching exact DOM dimensions of the real showcase.
 */
export const ShowcaseSkeleton: React.FC = () => {
  return (
    <div className={styles.sectionWrapper} aria-busy="true" aria-label="Đang tải dữ liệu sản phẩm">
      <div className={styles.container}>
        {/* Left Banners Skeleton */}
        <div className={styles.bannerCol}>
          {[1, 2].map((i) => (
            <div key={i} className={`${styles.posterCard} ${styles.skeletonCard}`}>
              <div className={`${styles.posterImageWrapper} ${styles.skeletonShimmer}`} />
            </div>
          ))}
        </div>

        {/* Right Content Skeleton */}
        <div className={styles.contentCol}>
          {/* Tabs Skeleton */}
          <div className={styles.categoryTabs}>
            <div className={`${styles.skeletonTab} ${styles.skeletonShimmer}`} />
            <div className={`${styles.skeletonTab} ${styles.skeletonShimmer}`} />
          </div>

          {/* Brands Skeleton */}
          <div className={styles.brandsRow}>
            <div className={styles.brandsGroup}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`${styles.skeletonChip} ${styles.skeletonShimmer}`} />
              ))}
            </div>
          </div>

          {/* 4-Column Product Grid Skeleton */}
          <div className={styles.productGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className={`${styles.productCard} ${styles.skeletonCard}`}>
                <div className={styles.cardBadges}>
                  <div className={`${styles.skeletonBadge} ${styles.skeletonShimmer}`} />
                </div>
                <div className={`${styles.imageBox} ${styles.skeletonShimmer}`} />
                <div className={`${styles.skeletonTextLine} ${styles.skeletonShimmer}`} style={{ width: '85%' }} />
                <div className={`${styles.skeletonTextLine} ${styles.skeletonShimmer}`} style={{ width: '60%', marginBottom: 12 }} />
                <div className={`${styles.skeletonPrice} ${styles.skeletonShimmer}`} />
                <div className={styles.cardFooter} style={{ borderTop: 'none' }}>
                  <div className={`${styles.skeletonBadge} ${styles.skeletonShimmer}`} style={{ width: 45 }} />
                  <div className={`${styles.skeletonBadge} ${styles.skeletonShimmer}`} style={{ width: 20 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
