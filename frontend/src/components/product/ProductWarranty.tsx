'use client';

import React from 'react';
import { Shield, Check, Info } from 'lucide-react';
import { WarrantyPlan } from '../../types/productDetail';
import styles from './ProductWarranty.module.css';

interface ProductWarrantyProps {
  warranties: WarrantyPlan[];
  selectedWarrantyId: string | null;
  onSelectWarranty: (id: string | null) => void;
}

export const ProductWarranty: React.FC<ProductWarrantyProps> = ({
  warranties,
  selectedWarrantyId,
  onSelectWarranty
}) => {
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  if (!warranties || warranties.length === 0) {
    return (
      <div className={styles.warrantyContainer}>
        <div className={styles.headerRow}>
          <div className={styles.titleWrap}>
            <Shield size={16} className={styles.shieldIcon} />
            <h3 className={styles.title}>Chọn gói dịch vụ bảo hành</h3>
          </div>
        </div>
        <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
          Sản phẩm áp dụng gói bảo hành tiêu chuẩn chính hãng
        </div>
      </div>
    );
  }

  return (
    <div className={styles.warrantyContainer}>
      <div className={styles.headerRow}>
        <div className={styles.titleWrap}>
          <Shield size={16} className={styles.shieldIcon} />
          <h3 className={styles.title}>Chọn gói dịch vụ bảo hành</h3>
          <span title="Bảo vệ sản phẩm tối đa trước các rủi ro rơi vỡ, vào nước" className={styles.infoWrapper}>
            <Info size={14} className={styles.infoIcon} />
          </span>
        </div>
      </div>

      <div className={styles.warrantyGrid}>
        {warranties.map((w) => {
          const isSelected = selectedWarrantyId === w.id;
          return (
            <div
              key={w.id}
              className={`${styles.warrantyCard} ${isSelected ? styles.selectedCard : ''}`}
              onClick={() => onSelectWarranty(isSelected ? null : w.id)}
            >
              <div className={styles.topRow}>
                <div className={styles.radioBox}>
                  <div className={`${styles.radioCircle} ${isSelected ? styles.radioChecked : ''}`}>
                    {isSelected && <div className={styles.radioDot} />}
                  </div>
                  <h4 className={styles.planName}>{w.name}</h4>
                </div>
                {w.isRecommended && <span className={styles.recommendedBadge}>Khuyên dùng</span>}
              </div>

              <p className={styles.planDesc}>{w.description}</p>

              <div className={styles.priceRow}>
                <span className={styles.planPrice}>{formatVND(w.price)}</span>
                <span className={styles.durationTag}>{w.durationMonths} tháng</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
