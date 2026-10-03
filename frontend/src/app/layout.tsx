import './globals.css';
import { Inter } from 'next/font/google';
import { LayoutShell } from '../components/navigation/LayoutShell';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
});

export const metadata = {
  title: 'truongngstore - Hệ thống bán lẻ công nghệ chính hãng',
  description: 'Khám phá thế giới công nghệ, điện thoại, laptop, phụ kiện chính hãng giá tốt.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.className}>
      <body style={{ margin: 0, padding: 0 }} className={inter.className}>
        <LayoutShell>
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}
