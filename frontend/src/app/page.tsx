import React from 'react';
import { AiChatbox } from '../components/chat/AiChatbox';

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        height: 48,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px'
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}></span>
          <nav style={{ display: 'flex', gap: 24, fontSize: '0.8rem', color: 'rgba(0,0,0,0.8)' }}>
            <a href="#">Cửa Hàng</a>
            <a href="#">Mac</a>
            <a href="#">iPad</a>
            <a href="#">iPhone</a>
            <a href="#">Watch</a>
            <a href="#">AirPods</a>
            <a href="#">Phụ Kiện</a>
          </nav>
          <div style={{ display: 'flex', gap: 16, fontSize: '0.95rem' }}>
            <span>🔍</span>
            <span>🛍️</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(145deg, #6090e6 0%, #4a75cb 40%, #2f54a3 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        color: '#fff'
      }}>
        <div style={{ fontSize: '6rem', marginBottom: 16 }}></div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, maxWidth: 680, margin: '0 auto 28px', lineHeight: 1.4 }}>
          Giới thiệu iPhone 15 Pro Max, MacBook Pro M3 Max, Apple Watch Ultra 2 và AirPods Pro 2.
        </h1>
        <button style={{
          background: '#fff',
          color: '#1d1d1f',
          border: 'none',
          padding: '12px 28px',
          borderRadius: 999,
          fontWeight: 600,
          fontSize: '0.9rem',
          cursor: 'pointer'
        }}>
          Xem sự kiện
        </button>
      </section>

      {/* AI Assistant Widget */}
      <AiChatbox />
    </main>
  );
}
