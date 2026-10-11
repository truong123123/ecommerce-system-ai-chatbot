import React from 'react';
import Link from 'next/link';
import { buildPaginationUrl } from '@/lib/category/categorySearchParams';
import styles from './CategoryListingPage.module.css';

interface CategoryPaginationProps {
  basePath: string;
  currentPage: number;
  totalPages: number;
  minPrice?: number;
  maxPrice?: number;
}

export const CategoryPagination: React.FC<CategoryPaginationProps> = ({
  basePath,
  currentPage,
  totalPages,
  minPrice,
  maxPrice,
}) => {
  if (totalPages <= 1) return null;

  const currentFilters = { minPrice, maxPrice };

  return (
    <nav aria-label="Phân trang" className={styles.pagination}>
      {/* Previous Page Link */}
      {currentPage > 1 ? (
        <Link
          href={buildPaginationUrl(basePath, currentFilters, currentPage - 1)}
          className={styles.pageBtn}
          aria-label="Chuyển đến trang trước"
        >
          « Trước
        </Link>
      ) : (
        <span
          className={`${styles.pageBtn} ${styles.pageBtnDisabled}`}
          aria-disabled="true"
        >
          « Trước
        </span>
      )}

      {/* Page Numbers */}
      {Array.from({ length: totalPages }).map((_, idx) => {
        const pageNum = idx + 1;
        const isCurrent = pageNum === currentPage;

        return isCurrent ? (
          <span
            key={pageNum}
            className={`${styles.pageBtn} ${styles.pageBtnActive}`}
            aria-current="page"
          >
            {pageNum}
          </span>
        ) : (
          <Link
            key={pageNum}
            href={buildPaginationUrl(basePath, currentFilters, pageNum)}
            className={styles.pageBtn}
            aria-label={`Chuyển đến trang ${pageNum}`}
          >
            {pageNum}
          </Link>
        );
      })}

      {/* Next Page Link */}
      {currentPage < totalPages ? (
        <Link
          href={buildPaginationUrl(basePath, currentFilters, currentPage + 1)}
          className={styles.pageBtn}
          aria-label="Chuyển đến trang sau"
        >
          Sau »
        </Link>
      ) : (
        <span
          className={`${styles.pageBtn} ${styles.pageBtnDisabled}`}
          aria-disabled="true"
        >
          Sau »
        </span>
      )}
    </nav>
  );
};
