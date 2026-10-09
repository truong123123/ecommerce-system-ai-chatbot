'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tag, Copy, Check, ArrowRight } from 'lucide-react';
import { AccountLayout } from '../../../components/account/AccountLayout';
import { apiClient } from '../../../services/api';
import styles from '../account.module.css';

interface CouponItem {
  couponId: number;
  code: string;
  title: string;
  description: string;
  type: string;
  value: number;
  minOrderValue: number;
  maxDiscount: number | null;
  isEligible: boolean;
}

export default function AccountCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<CouponItem[]>('/vouchers/available')
      .then((res) => setCoupons(res.data))
      .catch((err) => console.error('Fetch vouchers error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <AccountLayout title="Mã giảm giá của tôi">
      {loading ? (
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải danh sách ưu đãi...</p>
      ) : coupons.length === 0 ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', background: 'var(--color-bg-page)', borderRadius: '10px' }}>
          <Tag size={40} color="#9ca3af" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '15px', color: '#4b5563', fontWeight: 600 }}>Hiện chưa có mã ưu đãi</p>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
            Các voucher độc quyền sẽ sớm xuất hiện tại đây khi có chương trình khuyến mãi.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {coupons.map((c) => (
            <div
              key={c.couponId}
              style={{
                border: '1px dashed var(--color-primary)',
                borderRadius: '10px',
                padding: '16px',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    fontSize: '14px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    letterSpacing: '0.5px'
                  }}>
                    {c.code}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>
                    {c.type.toLowerCase() === 'percent' ? `Giảm ${c.value}%` : `Giảm ${formatPrice(c.value)}`}
                  </span>
                </div>

                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-title)', marginBottom: '4px' }}>
                  {c.title}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                  {c.description}
                </div>
                {c.minOrderValue > 0 && (
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                    Đơn tối thiểu: {formatPrice(c.minOrderValue)}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => handleCopy(c.code)}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  {copiedCode === c.code ? (
                    <>
                      <Check size={13} color="#16a34a" /> <span style={{ color: '#16a34a' }}>Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Chép mã
                    </>
                  )}
                </button>

                <Link
                  href="/"
                  style={{ fontSize: '12px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500 }}
                >
                  Dùng ngay <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
