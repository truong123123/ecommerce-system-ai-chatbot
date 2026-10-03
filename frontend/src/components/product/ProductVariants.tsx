'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { ProductVariantOption, ProductConfigOption } from '../../types/productDetail';
import styles from './ProductVariants.module.css';

interface ProductVariantsProps {
  variants: ProductVariantOption[];
  configurations: ProductConfigOption[];
  selectedVariantId: string;
  selectedConfigId: string;
  onSelectVariant: (id: string) => void;
  onSelectConfig: (id: string) => void;
}

export const ProductVariants: React.FC<ProductVariantsProps> = ({
  variants,
  configurations,
  selectedVariantId,
  selectedConfigId,
  onSelectVariant,
  onSelectConfig
}) => {
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  if ((!variants || variants.length === 0) && (!configurations || configurations.length === 0)) {
    return null;
  }

  return (
    <div className={styles.variantsSection}>
      {/* 1. Color / Variant Selector */}
      {variants && variants.length > 0 && (
        <div className={styles.groupBlock}>
          <div className={styles.groupTitle}>Phiên bản / Màu sắc</div>
          <div className={styles.variantGrid}>
            {variants.map((v) => {
              const isSelected = v.id === selectedVariantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  className={`${styles.variantCard} ${isSelected ? styles.activeCard : ''}`}
                  onClick={() => onSelectVariant(v.id)}
                >
                  <div className={styles.colorIndicator} style={{ backgroundColor: v.colorCode || '#ccc' }} />
                  <div className={styles.variantInfo}>
                    <div className={styles.variantName}>{v.name}</div>
                    <div className={styles.variantPrice}>{formatVND(v.price)}</div>
                  </div>
                  {isSelected && (
                    <div className={styles.selectedBadge}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Configuration Selector */}
      {configurations && configurations.length > 0 && (
        <div className={styles.groupBlock}>
          <div className={styles.groupTitle}>Lựa chọn cấu hình thịnh hành</div>
          <div className={styles.configGrid}>
            {configurations.map((cfg) => {
              const isSelected = cfg.id === selectedConfigId;
              return (
                <button
                  key={cfg.id}
                  type="button"
                  className={`${styles.configCard} ${isSelected ? styles.activeConfig : ''}`}
                  onClick={() => onSelectConfig(cfg.id)}
                >
                  <div className={styles.configLabel}>{cfg.label}</div>
                  <div className={styles.configPrice}>{formatVND(cfg.price)}</div>
                  {isSelected && (
                    <div className={styles.selectedBadge}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
