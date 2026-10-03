import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Home, Search } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div style={{
      minHeight: '65vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      background: '#f8fafc'
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '16px',
        padding: '40px 32px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
        textAlign: 'center',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: '#fee2e2',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
        }}>
          <ShoppingBag size={36} />
        </div>

        <h1 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: '10px'
        }}>
          Không tìm thấy sản phẩm
        </h1>

        <p style={{
          fontSize: '14px',
          color: '#64748b',
          lineHeight: '1.6',
          marginBottom: '28px'
        }}>
          Sản phẩm bạn đang tìm kiếm không tồn tại, đã đổi đường dẫn hoặc tạm thời ngừng kinh doanh tại hệ thống truongngstore.
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: '#0284c7',
              color: '#ffffff',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Home size={16} />
            <span>Về trang chủ</span>
          </Link>

          <Link
            href="/search"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: '#f1f5f9',
              color: '#334155',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
              border: '1px solid #cbd5e1'
            }}
          >
            <Search size={16} />
            <span>Tìm sản phẩm khác</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
