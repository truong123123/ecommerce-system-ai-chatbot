'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Eye, MessageSquare } from 'lucide-react';
import { AccountLayout } from '../../../components/account/AccountLayout';
import { accountService, CustomerOrder } from '../../../services/accountService';
import styles from '../account.module.css';

const TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'shipped', label: 'Đang giao' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export default function AccountOrdersPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = (status: string) => {
    setLoading(true);
    accountService.getOrders(status)
      .then((data) => setOrders(data))
      .catch((err) => console.error('Fetch orders error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <AccountLayout title="Đơn hàng của tôi">
      {/* Status Filter Tabs */}
      <div className={styles.tabList}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải danh sách đơn hàng...</p>
      ) : orders.length === 0 ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', background: 'var(--color-bg-page)', borderRadius: '10px' }}>
          <ShoppingBag size={40} color="#9ca3af" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '15px', color: '#4b5563', fontWeight: 600 }}>Không tìm thấy đơn hàng nào</p>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
            {activeTab === 'ALL' ? 'Bạn chưa thực hiện đơn đặt hàng nào.' : `Không có đơn hàng nào trong trạng thái "${TABS.find(t => t.key === activeTab)?.label}".`}
          </p>
          <Link href="/" className={styles.primaryBtn} style={{ marginTop: '16px' }}>
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.orderId} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div>
                <strong>Mã đơn: #{order.orderCode}</strong>
                <span style={{ margin: '0 8px', color: '#cbd5e1' }}>•</span>
                <span style={{ color: '#6b7280' }}>Ngày đặt: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</span>
              </div>
              <span className={`${styles.orderStatusBadge} ${
                order.status === 'completed' ? styles.statusCompleted :
                order.status === 'shipped' ? styles.statusShipped :
                order.status === 'cancelled' ? styles.statusCancelled : styles.statusPending
              }`}>
                {order.statusLabel}
              </span>
            </div>

            {order.items.map((item) => (
              <div key={item.orderItemId} className={styles.orderItemRow}>
                <img
                  src={item.productImage || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200'}
                  alt={item.productName}
                  className={styles.orderItemImg}
                />
                <div className={styles.orderItemInfo}>
                  <div className={styles.orderItemName}>{item.productName}</div>
                  <div className={styles.orderItemMeta}>
                    Số lượng: x{item.quantity} | Đơn giá: {formatPrice(item.unitPrice)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-title)' }}>
                    {formatPrice(item.lineTotal)}
                  </div>
                  {order.status === 'completed' && item.productId && (
                    item.canReview ? (
                      <Link
                        href={`/products/${item.productId}?orderItemId=${item.orderItemId}#product-reviews-section`}
                        className={styles.secondaryBtn}
                        style={{ fontSize: '11px', padding: '3px 8px', textDecoration: 'none' }}
                      >
                        <MessageSquare size={11} style={{ display: 'inline', marginRight: 3 }} />
                        <span>Đánh giá</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/products/${item.productId}#product-reviews-section`}
                        style={{ fontSize: '12px', color: '#0071e3', textDecoration: 'none', fontWeight: 500 }}
                      >
                        <span>Xem đánh giá</span>
                      </Link>
                    )
                  )}
                </div>
              </div>
            ))}

            <div className={styles.orderFooter}>
              <div>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Tổng thanh toán: </span>
                <span className={styles.orderTotal}>{formatPrice(order.totalAmount)}</span>
              </div>
              <Link href={`/account/orders/${order.orderId}`} className={styles.secondaryBtn}>
                <Eye size={14} />
                <span>Xem chi tiết</span>
              </Link>
            </div>
          </div>
        ))
      )}
    </AccountLayout>
  );
}
