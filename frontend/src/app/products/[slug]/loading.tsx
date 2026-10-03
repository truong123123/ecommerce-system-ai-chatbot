import React from 'react';

export default function ProductDetailLoading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px', minHeight: '80vh' }}>
      {/* Breadcrumb Skeleton */}
      <div style={{ height: '20px', width: '320px', background: '#e2e8f0', borderRadius: '6px', marginBottom: '20px', animation: 'pulse 1.5s infinite' }} />

      {/* Header Skeleton */}
      <div style={{ height: '32px', width: '60%', background: '#e2e8f0', borderRadius: '8px', marginBottom: '12px' }} />
      <div style={{ height: '18px', width: '40%', background: '#f1f5f9', borderRadius: '6px', marginBottom: '24px' }} />

      {/* 2-Columns Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)', gap: '32px' }}>
        {/* Left Column */}
        <div>
          <div style={{ height: '420px', background: '#f1f5f9', borderRadius: '16px', marginBottom: '20px', border: '1px solid #e2e8f0' }} />
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <div style={{ height: '64px', width: '64px', background: '#e2e8f0', borderRadius: '8px' }} />
            <div style={{ height: '64px', width: '64px', background: '#e2e8f0', borderRadius: '8px' }} />
            <div style={{ height: '64px', width: '64px', background: '#e2e8f0', borderRadius: '8px' }} />
          </div>
          <div style={{ height: '260px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
        </div>

        {/* Right Column */}
        <div>
          <div style={{ height: '110px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }} />
          <div style={{ height: '80px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }} />
          <div style={{ height: '180px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }} />
          <div style={{ height: '56px', background: '#e2e8f0', borderRadius: '12px' }} />
        </div>
      </div>
    </div>
  );
}
