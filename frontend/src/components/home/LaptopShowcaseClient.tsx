'use client';

import React, { useTransition, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { LaptopBanner, LaptopProduct } from '@/types/laptop';
import {
  DEFAULT_LAPTOP_BRANDS,
  ENABLE_NEED_FILTER,
  LAPTOP_CONFIG,
  LAPTOP_TABS,
  NEED_PILLS,
} from '@/config/laptopShowcase';
import { ProductCard } from '@/components/common/ProductCard';
import styles from './LaptopShowcase.module.css';

interface LaptopShowcaseClientProps {
  initialProducts: LaptopProduct[];
  banners: LaptopBanner[];
  activeTab: string;
  activeBrand: string;
  currentCategorySlug: string;
}

export const LaptopShowcaseClient: React.FC<LaptopShowcaseClientProps> = ({
  initialProducts,
  banners,
  activeTab,
  activeBrand,
  currentCategorySlug,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local fallback tracker for poster banners
  const [bannerImages, setBannerImages] = useState<Record<string, string>>(() => {
    const initialMap: Record<string, string> = {};
    banners.forEach((b) => {
      initialMap[b.id] = b.imageUrl || LAPTOP_CONFIG.PLACEHOLDER_IMAGE;
    });
    return initialMap;
  });

  const updateFilterParam = (key: string, value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (value && value !== 'Tất cả' && value !== 'all') {
      current.set(key, value);
    } else {
      current.delete(key);
    }

    // Reset brand filter when switching category tabs
    if (key === 'laptopTab') {
      current.delete('laptopBrand');
    }

    const query = current.toString();
    const targetUrl = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.push(targetUrl, { scroll: false });
    });
  };

  const handleTabChange = (tabId: string) => {
    updateFilterParam('laptopTab', tabId);
  };

  /**
   * Accessible keyboard navigation for tabs following W3C WAI-ARIA authoring practices.
   * Supports ArrowRight, ArrowLeft, Home, and End with automatic focus movement.
   */
  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let targetIndex = currentIndex;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % LAPTOP_TABS.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + LAPTOP_TABS.length) % LAPTOP_TABS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = LAPTOP_TABS.length - 1;
    } else {
      return;
    }

    const targetTab = LAPTOP_TABS[targetIndex];
    if (targetTab) {
      handleTabChange(targetTab.id);
      const targetEl = document.getElementById(`laptop-tab-${targetTab.id}`);
      if (targetEl) {
        targetEl.focus();
      }
    }
  };

  const handleBrandChange = (brand: string) => {
    updateFilterParam('laptopBrand', brand);
  };

  const handleResetFilters = () => {
    startTransition(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.delete('laptopBrand');
      const query = current.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  return (
    <section className={styles.sectionWrapper} aria-label="Chuyên mục Laptop và Máy tính">
      <div className={styles.container}>
        {/* ================= CỘT TRÁI: 2 BANNER DỌC NGUYÊN KHỐI ================= */}
        <div className={styles.bannerCol} aria-label="Banners khuyến mãi Laptop & PC">
          {banners.slice(0, 2).map((b, index) => {
            const currentImg = bannerImages[b.id] || LAPTOP_CONFIG.PLACEHOLDER_IMAGE;
            const isCustomGraphic = currentImg && currentImg !== LAPTOP_CONFIG.PLACEHOLDER_IMAGE;
            return (
              <Link
                key={b.id}
                href={b.targetLink || '/products?keyword=laptop'}
                className={styles.posterCard}
                title={b.title}
              >
                <div className={styles.posterImageWrapper}>
                  <Image
                    src={currentImg}
                    alt={b.title}
                    fill
                    unoptimized={Boolean(currentImg && currentImg.startsWith('http'))}
                    sizes="(max-width: 1024px) 100vw, 250px"
                    className={styles.posterImage}
                    priority={index === 0}
                    onError={() => {
                      setBannerImages((prev) => ({
                        ...prev,
                        [b.id]: LAPTOP_CONFIG.PLACEHOLDER_IMAGE,
                      }));
                    }}
                  />
                  {!isCustomGraphic && (
                    <div className={styles.posterOverlay}>
                      <span className={styles.posterBadge}>Laptop & PC</span>
                      <h3 className={styles.posterTitle}>{b.title}</h3>
                      <span className={styles.posterBtn}>MUA NGAY &gt;</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* ================= CỘT PHẢI: BỘ LỌC VÀ LƯỚI SẢN PHẨM ================= */}
        <div className={styles.contentCol}>
          {/* 1. Category Tabs with roving tabindex and ArrowLeft/Right keyboard support */}
          <div className={styles.categoryTabs} role="tablist" aria-label="Danh mục Laptop và Máy tính">
            {LAPTOP_TABS.map((tab, index) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`laptop-tab-${tab.id}`}
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`laptop-panel-${tab.id}`}
                  tabIndex={isSelected ? 0 : -1}
                  className={`${styles.tabBtn} ${isSelected ? styles.activeTab : ''}`}
                  onClick={() => handleTabChange(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, index)}
                  type="button"
                  disabled={isPending}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 2. Needs / Feature Pills (Tạm ẩn: Chờ backend hỗ trợ ?need=) */}
          {ENABLE_NEED_FILTER && (
            <div className={styles.featurePillsRow} role="group" aria-label="Lọc theo nhu cầu">
              {NEED_PILLS.map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  className={styles.featurePill}
                  disabled={isPending}
                >
                  <span>{pill.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* 3. Brand Filter Chips */}
          <div className={styles.brandsRow}>
            <div className={styles.brandsGroup} role="group" aria-label="Lọc theo thương hiệu">
              {DEFAULT_LAPTOP_BRANDS.map((brand) => {
                const isSelected = activeBrand === brand;
                return (
                  <button
                    key={brand}
                    type="button"
                    className={`${styles.brandChip} ${isSelected ? styles.activeBrand : ''}`}
                    onClick={() => handleBrandChange(brand)}
                    aria-pressed={isSelected}
                    disabled={isPending}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>

            <Link
              href={`/products?categorySlug=${currentCategorySlug}`}
              className={styles.viewAllLink}
              title="Xem tất cả sản phẩm trong danh mục"
            >
              <span>Xem tất cả</span>
              <span aria-hidden="true">&gt;</span>
            </Link>
          </div>

          {/* 4. Product Grid (4 Cột chuẩn, chuyển tab mượt mà) */}
          <div
            id={`laptop-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`laptop-tab-${activeTab}`}
            className={`${styles.gridWrapper} ${isPending ? styles.pendingTransition : ''}`}
            aria-busy={isPending}
          >
            {initialProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>
                  Chưa có sản phẩm nào phù hợp với bộ lọc hiện tại.
                </p>
                <button
                  type="button"
                  className={styles.emptyBtn}
                  onClick={handleResetFilters}
                >
                  Xem tất cả thương hiệu
                </button>
              </div>
            ) : (
              <div className={styles.productGrid}>
                {initialProducts.map((p, index) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    priority={index < 4}
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
