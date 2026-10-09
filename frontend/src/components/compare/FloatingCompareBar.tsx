'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCompareStore } from '../../store/compareStore';
import { Scale, X } from 'lucide-react';
import styles from './FloatingCompareBar.module.css';

export const FloatingCompareBar: React.FC = () => {
  const { selectedProducts, removeProduct, clear } = useCompareStore();

  if (!selectedProducts || selectedProducts.length === 0) {
    return null;
  }

  const compareUrl = `/compare?ids=${selectedProducts.map((p) => p.productId).join(',')}`;

  return (
    <div className={styles.compareBarContainer}>
      <div className={styles.itemsList}>
        {selectedProducts.map((p) => (
          <div key={p.productId} className={styles.compareItem} title={p.name}>
            {p.imageUrl ? (
              <Image
                src={p.imageUrl}
                alt={p.name}
                width={32}
                height={32}
                className={styles.itemThumb}
              />
            ) : (
              <div className={styles.itemThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                📦
              </div>
            )}
            <span className={styles.itemName}>{p.name}</span>
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeProduct(p.productId)}
              title="Xóa khỏi so sánh"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <Link
          href={selectedProducts.length >= 2 ? compareUrl : '#'}
          className={styles.compareBtn}
          onClick={(e) => {
            if (selectedProducts.length < 2) {
              e.preventDefault();
              alert('Vui lòng chọn ít nhất 2 sản phẩm để tiến hành so sánh.');
            }
          }}
        >
          <Scale size={15} />
          <span>So sánh ngay ({selectedProducts.length})</span>
        </Link>

        <button type="button" className={styles.clearBtn} onClick={clear}>
          Xóa hết
        </button>
      </div>
    </div>
  );
};
