'use client';

import React from 'react';
import { ShoppingCart, Zap, CreditCard } from 'lucide-react';
import styles from './ProductActionButtons.module.css';

interface ProductActionButtonsProps {
  onBuyNow: () => void;
  onAddToCart: () => void;
  onInstallment: () => void;
  isAddingToCart?: boolean;
}

export const ProductActionButtons: React.FC<ProductActionButtonsProps> = ({
  onBuyNow,
  onAddToCart,
  onInstallment,
  isAddingToCart
}) => {
  return (
    <div className={styles.actionsContainer}>
      {/* 1. Trả góp 0% */}
      <button
        type="button"
        className={styles.installmentBtn}
        onClick={onInstallment}
      >
        <span className={styles.installmentTitle}>TRẢ GÓP 0%</span>
        <span className={styles.installmentSub}>Trả trước 0đ qua thẻ / CTTC</span>
      </button>

      {/* 2. MUA NGAY (Dominant CTA) */}
      <button
        type="button"
        className={styles.buyNowBtn}
        onClick={onBuyNow}
      >
        <span className={styles.buyNowTitle}>MUA NGAY</span>
        <span className={styles.buyNowSub}>Giao nhanh từ 2 giờ hoặc nhận tại cửa hàng</span>
      </button>

      {/* 3. Thêm vào giỏ */}
      <button
        type="button"
        className={`${styles.cartBtn} ${isAddingToCart ? styles.cartAdding : ''}`}
        onClick={onAddToCart}
        title="Thêm vào giỏ hàng"
      >
        <ShoppingCart size={22} className={styles.cartIcon} />
        <span className={styles.cartText}>Thêm vào giỏ</span>
      </button>
    </div>
  );
};
