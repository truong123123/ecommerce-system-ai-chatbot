'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './AccessoryShowcase.module.css';

interface AccessoryCategoryItem {
  id: string;
  name: string;
  imageUrl: string;
  fallbackUrl: string;
  href: string;
}

const ACCESSORIES_LIST: AccessoryCategoryItem[] = [
  // HÀNG 1
  {
    id: 'apple-acc',
    name: 'Phụ kiện Apple',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=160&q=80',
    href: '/products?categorySlug=phu-kien&brand=Apple',
  },
  {
    id: 'cables-chargers',
    name: 'Cáp, sạc',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=160&q=80',
    href: '/products?categorySlug=phu-kien&keyword=sac',
  },
  {
    id: 'power-banks',
    name: 'Pin sạc dự phòng',
    imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=160&q=80',
    href: '/products?categorySlug=phu-kien&keyword=pin',
  },
  {
    id: 'cases-covers',
    name: 'Ốp lưng - Bao da',
    imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=160&q=80',
    href: '/products?categorySlug=phu-kien&keyword=op',
  },
  {
    id: 'screen-protector',
    name: 'Dán màn hình',
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=160&q=80',
    href: '/products?categorySlug=phu-kien&keyword=dan',
  },
  {
    id: 'memory-usb',
    name: 'Thẻ nhớ, USB',
    imageUrl: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=160&q=80',
    href: '/products?categorySlug=phu-kien&keyword=usb',
  },

  // HÀNG 2
  {
    id: 'gaming-gear',
    name: 'Gaming Gear, Playstation',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=160&q=80',
    href: '/products?keyword=gaming',
  },
  {
    id: 'sim-card',
    name: 'Sim 4G - 5G',
    imageUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=160&q=80',
    href: '/products?keyword=sim',
  },
  {
    id: 'networking',
    name: 'Thiết bị mạng',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=160&q=80',
    href: '/products?keyword=mang',
  },
  {
    id: 'security-camera',
    name: 'Camera',
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=160&q=80',
    href: '/products?keyword=camera',
  },
  {
    id: 'gimbal',
    name: 'Gimbal',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=160&q=80',
    href: '/products?keyword=gimbal',
  },
  {
    id: 'flycam',
    name: 'Flycam',
    imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=160&q=80',
    href: '/products?keyword=flycam',
  },

  // HÀNG 3
  {
    id: 'dslr-camera',
    name: 'Máy ảnh',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=160&q=80',
    href: '/products?keyword=may-anh',
  },
  {
    id: 'mouse-keyboard',
    name: 'Chuột, bàn phím',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=160&q=80',
    href: '/products?keyword=chuot',
  },
  {
    id: 'backpack-bag',
    name: 'Balo, túi xách',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=160&q=80',
    href: '/products?keyword=balo',
  },
  {
    id: 'hub-adapter',
    name: 'Hub chuyển đổi',
    imageUrl: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=160&q=80',
    href: '/products?keyword=hub',
  },
  {
    id: 'phone-accessories',
    name: 'Phụ kiện điện thoại',
    imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=160&q=80',
    href: '/products?categorySlug=phu-kien',
  },
  {
    id: 'laptop-accessories',
    name: 'Phụ kiện Laptop',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=160&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=160&q=80',
    href: '/products?categorySlug=macbook',
  },
];

export const AccessoryShowcase: React.FC = () => {
  return (
    <section className={styles.sectionWrapper} aria-label="Phụ kiện chất lượng">
      {/* Tiêu đề & Nút Xem tất cả */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>
            SẮM THÊM PHỤ KIỆN CHẤT LƯỢNG
          </h2>
          <span className={styles.titleDivider} aria-hidden="true" />
        </div>

        <Link href="/products?categorySlug=phu-kien" className={styles.viewAllBtn}>
          <span>Xem tất cả</span>
          <span className={styles.viewAllArrow}>&gt;</span>
        </Link>
      </div>

      {/* Lưới 18 danh mục phụ kiện (6 cột x 3 hàng) */}
      <div className={styles.gridContainer}>
        {ACCESSORIES_LIST.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={styles.gridItem}
            title={item.name}
          >
            <div className={styles.imageWrapper}>
              <img
                src={item.imageUrl}
                alt={item.name}
                className={styles.itemImage}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = item.fallbackUrl;
                }}
              />
            </div>
            <span className={styles.itemLabel}>{item.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};
