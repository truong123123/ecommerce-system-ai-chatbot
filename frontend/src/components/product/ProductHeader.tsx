'use client';

import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageSquare,
  SlidersHorizontal,
  Scale,
  Star,
  Share2,
  Check,
  Zap,
  ShieldCheck,
  RotateCcw,
  Truck
} from 'lucide-react';
import styles from './ProductHeader.module.css';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCompareStore } from '../../store/compareStore';

interface ProductHeaderProps {
  productId?: number | string;
  name: string;
  subtitle?: string;
  sku?: string;
  brand?: string;
  category?: string;
  rating?: number;
  reviewsCount?: number;
  questionsCount?: number;
  inStock?: boolean;
  onScrollToSpecs?: () => void;
  onScrollToReviews?: () => void;
  onCompare?: () => void;
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({
  productId,
  name,
  subtitle,
  sku,
  brand,
  category,
  rating = 0,
  reviewsCount = 0,
  questionsCount = 0,
  inStock = true,
  onScrollToSpecs,
  onScrollToReviews,
  onCompare
}) => {
  const numId = productId !== undefined && productId !== null ? Number(productId) : undefined;

  const { isInWishlist, toggleWishlist, fetchWishlist } = useWishlistStore();
  const isLiked = numId !== undefined && !isNaN(numId) ? isInWishlist(numId) : false;

  const { isSelected: isCompared, addProduct, removeProduct } = useCompareStore();
  const inCompare = numId !== undefined && !isNaN(numId) ? isCompared(numId) : false;

  const handleToggleWishlist = async () => {
    if (numId !== undefined && !isNaN(numId)) {
      await toggleWishlist(numId);
    }
  };

  const handleToggleCompare = () => {
    if (numId === undefined || isNaN(numId)) return;
    if (inCompare) {
      removeProduct(numId);
    } else {
      addProduct({
        productId: numId,
        name,
      });
    }
    onCompare?.();
  };

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Only display subtitle if it's a short, concise highlight tag (< 80 chars)
  // and not the long auto-generated boilerplate DB description
  const isCleanSubtitle =
    subtitle &&
    subtitle.trim().length > 0 &&
    subtitle.length <= 80 &&
    !subtitle.includes('chính hãng') &&
    !subtitle.includes('Giá gốc');

  return (
    <div className={styles.headerContainer}>
      {/* 1. Main Title & Badges Row */}
      <div className={styles.titleSection}>
        <div className={styles.titleRow}>
          <div className={styles.titleWrap}>
            <h1 className={styles.title}>{name}</h1>
            {isCleanSubtitle && <p className={styles.cleanSubtitle}>{subtitle}</p>}
          </div>

          <div className={styles.badgeGroup}>
            {brand && <span className={styles.brandBadge}>{brand}</span>}
            {sku && <span className={styles.skuBadge}>Mã: {sku}</span>}
            <span className={styles.stockBadge}>
              <span className={styles.stockDot} />
              {inStock ? 'Còn hàng' : 'Tạm hết hàng'}
            </span>
          </div>
        </div>

        {/* 2. Key Benefit Pills (thay thế cho đoạn text văn bản dài thô kệch) */}
        <div className={styles.benefitsRow}>
          <div className={styles.benefitPill}>
            <Zap size={13} className={styles.benefitIconAmber} />
            <span>Trả góp 0% lãi suất</span>
          </div>
          <div className={styles.benefitPill}>
            <ShieldCheck size={13} className={styles.benefitIconBlue} />
            <span>Bảo hành 12 tháng chính hãng</span>
          </div>
          <div className={styles.benefitPill}>
            <RotateCcw size={13} className={styles.benefitIconGreen} />
            <span>1 đổi 1 trong 30 ngày</span>
          </div>
          <div className={styles.benefitPill}>
            <Truck size={13} className={styles.benefitIconPurple} />
            <span>Giao hàng nhanh toàn quốc</span>
          </div>
        </div>
      </div>

      {/* 3. Meta Social Proof & Action Buttons Row */}
      <div className={styles.metaRow}>
        {/* Left: Star rating, reviews count, Q&A, specs jump */}
        <div className={styles.metaLeft}>
          <div className={styles.ratingBox}>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={15}
                  className={s <= Math.round(rating) ? styles.starFilled : styles.starEmpty}
                />
              ))}
            </div>
            {rating > 0 && <span className={styles.ratingScore}>{rating.toFixed(1)}</span>}
            <button
              type="button"
              onClick={onScrollToReviews}
              className={styles.reviewsCountBtn}
            >
              {reviewsCount > 0 ? `${reviewsCount} đánh giá` : 'Chưa có đánh giá'}
            </button>
          </div>

          <span className={styles.separator}>•</span>

          <button
            type="button"
            onClick={onScrollToReviews}
            className={styles.quickJumpBtn}
            title="Xem danh sách hỏi đáp về sản phẩm"
          >
            <MessageSquare size={14} />
            <span>Hỏi đáp ({questionsCount})</span>
          </button>

          <span className={styles.separator}>•</span>

          <button
            type="button"
            onClick={onScrollToSpecs}
            className={styles.quickJumpBtn}
            title="Cuộn xem thông số kỹ thuật chi tiết"
          >
            <SlidersHorizontal size={14} />
            <span>Thông số kỹ thuật</span>
          </button>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className={styles.actionsBox}>
          <button
            type="button"
            className={`${styles.actionBtn} ${inCompare ? styles.compared : ''}`}
            onClick={handleToggleCompare}
            title={inCompare ? 'Đang chọn so sánh (Click để hủy)' : 'Thêm vào danh sách so sánh'}
          >
            <Scale size={14} />
            <span>{inCompare ? 'Đã thêm so sánh' : 'So sánh'}</span>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
            onClick={handleToggleWishlist}
            title={isLiked ? 'Đã yêu thích (Click để hủy)' : 'Thêm vào danh sách yêu thích'}
          >
            <Heart
              size={14}
              fill={isLiked ? '#ef4444' : 'none'}
              color={isLiked ? '#ef4444' : 'currentColor'}
            />
            <span>{isLiked ? 'Đã thích' : 'Yêu thích'}</span>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${copied ? styles.copied : ''}`}
            onClick={handleShare}
            title="Chia sẻ liên kết sản phẩm"
          >
            {copied ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
            <span>{copied ? 'Đã chép link' : 'Chia sẻ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
