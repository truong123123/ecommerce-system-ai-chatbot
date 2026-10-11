'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { logError } from '@/lib/logger';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    logError('GlobalAppError', error, { digest: error.digest });
  }, [error]);

  return (
    <div
      style={{
        minHeight: '65vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        background: '#f8fafc',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '40px 32px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: '#fee2e2',
            color: '#d70018',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 4px 12px rgba(215, 0, 24, 0.15)',
          }}
        >
          <AlertCircle size={36} />
        </div>

        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '10px',
          }}
        >
          Đã có lỗi xảy ra
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: '#64748b',
            lineHeight: '1.6',
            marginBottom: '28px',
          }}
        >
          Hệ thống gặp sự cố không mong muốn khi tải trang này. Bạn có thể bấm nút
          thử lại bên dưới hoặc quay lại trang chủ.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => reset()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: '#d70018',
              color: '#ffffff',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <RefreshCw size={16} />
            <span>Thử lại</span>
          </button>

          <Link
            href="/"
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
              border: '1px solid #cbd5e1',
            }}
          >
            <Home size={16} />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
