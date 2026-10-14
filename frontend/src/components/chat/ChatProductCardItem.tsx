'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChatProductCard } from '../../types/chat';
import { formatVND } from '../../utils/formatCurrency';
import { useCartStore } from '../../store/cartStore';
import { productDetailService } from '../../services/productDetailService';
import styles from './AiChatbox.module.css';

interface ChatProductCardItemProps {
  product: ChatProductCard;
}

const PLACEHOLDER_IMG = '/images/placeholder-product.svg';

export const ChatProductCardItem: React.FC<ChatProductCardItemProps> = ({
  product,
}) => {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState<string>(
    product.imageUrl || PLACEHOLDER_IMG
  );
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const hasDiscount =
    product.salePrice &&
    product.salePrice > 0 &&
    product.salePrice < product.price;

  const currentDisplayPrice = product.salePrice ?? product.price;

  const handleAddToCart = async () => {
    if (!product.inStock || isAdding) return;
    setIsAdding(true);
    try {
      const detail = await productDetailService.getProductDetail(product.slug);
      const firstVariantId = detail?.variants?.[0]?.id
        ? Number(detail.variants[0].id)
        : null;

      if (firstVariantId) {
        await addItem(firstVariantId, 1, product.id, {
          name: product.name,
          price: currentDisplayPrice,
          imageUrl: product.imageUrl || '',
          slug: product.slug,
        });
      } else {
        router.push(`/products/${product.slug}`);
      }
    } catch {
      router.push(`/products/${product.slug}`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className={styles.productCardItem}>
      <div className={styles.productThumb}>
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="48px"
          className={styles.productImage}
          onError={() => setImgSrc(PLACEHOLDER_IMG)}
        />
      </div>

      <div className={styles.productDetails}>
        <Link
          href={`/products/${product.slug}`}
          className={styles.productName}
          title={product.name}
        >
          {product.name}
        </Link>

        <div className={styles.productPrices}>
          <span className={styles.currentPrice}>
            {formatVND(currentDisplayPrice)}
          </span>
          {hasDiscount && (
            <span className={styles.oldPrice}>{formatVND(product.price)}</span>
          )}
        </div>

        <div>
          <span
            className={`${styles.stockBadge} ${
              product.inStock ? styles.stockIn : styles.stockOut
            }`}
          >
            {product.inStock ? 'Còn hàng' : 'Tạm hết'}
          </span>
        </div>
      </div>

      <div className={styles.cardActions}>
        <Link href={`/products/${product.slug}`} className={styles.viewBtn}>
          Xem
        </Link>
        {product.inStock && (
          <button
            type="button"
            className={styles.cartBtn}
            onClick={handleAddToCart}
            disabled={isAdding}
            title="Thêm vào giỏ hàng"
          >
            {isAdding ? '...' : '+ Giỏ'}
          </button>
        )}
      </div>
    </div>
  );
};
