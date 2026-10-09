'use client';

import React from 'react';
import { ChevronRight, Wallet } from 'lucide-react';
import { PaymentOffer } from '../../types/productDetail';
import styles from './PaymentOffers.module.css';

interface PaymentOffersProps {
  offers: PaymentOffer[];
}

export const PaymentOffers: React.FC<PaymentOffersProps> = ({ offers }) => {
  if (!offers || offers.length === 0) {
    return (
      <div className={styles.sectionContainer}>
        <div className={styles.headerRow}>
          <div className={styles.titleWrap}>
            <Wallet size={16} className={styles.iconBlue} />
            <h3 className={styles.title}>Ưu đãi thanh toán</h3>
          </div>
        </div>
        <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
          Hiện chưa có chương trình ưu đãi thanh toán cho sản phẩm này
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.headerRow}>
        <div className={styles.titleWrap}>
          <Wallet size={16} className={styles.iconBlue} />
          <h3 className={styles.title}>Ưu đãi thanh toán</h3>
        </div>
      </div>

      <div className={styles.cardsSlider}>
        {offers.map((offer) => (
          <div key={offer.id} className={styles.offerCard}>
            <div className={styles.cardHeader}>
              <span className={styles.partnerTag}>{offer.partner}</span>
              <span className={styles.discountBadge}>{offer.discount}</span>
            </div>
            <div className={styles.cardBody}>
              <h4 className={styles.offerTitle}>{offer.title}</h4>
              <p className={styles.offerDesc}>{offer.description}</p>
            </div>
            <div className={styles.cardFooter}>
              <span className={styles.tagLabel}>{offer.tag}</span>
              <button type="button" className={styles.detailBtn}>
                <span>Chi tiết</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
