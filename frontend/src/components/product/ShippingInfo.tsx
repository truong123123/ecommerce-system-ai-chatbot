'use client';

import React from 'react';
import { Zap, MapPin, Truck } from 'lucide-react';
import styles from './ShippingInfo.module.css';

export const ShippingInfo: React.FC = () => {
  return (
    <div className={styles.shippingCard}>
      <div className={styles.header}>
        <Truck size={16} className={styles.truckIcon} />
        <span className={styles.title}>Thông tin vận chuyển</span>
      </div>

      <div className={styles.infoRow}>
        <div className={styles.fastBadge}>
          <Zap size={13} fill="#0284c7" color="#0284c7" />
          <span>Giao nhanh trong 2 giờ</span>
        </div>
        <span className={styles.fastDesc}>Áp dụng tại một số khu vực nội thành hỗ trợ giao nhanh</span>
      </div>

      <div className={styles.addressRow}>
        <MapPin size={14} className={styles.mapIcon} />
        <span className={styles.addressText}>
          Chọn địa chỉ giao hàng để nhận báo giá vận chuyển và thời gian chính xác
        </span>
      </div>
    </div>
  );
};
