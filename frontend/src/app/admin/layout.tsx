'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './adminLayout.module.css';
import { authService, UserSession } from '../../services/authService';
import {
  getFilteredNavigation,
  canAccessAdminRoute,
  isStaffRole,
  normalizeStaffRole,
  ROLE_LABELS,
} from '../../lib/rbac';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<UserSession | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 1. Kiểm tra xác thực & vai trò nhân sự
  useEffect(() => {
    let mounted = true;

    async function verifyAuth() {
      // Ưu tiên session bộ nhớ
      let currentUser = authService.getCurrentUser();
      if (!currentUser) {
        currentUser = await authService.fetchCurrentUser();
      }

      if (!mounted) return;

      // Nếu chưa đăng nhập hoặc không phải vai trò nhân viên (Staff) -> Chuyển về login
      if (!currentUser || !isStaffRole(currentUser.role)) {
        router.replace('/login?from=' + encodeURIComponent(pathname));
        return;
      }

      setUser(currentUser);
      setIsCheckingAuth(false);
    }

    verifyAuth();

    return () => {
      mounted = false;
    };
  }, [router, pathname]);

  // 2. Tự động mở submenu nếu route hiện tại nằm trong submenu đó
  useEffect(() => {
    // Đóng drawer trên mobile mỗi khi đổi route
    setIsDrawerOpen(false);

    if (pathname.includes('/categories') || pathname.includes('/brands')) {
      setOpenSubmenus((prev) => ({ ...prev, mod_categories_brands: true }));
    }
    if (
      pathname.includes('/banners') ||
      pathname.includes('showcase')
    ) {
      setOpenSubmenus((prev) => ({ ...prev, mod_banners_showcase: true }));
    }
  }, [pathname]);

  const toggleSubmenu = (itemId: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      router.replace('/login');
    } catch {
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  // 3. Lọc danh sách menu theo vai trò người dùng (RBAC)
  const navGroups = useMemo(() => {
    if (!user) return [];
    return getFilteredNavigation(user.role);
  }, [user]);

  // 4. Kiểm tra quyền truy cập route hiện tại (RBAC URL Guard)
  const isRouteAuthorized = useMemo(() => {
    if (!user) return true;
    return canAccessAdminRoute(user.role, pathname);
  }, [user, pathname]);

  if (isCheckingAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0b0d14', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #334155', borderTopColor: '#e30019', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Đang xác thực quyền quản trị...</span>
        </div>
      </div>
    );
  }

  const staffRoleKey = normalizeStaffRole(user?.role);
  const roleDisplay = staffRoleKey ? ROLE_LABELS[staffRoleKey] : 'Nhân sự';

  return (
    <div className={styles.adminContainer}>
      {/* Backdrop trên Mobile khi mở Drawer */}
      <div
        className={`${styles.drawerBackdrop} ${isDrawerOpen ? styles.drawerBackdropVisible : ''}`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Sidebar / Drawer */}
      <aside className={`${styles.sidebar} ${isDrawerOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>⚡</div>
          <div className={styles.brandName}>
            <span>TruongStore</span>
            <span className={styles.brandSubtext}>Admin Portal</span>
          </div>
        </div>

        <nav className={styles.navScrollArea}>
          {navGroups.map((group) => (
            <div key={group.id} className={styles.navGroup}>
              <div className={styles.navGroupTitle}>{group.title}</div>

              {group.items.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isSubmenuOpen = !!openSubmenus[item.id];

                if (hasChildren) {
                  const isAnyChildActive = item.children?.some(
                    (child) => pathname === child.href || pathname.startsWith(child.href)
                  );

                  return (
                    <div key={item.id}>
                      <button
                        type="button"
                        className={`${styles.navItem} ${isAnyChildActive ? styles.navItemActive : ''}`}
                        onClick={() => toggleSubmenu(item.id)}
                      >
                        <div className={styles.navItemLeft}>
                          <span className={styles.navIcon}>{item.icon}</span>
                          <span className={styles.navLabel}>{item.label}</span>
                        </div>
                        <span className={`${styles.chevron} ${isSubmenuOpen ? styles.chevronOpen : ''}`}>
                          ▶
                        </span>
                      </button>

                      {isSubmenuOpen && (
                        <div className={styles.submenu}>
                          {item.children?.map((sub) => {
                            const isSubActive = pathname === sub.href;
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                className={`${styles.submenuItem} ${isSubActive ? styles.submenuItemActive : ''}`}
                              >
                                {sub.icon && <span>{sub.icon}</span>}
                                <span>{sub.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href || '');

                return (
                  <Link
                    key={item.href || item.id}
                    href={item.href || '/admin'}
                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                  >
                    <div className={styles.navItemLeft}>
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span className={styles.navLabel}>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={() => setShowLogoutConfirm(true)}>
            <span>🚪</span> Đăng xuất hệ thống
          </button>
        </div>
      </aside>

      {/* Khu vực nội dung bên phải */}
      <div className={styles.mainWrapper}>
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.hamburgerBtn}
              onClick={() => setIsDrawerOpen(true)}
              title="Mở menu"
            >
              ☰
            </button>
            <div className={styles.headerTitle}>
              <span>HỆ THỐNG QUẢN TRỊ E-COMMERCE</span>
              <span className={styles.headerBadge}>Giai đoạn 1</span>
            </div>
          </div>

          <div className={styles.headerActions}>
            <Link href="/" className={styles.storeLink} target="_blank">
              <span>🛒</span> Xem Storefront
            </Link>

            <div className={styles.userBadge}>
              <div className={styles.userAvatar}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.name || 'Nhân viên'}</span>
                <span className={styles.userRole}>{roleDisplay}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Nội dung trang hoặc màn hình chặn quyền (403 Forbidden) */}
        <main className={styles.contentArea}>
          {!isRouteAuthorized ? (
            <div className={styles.forbiddenCard}>
              <div className={styles.forbiddenIcon}>🚫</div>
              <h2 className={styles.forbiddenTitle}>Truy cập bị từ chối (403 Forbidden)</h2>
              <p className={styles.forbiddenDesc}>
                Tài khoản của bạn với vai trò <strong>{roleDisplay}</strong> không có quyền truy cập vào phân hệ này.
                Vui lòng liên hệ Quản trị viên cấp cao (Admin) nếu bạn cần được cấp quyền thao tác.
              </p>
              <Link href="/admin" className={styles.backHomeBtn}>
                <span>📊</span> Quay về Dashboard Tổng quan
              </Link>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Modal xác nhận đăng xuất */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi cổng Quản trị viên E-Store không?"
        confirmText="Đăng xuất"
        cancelText="Ở lại"
        variant="danger"
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
