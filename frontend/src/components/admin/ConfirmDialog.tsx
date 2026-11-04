'use client';

import React, { useEffect } from 'react';
import styles from './ConfirmDialog.module.css';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚡';
      default:
        return '❓';
    }
  };

  const getIconClass = () => {
    switch (variant) {
      case 'danger':
        return styles.iconDanger;
      case 'warning':
        return styles.iconWarning;
      default:
        return styles.iconPrimary;
    }
  };

  const getBtnConfirmClass = () => {
    switch (variant) {
      case 'danger':
        return styles.btnDanger;
      case 'warning':
        return styles.btnWarning;
      default:
        return styles.btnPrimary;
    }
  };

  return (
    <div className={styles.overlay} onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={`${styles.iconWrap} ${getIconClass()}`}>{getIcon()}</div>
          <div className={styles.titleArea}>
            <h3 className={styles.title}>{title}</h3>
          </div>
        </div>

        <div className={styles.content}>{message}</div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`${styles.btnConfirm} ${getBtnConfirmClass()}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <span className={styles.spinner} />}
            <span>{isLoading ? 'Đang xử lý...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

