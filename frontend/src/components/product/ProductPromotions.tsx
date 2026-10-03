'use client';

import React, { useState } from 'react';
import { Gift, CheckCircle2, Ticket, ArrowRight, Sparkles } from 'lucide-react';
import { PromotionVoucher } from '../../types/productDetail';
import styles from './ProductPromotions.module.css';

interface ProductPromotionsProps {
  vouchers: PromotionVoucher[];
  bullets: string[];
  tradeIn: {
    title: string;
    minPrice: number;
    subsidy: number;
  };
}

export const ProductPromotions: React.FC<ProductPromotionsProps> = ({
  vouchers,
  bullets,
  tradeIn
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + '₫';
  };

  const handleCopyCode = (code: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  return (
    <div className={styles.promotionsBox}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleWrap}>
          <Gift size={18} className={styles.giftIcon} />
          <h3 className={styles.title}>Khuyến mãi đi kèm</h3>
        </div>
        <button type="button" className={styles.viewVouchersBtn}>
          <span>Xem tất cả voucher</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Vouchers Slider */}
      {vouchers && vouchers.length > 0 && (
        <div className={styles.vouchersSlider}>
          {vouchers.map((v) => {
            const isCopied = copiedCode === v.code;
            return (
              <div key={v.id} className={styles.voucherCard}>
                <div className={styles.voucherLeft}>
                  <Ticket size={16} className={styles.ticketIcon} />
                  <span className={styles.voucherDiscount}>{v.discount}</span>
                </div>
                <div className={styles.voucherMiddle}>
                  <div className={styles.voucherTitle}>{v.title}</div>
                  <div className={styles.voucherSub}>{v.subtitle}</div>
                </div>
                <button
                  type="button"
                  className={`${styles.saveCodeBtn} ${isCopied ? styles.savedBtn : ''}`}
                  onClick={() => handleCopyCode(v.code)}
                >
                  {isCopied ? 'Đã lưu' : 'Lưu mã'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Bullet Perks List */}
      {bullets && bullets.length > 0 && (
        <ul className={styles.perksList}>
          {bullets.map((bullet, idx) => (
            <li key={idx} className={styles.perkItem}>
              <CheckCircle2 size={16} className={styles.checkIcon} />
              <span className={styles.perkText}>{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Trade-in Thu Cũ Đổi Mới Footer */}
      {tradeIn && tradeIn.title && (tradeIn.minPrice > 0 || tradeIn.subsidy > 0) && (
        <div className={styles.tradeInFooter}>
          <div className={styles.tradeInLeft}>
            <Sparkles size={16} className={styles.sparkleIcon} />
            <span>
              {tradeIn.title} <strong>{formatVND(tradeIn.minPrice)}</strong> | Trợ giá thêm đến <strong>{formatVND(tradeIn.subsidy)}</strong>
            </span>
          </div>
          <button type="button" className={styles.tradeInBtn}>
            Định giá ngay
          </button>
        </div>
      )}

      {/* Empty State when no promotion exists */}
      {(!vouchers || vouchers.length === 0) && (!bullets || bullets.length === 0) && !(tradeIn && tradeIn.title && (tradeIn.minPrice > 0 || tradeIn.subsidy > 0)) && (
        <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
          Hiện chưa có chương trình khuyến mãi đặc biệt cho sản phẩm này
        </div>
      )}
    </div>
  );
};
