'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const LayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  // Các trang riêng biệt không được có Navbar và Footer của trang bán hàng (Login, Admin)
  const isStandalonePage = pathname.startsWith('/login') || pathname.startsWith('/admin');

  if (isStandalonePage) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        {children}
      </div>
      <Footer />
    </div>
  );
};
