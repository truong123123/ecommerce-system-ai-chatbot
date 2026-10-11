'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../../../types/showcase';
import { formatVND } from '../../../utils/formatCurrency';
import styles from '../WatchAudioShowcase.module.css';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const ProductCard = memo(function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
}: ProductCardProps) {
  const hasDiscount = product.discountPercent !== null && product.discountPercent > 0;
  const hasInstallment = Boolean(product.installmentText);
  const hasOldPrice = product.oldPrice !== null && product.oldPrice > product.price;

  return (
    <div className={styles.productCard} data-testid={`product-card-${product.id}`}>
      {/* 1. Top Badges: Height maintained to avoid row alignment shifts */}
      <div className={styles.cardBadges}>
        {hasDiscount ? (
          <span className={styles.discountBadge}>Giảm {product.discountPercent}%</span>
        ) : (
          <span aria-hidden="true" />
        )}
        {hasInstallment ? (
          <span className={styles.installmentBadge}>{product.installmentText}</span>
        ) : (
          <span aria-hidden="true" />
        )}
      </div>

      {/* 2. Main clickable product area (SEO semantic link without nested buttons) */}
      <Link
        href={`/products/${product.slug}`}
        className={styles.cardMainLink}
        title={product.name}
      >
        {/* Product Image */}
        <div className={styles.imageBox}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={styles.prodImage}
            loading="lazy"
          />
        </div>

        {/* Product Name */}
        <h4 className={styles.productName}>{product.name}</h4>

        {/* Price Row: Real prices only */}
        <div className={styles.priceRow}>
          <span className={styles.currentPrice}>{formatVND(product.price)}</span>
          {hasOldPrice && (
            <span className={styles.oldPrice}>{formatVND(product.oldPrice!)}</span>
          )}
        </div>
      </Link>

      {/* 3. Promotional text (render ONLY if returned from backend) */}
      {product.tmemberDiscountText && (
        <div className={styles.promosBox}>
          <span className={styles.promoPillSmember}>{product.tmemberDiscountText}</span>
        </div>
      )}

      {/* 4. Installment note (render ONLY if returned from backend) */}
      {product.installmentText && (
        <p className={styles.installmentNote}>{product.installmentText}</p>
      )}

      {/* 5. Card Footer: Delivery badge, real rating (if any), and isolated accessible favorite button */}
      <div className={styles.cardFooter}>
        <span className={styles.deliveryBadge}>⚡ 2 Giờ</span>
        {product.rating !== null ? (
          <span className={styles.ratingText}>★ {product.rating}</span>
        ) : (
          <span />
        )}

        <button
          type="button"
          className={`${styles.favBtn} ${isFavorite ? styles.activeFav : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          aria-label={isFavorite ? `Bỏ yêu thích ${product.name}` : `Thêm ${product.name} vào yêu thích`}
          aria-pressed={isFavorite}
          title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>
    </div>
  );
});
