'use client';

import React, { useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Banner, Product } from '../../../types/showcase';
import { WATCH_TABS, NEED_PILLS, ENABLE_NEED_FILTER } from '../../../config/showcase';
import { useFavorites } from '../../../hooks/useFavorites';
import { BannerPoster } from './BannerPoster';
import { FilterTabs } from './FilterTabs';
import { BrandChips } from './BrandChips';
import { ProductCard } from './ProductCard';
import { EmptyState } from './EmptyState';
import styles from '../WatchAudioShowcase.module.css';

interface WatchAudioShowcaseClientProps {
  initialProducts: Product[];
  banners: Banner[];
  availableBrands: string[];
  activeTab: string;
  activeBrand: string;
  currentCategorySlug: string;
}

export const WatchAudioShowcaseClient: React.FC<WatchAudioShowcaseClientProps> = ({
  initialProducts,
  banners,
  availableBrands,
  activeTab,
  activeBrand,
  currentCategorySlug,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { isFavorite, toggleFavorite } = useFavorites();

  /**
   * Updates searchParams on the URL with smooth Next.js useTransition.
   * Keeps URL shareable and preserves filter state across page refreshes.
   */
  const updateFilterParam = (key: string, value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (value && value !== 'Tất cả' && value !== 'all') {
      current.set(key, value);
    } else {
      current.delete(key);
    }

    // Reset brand when switching category tabs
    if (key === 'tab') {
      current.delete('brand');
      current.delete('need');
    }

    const query = current.toString();
    const targetUrl = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.push(targetUrl, { scroll: false });
    });
  };

  const handleTabChange = (tabId: string) => {
    updateFilterParam('tab', tabId);
  };

  const handleBrandChange = (brand: string) => {
    updateFilterParam('brand', brand);
  };

  const handleResetFilters = () => {
    startTransition(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.delete('brand');
      current.delete('need');
      const query = current.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  return (
    <section
      className={styles.sectionWrapper}
      aria-label="Chuyên mục Đồng hồ và Âm thanh"
      id="showcase-watch-audio"
    >
      <div className={styles.container}>
        {/* ================= LEFT COLUMN: VERTICAL BANNERS ================= */}
        <div className={styles.bannerCol} aria-label="Banners khuyến mãi">
          {banners.slice(0, 2).map((banner, index) => (
            <BannerPoster
              key={banner.id}
              banner={banner}
              priority={index === 0}
            />
          ))}
        </div>

        {/* ================= RIGHT COLUMN: TABS, FILTERS & PRODUCT GRID ================= */}
        <div className={styles.contentCol}>
          {/* 1. Accessible Category Tabs */}
          <FilterTabs
            tabs={WATCH_TABS}
            activeTabId={activeTab}
            onTabChange={handleTabChange}
            disabled={isPending}
          />

          {/* 2. Needs / Feature Pills (conditionally rendered only if backend supports query ?need=) */}
          {ENABLE_NEED_FILTER && (
            <div className={styles.featurePillsRow} role="group" aria-label="Lọc theo nhu cầu">
              {NEED_PILLS.map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  className={styles.featurePill}
                  onClick={() => updateFilterParam('need', pill.id)}
                >
                  <span>{pill.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* 3. Brand Filter Chips */}
          <BrandChips
            brands={availableBrands}
            activeBrand={activeBrand}
            onBrandChange={handleBrandChange}
            categorySlug={currentCategorySlug}
            disabled={isPending}
          />

          {/* 4. Product Grid or Empty State with smooth pending indicator */}
          <div
            id={`showcase-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`showcase-tab-${activeTab}`}
            className={`${styles.gridWrapper} ${isPending ? styles.pendingTransition : ''}`}
            aria-busy={isPending}
          >
            {initialProducts.length === 0 ? (
              <EmptyState onResetFilters={handleResetFilters} />
            ) : (
              <div className={styles.productGrid}>
                {initialProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={isFavorite(product.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
