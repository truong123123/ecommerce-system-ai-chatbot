'use client';

import React from 'react';
import { GraduationCap, Award, HelpCircle } from 'lucide-react';
import styles from './ProductPricing.module.css';

interface ProductPricingProps {
  price: number;
  originalPrice?: number | null;
  discountPercent?: number;
  monthlyInstallment?: number;
  studentDiscount?: number;
  smemberDiscount?: number;
}

export const ProductPricing: React.FC<ProductPricingProps> = ({
  price,
  originalPrice,
  discountPercent = 0,
  monthlyInstallment = 0,
  studentDiscount = 0,
  smemberDiscount = 0
}) => {
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  return (
    <div className={styles.pricingCard}>
      {/* Main Price Row */}
      <div className={styles.mainPriceRow}>
        <div className={styles.priceLeft}>
          <div className={styles.currentPrice}>{formatVND(price)}</div>
          {originalPrice && originalPrice > price && (
            <div className={styles.originalPriceBox}>
              <span className={styles.originalPrice}>{formatVND(originalPrice)}</span>
              {discountPercent > 0 && (
                <span className={styles.discountBadge}>-{discountPercent}%</span>
              )}
            </div>
          )}
        </div>

        {monthlyInstallment > 0 && (
          <div className={styles.priceRight}>
            <div className={styles.installmentAmount}>
              {formatVND(monthlyInstallment)}<span className={styles.monthUnit}>/tháng</span>
            </div>
            <div className={styles.installmentLabel}>
              <span>Trả góp 0% lãi suất</span>
              <HelpCircle size={13} className={styles.helpIcon} />
            </div>
          </div>
        )}
      </div>

      {/* Membership & Student perks row (only when discount values exist) */}
      {(studentDiscount > 0 || smemberDiscount > 0) && (
        <div className={styles.perksRow}>
          {studentDiscount > 0 && (
            <div className={styles.perkCard}>
              <div className={styles.perkHeader}>
                <GraduationCap size={16} className={styles.perkIconBlue} />
                <span className={styles.perkTitle}>HSSV, Giáo viên</span>
              </div>
              <div className={styles.perkValue}>
                Ưu đãi tới <strong>{formatVND(studentDiscount)}</strong>
              </div>
            </div>
          )}

          {smemberDiscount > 0 && (
            <div className={styles.perkCard}>
              <div className={styles.perkHeader}>
                <Award size={16} className={styles.perkIconGold} />
                <span className={styles.perkTitle}>Smember</span>
              </div>
              <div className={styles.perkValue}>
                Giảm thêm đến <strong>{formatVND(smemberDiscount)}</strong>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
