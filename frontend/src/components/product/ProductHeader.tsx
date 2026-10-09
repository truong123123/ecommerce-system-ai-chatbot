'use client';

import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, SlidersHorizontal, Scale, Star, Share2 } from 'lucide-react';
import styles from './ProductHeader.module.css';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCompareStore } from '../../store/compareStore';

interface ProductHeaderProps {
  productId?: number | string;
  name: string;
  subtitle: string;
  sku: string;
  rating: number;
  reviewsCount: number;
  questionsCount: number;
  onScrollToSpecs?: () => void;
  onScrollToReviews?: () => void;
  onCompare?: () => void;
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({
  productId,
  name,
  subtitle,
  sku,
  rating,
  reviewsCount,
  questionsCount,
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

  return (
    <div className={styles.headerContainer}>
      <div className={styles.titleSection}>
        <div className={styles.nameRow}>
          <h1 className={styles.title}>{name}</h1>
          <span className={styles.skuBadge}>Mã: {sku}</span>
        </div>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      <div className={styles.metaRow}>
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
          <button 
            type="button" 
            onClick={onScrollToReviews} 
            className={styles.reviewsCountBtn}
          >
            {reviewsCount > 0 ? `${reviewsCount} đánh giá` : 'Chưa có đánh giá'}
          </button>
        </div>

        <div className={styles.actionsBox}>
          <button
            type="button"
            className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
            onClick={handleToggleWishlist}
            title={isLiked ? "Đã yêu thích (Click để hủy)" : "Thêm vào danh sách yêu thích"}
          >
            <Heart size={15} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'currentColor'} />
            <span>{isLiked ? 'Đã thích' : 'Yêu thích'}</span>
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={onScrollToReviews}
            title="Hỏi đáp về sản phẩm"
          >
            <MessageSquare size={15} />
            <span>Hỏi đáp ({questionsCount})</span>
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={onScrollToSpecs}
            title="Xem chi tiết thông số kỹ thuật"
          >
            <SlidersHorizontal size={15} />
            <span>Thông số</span>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${inCompare ? styles.liked : ''}`}
            onClick={handleToggleCompare}
            title={inCompare ? "Đang chọn so sánh (Click để bỏ)" : "So sánh với sản phẩm khác"}
          >
            <Scale size={15} color={inCompare ? '#d70018' : 'currentColor'} />
            <span>{inCompare ? 'Đã thêm so sánh' : 'So sánh'}</span>
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={handleShare}
            title="Chia sẻ sản phẩm"
          >
            <Share2 size={15} />
            <span>{copied ? 'Đã chép link' : 'Chia sẻ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
