'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import styles from './ProductBreadcrumb.module.css';

interface BreadcrumbProps {
  category: string;
  brand: string;
  series?: string;
  productName: string;
}

export const ProductBreadcrumb: React.FC<BreadcrumbProps> = ({
  category,
  brand,
  series,
  productName
}) => {
  return (
    <nav className={styles.breadcrumbNav} aria-label="Breadcrumb">
      <div className={styles.container}>
        <ol className={styles.list}>
          <li className={styles.item}>
            <Link href="/" className={styles.link} title="Trang chủ">
              <Home size={15} className={styles.icon} />
              <span>Trang chủ</span>
            </Link>
          </li>
          {category && (
            <>
              <li className={styles.separator}>
                <ChevronRight size={14} />
              </li>
              <li className={styles.item}>
                <Link href={`/products?categorySlug=${encodeURIComponent(category.toLowerCase())}`} className={styles.link}>
                  {category}
                </Link>
              </li>
            </>
          )}

          {brand && (
            <>
              <li className={styles.separator}>
                <ChevronRight size={14} />
              </li>
              <li className={styles.item}>
                <Link href={`/products?brand=${encodeURIComponent(brand.toLowerCase())}`} className={styles.link}>
                  {brand}
                </Link>
              </li>
            </>
          )}

          {series && (
            <>
              <li className={styles.separator}>
                <ChevronRight size={14} />
              </li>
              <li className={styles.item}>
                <span className={styles.seriesLink}>{series}</span>
              </li>
            </>
          )}

          <li className={styles.separator}>
            <ChevronRight size={14} />
          </li>
          <li className={styles.itemCurrent} aria-current="page">
            <span title={productName}>{productName}</span>
          </li>
        </ol>
      </div>
    </nav>
  );
};
