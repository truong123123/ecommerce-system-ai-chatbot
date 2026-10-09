'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './adminLayout.module.css';
import { authService, UserSession } from '../../services/authService';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    // Kiểm tra nghiêm ngặt quyền Admin
    if (!currentUser || currentUser.role !== 'admin') {
      router.replace('/login?from=' + encodeURIComponent(pathname));
      return;
    }
    setUser(currentUser);
    setIsCheckingAuth(false);
  }, [router, pathname]);

  const handleLogout = () => {
    authService.logout();
    router.replace('/login');
  };

  if (isCheckingAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f111a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Đang tải hệ thống quản trị...
      </div>
    );
  }

  const navItems = [
    { label: 'Tổng quan (Dashboard)', href: '/admin', icon: '📊' },
    { label: 'Quản lý Danh mục', href: '/admin/categories', icon: '📁' },
    { label: 'Quản lý Thương hiệu', href: '/admin/brands', icon: '🏷️' },
    { label: 'Quản lý Sản phẩm', href: '/admin/products', icon: '📦' },
    { label: 'Quản lý Flash Sale', href: '/admin/flash-sale', icon: '⚡' },
    { label: 'Quản lý Mã giảm giá', href: '/admin/coupons', icon: '🏷️' },
    { label: 'Quản lý Tồn kho', href: '/admin/inventory', icon: '📊' },
    { label: 'Kiểm duyệt Đánh giá', href: '/admin/reviews', icon: '⭐' },
    { label: 'Quản lý Điện Thoại & Tablet', href: '/admin/category-showcase', icon: '📱' },
    { label: 'Quản lý Laptop & Máy Tính', href: '/admin/laptop-showcase', icon: '💻' },
    { label: 'Quản lý Đồng Hồ & Âm Thanh', href: '/admin/watch-showcase', icon: '⌚' },
  ];

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar bên trái */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>⚡</div>
          <div className={styles.brandName}>E-Store Admin</div>
        </div>

        <nav className={styles.navMenu}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content bên phải */}
      <div className={styles.mainWrapper}>
        <header className={styles.topHeader}>
          <div className={styles.headerTitle}>HỆ THỐNG QUẢN TRỊ BÁN HÀNG</div>

          <div className={styles.headerActions}>
            <Link href="/" className={styles.storeLink} target="_blank">
              <span>🛒</span> Xem Trang Khách Hàng
            </Link>

            <div className={styles.userBadge}>
              <div className={styles.userAvatar}>A</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.name || 'Admin'}</span>
                <span className={styles.userRole}>Quản trị viên (Staff)</span>
              </div>
            </div>
          </div>
        </header>

        <main className={styles.contentArea}>{children}</main>
      </div>
    </div>
  );
}
