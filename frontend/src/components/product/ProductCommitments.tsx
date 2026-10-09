'use client';

import React from 'react';
import { ShieldCheck, RefreshCw, Package, ReceiptText } from 'lucide-react';
import { ProductCommitment } from '../../types/productDetail';
import styles from './ProductCommitments.module.css';

interface ProductCommitmentsProps {
  commitments: ProductCommitment[];
}

export const ProductCommitments: React.FC<ProductCommitmentsProps> = ({ commitments }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield':
        return <ShieldCheck size={20} className={styles.iconBlue} />;
      case 'refresh':
        return <RefreshCw size={20} className={styles.iconBlue} />;
      case 'box':
        return <Package size={20} className={styles.iconBlue} />;
      case 'receipt':
        return <ReceiptText size={20} className={styles.iconBlue} />;
      default:
        return <ShieldCheck size={20} className={styles.iconBlue} />;
    }
  };

  return (
    <div className={styles.commitmentsSection}>
      <h3 className={styles.sectionTitle}>
        <span>Cam kết sản phẩm</span>
      </h3>

      <div className={styles.commitmentsGrid}>
        {commitments.map((c) => (
          <div key={c.id} className={styles.commitmentCard}>
            <div className={styles.iconWrapper}>
              {getIcon(c.iconName)}
            </div>
            <div className={styles.contentWrapper}>
              <h4 className={styles.cardTitle}>{c.title}</h4>
              <p className={styles.cardDesc}>{c.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
