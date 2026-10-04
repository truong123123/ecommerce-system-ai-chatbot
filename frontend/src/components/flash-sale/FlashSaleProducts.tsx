import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './FlashSale.module.css';
import { FlashSaleProduct } from '../../types/flashSale';
import { FlashSaleProductCard } from './FlashSaleProductCard';

interface FlashSaleProductsProps {
  products: FlashSaleProduct[];
  slotStatus: 'UPCOMING' | 'ACTIVE' | 'ENDED';
}

export const FlashSaleProducts: React.FC<FlashSaleProductsProps> = React.memo(
  ({ products, slotStatus }) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
    const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

    const updateScrollArrows = useCallback(() => {
      const el = viewportRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 6);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
    }, []);

    useEffect(() => {
      updateScrollArrows();
      const el = viewportRef.current;
      if (el) {
        el.addEventListener('scroll', updateScrollArrows, { passive: true });
        window.addEventListener('resize', updateScrollArrows);
        return () => {
          el.removeEventListener('scroll', updateScrollArrows);
          window.removeEventListener('resize', updateScrollArrows);
        };
      }
    }, [updateScrollArrows, products]);

    const handleScroll = (direction: 'left' | 'right') => {
      if (!viewportRef.current) return;
      const cardWidth = 240;
      const scrollAmount = cardWidth * 2;
      viewportRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    };

    if (!products || products.length === 0) {
      return (
        <div className={styles.emptyStateContainer}>
          <p className={styles.emptyStateText}>
            ⚡ Chưa có sản phẩm trong khung giờ này
          </p>
        </div>
      );
    }

    return (
      <div className={styles.productWrapper}>
        {canScrollLeft && (
          <button
            className={`${styles.arrowBtn} ${styles.arrowLeft}`}
            onClick={() => handleScroll('left')}
            aria-label="Xem sản phẩm trước"
          >
            ‹
          </button>
        )}

        <div className={styles.carouselViewport} ref={viewportRef}>
          <div className={styles.carouselTrack}>
            {products.map((product) => (
              <FlashSaleProductCard
                key={product.id}
                product={product}
                slotStatus={slotStatus}
              />
            ))}
          </div>
        </div>

        {canScrollRight && (
          <button
            className={`${styles.arrowBtn} ${styles.arrowRight}`}
            onClick={() => handleScroll('right')}
            aria-label="Xem sản phẩm kế tiếp"
          >
            ›
          </button>
        )}
      </div>
    );
  }
);

FlashSaleProducts.displayName = 'FlashSaleProducts';
