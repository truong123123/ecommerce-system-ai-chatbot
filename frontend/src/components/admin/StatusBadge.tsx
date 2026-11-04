'use client';

import React from 'react';
import styles from './StatusBadge.module.css';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral';

export type StatusType = 'order' | 'payment' | 'inventory' | 'user' | 'general';

interface StatusBadgeProps {
  status: string | boolean;
  label?: string;
  type?: StatusType;
  variant?: BadgeVariant;
  showDot?: boolean;
  className?: string;
}

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

const STATUS_DICTIONARY: Record<string, StatusConfig> = {
  // Orders
  pending: { label: 'Chờ xác nhận', variant: 'warning' },
  pending_payment: { label: 'Chờ thanh toán', variant: 'warning' },
  confirmed: { label: 'Đã xác nhận', variant: 'info' },
  processing: { label: 'Đang xử lý', variant: 'info' },
  shipping: { label: 'Đang vận chuyển', variant: 'purple' },
  delivered: { label: 'Đã giao hàng', variant: 'success' },
  completed: { label: 'Hoàn thành', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'danger' },
  returned: { label: 'Trả hàng/Hoàn tiền', variant: 'danger' },

  // Payments
  initiated: { label: 'Khởi tạo', variant: 'neutral' },
  paid: { label: 'Đã thanh toán', variant: 'success' },
  failed: { label: 'Thất bại', variant: 'danger' },
  refunded: { label: 'Đã hoàn tiền', variant: 'neutral' },

  // Inventory & Stock
  in_stock: { label: 'Còn hàng', variant: 'success' },
  low_stock: { label: 'Sắp hết hàng', variant: 'warning' },
  out_of_stock: { label: 'Hết hàng', variant: 'danger' },

  // General active / inactive
  active: { label: 'Đang hoạt động', variant: 'success' },
  inactive: { label: 'Ngừng hoạt động', variant: 'neutral' },
  locked: { label: 'Đã khóa', variant: 'danger' },
  true: { label: 'Hoạt động', variant: 'success' },
  false: { label: 'Tạm khóa', variant: 'neutral' },

  // Reviews
  approved: { label: 'Đã duyệt', variant: 'success' },
  rejected: { label: 'Từ chối', variant: 'danger' },
};

export default function StatusBadge({
  status,
  label,
  variant,
  showDot = true,
  className = '',
}: StatusBadgeProps) {
  const statusKey = String(status).trim().toLowerCase();
  const config = STATUS_DICTIONARY[statusKey] || {
    label: String(status),
    variant: 'neutral' as BadgeVariant,
  };

  const resolvedVariant = variant || config.variant;
  const resolvedLabel = label || config.label;

  return (
    <span className={`${styles.badge} ${styles[resolvedVariant]} ${className}`}>
      {showDot && <span className={styles.dot} />}
      <span>{resolvedLabel}</span>
    </span>
  );
}

