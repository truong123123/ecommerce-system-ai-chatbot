'use client';

import React from 'react';
import { Sparkles, Check, ChevronRight } from 'lucide-react';
import { ProductBundleItem } from '../../types/productDetail';
import styles from './ProductBundles.module.css';

interface ProductBundlesProps {
  bundles: ProductBundleItem[];
  selectedBundleIds: string[];
  onToggleBundle: (id: string) => void;
}

export const ProductBundles: React.FC<ProductBundlesProps> = ({
  bundles,
  selectedBundleIds,
  onToggleBundle
}) => {
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  if (!bundles || bundles.length === 0) {
    return (
      <div className={styles.bundlesContainer}>
        <div className={styles.headerRow}>
          <div className={styles.titleWrap}>
            <Sparkles size={16} className={styles.sparkleIcon} />
            <h3 className={styles.title}>Mua kèm giá sốc</h3>
          </div>
        </div>
        <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
          Hiện chưa có sản phẩm mua kèm cho sản phẩm này
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bundlesContainer}>
      <div className={styles.headerRow}>
        <div className={styles.titleWrap}>
          <Sparkles size={16} className={styles.sparkleIcon} />
          <h3 className={styles.title}>Mua kèm giá sốc</h3>
        </div>
        <span className={styles.viewMoreLink}>
          <span>Thêm vào</span>
          <ChevronRight size={13} />
        </span>
      </div>

      <div className={styles.bundlesGrid}>
        {bundles.map((item) => {
          const isSelected = selectedBundleIds.includes(item.id);
          return (
            <div
              key={item.id}
              className={`${styles.bundleCard} ${isSelected ? styles.cardSelected : ''}`}
              onClick={() => onToggleBundle(item.id)}
            >
              <div className={styles.imageBox}>
                <img src={item.image} alt={item.name} className={styles.itemImg} />
              </div>

              <div className={styles.itemInfo}>
                <h4 className={styles.itemName}>{item.name}</h4>
                <div className={styles.priceRow}>
                  <span className={styles.bundlePrice}>{formatVND(item.bundlePrice)}</span>
                  <span className={styles.origPrice}>{formatVND(item.originalPrice)}</span>
                </div>
                <div className={styles.discountTag}>Giảm {item.discountPercent}%</div>
              </div>

              <button
                type="button"
                className={`${styles.selectBtn} ${isSelected ? styles.btnSelected : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBundle(item.id);
                }}
              >
                {isSelected ? (
                  <>
                    <Check size={12} strokeWidth={3} />
                    <span>Đã chọn</span>
                  </>
                ) : (
                  <span>Chọn +</span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
