'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/api';
import { AdminDataTable, StatusBadge, Column } from '../../../components/admin';
import styles from '../adminCrud.module.css';

interface PaymentTxn {
  id: number;
  orderId?: number;
  orderCode?: string;
  customerName?: string;
  customerEmail?: string;
  paymentMethod: string;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  providerTxnRef: string;
  providerTransactionNo?: string;
  createdAt: string;
  paidAt?: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentTxn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<PaymentTxn | null>(null);
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admin/payments');
      if (Array.isArray(res.data)) {
        setPayments(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách thanh toán:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredData = payments.filter((item) => {
    if (providerFilter !== 'ALL' && item.provider?.toUpperCase() !== providerFilter) {
      return false;
    }
    if (statusFilter !== 'ALL' && item.status?.toUpperCase() !== statusFilter) {
      return false;
    }
    return true;
  });

  const totalSuccessAmount = payments
    .filter((p) => p.status?.toUpperCase() === 'SUCCESS')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const successCount = payments.filter((p) => p.status?.toUpperCase() === 'SUCCESS').length;
  const pendingCount = payments.filter((p) => ['INITIATED', 'PENDING'].includes(p.status?.toUpperCase())).length;
  const failedCount = payments.filter((p) => p.status?.toUpperCase() === 'FAILED').length;

  const columns: Column<PaymentTxn>[] = [
    {
      key: 'id',
      title: 'Mã GD',
      width: '100px',
      sortable: true,
      render: (item) => <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>#{item.id}</span>,
    },
    {
      key: 'orderCode',
      title: 'Mã đơn hàng',
      width: '160px',
      sortable: true,
      render: (item) => (
        <span style={{ fontWeight: 700, color: '#f8fafc' }}>
          {item.orderCode || `Đơn #${item.orderId || 'N/A'}`}
        </span>
      ),
    },
    {
      key: 'customerName',
      title: 'Khách hàng',
      sortable: true,
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{item.customerName || 'Khách vãng lai'}</div>
          {item.customerEmail && (
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.customerEmail}</div>
          )}
        </div>
      ),
    },
    {
      key: 'provider',
      title: 'Cổng thanh toán',
      width: '150px',
      sortable: true,
      render: (item) => (
        <span style={{
          display: 'inline-block',
          padding: '3px 8px',
          borderRadius: 4,
          fontSize: '0.75rem',
          fontWeight: 700,
          background: item.provider === 'VNPAY' ? 'rgba(0, 114, 206, 0.2)' : 'rgba(255, 255, 255, 0.08)',
          color: item.provider === 'VNPAY' ? '#38bdf8' : '#e2e8f0',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {item.provider || item.paymentMethod}
        </span>
      ),
    },
    {
      key: 'amount',
      title: 'Số tiền',
      width: '150px',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span style={{ fontWeight: 700, color: item.status === 'SUCCESS' ? '#10b981' : '#f8fafc' }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount || 0)}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '140px',
      align: 'center',
      render: (item) => <StatusBadge status={item.status} type="payment" />,
    },
    {
      key: 'createdAt',
      title: 'Thời gian tạo',
      width: '160px',
      sortable: true,
      render: (item) => (
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '—'}
        </span>
      ),
    },
    {
      key: 'providerTxnRef',
      title: 'Thao tác',
      width: '100px',
      align: 'center',
      render: (item) => (
        <button
          onClick={() => setSelectedTxn(item)}
          className={styles.btnSecondary}
          style={{ padding: '5px 10px', fontSize: '0.75rem' }}
        >
          Chi tiết
        </button>
      ),
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1>Quản lý Giao dịch & Thanh toán (Payments)</h1>
          <p>Đối soát cổng thanh toán VNPay, thẻ tín dụng, chuyển khoản và tiền mặt tại cửa hàng</p>
        </div>

        <div className={styles.headerButtons}>
          <button className={styles.btnSecondary} onClick={fetchPayments}>
            Làm mới dữ liệu
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>₫</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Đã thu thành công</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalSuccessAmount)}
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPrimary}`}>✓</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Thành công</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{successCount} GD</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconWarning}`}>⏳</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Chờ xử lý</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>{pendingCount} GD</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconInfo}`}>✕</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Thất bại / Hủy</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171' }}>{failedCount} GD</div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#161824',
        padding: '12px 16px',
        borderRadius: 10,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Cổng thanh toán:</span>
          <select
            className={styles.filterSelect}
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
          >
            <option value="ALL">Tất cả cổng</option>
            <option value="VNPAY">VNPay</option>
            <option value="STORE">Tại quầy / Cửa hàng</option>
            <option value="COD">Thanh toán khi nhận (COD)</option>
            <option value="BANK_QR">Ngân hàng QR</option>
            <option value="MOMO">Ví MoMo</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Trạng thái:</span>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SUCCESS">Thành công (SUCCESS)</option>
            <option value="INITIATED">Khởi tạo (INITIATED)</option>
            <option value="PENDING">Chờ xử lý (PENDING)</option>
            <option value="FAILED">Thất bại (FAILED)</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <AdminDataTable
        columns={columns}
        data={filteredData}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Tìm theo mã GD, mã đơn hàng, đối soát nhà cung cấp..."
        searchFields={['orderCode', 'providerTxnRef', 'providerTransactionNo', 'customerName', 'provider']}
        isLoading={isLoading}
        emptyMessage="Chưa có dữ liệu giao dịch thanh toán"
        emptySubtext="Các giao dịch VNPay, tiền mặt hoặc thẻ sẽ hiển thị tại đây sau khi khách đặt hàng"
      />

      {/* Transaction Detail Modal */}
      {selectedTxn && (
        <div className={styles.modalOverlay} onClick={() => setSelectedTxn(null)}>
          <div
            className={styles.modalDialog}
            style={{ maxWidth: 580 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Chi tiết giao dịch #{selectedTxn.id}</h2>
              <button className={styles.modalCloseBtn} onClick={() => setSelectedTxn(null)}>×</button>
            </div>

            <div className={styles.modalBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#94a3b8' }}>Mã đơn hàng:</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{selectedTxn.orderCode || `#${selectedTxn.orderId}`}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#94a3b8' }}>Khách hàng:</span>
                  <span style={{ color: '#fff' }}>{selectedTxn.customerName || 'Khách vãng lai'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#94a3b8' }}>Số tiền:</span>
                  <span style={{ color: '#e30019', fontWeight: 800, fontSize: '1.1rem' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedTxn.amount)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#94a3b8' }}>Trạng thái:</span>
                  <StatusBadge status={selectedTxn.status} type="payment" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#94a3b8' }}>Cổng cung cấp:</span>
                  <span style={{ color: '#fff' }}>{selectedTxn.provider}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#94a3b8' }}>Mã đối soát hệ thống (TxnRef):</span>
                  <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{selectedTxn.providerTxnRef}</span>
                </div>

                {selectedTxn.providerTransactionNo && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: '#94a3b8' }}>Mã GD Cổng (VNPay/Momo No):</span>
                    <span style={{ color: '#a78bfa', fontFamily: 'monospace' }}>{selectedTxn.providerTransactionNo}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#94a3b8' }}>Thời gian khởi tạo:</span>
                  <span style={{ color: '#cbd5e1' }}>{selectedTxn.createdAt ? new Date(selectedTxn.createdAt).toLocaleString('vi-VN') : '—'}</span>
                </div>

                {selectedTxn.paidAt && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ color: '#94a3b8' }}>Thời gian xác nhận tiền về:</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>{new Date(selectedTxn.paidAt).toLocaleString('vi-VN')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setSelectedTxn(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
