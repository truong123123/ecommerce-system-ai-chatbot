import React from 'react';
import Link from 'next/link';
import styles from './FlashSale.module.css';
import { FlashSaleProduct } from '../../types/flashSale';
import { formatPrice } from '../../utils/flashSaleTime';

interface FlashSaleProductCardProps {
  product: FlashSaleProduct;
  slotStatus: 'UPCOMING' | 'ACTIVE' | 'ENDED';
}

export const FlashSaleProductCard: React.FC<FlashSaleProductCardProps> = React.memo(
  ({ product, slotStatus }) => {
    const sold = product.sold ?? product.soldCount ?? 0;
    const quota = Math.max(product.quota ?? product.totalStock ?? 1, 1);
    const percentSold = Math.min(Math.max((sold / quota) * 100, 0), 100);

    const isSoldOut = sold >= quota;
    const isEnded = slotStatus === 'ENDED';
    const isUpcoming = slotStatus === 'UPCOMING';

    const productHref = product.productSlug
      ? `/products/${product.productSlug}`
      : product.productId
      ? `/products/${product.productId}`
      : `/products/${product.id}`;

    return (
      <div
        className={`${styles.productCard} ${isEnded ? styles.cardEnded : ''}`}
        role="article"
        aria-label={product.name}
      >
        <Link
          href={isEnded ? '#' : productHref}
          onClick={(e) => {
            if (isEnded) {
              e.preventDefault();
            }
          }}
          tabIndex={isEnded ? -1 : 0}
          style={{
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {/* Ảnh vuông 1:1 */}
          <div className={styles.imageWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                product.image ||
                product.imageUrl ||
                'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80'
              }
              alt={product.name}
              className={`${styles.productImg} ${isEnded ? styles.imageEnded : ''}`}
              loading="lazy"
            />
          </div>

          {/* Chi tiết sản phẩm */}
          <div className={styles.productInfo}>
            <h3 className={styles.productName} title={product.name}>
              {product.name}
            </h3>

            {/* Hàng giá: Giá sale đỏ to rõ, Giá gốc gạch ngang */}
            <div className={styles.priceRow}>
              <span className={styles.salePrice}>
                {formatPrice(product.salePrice)}
              </span>
              {product.originalPrice > product.salePrice && (
                <span className={styles.originalPrice}>
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Thanh tiến độ */}
            <div className={styles.progressContainer}>
              <div
                className={styles.progressBar}
                style={{
                  width: isEnded ? '100%' : `${percentSold}%`,
                  background: isEnded ? '#8c8c8c' : undefined,
                }}
              />
              <div className={styles.progressContent}>
                <span className={styles.mascotIcon}>{isEnded ? '⌛' : '🔥'}</span>
                <span className={styles.progressText}>
                  {isEnded
                    ? 'Đã kết thúc'
                    : isSoldOut
                    ? 'Hết suất'
                    : isUpcoming
                    ? 'Sắp mở bán'
                    : `Đã bán ${sold}/${quota} suất`}
                </span>
              </div>
            </div>

            {/* Nút hành động */}
            {isEnded ? (
              <button
                disabled
                aria-disabled="true"
                className={`${styles.cardActionBtn} ${styles.btnEnded}`}
              >
                ĐÃ KẾT THÚC
              </button>
            ) : isSoldOut ? (
              <button
                disabled
                aria-disabled="true"
                className={`${styles.cardActionBtn} ${styles.btnSoldOut}`}
              >
                HẾT SUẤT
              </button>
            ) : isUpcoming ? (
              <button
                disabled
                aria-disabled="true"
                className={`${styles.cardActionBtn} ${styles.btnUpcoming}`}
              >
                SẮP MỞ BÁN
              </button>
            ) : (
              <button
                className={`${styles.cardActionBtn} ${styles.btnLive}`}
                aria-label={`Mua ngay ${product.name}`}
              >
                MUA NGAY
              </button>
            )}
          </div>
        </Link>
      </div>
    );
  }
);

FlashSaleProductCard.displayName = 'FlashSaleProductCard';
