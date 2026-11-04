export type StaffRole = 'admin' | 'manager' | 'sales' | 'warehouse' | 'support' | 'accountant';

export interface AdminNavItem {
  id: string;
  label: string;
  href?: string;
  icon: string;
  badge?: string;
  allowedRoles: StaffRole[];
  children?: {
    id: string;
    label: string;
    href: string;
    icon?: string;
    allowedRoles: StaffRole[];
  }[];
}

export interface AdminNavGroup {
  id: string;
  title: string;
  items: AdminNavItem[];
}

export const ADMIN_NAVIGATION: AdminNavGroup[] = [
  {
    id: 'group_overview',
    title: '1. Tổng quan & Báo cáo',
    items: [
      {
        id: 'mod_dashboard',
        label: 'Dashboard',
        href: '/admin',
        icon: '📊',
        allowedRoles: ['admin', 'manager', 'sales', 'warehouse', 'support', 'accountant'],
      },
    ],
  },
  {
    id: 'group_catalog',
    title: '2. Hàng hóa & Danh mục',
    items: [
      {
        id: 'mod_products',
        label: 'Sản phẩm (Products)',
        href: '/admin/products',
        icon: '📦',
        allowedRoles: ['admin', 'manager'],
      },
      {
        id: 'mod_categories_brands',
        label: 'Danh mục & Thương hiệu',
        icon: '📁',
        allowedRoles: ['admin', 'manager'],
        children: [
          {
            id: 'sub_categories',
            label: 'Quản lý Danh mục',
            href: '/admin/categories',
            icon: '📂',
            allowedRoles: ['admin', 'manager'],
          },
          {
            id: 'sub_brands',
            label: 'Quản lý Thương hiệu',
            href: '/admin/brands',
            icon: '🏷️',
            allowedRoles: ['admin', 'manager'],
          },
        ],
      },
    ],
  },
  {
    id: 'group_sales',
    title: '3. Bán hàng & Giao dịch',
    items: [
      {
        id: 'mod_orders',
        label: 'Đơn hàng (Orders)',
        href: '/admin/orders',
        icon: '📑',
        allowedRoles: ['admin', 'manager', 'sales', 'warehouse', 'accountant'],
      },
      {
        id: 'mod_payments',
        label: 'Thanh toán (Payments)',
        href: '/admin/payments',
        icon: '💳',
        allowedRoles: ['admin', 'manager', 'accountant'],
      },
      {
        id: 'mod_customers',
        label: 'Khách hàng (Customers)',
        href: '/admin/customers',
        icon: '👥',
        allowedRoles: ['admin', 'manager', 'sales', 'support'],
      },
    ],
  },
  {
    id: 'group_logistics',
    title: '4. Kho vận & Địa bàn',
    items: [
      {
        id: 'mod_inventory',
        label: 'Tồn kho (Inventory)',
        href: '/admin/inventory',
        icon: '🏢',
        allowedRoles: ['admin', 'manager', 'warehouse'],
      },
      {
        id: 'mod_stores',
        label: 'Cửa hàng (Stores)',
        href: '/admin/stores',
        icon: '🏪',
        allowedRoles: ['admin', 'manager', 'warehouse'],
      },
    ],
  },
  {
    id: 'group_marketing',
    title: '5. Marketing & Khách hàng',
    items: [
      {
        id: 'mod_coupons',
        label: 'Khuyến mãi & Mã giảm giá',
        href: '/admin/coupons',
        icon: '🎟️',
        allowedRoles: ['admin', 'manager', 'sales'],
      },
      {
        id: 'mod_flash_sale',
        label: 'Chiến dịch Flash Sale',
        href: '/admin/flash-sale',
        icon: '⚡',
        allowedRoles: ['admin', 'manager'],
      },
      {
        id: 'mod_banners_showcase',
        label: 'Banners & Showcase',
        icon: '🖼️',
        allowedRoles: ['admin', 'manager'],
        children: [
          {
            id: 'sub_banners',
            label: 'Quản lý Banner',
            href: '/admin/banners',
            icon: '🎨',
            allowedRoles: ['admin', 'manager'],
          },
          {
            id: 'sub_showcase_phones',
            label: 'Showcase Điện thoại & Tablet',
            href: '/admin/category-showcase',
            icon: '📱',
            allowedRoles: ['admin', 'manager'],
          },
          {
            id: 'sub_showcase_laptops',
            label: 'Showcase Laptop & Máy tính',
            href: '/admin/laptop-showcase',
            icon: '💻',
            allowedRoles: ['admin', 'manager'],
          },
          {
            id: 'sub_showcase_watches',
            label: 'Showcase Đồng hồ & Âm thanh',
            href: '/admin/watch-showcase',
            icon: '⌚',
            allowedRoles: ['admin', 'manager'],
          },
        ],
      },
      {
        id: 'mod_reviews',
        label: 'Kiểm duyệt Đánh giá',
        href: '/admin/reviews',
        icon: '⭐',
        allowedRoles: ['admin', 'manager', 'support'],
      },
    ],
  },
  {
    id: 'group_system',
    title: '6. Vận hành & Hệ thống',
    items: [
      {
        id: 'mod_support',
        label: 'Hỗ trợ & Khiếu nại (CSKH)',
        href: '/admin/support',
        icon: '🎧',
        allowedRoles: ['admin', 'manager', 'support'],
      },
      {
        id: 'mod_staff',
        label: 'Tài khoản & Phân quyền',
        href: '/admin/staff',
        icon: '🛡️',
        allowedRoles: ['admin'],
      },
      {
        id: 'mod_settings',
        label: 'Cấu hình hệ thống',
        href: '/admin/settings',
        icon: '⚙️',
        allowedRoles: ['admin'],
      },
    ],
  },
];

export function normalizeStaffRole(role?: string | null): StaffRole | null {
  if (!role) return null;
  const r = role.trim().toLowerCase();
  if (['admin', 'manager', 'sales', 'warehouse', 'support', 'accountant'].includes(r)) {
    return r as StaffRole;
  }
  return null;
}

export function isStaffRole(role?: string | null): boolean {
  return normalizeStaffRole(role) !== null;
}

export function hasRoleAccess(role: string | null | undefined, allowedRoles: StaffRole[]): boolean {
  const norm = normalizeStaffRole(role);
  if (!norm) return false;
  if (norm === 'admin') return true;
  return allowedRoles.includes(norm);
}

export function canAccessAdminRoute(role: string | null | undefined, pathname: string): boolean {
  const norm = normalizeStaffRole(role);
  if (!norm) return false;
  if (norm === 'admin') return true;

  for (const group of ADMIN_NAVIGATION) {
    for (const item of group.items) {
      if (item.href && (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)))) {
        return hasRoleAccess(norm, item.allowedRoles);
      }
      if (item.children) {
        for (const sub of item.children) {
          if (pathname === sub.href || pathname.startsWith(sub.href)) {
            return hasRoleAccess(norm, sub.allowedRoles);
          }
        }
      }
    }
  }

  return norm === 'admin' || norm === 'manager';
}

export function getFilteredNavigation(role: string | null | undefined): AdminNavGroup[] {
  const norm = normalizeStaffRole(role);
  if (!norm) return [];

  return ADMIN_NAVIGATION.map((group) => {
    const filteredItems = group.items
      .map((item) => {
        if (item.children) {
          const visibleChildren = item.children.filter((sub) => hasRoleAccess(norm, sub.allowedRoles));
          if (visibleChildren.length > 0) {
            return {
              ...item,
              children: visibleChildren,
            };
          }
          return null;
        }

        if (hasRoleAccess(norm, item.allowedRoles)) {
          return item;
        }
        return null;
      })
      .filter((item): item is AdminNavItem => item !== null);

    return {
      ...group,
      items: filteredItems,
    };
  }).filter((group) => group.items.length > 0);
}

export const ROLE_LABELS: Record<StaffRole, string> = {
  admin: 'Quản trị viên cấp cao (Admin)',
  manager: 'Quản lý cửa hàng (Manager)',
  sales: 'Nhân viên kinh doanh (Sales)',
  warehouse: 'Quản lý kho vận (Warehouse)',
  support: 'Chăm sóc khách hàng (Support)',
  accountant: 'Kế toán & Tài chính (Accountant)',
};

