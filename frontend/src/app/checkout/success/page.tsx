'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShoppingBag, ArrowRight, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/services/api';

interface BackendOrderStatus {
  orderCode: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const rawOrderCode = searchParams.get('orderCode') || searchParams.get('vnp_TxnRef') || '';
  const storeHours = searchParams.get('storeHours') || '24';

  const [orderInfo, setOrderInfo] = useState<BackendOrderStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(!!rawOrderCode);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // BƯỚC 5: Đọc trạng thái thật từ backend, không tự đánh dấu đã thanh toán dựa vào tham số URL
  useEffect(() => {
    if (!rawOrderCode) return;
    let isMounted = true;
    apiClient.get<BackendOrderStatus>(`/payment/order-status/${encodeURIComponent(rawOrderCode)}`)
      .then(res => {
        if (isMounted) {
          setOrderInfo(res.data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFetchError('Chưa thể đối soát tức thời từ máy chủ. Hệ thống đang tiếp tục xử lý.');
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, [rawOrderCode]);

  const isPaid = orderInfo?.status === 'paid' || orderInfo?.status === 'completed';
  const isPending = !orderInfo || orderInfo.status === 'pending_payment' || orderInfo.status === 'pending';
  const method = orderInfo?.paymentMethod || searchParams.get('method') || 'VNPAY';
  const finalOrderCode = orderInfo?.orderCode || rawOrderCode || 'Đang cập nhật';

  const formatPrice = (amount?: number) => {
    if (amount === undefined || amount === null) return 'Đang cập nhật';
    return Number(amount).toLocaleString('vi-VN') + 'đ';
  };

  const getMethodTitle = (m: string) => {
    switch (m.toUpperCase()) {
      case 'STORE':
        return 'Thanh toán khi nhận máy tại cửa hàng';
      case 'BANK_QR':
        return 'Chuyển khoản ngân hàng qua mã QR (VietQR)';
      case 'VNPAY':
        return 'Cổng thanh toán điện tử VNPAY';
      case 'MOMO':
        return 'Ví điện tử MoMo';
      default:
        return 'Thanh toán trực tiếp';
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', padding: '40px 16px' }}>
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          padding: '36px 28px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: isPaid ? '#ecfdf5' : '#fffbeb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          {loading ? (
            <Loader2 size={40} color="#3b82f6" className="animate-spin" />
          ) : isPaid ? (
            <CheckCircle2 size={44} color="#059669" />
          ) : (
            <Clock size={44} color="#d97706" />
          )}
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
          {loading ? 'Đang đối soát thanh toán...' : isPaid ? 'Đặt hàng & Thanh toán thành công!' : 'Đơn hàng đang chờ xác nhận thanh toán'}
        </h1>

        <p style={{ color: '#4b5563', fontSize: '14.5px', marginBottom: '24px', lineHeight: 1.5 }}>
          {isPaid
            ? 'Cảm ơn quý khách đã mua sắm tại truongngstore. Đơn hàng của bạn đã được thanh toán thành công và chuyển sang bộ phận điều phối.'
            : 'Hệ thống đang tiến hành đối soát giao dịch từ cổng thanh toán. Trạng thái đơn hàng sẽ được cập nhật tự động.'}
        </p>

        {fetchError && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#b91c1c',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{fetchError}</span>
          </div>
        )}

        {/* Order Details Card */}
        <div
          style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'left',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '12px',
              borderBottom: '1px dashed #d1d5db',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '13.5px', color: '#6b7280' }}>Mã đơn hàng:</span>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#d70018',
                letterSpacing: '0.5px',
                background: '#fee2e2',
                padding: '3px 10px',
                borderRadius: '6px',
              }}
            >
              {finalOrderCode}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '12px',
              borderBottom: '1px dashed #d1d5db',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '13.5px', color: '#6b7280' }}>Phương thức:</span>
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1f2937' }}>
              {getMethodTitle(method)}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '12px',
              borderBottom: '1px dashed #d1d5db',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '13.5px', color: '#6b7280' }}>Tổng số tiền:</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#d70018' }}>
              {formatPrice(orderInfo?.totalAmount)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13.5px', color: '#6b7280' }}>Trạng thái xác thực từ Server:</span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: isPaid ? '#059669' : '#d97706',
                background: isPaid ? '#ecfdf5' : '#fef3c7',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              {isPaid
                ? 'Đã thanh toán (Chờ giao hàng)'
                : isPending
                  ? 'Đang chờ cổng thanh toán xác nhận'
                  : orderInfo?.status}
            </span>
          </div>
        </div>

        {method === 'STORE' && (
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#92400e',
              fontSize: '13px',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              textAlign: 'left',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <Clock size={20} style={{ flexShrink: 0 }} />
            <span>
              <strong>Lưu ý nhận máy:</strong> Chi nhánh sẽ giữ hàng và bảo lưu giá ưu đãi trong vòng{' '}
              <strong>{storeHours} giờ</strong>. Quý khách vui lòng đến nhận máy đúng hạn kèm mã đơn hàng.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              flex: '1',
              minWidth: '180px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#ffffff',
              color: '#374151',
              border: '1.5px solid #d1d5db',
              borderRadius: '8px',
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: '14.5px',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <ShoppingBag size={18} /> Tiếp tục mua sắm
          </Link>

          <Link
            href="/account"
            style={{
              flex: '1',
              minWidth: '180px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#d70018',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: '14.5px',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              boxShadow: '0 4px 12px rgba(215, 0, 24, 0.2)',
            }}
          >
            Theo dõi đơn hàng <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '80px 20px', textAlign: 'center', color: '#6b7280' }}>
          Đang tải thông tin đơn hàng...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
