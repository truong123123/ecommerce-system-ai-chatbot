'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/api';
import { AdminDataTable, StatusBadge, Column, ConfirmDialog } from '../../../components/admin';
import styles from '../adminCrud.module.css';

interface OrderItemDetail {
  orderItemId: number;
  productNameSnapshot: string;
  productImageSnapshot: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  variant?: {
    sku: string;
    attributes?: Record<string, string>;
  };
}

interface OrderData {
  orderId: number;
  orderCode: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  subtotal?: number;
  shippingFee?: number;
  discountAmount?: number;
  voucherDiscount?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentMethod?: string;
  receiveType?: string;
  shippingStreet?: string;
  shippingWard?: string;
  shippingDistrict?: string;
  shippingProvince?: string;
  note?: string;
  needInvoice?: boolean;
  items?: OrderItemDetail[];
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'pending_payment', label: 'Chờ thanh toán' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao hàng' },
  { value: 'delivered', label: 'Đã giao thành công' },
  { value: 'cancelled', label: 'Đã hủy đơn' },
  { value: 'returned', label: 'Đã hoàn trả' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/orders');
      if (Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách đơn hàng:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openOrderDetail = async (order: OrderData) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setDetailLoading(true);
    try {
      const res = await apiClient.get(`/orders/${order.orderId}`);
      if (res.data) {
        setSelectedOrder(res.data);
        setNewStatus(res.data.status);
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết đơn hàng:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    setIsUpdatingStatus(true);
    try {
      await apiClient.put(`/orders/${selectedOrder.orderId}/status`, { status: newStatus });
      setAlert({ type: 'success', message: `Đã cập nhật trạng thái đơn ${selectedOrder.orderCode} sang ${newStatus}` });
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      fetchOrders();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng';
      setAlert({ type: 'error', message: msg });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const columns: Column<OrderData>[] = [
    {
      key: 'orderCode',
      title: 'Mã đơn hàng',
      width: '180px',
      sortable: true,
      render: (item) => (
        <span style={{ fontWeight: 700, color: '#f8fafc', letterSpacing: '0.02em' }}>
          {item.orderCode || `#ORD-${item.orderId}`}
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
          {item.customerPhone && (
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.customerPhone}</div>
          )}
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      title: 'Thanh toán',
      width: '140px',
      render: (item) => (
        <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
          {item.paymentMethod === 'VNPAY' ? 'VNPay' : item.paymentMethod === 'STORE' ? 'Tại cửa hàng' : 'COD'}
        </span>
      ),
    },
    {
      key: 'orderDate',
      title: 'Thời gian đặt',
      width: '170px',
      sortable: true,
      render: (item) => (
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {item.orderDate ? new Date(item.orderDate).toLocaleString('vi-VN') : '—'}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      title: 'Tổng tiền',
      width: '150px',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span style={{ fontWeight: 700, color: '#e30019' }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalAmount || 0)}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '160px',
      align: 'center',
      render: (item) => <StatusBadge status={item.status} type="order" />,
    },
    {
      key: 'orderId',
      title: 'Thao tác',
      width: '110px',
      align: 'center',
      render: (item) => (
        <button
          onClick={() => openOrderDetail(item)}
          className={styles.btnSecondary}
          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
        >
          Chi tiết
        </button>
      ),
    },
  ];

  const fullAddress = selectedOrder
    ? [selectedOrder.shippingStreet, selectedOrder.shippingWard, selectedOrder.shippingDistrict, selectedOrder.shippingProvince]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <div className={styles.pageWrapper}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1>Quản lý Đơn hàng (Orders)</h1>
          <p>Theo dõi, xử lý và cập nhật tiến độ giao dịch đơn hàng toàn hệ thống</p>
        </div>

        <div className={styles.headerButtons}>
          <StatusBadge status="active" label={`Tổng ${orders.length} đơn hàng`} variant="info" />
        </div>
      </div>

      {alert && (
        <div className={`${styles.alertBanner} ${alert.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          <span>{alert.message}</span>
          <button className={styles.alertCloseBtn} onClick={() => setAlert(null)}>×</button>
        </div>
      )}

      {/* Table */}
      <AdminDataTable
        columns={columns}
        data={orders}
        keyExtractor={(item) => item.orderId}
        searchPlaceholder="Tìm kiếm mã đơn, tên khách, số điện thoại..."
        searchFields={['orderCode', 'customerName', 'customerPhone', 'status']}
        isLoading={isLoading}
        emptyMessage="Chưa có đơn hàng nào trong hệ thống"
        emptySubtext="Khi có khách hàng đặt mua trên website, danh sách đơn hàng sẽ hiển thị tại đây"
      />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div
            className={styles.modalDialog}
            style={{ maxWidth: 720 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Chi tiết đơn hàng {selectedOrder.orderCode || `#${selectedOrder.orderId}`}
              </h2>
              <button className={styles.modalCloseBtn} onClick={() => setSelectedOrder(null)}>×</button>
            </div>

            <div className={styles.modalBody}>
              {detailLoading ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
                  Đang tải thông tin đơn hàng...
                </div>
              ) : (
                <>
                  {/* Status update box */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Trạng thái hiện tại:</span>
                      <StatusBadge status={selectedOrder.status} type="order" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <select
                        className={styles.filterSelect}
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>

                      <button
                        className={styles.btnPrimary}
                        style={{ padding: '7px 14px', fontSize: '0.8rem' }}
                        onClick={handleUpdateStatus}
                        disabled={isUpdatingStatus || newStatus === selectedOrder.status}
                      >
                        {isUpdatingStatus ? 'Lưu...' : 'Cập nhật'}
                      </button>
                    </div>
                  </div>

                  {/* Customer & Delivery info */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                    <div style={{ background: '#1c1f2e', padding: 14, borderRadius: 8 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
                        Thông tin khách hàng
                      </div>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{selectedOrder.customerName || 'Khách vãng lai'}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 3 }}>SĐT: {selectedOrder.customerPhone || '—'}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 3 }}>Email: {selectedOrder.customerEmail || '—'}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 3 }}>
                        Hình thức: {selectedOrder.receiveType === 'STORE_PICKUP' ? 'Nhận tại cửa hàng' : 'Giao tận nơi'}
                      </div>
                    </div>

                    <div style={{ background: '#1c1f2e', padding: 14, borderRadius: 8 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
                        Địa chỉ & Thanh toán
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                        {fullAddress || 'Nhận tại cửa hàng'}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 8 }}>
                        Phương thức: <span style={{ color: '#fff', fontWeight: 600 }}>{selectedOrder.paymentMethod}</span>
                      </div>
                      {selectedOrder.note && (
                        <div style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: 6, fontStyle: 'italic' }}>
                          Ghi chú: {selectedOrder.note}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                      Danh sách sản phẩm ({selectedOrder.items?.length || 0})
                    </div>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {selectedOrder.items.map((item) => (
                          <div
                            key={item.orderItemId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: '#1c1f2e',
                              padding: '10px 14px',
                              borderRadius: 8,
                              gap: 12
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {item.productImageSnapshot ? (
                                <img
                                  src={item.productImageSnapshot}
                                  alt={item.productNameSnapshot}
                                  style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 6, background: '#26293b' }}
                                />
                              ) : (
                                <div style={{ width: 44, height: 44, borderRadius: 6, background: '#26293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                  IMG
                                </div>
                              )}
                              <div>
                                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
                                  {item.productNameSnapshot}
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                  SKU: {item.variant?.sku || 'N/A'} × {item.quantity}
                                </div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ color: '#e30019', fontWeight: 700, fontSize: '0.9rem' }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.lineTotal || (item.unitPrice * item.quantity))}
                              </div>
                              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice)}/sp
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic', padding: 12 }}>
                        Không có sản phẩm nào
                      </div>
                    )}
                  </div>

                  {/* Financial Summary */}
                  <div style={{
                    background: '#1c1f2e',
                    padding: 14,
                    borderRadius: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Tạm tính hàng hóa:</span>
                      <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.subtotal || selectedOrder.totalAmount)}</span>
                    </div>
                    {selectedOrder.shippingFee ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                        <span>Phí giao hàng:</span>
                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.shippingFee)}</span>
                      </div>
                    ) : null}
                    {selectedOrder.voucherDiscount ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                        <span>Giảm giá Voucher / Khuyến mãi:</span>
                        <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.voucherDiscount)}</span>
                      </div>
                    ) : null}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '1rem',
                      paddingTop: 8,
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      <span>Tổng thanh toán:</span>
                      <span style={{ color: '#e30019' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalAmount || 0)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setSelectedOrder(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
