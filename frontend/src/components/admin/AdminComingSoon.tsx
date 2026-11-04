'use client';

import React from 'react';
import styles from './AdminComingSoon.module.css';
import StatusBadge from './StatusBadge';
import AdminDataTable, { Column } from './AdminDataTable';

export interface AdminComingSoonProps {
  moduleId: string;
  moduleName: string;
  icon: string;
  description: string;
  allowedRoles: string[];
  plannedFeatures: string[];
  columns?: Column<any>[];
  previewData?: any[];
}

export default function AdminComingSoon({
  moduleId,
  moduleName,
  icon,
  description,
  allowedRoles,
  plannedFeatures,
  columns,
  previewData = [],
}: AdminComingSoonProps) {
  const defaultColumns: Column<any>[] = columns || [
    { key: 'code', title: 'Mã định danh', width: '150px' },
    { key: 'title', title: 'Tên mục / Tiêu đề' },
    { key: 'status', title: 'Trạng thái', width: '140px', render: () => <StatusBadge status="pending" label="Sẵn sàng Giai đoạn 2" /> },
    { key: 'updatedAt', title: 'Cập nhật', width: '160px', render: () => 'Đang phát triển' },
  ];

  return (
    <div className={styles.container}>
      {/* Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>{icon}</div>
          <div className={styles.titleArea}>
            <h1>{moduleName}</h1>
            <p>{description}</p>
          </div>
        </div>

        <div className={styles.headerRight}>
          <StatusBadge status="in_stock" label="Giai đoạn 1: Sẵn sàng cấu trúc" variant="info" />
        </div>
      </div>

      {/* Thông tin nghiệp vụ & Quyền truy cập */}
      <div className={styles.specsGrid}>
        <div className={styles.specCard}>
          <div className={styles.specTitle}>Vai trò được cấp quyền truy cập</div>
          <div className={styles.roleTags}>
            {allowedRoles.map((role) => (
              <span key={role} className={styles.roleTag}>
                {role.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.specCard}>
          <div className={styles.specTitle}>Các tính năng trọng tâm (Giai đoạn tiếp theo)</div>
          <div className={styles.specContent}>
            {plannedFeatures.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                <span style={{ color: '#10b981' }}>✔</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thông báo nền tảng */}
      <div className={styles.infoBanner}>
        <span className={styles.infoIcon}>ℹ️</span>
        <div className={styles.infoText}>
          <strong>Phân hệ {moduleName}:</strong> Cấu trúc định tuyến (Route), kiểm soát phân quyền (RBAC) và giao diện AdminLayout đã được tích hợp hoàn tất trong Giai đoạn 1. Các nghiệp vụ CRUD chi tiết sẽ được kết nối với API backend tương ứng trong giai đoạn tiếp theo.
        </div>
      </div>

      {/* Bảng dữ liệu chuẩn của phân hệ */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: 12 }}>
          Xem trước giao diện bảng dữ liệu (AdminDataTable)
        </h3>
        <AdminDataTable
          columns={defaultColumns}
          data={previewData}
          keyExtractor={(item, index) => item.id || `row-${index}`}
          emptyMessage={`Chưa có dữ liệu cho phân hệ ${moduleName}`}
          emptySubtext="Dữ liệu thật sẽ được kết nối từ API Spring Boot trong giai đoạn tiếp theo"
        />
      </div>
    </div>
  );
}

