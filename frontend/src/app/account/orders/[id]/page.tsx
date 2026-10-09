'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, MapPin, CreditCard, AlertTriangle, MessageSquare } from 'lucide-react';
import { AccountLayout } from '../../../../components/account/AccountLayout';
import { accountService, CustomerOrder } from '../../../../services/accountService';
import styles from '../../account.module.css';

export default function OrderDetailPage() {
  const params = useParams();
  const idStr = params.id as string;
  const orderId = Number(idStr);

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDetail = () => {
    if (!orderId) return;
    setLoading(true);
    accountService.getOrderDetail(orderId)
      .then((data) => setOrder(data))
      .catch((err) => {
        if (err.response?.status === 403) {
          setErrorMsg('Bạn không có quyền xem thông tin đơn hàng này (Bảo mật IDOR).');
        } else {
          setErrorMsg('Không tìm thấy thông tin đơn hàng.');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;

    setCancelling(true);
    try {
      await accountService.cancelOrder(order.orderId);
      alert('Đã hủy đơn hàng thành công.');
      fetchDetail();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể hủy đơn hàng.');
    } finally {
      setCancelling(false);
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  if (loading) {
    return (
      <AccountLayout title="Chi tiết đơn hàng">
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải thông tin đơn hàng #{orderId}...</p>
      </AccountLayout>
    );
  }

  if (errorMsg || !order) {
    return (
      <AccountLayout title="Chi tiết đơn hàng">
        <div style={{ padding: '32px 16px', textAlign: 'center', background: '#fee2e2', borderRadius: '10px', color: '#991b1b' }}>
          <AlertTriangle size={36} style={{ margin: '0 auto 10px' }} />
          <p style={{ fontWeight: 600, fontSize: '15px' }}>{errorMsg || 'Không tìm thấy đơn hàng.'}</p>
          <Link href="/account/orders" className={styles.secondaryBtn} style={{ marginTop: '16px' }}>
            <ArrowLeft size={14} /> Quay lại danh sách đơn
          </Link>
        </div>
      </AccountLayout>
    );
  }

  const canCancel = order.status === 'pending' || order.status === 'pending_payment';

  return (
    <AccountLayout
      title={`Đơn hàng #${order.orderCode}`}
      actionButton={
        <Link href="/account/orders" className={styles.secondaryBtn}>
          <ArrowLeft size={14} /> Quay lại
        </Link>
      }
    >
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-page)', padding: '16px', borderRadius: '10px', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>Ngày đặt hàng</div>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-title)', marginTop: '2px' }}>
            {new Date(order.orderDate).toLocaleString('vi-VN')}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>Trạng thái đơn</div>
          <span className={`${styles.orderStatusBadge} ${
            order.status === 'completed' ? styles.statusCompleted :
            order.status === 'shipped' ? styles.statusShipped :
            order.status === 'cancelled' ? styles.statusCancelled : styles.statusPending
          }`} style={{ display: 'inline-block', marginTop: '4px' }}>
            {order.statusLabel}
          </span>
        </div>
        <div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>Phương thức thanh toán</div>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-title)', marginTop: '2px' }}>
            {order.paymentMethod === 'VNPAY' ? 'Thanh toán trực tuyến VNPay' : 'Thanh toán khi nhận hàng (COD)'}
          </div>
        </div>
        {canCancel && (
          <button
            type="button"
            className={styles.secondaryBtn}
            style={{ color: '#ef4444', borderColor: '#fca5a5' }}
            onClick={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
          </button>
        )}
      </div>

      {/* Receiver & Delivery Info */}
      <div className={styles.formGrid} style={{ marginBottom: '24px' }}>
        <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', marginBottom: '10px', color: 'var(--color-text-title)' }}>
            <MapPin size={16} color="var(--color-primary)" />
            <span>Địa chỉ nhận hàng</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>{order.receiverName}</div>
          <div style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0' }}>SĐT: {order.receiverPhone}</div>
          <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>{order.shippingAddress || 'Nhận tại cửa hàng'}</div>
        </div>

        <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', marginBottom: '10px', color: 'var(--color-text-title)' }}>
            <CreditCard size={16} color="var(--color-blue)" />
            <span>Thông tin thanh toán</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: '#6b7280' }}>Tạm tính:</span>
            <span style={{ fontWeight: 600 }}>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: '#16a34a' }}>
              <span>Giảm giá coupon:</span>
              <span style={{ fontWeight: 600 }}>-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: '#6b7280' }}>Phí vận chuyển:</span>
            <span style={{ fontWeight: 600 }}>{order.shippingFee > 0 ? formatPrice(order.shippingFee) : 'Miễn phí'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', paddingTop: '8px', borderTop: '1px solid var(--color-border-subtle)', marginTop: '8px' }}>
            <span style={{ fontWeight: 700 }}>Tổng tiền:</span>
            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className={styles.sectionHeading}>
        <span>Sản phẩm trong đơn hàng ({order.items.length})</span>
      </div>

      <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', padding: '8px 16px' }}>
        {order.items.map((item) => (
          <div key={item.orderItemId} className={styles.orderItemRow} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
            <img
              src={item.productImage || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200'}
              alt={item.productName}
              className={styles.orderItemImg}
            />
            <div className={styles.orderItemInfo}>
              <div className={styles.orderItemName}>{item.productName}</div>
              <div className={styles.orderItemMeta}>
                SKU: {item.sku || 'N/A'} | Đơn giá: {formatPrice(item.unitPrice)} | Số lượng: x{item.quantity}
              </div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '15px' }}>
                {formatPrice(item.lineTotal)}
              </span>
              {order.status === 'completed' && item.productId && (
                item.canReview ? (
                  <Link
                    href={`/products/${item.productId}?orderItemId=${item.orderItemId}#product-reviews-section`}
                    className={styles.secondaryBtn}
                    style={{ fontSize: '12px', padding: '4px 10px', textDecoration: 'none' }}
                  >
                    <MessageSquare size={13} style={{ display: 'inline', marginRight: 4 }} />
                    <span>Viết đánh giá</span>
                  </Link>
                ) : (
                  <Link
                    href={`/products/${item.productId}#product-reviews-section`}
                    className={styles.secondaryBtn}
                    style={{ fontSize: '12px', padding: '4px 10px', textDecoration: 'none' }}
                  >
                    <span>Xem đánh giá</span>
                  </Link>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </AccountLayout>
  );
}
