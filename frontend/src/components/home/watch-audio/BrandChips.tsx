'use client';

import React from 'react';
import Link from 'next/link';
import styles from '../WatchAudioShowcase.module.css';

interface BrandChipsProps {
  brands: string[];
  activeBrand: string;
  onBrandChange: (brand: string) => void;
  categorySlug: string;
  disabled?: boolean;
}

export const BrandChips: React.FC<BrandChipsProps> = ({
  brands,
  activeBrand,
  onBrandChange,
  categorySlug,
  disabled = false,
}) => {
  return (
    <div className={styles.brandsRow} role="group" aria-label="Lọc theo thương hiệu">
      <div className={styles.brandsGroup}>
        {brands.map((brand) => {
          const isSelected = activeBrand === brand;
          return (
            <button
              key={brand}
              type="button"
              className={`${styles.brandChip} ${isSelected ? styles.activeBrand : ''}`}
              aria-pressed={isSelected}
              onClick={() => onBrandChange(brand)}
              disabled={disabled}
            >
              {brand}
            </button>
          );
        })}
      </div>

      <Link
        href={`/products?categorySlug=${categorySlug}`}
        className={styles.viewAllLink}
        title="Xem tất cả sản phẩm trong danh mục"
      >
        <span>Xem tất cả</span>
        <span aria-hidden="true">&gt;</span>
      </Link>
    </div>
  );
};
