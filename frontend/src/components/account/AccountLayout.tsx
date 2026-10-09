'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  Tag,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Home
} from 'lucide-react';
import { authService, UserSession } from '../../services/authService';
import { accountService, CustomerProfile } from '../../services/accountService';
import styles from './AccountLayout.module.css';

interface AccountLayoutProps {
  children: React.ReactNode;
  title?: string;
  actionButton?: React.ReactNode;
}

export const AccountLayout: React.FC<AccountLayoutProps> = ({ children, title, actionButton }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = authService.getCurrentUser();
    if (!session) {
      router.replace('/login?from=' + encodeURIComponent(pathname));
      return;
    }
    setUser(session);

    accountService.getProfile()
      .then((data) => setProfile(data))
      .catch(() => {
        // Fallback or session expired
      })
      .finally(() => setLoading(false));
  }, [router, pathname]);

  const handleLogout = () => {
    authService.logout();
    router.replace('/login');
  };

  const navItems = [
    { label: 'Tổng quan tài khoản', href: '/account', icon: Home },
    { label: 'Thông tin cá nhân', href: '/account/profile', icon: User },
    { label: 'Đơn hàng của tôi', href: '/account/orders', icon: ShoppingBag, badge: profile?.orderCount },
    { label: 'Sổ địa chỉ nhận hàng', href: '/account/address', icon: MapPin },
    { label: 'Sản phẩm yêu thích', href: '/account/wishlist', icon: Heart, badge: profile?.wishlistCount },
    { label: 'Mã giảm giá của tôi', href: '/account/coupons', icon: Tag },
    { label: 'Đổi mật khẩu & Bảo mật', href: '/account/security', icon: ShieldCheck },
  ];

  if (loading && !user) {
    return (
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 16px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  const initialLetter = (profile?.fullName || user?.name || 'K').charAt(0).toUpperCase();

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link href="/account">Tài khoản</Link>
        {title && (
          <>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--color-text-title)', fontWeight: 500 }}>{title}</span>
          </>
        )}
      </nav>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{initialLetter}</div>
            <div>
              <div className={styles.userName}>{profile?.fullName || user?.name || 'Khách hàng'}</div>
              <span className={styles.userTier}>{profile?.tierName || 'Thành viên Thường'}</span>
            </div>
          </div>

          <nav className={styles.navMenu}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                >
                  <Icon size={18} strokeWidth={2} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={styles.badge}>{item.badge}</span>
                  )}
                </Link>
              );
            })}

            <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
              <LogOut size={18} strokeWidth={2} />
              <span>Đăng xuất</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.content}>
          {title && (
            <div className={styles.pageTitle}>
              <span>{title}</span>
              {actionButton}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};
