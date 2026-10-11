'use client';

import React from 'react';
import styles from '../WatchAudioShowcase.module.css';

interface EmptyStateProps {
  onResetFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onResetFilters }) => {
  return (
    <div className={styles.emptyBox}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
      <p className={styles.emptyText}>
        Không tìm thấy sản phẩm nào phù hợp với bộ lọc đã chọn.
      </p>
      <button type="button" className={styles.resetBtn} onClick={onResetFilters}>
        Xóa bộ lọc
      </button>
    </div>
  );
};
