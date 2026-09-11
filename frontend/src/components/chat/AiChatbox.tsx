'use client';

import React, { useState } from 'react';

export const AiChatbox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'bot' | 'user'; text: string }[]>([
    { sender: 'bot', text: 'Xin chào 👋! Tôi là Trợ lý Apple Intelligence. Bạn cần tư vấn về sản phẩm iPhone, Mac hay iPad chính hãng VN/A?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    setTimeout(() => {
      let botReply = 'Tất cả sản phẩm tại Apple Store Việt Nam đều là hàng chính hãng mã VN/A nguyên seal và được bảo hành 12 tháng.';
      const lower = userMsg.toLowerCase();
      if (lower.includes('iphone')) {
        botReply = '📱 iPhone 15 Pro Max 256GB VN/A có giá niêm yết chính hãng từ 29.990.000đ.';
      } else if (lower.includes('macbook') || lower.includes('mac')) {
        botReply = '💻 MacBook Pro 16 inch M3 Max với 36GB RAM có giá 58.990.000đ.';
      }
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0071e3, #42a5f5)',
          color: '#fff',
          fontSize: '1.5rem',
          boxShadow: '0 8px 25px rgba(0, 113, 227, 0.4)',
          zIndex: 300,
          cursor: 'pointer',
          border: 'none'
        }}
      >
        💬
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 96,
          right: 28,
          width: 360,
          height: 480,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(25px)',
          borderRadius: 24,
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.6)',
          zIndex: 310,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#f5f5f7',
            padding: '14px 18px',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>
            <div> Apple Intelligence</div>
            <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, idx) => (
              <div key={idx} style={{
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: 16,
                fontSize: '0.88rem',
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                background: m.sender === 'user' ? '#0071e3' : '#e9e9eb',
                color: m.sender === 'user' ? '#fff' : '#1d1d1f'
              }}>
                {m.text}
              </div>
            ))}
          </div>

          <div style={{ padding: 12, background: '#f5f5f7', display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Hỏi Apple Intelligence..."
              style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 999, padding: '8px 16px', fontSize: '0.85rem' }}
            />
            <button onClick={handleSend} style={{ background: '#0071e3', color: '#fff', border: 'none', borderRadius: 999, padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer' }}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};
