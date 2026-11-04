'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/api';
import { AdminDataTable, StatusBadge, Column, ConfirmDialog } from '../../../components/admin';
import styles from '../adminCrud.module.css';

interface CustomerItem {
  customerId: number;
  fullName: string;
  email: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
  totalOrders: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toggleCustomer, setToggleCustomer] = useState<CustomerItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admin/customers');
      if (Array.isArray(res.data)) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách khách hàng:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async () => {
    if (!toggleCustomer) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient.put(`/admin/customers/${toggleCustomer.customerId}/toggle-status`);
      setAlert({
        type: 'success',
        message: res.data?.message || 'Cập nhật trạng thái khách hàng thành công!'
      });
      setToggleCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Không thể thay đổi trạng thái khách hàng'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMembers = customers.length;
  const activeMembers = customers.filter((c) => c.isActive).length;
  const lockedMembers = totalMembers - activeMembers;
  const totalPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);

  const columns: Column<CustomerItem>[] = [
    {
      key: 'customerId',
      title: 'Mã KH',
      width: '90px',
      sortable: true,
      render: (item) => <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>#{item.customerId}</span>,
    },
    {
      key: 'fullName',
      title: 'Khách hàng',
      sortable: true,
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{item.fullName}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.email}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      title: 'Số điện thoại',
      width: '130px',
      render: (item) => <span style={{ color: '#cbd5e1' }}>{item.phone || '—'}</span>,
    },
    {
      key: 'loyaltyPoints',
      title: 'Smember',
      width: '120px',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span style={{ fontWeight: 700, color: '#f59e0b' }}>
          {item.loyaltyPoints.toLocaleString('vi-VN')} điểm
        </span>
      ),
    },
    {
      key: 'totalOrders',
      title: 'Đơn hàng',
      width: '110px',
      sortable: true,
      align: 'center',
      render: (item) => (
        <span style={{ fontWeight: 600, color: '#38bdf8' }}>
          {item.totalOrders || 0}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Ngày tham gia',
      width: '150px',
      sortable: true,
      render: (item) => (
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—'}
        </span>
      ),
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      width: '140px',
      align: 'center',
      render: (item) => (
        <StatusBadge
          status={item.isActive ? 'active' : 'inactive'}
          label={item.isActive ? 'Hoạt động' : 'Bị khóa'}
          variant={item.isActive ? 'success' : 'danger'}
        />
      ),
    },
    {
      key: 'customerId',
      title: 'Hành động',
      width: '120px',
      align: 'center',
      render: (item) => (
        <button
          onClick={() => setToggleCustomer(item)}
          className={item.isActive ? styles.btnDanger : styles.btnSecondary}
          style={{ padding: '5px 12px', fontSize: '0.75rem' }}
        >
          {item.isActive ? 'Khóa' : 'Mở khóa'}
        </button>
      ),
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1>Quản lý Khách hàng (Customers CRM)</h1>
          <p>Hồ sơ hội viên Smember, lịch sử tích điểm và kiểm soát trạng thái tài khoản người dùng</p>
        </div>

        <div className={styles.headerButtons}>
          <button className={styles.btnSecondary} onClick={fetchCustomers}>
            Làm mới dữ liệu
          </button>
        </div>
      </div>

      {alert && (
        <div className={`${styles.alertBanner} ${alert.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          <span>{alert.message}</span>
          <button className={styles.alertCloseBtn} onClick={() => setAlert(null)}>×</button>
        </div>
      )}

      {/* Stats Summary */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPrimary}`}>👥</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tổng khách hàng</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{totalMembers}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>✓</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Đang hoạt động</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{activeMembers}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconWarning}`}>🔒</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Bị tạm khóa</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171' }}>{lockedMembers}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconInfo}`}>⭐</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tổng điểm Smember</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
              {totalPoints.toLocaleString('vi-VN')}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <AdminDataTable
        columns={columns}
        data={customers}
        keyExtractor={(item) => item.customerId}
        searchPlaceholder="Tìm theo họ tên, email, số điện thoại..."
        searchFields={['fullName', 'email', 'phone']}
        isLoading={isLoading}
        emptyMessage="Chưa có khách hàng nào đăng ký trên website"
      />

      {/* Confirm Lock/Unlock Dialog */}
      <ConfirmDialog
        isOpen={!!toggleCustomer}
        title={toggleCustomer?.isActive ? 'Khóa tài khoản khách hàng' : 'Mở khóa tài khoản khách hàng'}
        message={`Bạn có chắc chắn muốn ${toggleCustomer?.isActive ? 'khóa' : 'mở khóa'} tài khoản của "${toggleCustomer?.fullName}" (${toggleCustomer?.email})?`}
        confirmText={toggleCustomer?.isActive ? 'Xác nhận khóa' : 'Mở khóa'}
        confirmVariant={toggleCustomer?.isActive ? 'danger' : 'primary'}
        isLoading={isSubmitting}
        onConfirm={handleToggleStatus}
        onCancel={() => setToggleCustomer(null)}
      />
    </div>
  );
}
