'use client';

import React, { useState } from 'react';
import styles from './CouponModal.module.css';
import { Tag, X } from 'lucide-react';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCoupon: (code: string) => Promise<void>;
  currentCouponCode?: string;
}

const AVAILABLE_COUPONS = [
  {
    code: 'CHAOMUNG50K',
    title: 'Giảm 50.000đ',
    desc: 'Đơn hàng từ 500.000đ trở lên',
    expiry: 'Hạn dùng: 22/10/2026',
  },
  {
    code: 'VIPDISCOUNT10',
    title: 'Giảm 10% (Tối đa 2 Triệu)',
    desc: 'Đơn hàng từ 5.000.000đ trở lên',
    expiry: 'Hạn dùng: 21/11/2026',
  },
  {
    code: 'APPLE500K',
    title: 'Giảm 500.000đ hệ sinh thái Apple',
    desc: 'Đơn hàng từ 10.000.000đ trở lên',
    expiry: 'Hạn dùng: 12/10/2026',
  },
];

export const CouponModal: React.FC<CouponModalProps> = ({
  isOpen,
  onClose,
  onApplyCoupon,
  currentCouponCode,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApply = async (codeToApply: string) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) {
      setErrorMsg('Vui lòng nhập mã giảm giá.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await onApplyCoupon(code);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Mã giảm giá không hợp lệ hoặc không đủ điều kiện đơn hàng.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <Tag size={20} color="#d70018" />
            Chọn hoặc nhập mã giảm giá
          </h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              className={styles.input}
              placeholder="Nhập mã ưu đãi..."
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleApply(inputCode)}
            />
            <button
              className={styles.applyBtn}
              onClick={() => handleApply(inputCode)}
              disabled={isLoading || !inputCode.trim()}
            >
              {isLoading ? 'Đang áp dụng...' : 'Áp dụng'}
            </button>
          </div>

          {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

          <div className={styles.sectionTitle}>Mã ưu đãi có sẵn cho bạn:</div>

          <div className={styles.couponList}>
            {AVAILABLE_COUPONS.map((coupon) => {
              const isSelected = currentCouponCode === coupon.code;
              return (
                <div
                  key={coupon.code}
                  className={`${styles.couponCard} ${isSelected ? styles.couponCardSelected : ''}`}
                  onClick={() => handleApply(coupon.code)}
                >
                  <div className={styles.couponLeft}>
                    <span className={styles.couponCode}>{coupon.code}</span>
                    <span className={styles.couponDesc}>{coupon.title} • {coupon.desc}</span>
                    <span className={styles.couponExpiry}>{coupon.expiry}</span>
                  </div>
                  <button className={styles.selectCouponBtn}>
                    {isSelected ? 'Đang dùng' : 'Chọn'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
