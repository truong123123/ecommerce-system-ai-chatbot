'use client';

import React, { useEffect } from 'react';
import { ErrorState } from '@/components/common/ErrorState';
import styles from '@/components/category/CategoryListingPage.module.css';

interface CategoryErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CategoryError({ error, reset }: CategoryErrorProps) {
  useEffect(() => {
    console.error('[CategoryError] Error in category route:', error);
  }, [error]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.errorWrapper}>
        <ErrorState
          message="Không thể tải danh sách sản phẩm danh mục. Vui lòng kiểm tra kết nối mạng và thử lại."
          onRetry={() => reset()}
        />
      </div>
    </div>
  );
}
