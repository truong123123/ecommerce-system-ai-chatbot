'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, ArrowRight, MapPin, User } from 'lucide-react';
import { AccountLayout } from '../../components/account/AccountLayout';
import { accountService, CustomerProfile, CustomerOrder } from '../../services/accountService';
import styles from './account.module.css';

export default function AccountDashboardPage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      accountService.getProfile(),
      accountService.getOrders()
    ])
      .then(([prof, orders]) => {
        setProfile(prof);
        setRecentOrders(orders.slice(0, 3));
      })
      .catch((err) => {
        console.error('Error fetching dashboard info:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <AccountLayout title={`Xin chào, ${profile?.fullName || 'Quý khách'}`}>
      {/* Overview Stat Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Đơn hàng đã đặt</div>
          <div className={styles.statVal}>{profile?.orderCount ?? 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Sản phẩm yêu thích</div>
          <div className={styles.statVal}>{profile?.wishlistCount ?? 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Điểm tích lũy</div>
          <div className={styles.statVal}>{profile?.loyaltyPoints ?? 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Hạng thành viên</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#d97706', marginTop: '8px' }}>
            {profile?.tierName || 'Thành viên Thường'}
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className={styles.sectionHeading}>
        <span>Đơn hàng gần đây</span>
        <Link href="/account/orders" style={{ fontSize: '13px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          Xem tất cả <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải đơn hàng gần đây...</p>
      ) : recentOrders.length === 0 ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', background: 'var(--color-bg-page)', borderRadius: '10px' }}>
          <ShoppingBag size={36} color="#9ca3af" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>Bạn chưa có đơn hàng nào.</p>
          <Link href="/" className={styles.primaryBtn}>Khám phá sản phẩm</Link>
        </div>
      ) : (
        recentOrders.map((order) => (
          <div key={order.orderId} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div>
                <strong>Mã đơn: #{order.orderCode}</strong>
                <span style={{ margin: '0 8px', color: '#cbd5e1' }}>•</span>
                <span style={{ color: '#6b7280' }}>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</span>
              </div>
              <span className={`${styles.orderStatusBadge} ${
                order.status === 'completed' ? styles.statusCompleted :
                order.status === 'shipped' ? styles.statusShipped :
                order.status === 'cancelled' ? styles.statusCancelled : styles.statusPending
              }`}>
                {order.statusLabel}
              </span>
            </div>

            {order.items.slice(0, 2).map((item) => (
              <div key={item.orderItemId} className={styles.orderItemRow}>
                <img
                  src={item.productImage || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200'}
                  alt={item.productName}
                  className={styles.orderItemImg}
                />
                <div className={styles.orderItemInfo}>
                  <div className={styles.orderItemName}>{item.productName}</div>
                  <div className={styles.orderItemMeta}>Số lượng: x{item.quantity} | {formatPrice(item.unitPrice)}</div>
                </div>
              </div>
            ))}

            <div className={styles.orderFooter}>
              <div>Tổng tiền: <span className={styles.orderTotal}>{formatPrice(order.totalAmount)}</span></div>
              <Link href={`/account/orders/${order.orderId}`} className={styles.secondaryBtn}>
                Xem chi tiết
              </Link>
            </div>
          </div>
        ))
      )}

      {/* Quick Action Shortcuts */}
      <div className={styles.sectionHeading} style={{ marginTop: '36px' }}>
        <span>Phím tắt nhanh</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <Link href="/account/profile" className={styles.orderCard} style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <User size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-title)' }}>Thông tin cá nhân</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Cập nhật họ tên, điện thoại</div>
          </div>
        </Link>
        <Link href="/account/address" className={styles.orderCard} style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <MapPin size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-title)' }}>Sổ địa chỉ</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Quản lý nơi nhận hàng</div>
          </div>
        </Link>
        <Link href="/account/wishlist" className={styles.orderCard} style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#db2777' }}>
            <Heart size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-title)' }}>Yêu thích</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Sản phẩm bạn đang theo dõi</div>
          </div>
        </Link>
      </div>
    </AccountLayout>
  );
}
