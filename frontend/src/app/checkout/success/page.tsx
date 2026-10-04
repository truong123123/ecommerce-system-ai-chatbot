'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShoppingBag, ArrowRight, Clock, ShieldCheck, CreditCard, Copy } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get('orderCode') || searchParams.get('vnp_TxnRef') || 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const method = searchParams.get('method') || (searchParams.get('vnp_ResponseCode') ? 'VNPAY' : 'STORE');
  const amountParam = searchParams.get('amount') || searchParams.get('vnp_Amount');
  const storeHours = searchParams.get('storeHours') || '24';
  const vnpResponseCode = searchParams.get('vnp_ResponseCode');

  const isVnpaySuccess = !vnpResponseCode || vnpResponseCode === '00';

  const formatPrice = (val: string | null) => {
    if (!val) return '0đ';
    const num = parseInt(val, 10);
    // If from VNPAY vnp_Amount, it's multiplied by 100
    const finalNum = vnpResponseCode ? Math.round(num / 100) : num;
    return finalNum.toLocaleString('vi-VN') + 'đ';
  };

  const getMethodTitle = (m: string) => {
    switch (m) {
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
            background: isVnpaySuccess ? '#ecfdf5' : '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          {isVnpaySuccess ? (
            <CheckCircle2 size={44} color="#059669" />
          ) : (
            <CheckCircle2 size={44} color="#dc2626" />
          )}
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
          {isVnpaySuccess ? 'Đặt hàng thành công!' : 'Thanh toán chưa hoàn tất!'}
        </h1>

        <p style={{ color: '#4b5563', fontSize: '14.5px', marginBottom: '24px', lineHeight: 1.5 }}>
          Cảm ơn quý khách đã mua sắm tại <strong>CellphoneS / truongngstore</strong>.<br />
          Đơn hàng của bạn đã được ghi nhận và đang được hệ thống điều phối xử lý.
        </p>

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
              {orderCode}
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

          {amountParam && (
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
                {formatPrice(amountParam)}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13.5px', color: '#6b7280' }}>Trạng thái đơn:</span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: method === 'STORE' ? '#0284c7' : '#059669',
                background: method === 'STORE' ? '#e0f2fe' : '#ecfdf5',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              {method === 'STORE' ? 'Đã xác nhận (Giữ hàng 24h)' : 'Đã thanh toán (Chờ giao hàng)'}
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
