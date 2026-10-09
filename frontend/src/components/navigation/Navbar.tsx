'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Menu, X, ChevronRight, User, CircleUser, LayoutGrid, ChevronDown, MapPin, Check, LogOut } from 'lucide-react';
import styles from './Navbar.module.css';
import { categoryService } from '../../services/categoryService';
import { brandService } from '../../services/brandService';
import { productService } from '../../services/productService';
import { useCartStore } from '../../store/cartStore';
import { authService, UserSession } from '../../services/authService';

const getDisplayName = (user: UserSession): string => {
  if (!user || !user.name) {
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Tài khoản';
  }
  const trimmed = user.name.trim();
  const parts = trimmed.split(/\s+/);
  return parts[parts.length - 1] || trimmed;
};

interface SubMenuItem {
  title: string;
  href: string;
  isHeader?: boolean;
  badge?: 'new' | 'hot' | 'sale';
}

interface MegaMenuColumn {
  title: string;
  items: SubMenuItem[];
  isPrice?: boolean;
}

interface CategoryMegaMenu {
  columns: MegaMenuColumn[];
}

interface NavCategory {
  id: string;
  name: string;
  href: string;
  columns: {
    title: string;
    items: SubMenuItem[];
  }[];
}

interface CategoryMenuItem {
  id: string;
  title: string;
  href: string;
  icon: string;
}

const DEFAULT_CATEGORY_ITEMS: CategoryMenuItem[] = [
  { id: 'phone-tablet', title: 'Điện thoại, Tablet', href: '/category/phone-tablet', icon: '📱' },
  { id: 'laptop', title: 'Laptop', href: '/category/laptop', icon: '💻' },
  { id: 'audio', title: 'Âm thanh, Mic thu âm', href: '/category/audio', icon: '🎧' },
  { id: 'watch-camera', title: 'Đồng hồ, Camera', href: '/category/watch-camera', icon: '⌚' },
  { id: 'accessories', title: 'Phụ kiện', href: '/category/accessories', icon: '🔌' },
  { id: 'pc-monitor', title: 'PC, Màn hình, Máy in', href: '/category/pc-monitor', icon: '🖥️' },
  { id: 'tv-appliances', title: 'Tivi, Điện máy', href: '/category/tv-appliances', icon: '📺' },
];

const PROVINCES = [
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Cần Thơ',
  'Hải Phòng',
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
  'Bình Dương',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Tĩnh',
  'Hải Dương',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
];

const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'store',
    name: 'Cửa Hàng',
    href: '/store',
    columns: [
      {
        title: 'Mua sắm',
        items: [
          { title: 'Mua sản phẩm mới nhất', href: '/store' },
          { title: 'Mac', href: '/mac' },
          { title: 'iPad', href: '/ipad' },
          { title: 'iPhone', href: '/iphone' },
          { title: 'Apple Watch', href: '/watch' },
          { title: 'Accessories', href: '/accessories' },
        ]
      },
      {
        title: 'Đường dẫn nhanh',
        items: [
          { title: 'Tìm cửa hàng', href: '/stores' },
          { title: 'Trạng thái đơn hàng', href: '/account/orders' },
          { title: 'Apple Trade In', href: '#' },
          { title: 'Tài chính', href: '#' },
        ]
      }
    ]
  },
  {
    id: 'mac',
    name: 'Mac',
    href: '/mac',
    columns: [
      {
        title: 'Khám phá Mac',
        items: [
          { title: 'Khám phá tất cả Mac', href: '/mac' },
          { title: 'MacBook Air', href: '#' },
          { title: 'MacBook Pro', href: '#' },
          { title: 'iMac', href: '#' },
          { title: 'Mac mini', href: '#' },
          { title: 'Mac Studio', href: '#' },
          { title: 'Mac Pro', href: '#' },
          { title: 'Displays', href: '#' },
        ]
      },
      {
        title: 'Mua Mac',
        items: [
          { title: 'Mua Mac', href: '#' },
          { title: 'Phụ kiện Mac', href: '#' },
          { title: 'Apple Trade In', href: '#' },
        ]
      }
    ]
  },
  {
    id: 'ipad',
    name: 'iPad',
    href: '/ipad',
    columns: [
      {
        title: 'Khám phá iPad',
        items: [
          { title: 'Khám phá tất cả iPad', href: '/ipad' },
          { title: 'iPad Pro', href: '#' },
          { title: 'iPad Air', href: '#' },
          { title: 'iPad', href: '#' },
          { title: 'iPad mini', href: '#' },
          { title: 'Apple Pencil', href: '#' },
          { title: 'Keyboards', href: '#' },
        ]
      },
      {
        title: 'Mua iPad',
        items: [
          { title: 'Mua iPad', href: '#' },
          { title: 'Phụ kiện iPad', href: '#' },
        ]
      }
    ]
  },
  {
    id: 'iphone',
    name: 'iPhone',
    href: '/iphone',
    columns: [
      {
        title: 'Khám phá iPhone',
        items: [
          { title: 'Khám phá tất cả iPhone', href: '/iphone' },
          { title: 'iPhone 15 Pro', href: '#' },
          { title: 'iPhone 15', href: '#' },
          { title: 'iPhone 14', href: '#' },
          { title: 'iPhone 13', href: '#' },
          { title: 'iPhone SE', href: '#' },
        ]
      },
      {
        title: 'Mua iPhone',
        items: [
          { title: 'Mua iPhone', href: '#' },
          { title: 'Phụ kiện iPhone', href: '#' },
          { title: 'Apple Trade In', href: '#' },
        ]
      }
    ]
  },
  {
    id: 'watch',
    name: 'Watch',
    href: '/watch',
    columns: [
      {
        title: 'Khám phá Watch',
        items: [
          { title: 'Khám phá tất cả Apple Watch', href: '/watch' },
          { title: 'Apple Watch Series 9', href: '#' },
          { title: 'Apple Watch Ultra 2', href: '#' },
          { title: 'Apple Watch SE', href: '#' },
          { title: 'Apple Watch Nike', href: '#' },
        ]
      },
      {
        title: 'Mua Watch',
        items: [
          { title: 'Mua Apple Watch', href: '#' },
          { title: 'Dây đeo Apple Watch', href: '#' },
          { title: 'Phụ kiện Watch', href: '#' },
        ]
      }
    ]
  },
  {
    id: 'airpods',
    name: 'AirPods',
    href: '/airpods',
    columns: [
      {
        title: 'Khám phá AirPods',
        items: [
          { title: 'Khám phá tất cả AirPods', href: '/airpods' },
          { title: 'AirPods Pro thế hệ thứ 2', href: '#' },
          { title: 'AirPods thế hệ thứ 3', href: '#' },
          { title: 'AirPods thế hệ thứ 2', href: '#' },
          { title: 'AirPods Max', href: '#' },
        ]
      },
      {
        title: 'Mua AirPods',
        items: [
          { title: 'Mua AirPods', href: '#' },
          { title: 'Phụ kiện AirPods', href: '#' },
        ]
      }
    ]
  },
  {
    id: 'tv-home',
    name: 'TV & Nhà',
    href: '/tv-home',
    columns: [
      {
        title: 'Khám phá TV & Nhà',
        items: [
          { title: 'Khám phá TV & Nhà', href: '/tv-home' },
          { title: 'Apple TV 4K', href: '#' },
          { title: 'HomePod', href: '#' },
          { title: 'HomePod mini', href: '#' },
        ]
      }
    ]
  },
  {
    id: 'entertainment',
    name: 'Giải Trí',
    href: '/entertainment',
    columns: [
      {
        title: 'Khám phá Giải Trí',
        items: [
          { title: 'Apple One', href: '#' },
          { title: 'Apple TV+', href: '#' },
          { title: 'Apple Music', href: '#' },
          { title: 'Apple Arcade', href: '#' },
          { title: 'Apple Podcasts', href: '#' },
          { title: 'Apple Books', href: '#' },
        ]
      }
    ]
  },
  {
    id: 'accessories',
    name: 'Phụ Kiện',
    href: '/accessories',
    columns: [
      {
        title: 'Mua phụ kiện',
        items: [
          { title: 'Mua tất cả phụ kiện', href: '/accessories' },
          { title: 'Phụ kiện Mac', href: '#' },
          { title: 'Phụ kiện iPad', href: '#' },
          { title: 'Phụ kiện iPhone', href: '#' },
          { title: 'Phụ kiện Apple Watch', href: '#' },
        ]
      }
    ]
  },
  {
    id: 'support',
    name: 'Hỗ Trợ',
    href: '/support',
    columns: [
      {
        title: 'Trợ giúp',
        items: [
          { title: 'Hỗ trợ iPhone', href: '#' },
          { title: 'Hỗ trợ Mac', href: '#' },
          { title: 'Hỗ trợ iPad', href: '#' },
          { title: 'Hỗ trợ Watch', href: '#' },
          { title: 'Quên ID Apple hoặc mật khẩu', href: '#' },
          { title: 'Sửa chữa Apple', href: '#' },
        ]
      }
    ]
  }
];

let cachedMegaMenuData: {
  categoryItems: CategoryMenuItem[];
  categoryMegaMenus: Record<string, CategoryMegaMenu>;
} | null = null;

export const clearNavbarMegaMenuCache = () => {
  cachedMegaMenuData = null;
};

export const Navbar: React.FC = () => {
  const [categoryItems, setCategoryItems] = useState<CategoryMenuItem[]>(() => {
    return cachedMegaMenuData ? cachedMegaMenuData.categoryItems : DEFAULT_CATEGORY_ITEMS;
  });
  const [categoryMegaMenus, setCategoryMegaMenus] = useState<Record<string, CategoryMegaMenu>>(() => {
    return cachedMegaMenuData ? cachedMegaMenuData.categoryMegaMenus : {};
  });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const [hoveredCategoryItem, setHoveredCategoryItem] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('Hồ Chí Minh');
  const [isLocationOpen, setIsLocationOpen] = useState<boolean>(false);
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isBagOpen, setIsBagOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scrolled, setScrolled] = useState<boolean>(false);

  const { fetchCart, getTotalCount } = useCartStore();
  const cartCount = getTotalCount();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const userMenuTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCart();
    const updateSession = () => {
      setCurrentUser(authService.getCurrentUser());
    };
    updateSession();
    window.addEventListener('storage', updateSession);
    window.addEventListener('auth_changed', updateSession);
    return () => {
      window.removeEventListener('storage', updateSession);
      window.removeEventListener('auth_changed', updateSession);
    };
  }, [fetchCart]);

  const handleUserMouseEnter = () => {
    if (userMenuTimerRef.current) {
      clearTimeout(userMenuTimerRef.current);
      userMenuTimerRef.current = null;
    }
    setIsUserMenuOpen(true);
    setIsBagOpen(false);
    setIsSearchOpen(false);
  };

  const handleUserMouseLeave = () => {
    userMenuTimerRef.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 220);
  };

  const handleLogout = () => {
    authService.logout();
    setIsUserMenuOpen(false);
    setCurrentUser(null);
    if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/account') || window.location.pathname.startsWith('/admin'))) {
      window.location.href = '/login';
    }
  };

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const categoryCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const itemSwitchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActiveCategoryRef = useRef<string | null>(null);

  if (activeCategory) {
    lastActiveCategoryRef.current = activeCategory;
  }

  useEffect(() => {
    if (cachedMegaMenuData) {
      return;
    }

    let isMounted = true;
    async function loadDynamicMegaMenu() {
      try {
        const [tree, hotProds] = await Promise.all([
          categoryService.getCategoryTree(true),
          productService.fetchProducts({ isHot: true, limit: 6 }),
        ]);

        if (!isMounted) return;

        if (tree && tree.length > 0) {
          const items: CategoryMenuItem[] = tree.map((root) => ({
            id: root.slug,
            title: root.name,
            href: `/category/${root.slug}`,
            icon: root.iconUrl || '📦',
          }));
          setCategoryItems(items);

          // Lấy danh sách thương hiệu thực tế theo từng child category
          const allChildren = tree.flatMap((r) => r.children || []);
          const childBrandsMap: Record<string, any[]> = {};
          await Promise.all(
            allChildren.map(async (child) => {
              try {
                const bList = await brandService.getBrands({ categorySlug: child.slug, activeOnly: true });
                childBrandsMap[child.slug] = bList;
              } catch {
                childBrandsMap[child.slug] = [];
              }
            })
          );

          const megaMap: Record<string, CategoryMegaMenu> = {};

          for (const root of tree) {
            const columns: MegaMenuColumn[] = [];

            if (root.children && root.children.length > 0) {
              for (const child of root.children) {
                const subItems: SubMenuItem[] = [];

                if (child.children && child.children.length > 0) {
                  child.children.forEach((grand) => {
                    subItems.push({
                      title: grand.name,
                      href: `/category/${grand.slug}`,
                    });
                  });
                }

                // Các brand thực sự có sản phẩm trong child category
                const childBrands = childBrandsMap[child.slug] || [];
                if (childBrands.length > 0) {
                  childBrands.forEach((b) => {
                    if (!subItems.some((s) => s.title.toLowerCase() === b.name.toLowerCase())) {
                      subItems.push({
                        title: b.name,
                        href: `/category/${child.slug}/${b.slug}`,
                      });
                    }
                  });
                }

                if (subItems.length === 0) {
                  subItems.push({
                    title: `Xem tất cả ${child.name}`,
                    href: `/category/${child.slug}`,
                  });
                }

                columns.push({
                  title: child.name,
                  items: subItems.slice(0, 10),
                });
              }
            }

            // Cột sản phẩm HOT
            const rootHotProducts = hotProds.filter((p) => {
              const cSlug = p.categorySlug ? p.categorySlug.toLowerCase() : '';
              return (
                cSlug === root.slug ||
                (root.children && root.children.some((c) => c.slug === cSlug || (c.children && c.children.some((g) => g.slug === cSlug))))
              );
            });

            if (rootHotProducts.length > 0) {
              columns.push({
                title: `${root.name} HOT 🔥`,
                items: rootHotProducts.slice(0, 6).map((p) => ({
                  title: p.name,
                  href: `/products/${p.slug}`,
                  badge: p.isNew ? 'new' : 'hot',
                })),
              });
            }

            // Cột mức giá
            const isLaptopOrPC = root.slug.includes('laptop') || root.slug.includes('pc');
            const priceItems: SubMenuItem[] = isLaptopOrPC
              ? [
                  { title: 'Dưới 10 triệu', href: `/category/${root.slug}?maxPrice=10000000` },
                  { title: '10 - 15 triệu', href: `/category/${root.slug}?minPrice=10000000&maxPrice=15000000` },
                  { title: '15 - 20 triệu', href: `/category/${root.slug}?minPrice=15000000&maxPrice=20000000` },
                  { title: '20 - 30 triệu', href: `/category/${root.slug}?minPrice=20000000&maxPrice=30000000` },
                  { title: 'Trên 30 triệu', href: `/category/${root.slug}?minPrice=30000000` },
                ]
              : [
                  { title: 'Dưới 2 triệu', href: `/category/${root.slug}?maxPrice=2000000` },
                  { title: 'Từ 2 - 4 triệu', href: `/category/${root.slug}?minPrice=2000000&maxPrice=4000000` },
                  { title: 'Từ 4 - 7 triệu', href: `/category/${root.slug}?minPrice=4000000&maxPrice=7000000` },
                  { title: 'Từ 7 - 13 triệu', href: `/category/${root.slug}?minPrice=7000000&maxPrice=13000000` },
                  { title: 'Từ 13 - 20 triệu', href: `/category/${root.slug}?minPrice=13000000&maxPrice=20000000` },
                  { title: 'Trên 20 triệu', href: `/category/${root.slug}?minPrice=20000000` },
                ];

            columns.push({
              title: `Mức giá ${root.name}`,
              isPrice: true,
              items: priceItems,
            });

            megaMap[root.slug] = { columns };
          }

          cachedMegaMenuData = {
            categoryItems: items,
            categoryMegaMenus: megaMap,
          };
          setCategoryMegaMenus(megaMap);
        }
      } catch (err) {
        console.error('Lỗi tải Mega Menu động:', err);
      }
    }

    loadDynamicMegaMenu();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('user_location');
      if (saved) setSelectedLocation(saved);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectLocation = (province: string) => {
    setSelectedLocation(province);
    try {
      localStorage.setItem('user_location', province);
    } catch {
      // ignore
    }
    setIsLocationOpen(false);
    setLocationSearch('');
  };

  const filteredProvinces = PROVINCES.filter((p) =>
    p.toLowerCase().includes(locationSearch.toLowerCase().trim())
  );

  const handleMouseEnterCategory = () => {
    if (categoryCloseTimerRef.current) {
      clearTimeout(categoryCloseTimerRef.current);
      categoryCloseTimerRef.current = null;
    }
    if (itemSwitchTimerRef.current) {
      clearTimeout(itemSwitchTimerRef.current);
      itemSwitchTimerRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsCategoryOpen(true);
    setIsLocationOpen(false);
    setActiveCategory(null);
    setIsSearchOpen(false);
    setIsBagOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleMouseLeaveCategory = () => {
    if (itemSwitchTimerRef.current) {
      clearTimeout(itemSwitchTimerRef.current);
      itemSwitchTimerRef.current = null;
    }
    if (categoryCloseTimerRef.current) {
      clearTimeout(categoryCloseTimerRef.current);
    }
    categoryCloseTimerRef.current = setTimeout(() => {
      setIsCategoryOpen(false);
      setHoveredCategoryItem(null);
    }, 280);
  };

  const handleCategoryItemMouseEnter = (itemId: string) => {
    if (categoryCloseTimerRef.current) {
      clearTimeout(categoryCloseTimerRef.current);
      categoryCloseTimerRef.current = null;
    }

    // Nếu chưa có item nào được mở: kích hoạt ngay lập tức (0ms delay)
    if (!hoveredCategoryItem) {
      if (itemSwitchTimerRef.current) {
        clearTimeout(itemSwitchTimerRef.current);
        itemSwitchTimerRef.current = null;
      }
      setHoveredCategoryItem(itemId);
      return;
    }

    // Nếu đang là item hiện tại: không làm gì
    if (hoveredCategoryItem === itemId) {
      if (itemSwitchTimerRef.current) {
        clearTimeout(itemSwitchTimerRef.current);
        itemSwitchTimerRef.current = null;
      }
      return;
    }

    // Hover Intent: Đặt độ trễ 120ms khi chuyển sang item khác
    // Giúp khi di chuột chéo qua các item khác sang submenu bên phải thì KHÔNG bị nhảy sang item khác
    if (itemSwitchTimerRef.current) {
      clearTimeout(itemSwitchTimerRef.current);
    }
    itemSwitchTimerRef.current = setTimeout(() => {
      setHoveredCategoryItem(itemId);
      itemSwitchTimerRef.current = null;
    }, 120);
  };

  const handleSubMenuMouseEnter = () => {
    // Khi chuột đã vào submenu bên phải:
    // HỦY ngay lập tức lệnh chuyển item nếu có (khóa submenu hiện tại đang mở)
    if (itemSwitchTimerRef.current) {
      clearTimeout(itemSwitchTimerRef.current);
      itemSwitchTimerRef.current = null;
    }
    if (categoryCloseTimerRef.current) {
      clearTimeout(categoryCloseTimerRef.current);
      categoryCloseTimerRef.current = null;
    }
  };

  const handleSubMenuMouseLeave = () => {
    // Chuột rời khỏi submenu: đợi 280ms
    if (categoryCloseTimerRef.current) {
      clearTimeout(categoryCloseTimerRef.current);
    }
    categoryCloseTimerRef.current = setTimeout(() => {
      setHoveredCategoryItem(null);
    }, 280);
  };

  const handleMouseEnterItem = (catId: string) => {
    if (categoryCloseTimerRef.current) {
      clearTimeout(categoryCloseTimerRef.current);
      categoryCloseTimerRef.current = null;
    }
    setIsCategoryOpen(false);
    setIsLocationOpen(false);
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveCategory(catId);
    setIsSearchOpen(false);
    setIsBagOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleMouseLeaveNav = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 140);
  };

  const handleMouseEnterDropdown = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const isDropdownOpen = !!activeCategory;
  const currentOpenCategory = activeCategory || lastActiveCategoryRef.current;

  return (
    <>
      <header 
        className={`${styles.navHeader} ${isDropdownOpen || isSearchOpen || isBagOpen || isCategoryOpen || isLocationOpen || scrolled ? styles.navHeaderActive : ''}`}
        onMouseLeave={handleMouseLeaveNav}
      >
        {/* Main Nav Container */}
        <div className={styles.navContainer}>
          {/* Logo & Category Button Group */}
          <div className={styles.navLeft}>
            {/* Apple Logo */}
            <Link 
              href="/" 
              className={styles.navLogo}
              onMouseEnter={() => {
                setActiveCategory(null);
                setIsCategoryOpen(false);
                setIsLocationOpen(false);
                setIsBagOpen(false);
                setIsSearchOpen(false);
              }}
              aria-label="Apple Home"
            >
              <svg height="17" viewBox="0 0 17 21" width="14" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <path d="m15.575 12.308c.036 3.123 2.76 4.167 2.79 4.18-.024.08-.435 1.5-1.434 2.966-.864 1.266-1.763 2.529-3.178 2.555-1.391.026-1.84-.827-3.433-.827-1.594 0-2.09.801-3.411.853-1.368.052-2.414-1.37-3.284-2.628-1.78-2.57-3.14-7.262-1.31-10.444 0.908-1.579 2.534-2.579 4.312-2.605 1.343-.026 2.61.908 3.433.908.823 0 2.362-1.121 3.98-0.954.678.028 2.585.273 3.808 2.065-.098.06-2.274 1.325-2.25 3.431zM11.59 3.468c.613-.743 1.027-1.777.914-2.812-.884.036-1.95.589-2.585 1.332-.569.658-.96 1.714-.827 2.724 0.985.076 1.986-.501 2.498-1.244z"/>
              </svg>
            </Link>

            {/* Khối nút Danh mục & Chi nhánh (cách logo thoáng hơn) */}
            <div className={styles.navButtonGroup}>
              {/* Nút Danh mục */}
              <div 
                className={styles.categoryWrapper}
                onMouseEnter={handleMouseEnterCategory}
                onMouseLeave={handleMouseLeaveCategory}
              >
                <button 
                  className={`${styles.categoryBtn} ${isCategoryOpen ? styles.categoryBtnActive : ''}`}
                  aria-label="Danh mục sản phẩm"
                  aria-expanded={isCategoryOpen}
                  onClick={() => setIsCategoryOpen((prev) => !prev)}
                >
                  <LayoutGrid size={15} strokeWidth={2.4} />
                  <span>Danh mục</span>
                  <ChevronDown size={14} strokeWidth={2.4} className={`${styles.categoryChevron} ${isCategoryOpen ? styles.chevronRotated : ''}`} />
                </button>

                {/* Dropdown danh sách + Mega Submenu */}
                <div 
                  className={`${styles.categoryDropdown} ${isCategoryOpen ? styles.categoryDropdownOpen : ''}`}
                  onMouseEnter={handleMouseEnterCategory}
                  onMouseLeave={handleMouseLeaveCategory}
                >
                  {/* Cột trái: Danh sách danh mục chính (240px) */}
                  <div className={styles.categoryNavList}>
                    {categoryItems.map((item) => {
                      const isHovered = hoveredCategoryItem === item.id;
                      return (
                        <div
                          key={item.id}
                          className={`${styles.categoryItemWrapper} ${isHovered ? styles.categoryItemWrapperActive : ''}`}
                          onMouseEnter={() => handleCategoryItemMouseEnter(item.id)}
                        >
                          <Link
                            href={item.href}
                            className={`${styles.categoryItem} ${isHovered ? styles.categoryItemHovered : ''}`}
                            onClick={() => { setIsCategoryOpen(false); setHoveredCategoryItem(null); }}
                          >
                            <span className={styles.categoryItemIcon}>{item.icon}</span>
                            <span className={styles.categoryItemText}>{item.title}</span>
                            {categoryMegaMenus[item.id] && (
                              <ChevronRight 
                                size={13} 
                                className={`${styles.categoryItemArrow} ${isHovered ? styles.categoryItemArrowActive : ''}`} 
                              />
                            )}
                          </Link>
                        </div>
                      );
                    })}
                  </div>

                  {/* Khối Mega Submenu bên phải: neo tại top: 0 của categoryDropdown, hiển thị theo hoveredCategoryItem */}
                  {hoveredCategoryItem && categoryMegaMenus[hoveredCategoryItem] && (() => {
                    const currentMenu = categoryMegaMenus[hoveredCategoryItem];
                    const mainCols = currentMenu.columns.filter(c => !c.isPrice);
                    const priceCol = currentMenu.columns.find(c => c.isPrice);

                    return (
                      <div 
                        className={styles.megaSubmenu}
                        onMouseEnter={handleSubMenuMouseEnter}
                        onMouseLeave={handleSubMenuMouseLeave}
                      >
                        {/* Hàng trên: các cột chính */}
                        <div className={styles.megaSubmenuMain}>
                          {mainCols.map((col, colIdx) => (
                            <div key={colIdx} className={styles.megaSubmenuColumn}>
                              <div className={styles.megaSubmenuColumnTitle}>{col.title}</div>
                              <ul className={styles.megaSubmenuList}>
                                {col.items.map((subItem, subIdx) => (
                                  <li key={subIdx}>
                                    <Link
                                      href={subItem.href}
                                      className={styles.megaSubmenuItem}
                                      onClick={() => { setIsCategoryOpen(false); setHoveredCategoryItem(null); }}
                                    >
                                      <span>{subItem.title}</span>
                                      {subItem.badge && (
                                        <span className={`${styles.subItemBadge} ${styles[`badge_${subItem.badge}`]}`}>
                                          {subItem.badge === 'new' ? 'Mới' : subItem.badge === 'hot' ? 'Hot' : 'Sale'}
                                        </span>
                                      )}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Hàng dưới: cột mức giá */}
                        {priceCol && (
                          <div className={styles.megaSubmenuPriceRow}>
                            <div className={styles.megaSubmenuPriceTitle}>{priceCol.title}</div>
                            <div className={styles.megaSubmenuPriceItems}>
                              {priceCol.items.map((subItem, subIdx) => (
                                <Link
                                  key={subIdx}
                                  href={subItem.href}
                                  className={styles.megaSubmenuPriceItem}
                                  onClick={() => { setIsCategoryOpen(false); setHoveredCategoryItem(null); }}
                                >
                                  {subItem.title}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Nút Chọn chi nhánh (Tỉnh thành) */}
              <div className={styles.locationWrapper}>
                <button 
                  className={`${styles.locationBtn} ${isLocationOpen ? styles.locationBtnActive : ''}`}
                  aria-label="Chọn chi nhánh, tỉnh thành"
                  aria-expanded={isLocationOpen}
                  onClick={() => {
                    setIsLocationOpen((prev) => !prev);
                    setIsCategoryOpen(false);
                    setActiveCategory(null);
                    setIsSearchOpen(false);
                    setIsBagOpen(false);
                  }}
                >
                  <MapPin size={15} strokeWidth={2.4} />
                  <span>{selectedLocation}</span>
                  <ChevronDown size={14} strokeWidth={2.4} className={`${styles.locationChevron} ${isLocationOpen ? styles.locationChevronRotated : ''}`} />
                </button>

                {/* Modal / Dropdown chọn Tỉnh Thành */}
                {isLocationOpen && (
                  <div className={styles.locationDropdown}>
                    <div className={styles.locationHeaderBar}>
                      <div className={styles.locationSearchBox}>
                        <Search size={15} />
                        <input 
                          type="text"
                          placeholder="Nhập tên tỉnh thành..."
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          className={styles.locationSearchInput}
                          autoFocus
                        />
                      </div>
                      <button 
                        type="button" 
                        className={styles.locationCloseBtn}
                        onClick={() => setIsLocationOpen(false)}
                      >
                        Đóng <X size={15} />
                      </button>
                    </div>

                    <div className={styles.locationBody}>
                      <p className={styles.locationSubtitle}>
                        Vui lòng chọn tỉnh, thành phố để biết chính xác giá, khuyến mãi và tồn kho
                      </p>

                      <div className={styles.locationGrid}>
                        {filteredProvinces.map((prov) => {
                          const isSelected = prov === selectedLocation;
                          return (
                            <button
                              key={prov}
                              type="button"
                              className={`${styles.locationItem} ${isSelected ? styles.locationItemActive : ''}`}
                              onClick={() => handleSelectLocation(prov)}
                            >
                              <span>{prov}</span>
                              {isSelected && <Check size={14} strokeWidth={2.8} className={styles.locationCheckIcon} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className={styles.desktopNav} aria-label="Global Navigation">
            {NAV_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                onMouseEnter={() => handleMouseEnterItem(cat.id)}
                className={`${styles.navItem} ${activeCategory === cat.id ? styles.navItemActive : ''}`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions (Search & Bag) */}
          <div className={styles.actionIcons}>
            {/* Search Button */}
            <button
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                setIsBagOpen(false);
                setIsUserMenuOpen(false);
                setActiveCategory(null);
              }}
              className={styles.iconButton}
              aria-label="Tìm kiếm"
            >
              <Search size={15} strokeWidth={2.2} />
            </button>

            {/* Bag Button */}
            <button
              onClick={() => {
                setIsBagOpen(!isBagOpen);
                setIsSearchOpen(false);
                setIsUserMenuOpen(false);
                setActiveCategory(null);
              }}
              className={styles.iconButton}
              style={{ position: 'relative' }}
              aria-label="Giỏ hàng"
            >
              <ShoppingBag size={15} strokeWidth={2.2} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#d70018',
                    color: '#ffffff',
                    borderRadius: '9999px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    minWidth: '15px',
                    height: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* User / Login / Admin Button */}
            {currentUser ? (
              <div
                className={styles.userMenuWrapper}
                onMouseEnter={handleUserMouseEnter}
                onMouseLeave={handleUserMouseLeave}
              >
                <Link
                  href={currentUser.role === 'admin' ? '/admin' : '/account'}
                  className={styles.userLoggedInBtn}
                  aria-label={`Tài khoản: ${currentUser.name}`}
                  title={`Tài khoản: ${currentUser.name}`}
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <span className={styles.userLoggedInName}>{getDisplayName(currentUser)}</span>
                  <span className={styles.userLoggedInIcon}>
                    <CircleUser size={16} strokeWidth={2.2} />
                  </span>
                </Link>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className={styles.userDropdown}>
                    <div className={styles.userDropdownHeader}>
                      <div className={styles.userDropdownFullName}>{currentUser.name}</div>
                      <div className={styles.userDropdownEmail}>{currentUser.email}</div>
                    </div>
                    <div className={styles.userDropdownMenu}>
                      <Link
                        href={currentUser.role === 'admin' ? '/admin' : '/account'}
                        className={styles.userDropdownItem}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User size={15} strokeWidth={2} />
                        <span>{currentUser.role === 'admin' ? 'Trang quản trị (Admin)' : 'Thông tin tài khoản'}</span>
                      </Link>
                      <Link
                        href="/account/orders"
                        className={styles.userDropdownItem}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ShoppingBag size={15} strokeWidth={2} />
                        <span>Đơn hàng của tôi</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className={`${styles.userDropdownItem} ${styles.userDropdownItemLogout}`}
                      >
                        <LogOut size={15} strokeWidth={2} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={styles.iconButton}
                aria-label="Đăng nhập"
                title="Đăng nhập tài khoản"
              >
                <User size={15} strokeWidth={2.2} />
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={styles.mobileToggle}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mega Flyout Menu Dropdown (Pre-rendered Panels, smooth slide-up close) */}
        <div
          className={`${styles.dropdownOverlay} ${isDropdownOpen ? styles.dropdownOpen : ''}`}
          onMouseEnter={handleMouseEnterDropdown}
          onMouseLeave={handleMouseLeaveNav}
        >
          <div className={styles.dropdownInnerWrapper}>
            {NAV_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={`${styles.dropdownInner} ${currentOpenCategory === cat.id ? styles.panelVisible : styles.panelHidden}`}
              >
                {cat.columns.map((col, idx) => (
                  <div key={idx} className={styles.dropdownColumn}>
                    <h4 className={styles.columnHeading}>
                      {col.title}
                    </h4>
                    <ul className={styles.columnList}>
                      {col.items.map((item, itemIdx) => (
                        <li key={itemIdx} className={styles.columnListItem}>
                          <Link 
                            href={item.href}
                            className={itemIdx === 0 ? styles.primaryMenuItem : styles.secondaryMenuItem}
                            onClick={() => setActiveCategory(null)}
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Search Overlay */}
        {isSearchOpen && (
          <div className={styles.searchDropdown}>
            <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 20px' }}>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderBottom: '2px solid #0066cc',
                  paddingBottom: '8px',
                }}
              >
                <Search size={20} color="#0066cc" />
                <input
                  type="text"
                  placeholder="Tìm kiếm apple.com hoặc hỗ trợ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: '18px',
                    fontWeight: 500,
                    background: 'transparent',
                    color: '#1d1d1f'
                  }}
                />
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.5)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quick Links in Search */}
              <div style={{ marginTop: '24px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.48)', marginBottom: '12px', fontWeight: 500 }}>
                  Liên kết nhanh
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Tìm cửa hàng Apple Store', 'Phụ kiện cho iPhone 15 Pro', 'Apple Trade In', 'Hỗ trợ AppleCare+'].map((text, i) => (
                    <Link 
                      key={i} 
                      href="#" 
                      onClick={() => setIsSearchOpen(false)}
                      style={{ 
                        fontSize: '14px', 
                        color: '#1d1d1f', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        padding: '4px 0'
                      }}
                    >
                      <ChevronRight size={14} color="#0066cc" />
                      <span>{text}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Shopping Bag Dropdown */}
        {isBagOpen && (
          <div className={styles.bagDropdown}>
            <div style={{ textAlign: 'center', padding: '16px 0', color: 'rgba(0,0,0,0.8)', fontSize: '14px', fontWeight: 600 }}>
              {cartCount > 0
                ? `Giỏ hàng của bạn (${cartCount} sản phẩm)`
                : 'Giỏ hàng của bạn đang trống.'}
            </div>
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link 
                href="/cart" 
                style={{ fontSize: '13px', color: '#d70018', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setIsBagOpen(false)}
              >
                <ShoppingBag size={14} />
                <span>Vào Xem Giỏ Hàng</span>
              </Link>
              <Link 
                href="/orders" 
                style={{ fontSize: '13px', color: '#0066cc', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setIsBagOpen(false)}
              >
                <span>Đơn Hàng Đã Mua</span>
              </Link>
            </div>
          </div>
        )}

        {/* Mobile Vertical Navigation Overlay */}
        {isMobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              top: '44px',
              left: 0,
              width: '100vw',
              height: 'calc(100vh - 44px)',
              backgroundColor: '#ffffff',
              padding: '24px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              overflowY: 'auto',
              animation: 'fadeIn 0.25s ease-out',
              zIndex: 9998
            }}
            className="apple-mobile-menu"
          >
            {NAV_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#1d1d1f',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(0,0,0,0.06)'
                }}
              >
                {cat.name}
              </Link>
            ))}

            {currentUser ? (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <Link
                  href={currentUser.role === 'admin' ? '/admin' : '/account'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#0071e3',
                    marginBottom: '16px'
                  }}
                >
                  <CircleUser size={22} />
                  <span>Xin chào, {currentUser.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '15px',
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#0071e3'
                  }}
                >
                  <User size={20} />
                  <span>Đăng nhập / Đăng ký</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Screen Backdrop Dimmer (Apple-style backdrop blur behind dropdown) */}
      <div 
        className={`${styles.screenBackdrop} ${isDropdownOpen || isSearchOpen || isBagOpen || isCategoryOpen || isLocationOpen ? styles.backdropVisible : styles.backdropHidden}`}
        onClick={() => {
          setActiveCategory(null);
          setIsCategoryOpen(false);
          setIsLocationOpen(false);
          setIsSearchOpen(false);
          setIsBagOpen(false);
        }}
      />
    </>
  );
};
