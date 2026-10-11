'use client';

import React, { memo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFavorites } from '@/hooks/useFavorites';
import { formatVND } from '@/utils/formatCurrency';
import styles from './ProductCard.module.css';

export interface SharedProduct {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  brandSlug?: string;
  category?: string;
  image?: string;
  price: number;
  oldPrice?: number | null;
  discountPercent?: number | null;
  specs?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  tmemberText?: string | null;
  studentText?: string | null;
  installmentText?: string | null;
  isFastDelivery?: boolean;
}

export interface ProductCardProps {
  product: SharedProduct;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

const PLACEHOLDER_IMG = '/images/placeholder-product.svg';

export const ProductCard = memo(function ProductCard({
  product,
  priority = false,
  className,
  sizes,
}: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imgSrc, setImgSrc] = useState<string>(product.image || PLACEHOLDER_IMG);

  const favorited = isFavorite(product.id);
  const hasDiscount = product.discountPercent !== null && product.discountPercent > 0;
  const hasOldPrice = product.oldPrice !== null && product.oldPrice > product.price;
  const hasInstallment = Boolean(product.installmentText);
  const hasPromos = Boolean(product.tmemberText || product.studentText);

  return (
    <div
      className={`${styles.productCard} ${className || ''}`}
      data-testid={`product-card-${product.id}`}
    >
      {/* 1. Badges Row: Height preserved so card grid aligns uniformly */}
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

      {/* 2. Main clickable product link wrapping product details */}
      <Link
        href={`/products/${product.slug}`}
        className={styles.cardMainLink}
        title={product.name}
      >
        {/* Product Image */}
        <div className={styles.imageBox}>
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            sizes={sizes || '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
            className={styles.prodImage}
            loading={priority ? 'eager' : 'lazy'}
            priority={priority}
            onError={() => setImgSrc(PLACEHOLDER_IMG)}
          />
        </div>

        {/* Specs Pill (Shown only when genuine specs are present) */}
        {product.specs && (
          <div className={styles.specsPill} title={product.specs}>
            {product.specs}
          </div>
        )}

        {/* Product Name */}
        <h4 className={styles.productName}>{product.name}</h4>

        {/* Price Row: Real prices only */}
        <div className={styles.priceRow}>
          <span className={styles.currentPrice}>{formatVND(product.price)}</span>
          {hasOldPrice && (
            <span className={styles.oldPrice}>{formatVND(product.oldPrice!)}</span>
          )}
        </div>

        {/* Promotional text (Rendered ONLY if genuine data is returned from backend) */}
        {hasPromos && (
          <div className={styles.promosBox}>
            {product.tmemberText && (
              <span className={styles.promoPillSmember}>{product.tmemberText}</span>
            )}
            {product.studentText && (
              <span className={styles.promoPillStudent}>{product.studentText}</span>
            )}
          </div>
        )}

        {/* Installment note (Rendered ONLY if genuine data is returned from backend) */}
        {product.installmentText && (
          <p className={styles.installmentNote}>{product.installmentText}</p>
        )}

        {/* Card Footer: Delivery badge, rating, and spacer for favorite button */}
        <div className={styles.cardFooter}>
          <span className={styles.deliveryBadge}>⚡ 2 Giờ</span>
          {product.rating !== null && product.rating > 0 ? (
            <span className={styles.ratingText}>★ {product.rating}</span>
          ) : (
            <span aria-hidden="true" />
          )}
          <span className={styles.favSpacer} aria-hidden="true" />
        </div>
      </Link>

      {/* 3. Favorite button: Completely OUTSIDE the <Link> element, absolute positioned */}
      <button
        type="button"
        className={`${styles.favBtn} ${favorited ? styles.activeFav : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(product.id);
        }}
        aria-label={
          favorited
            ? `Bỏ yêu thích sản phẩm ${product.name}`
            : `Thêm sản phẩm ${product.name} vào danh sách yêu thích`
        }
        aria-pressed={favorited}
        title={favorited ? 'Bỏ yêu thích' : 'Yêu thích'}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill={favorited ? 'currentColor' : 'none'}
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
  );
});
