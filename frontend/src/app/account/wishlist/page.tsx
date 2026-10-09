'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';
import { AccountLayout } from '../../../components/account/AccountLayout';
import { useWishlistStore } from '../../../store/wishlistStore';
import styles from '../account.module.css';

export default function AccountWishlistPage() {
  const { items, loading, fetchWishlist, removeFromWishlist } = useWishlistStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <AccountLayout title="Sản phẩm yêu thích">
      {loading && items.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải danh sách yêu thích...</p>
      ) : items.length === 0 ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', background: 'var(--color-bg-page)', borderRadius: '10px' }}>
          <Heart size={40} color="#9ca3af" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '15px', color: '#4b5563', fontWeight: 600 }}>Chưa có sản phẩm yêu thích nào</p>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
            Nhấn vào biểu tượng trái tim ở bất kỳ sản phẩm nào để lưu lại và theo dõi giá.
          </p>
          <Link href="/" className={styles.primaryBtn} style={{ marginTop: '16px' }}>
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                padding: '16px',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              {/* Delete button */}
              <button
                type="button"
                onClick={() => removeFromWishlist(item.productId)}
                title="Xóa khỏi yêu thích"
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
              >
                <Trash2 size={16} />
              </button>

              <div>
                <Link href={`/products/${item.slug}`}>
                  <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <img
                      src={item.primaryImage || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300'}
                      alt={item.name}
                      style={{ width: '140px', height: '140px', objectFit: 'contain', margin: '0 auto' }}
                    />
                  </div>
                </Link>

                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                  {item.categoryName} • {item.brandName}
                </div>

                <Link href={`/products/${item.slug}`}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-text-title)',
                    lineHeight: '1.4',
                    marginBottom: '8px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '40px'
                  }}>
                    {item.name}
                  </h4>
                </Link>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {formatPrice(item.price)}
                  </span>
                  {item.oldPrice && item.oldPrice > item.price && (
                    <span style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through' }}>
                      {formatPrice(item.oldPrice)}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '12px', marginBottom: '12px' }}>
                  {item.inStock ? (
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>● Còn hàng</span>
                  ) : (
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>● Tạm hết hàng</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  href={`/products/${item.slug}`}
                  className={styles.secondaryBtn}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
