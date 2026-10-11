'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import styles from './Common.module.css';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
  onRetry,
  className,
}) => {
  return (
    <div className={`${styles.errorContainer} ${className || ''}`} role="alert">
      <div className={styles.errorIcon}>
        <AlertCircle size={40} />
      </div>
      <p className={styles.errorMessage}>{message}</p>
      {onRetry && (
        <button type="button" className={styles.retryButton} onClick={onRetry}>
          <RefreshCw size={14} />
          <span>Thử lại</span>
        </button>
      )}
    </div>
  );
};
