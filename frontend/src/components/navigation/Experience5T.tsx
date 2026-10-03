'use client';

import React from 'react';
import { DollarSign, UserCheck, RefreshCw, CreditCard, ShieldCheck } from 'lucide-react';
import styles from './Experience5T.module.css';

interface ExperienceItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const ITEMS: ExperienceItem[] = [
  {
    id: 'price',
    title: 'Tốt hơn về giá',
    subtitle: 'Giá tốt hàng đầu, ngập tràn deal hời',
    icon: <DollarSign size={25} strokeWidth={2.6} />,
  },
  {
    id: 'member',
    title: 'Thành viên - HSSV',
    subtitle: 'Ưu đãi riêng tới 5%',
    icon: <UserCheck size={25} strokeWidth={2.4} />,
  },
  {
    id: 'tradein',
    title: 'Thu cũ đổi mới',
    subtitle: 'Thu cũ giá cao, trợ giá lên đời',
    icon: <RefreshCw size={25} strokeWidth={2.4} />,
  },
  {
    id: 'installment',
    title: 'Thanh toán - Trả góp',
    subtitle: 'Dễ dàng',
    icon: <CreditCard size={25} strokeWidth={2.4} />,
  },
  {
    id: 'warranty',
    title: 'Trả máy lỗi',
    subtitle: 'Đổi máy liền',
    icon: <ShieldCheck size={25} strokeWidth={2.4} />,
  },
];

export const Experience5T: React.FC = () => {
  return (
    <div className={styles.wrapper} aria-label="Trải nghiệm mua sắm 5T">
      <div className={styles.card}>
        <h2 className={styles.headerTitle}>Trải nghiệm mua sắm 5T tại truongngstore</h2>
        <div className={styles.grid}>
          {ITEMS.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.iconCircle}>
                {item.icon}
              </div>
              <div className={styles.contentBox}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemSub}>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
