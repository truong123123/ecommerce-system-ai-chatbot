'use client';

import React from 'react';
import styles from '../WatchAudioShowcase.module.css';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.',
  onRetry,
}) => {
  return (
    <div className={styles.errorBox} role="alert">
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#e11b22"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className={styles.errorText}>{message}</p>
      <button type="button" className={styles.retryBtn} onClick={onRetry}>
        Thử lại
      </button>
    </div>
  );
};
