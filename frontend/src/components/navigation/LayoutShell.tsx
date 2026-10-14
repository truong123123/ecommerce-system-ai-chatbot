'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingCompareBar } from '../compare/FloatingCompareBar';

const AiChatbox = dynamic(
  () => import('../chat/AiChatbox').then((mod) => mod.AiChatbox),
  { ssr: false }
);

export const LayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  // Các trang riêng biệt không được có Navbar và Footer của trang bán hàng (Login, Admin)
  const isStandalonePage = pathname.startsWith('/login') || pathname.startsWith('/admin');

  if (isStandalonePage) {
    return <>{children}</>;
  }

  // Ẩn chatbot ở trang thanh toán để không che các nút và thông tin thanh toán quan trọng
  const hideChatbot = pathname.startsWith('/checkout');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        {children}
      </div>
      <Footer />
      <FloatingCompareBar />
      {!hideChatbot && <AiChatbox />}
    </div>
  );
};
