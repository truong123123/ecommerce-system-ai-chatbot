'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { BrandItem } from '@/services/brandService';
import { CategoryTreeItem } from '@/services/categoryService';
import { PriceRangeOption, buildCategoryQueryString } from '@/lib/category/categorySearchParams';
import styles from './CategoryListingPage.module.css';

interface CategoryFiltersClientProps {
  categorySlug: string;
  brandSlug?: string;
  brands: BrandItem[];
  subCategories: CategoryTreeItem[];
  priceRanges: PriceRangeOption[];
  selectedPriceId?: string;
  currentMinPrice?: number;
  currentMaxPrice?: number;
}

export const CategoryFiltersClient: React.FC<CategoryFiltersClientProps> = ({
  categorySlug,
  brandSlug,
  brands,
  subCategories,
  priceRanges,
  selectedPriceId,
  currentMinPrice,
  currentMaxPrice,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Price filter change: preserve current pathname, update minPrice/maxPrice, reset page to 1
  const handlePriceSelect = (range?: PriceRangeOption) => {
    const qs = buildCategoryQueryString({
      minPrice: range?.min,
      maxPrice: range?.max,
      page: 1, // Reset to page 1 on filter change
    });

    startTransition(() => {
      router.push(`${pathname}${qs}`);
    });
  };

  // Build URL for brand switch preserving current price filters (resetting page to 1)
  const getBrandUrl = (targetBrandSlug?: string): string => {
    const targetPath = targetBrandSlug
      ? `/category/${categorySlug}/${targetBrandSlug}`
      : `/category/${categorySlug}`;

    const qs = buildCategoryQueryString({
      minPrice: currentMinPrice,
      maxPrice: currentMaxPrice,
      page: 1, // Reset to page 1 on filter change
    });

    return `${targetPath}${qs}`;
  };

  return (
    <div
      className={`${styles.filterCard} ${isPending ? styles.filterPending : ''}`}
      aria-busy={isPending}
      data-pending={isPending}
    >
      {/* 1. Brand Filter Row */}
      {brands.length > 0 && (
        <div className={styles.filterRow}>
          <div className={styles.filterLabel} id="brand-filter-heading">
            <span aria-hidden="true">🏷️</span> Thương hiệu:
          </div>
          <div
            className={styles.pillGroup}
            role="group"
            aria-labelledby="brand-filter-heading"
          >
            <Link
              href={getBrandUrl(undefined)}
              className={`${styles.pill} ${!brandSlug ? styles.pillActive : ''}`}
              aria-pressed={!brandSlug}
              onClick={(e) => {
                e.preventDefault();
                startTransition(() => {
                  router.push(getBrandUrl(undefined));
                });
              }}
            >
              Tất cả
            </Link>
            {brands.map((b) => {
              const isActive = brandSlug?.toLowerCase() === b.slug.toLowerCase();
              return (
                <Link
                  key={b.brandId}
                  href={getBrandUrl(b.slug)}
                  className={`${styles.pill} ${isActive ? styles.pillActive : ''}`}
                  aria-pressed={isActive}
                  onClick={(e) => {
                    e.preventDefault();
                    startTransition(() => {
                      router.push(getBrandUrl(b.slug));
                    });
                  }}
                >
                  {b.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Subcategories Row (if any) */}
      {subCategories.length > 0 && (
        <div className={styles.filterRow}>
          <div className={styles.filterLabel} id="subcat-filter-heading">
            <span aria-hidden="true">📂</span> Danh mục con:
          </div>
          <div
            className={styles.pillGroup}
            role="group"
            aria-labelledby="subcat-filter-heading"
          >
            {subCategories.map((sub) => (
              <Link
                key={sub.categoryId}
                href={`/category/${sub.slug}`}
                className={styles.pill}
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 3. Price Range Filter Row */}
      <div className={styles.filterRow}>
        <div className={styles.filterLabel} id="price-filter-heading">
          <span aria-hidden="true">💰</span> Mức giá:
        </div>
        <div
          className={styles.pillGroup}
          role="group"
          aria-labelledby="price-filter-heading"
        >
          <button
            type="button"
            className={`${styles.pill} ${!selectedPriceId ? styles.pillActive : ''}`}
            aria-pressed={!selectedPriceId}
            onClick={() => handlePriceSelect(undefined)}
          >
            Tất cả
          </button>
          {priceRanges.map((pr) => {
            const isActive = selectedPriceId === pr.id;
            return (
              <button
                key={pr.id}
                type="button"
                className={`${styles.pill} ${isActive ? styles.pillActive : ''}`}
                aria-pressed={isActive}
                onClick={() => handlePriceSelect(pr)}
              >
                {pr.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
