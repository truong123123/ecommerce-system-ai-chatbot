'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Menu, X, ChevronRight, User, CircleUser, LayoutGrid, ChevronDown, MapPin, Check, LogOut, Trash2, Clock, Zap, Award, Truck, RotateCcw, Flame, AlertCircle, Store, FileText, PhoneCall } from 'lucide-react';
import styles from './Navbar.module.css';
import { ADMIN_SEARCH_CONFIG } from '../../config/adminSearchConfig';
import { categoryService } from '../../services/categoryService';
import { brandService } from '../../services/brandService';
import { productService } from '../../services/productService';
import { useCartStore } from '../../store/cartStore';
import { authService, UserSession } from '../../services/authService';
import { accountService } from '../../services/accountService';
import { LocationProvince } from '@/types/checkout';
import { checkoutService, clearProvincesCache } from '../../services/checkoutService';

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

export const normalizeVietnamese = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
};

const matchesLocationSearch = (province: LocationProvince, query: string): boolean => {
  if (!query || !query.trim()) return true;
  const qNorm = normalizeVietnamese(query);
  const nameNorm = normalizeVietnamese(province.name);
  if (nameNorm.includes(qNorm)) return true;
  if (province.code === qNorm) return true;
  // Hỗ trợ từ viết tắt / tên gọi thông dụng
  if ((qNorm === 'hcm' || qNorm === 'tphcm' || qNorm === 'ho chi minh') && (province.code === '79' || nameNorm.includes('ho chi minh'))) {
    return true;
  }
  if ((qNorm === 'hn' || qNorm === 'ha noi') && (province.code === '01' || nameNorm.includes('ha noi'))) {
    return true;
  }
  if ((qNorm === 'dn' || qNorm === 'da nang') && (province.code === '48' || nameNorm.includes('da nang'))) {
    return true;
  }
  if ((qNorm === 'hp' || qNorm === 'hai phong') && (province.code === '31' || nameNorm.includes('hai phong'))) {
    return true;
  }
  if ((qNorm === 'ct' || qNorm === 'can tho') && (province.code === '92' || nameNorm.includes('can tho'))) {
    return true;
  }
  return false;
};

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
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [categoryItems, setCategoryItems] = useState<CategoryMenuItem[]>(() => {
    return cachedMegaMenuData ? cachedMegaMenuData.categoryItems : DEFAULT_CATEGORY_ITEMS;
  });
  const [categoryMegaMenus, setCategoryMegaMenus] = useState<Record<string, CategoryMegaMenu>>(() => {
    return cachedMegaMenuData ? cachedMegaMenuData.categoryMegaMenus : {};
  });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const [hoveredCategoryItem, setHoveredCategoryItem] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<LocationProvince[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState<boolean>(false);
  const [provincesError, setProvincesError] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<LocationProvince>({
    code: '79',
    name: 'Thành phố Hồ Chí Minh',
  });
  const [isLocationOpen, setIsLocationOpen] = useState<boolean>(false);
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isBagOpen, setIsBagOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scrolled, setScrolled] = useState<boolean>(false);

  // Đóng popover tìm kiếm khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleSelectTrendingItem = (query: string, href?: string) => {
    setSearchQuery(query);
    setIsSearchOpen(false);
    if (href && href !== '#') {
      router.push(href);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const { fetchCart, getTotalCount, cartData, removeItem } = useCartStore();
  const cartCount = getTotalCount();
  const cartItems = cartData?.items || [];
  const cartSubtotal =
    cartData?.summary?.subtotal ??
    cartItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
      0
    );
  const [isCartBumping, setIsCartBumping] = useState<boolean>(false);
  const [addedCartDiff, setAddedCartDiff] = useState<number>(1);
  const prevCartCountRef = useRef<number | null>(null);
  const cartBumpTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Tránh kích hoạt animation khi render lần đầu
    if (prevCartCountRef.current === null) {
      prevCartCountRef.current = cartCount;
      return;
    }

    if (cartCount > prevCartCountRef.current) {
      const diff = cartCount - prevCartCountRef.current;
      setAddedCartDiff(diff);
      setIsCartBumping(true);

      if (cartBumpTimerRef.current) {
        clearTimeout(cartBumpTimerRef.current);
      }
      cartBumpTimerRef.current = setTimeout(() => {
        setIsCartBumping(false);
      }, 1000);
    }

    prevCartCountRef.current = cartCount;
    return () => {
      if (cartBumpTimerRef.current) {
        clearTimeout(cartBumpTimerRef.current);
      }
    };
  }, [cartCount]);

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

  const loadProvinces = async () => {
    setIsLoadingProvinces(true);
    setProvincesError(null);
    try {
      const data = await checkoutService.getProvinces();
      setProvinces(data);
      return data;
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách tỉnh thành:', err);
      setProvincesError('Không thể kết nối máy chủ để lấy danh sách tỉnh/thành.');
      return null;
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function initLocation() {
      let currentLoc: LocationProvince | null = null;
      try {
        const savedInfo = localStorage.getItem('user_location_info');
        if (savedInfo) {
          const parsed = JSON.parse(savedInfo);
          if (parsed && typeof parsed.code === 'string' && typeof parsed.name === 'string') {
            currentLoc = parsed;
          }
        } else {
          const legacyName = localStorage.getItem('user_location');
          if (legacyName) {
            currentLoc = { code: '', name: legacyName };
          }
        }
      } catch {
        // ignore
      }

      setIsLoadingProvinces(true);
      setProvincesError(null);
      try {
        const list = await checkoutService.getProvinces();
        if (!isMounted) return;
        setProvinces(list);

        // Kiểm tra xem người dùng có đăng nhập và có địa chỉ mặc định không
        const currentUser = authService.getCurrentUser();
        let defaultAddrProvince: string | null = null;
        if (currentUser) {
          try {
            const addresses = await accountService.getAddresses();
            const def = addresses.find((a) => a.isDefault);
            if (def && def.province) {
              defaultAddrProvince = def.province;
            }
          } catch {
            // ignore
          }
        }

        // 1. Ưu tiên địa chỉ mặc định tài khoản nếu có và hợp lệ
        if (defaultAddrProvince) {
          const normDef = normalizeVietnamese(defaultAddrProvince);
          const matchedByAccount = list.find((p) => {
            const pNorm = normalizeVietnamese(p.name);
            return pNorm === normDef || pNorm.includes(normDef) || normDef.includes(pNorm);
          });
          if (matchedByAccount) {
            setSelectedProvince(matchedByAccount);
            localStorage.setItem('user_location_info', JSON.stringify({ code: matchedByAccount.code, name: matchedByAccount.name }));
            localStorage.setItem('user_location', matchedByAccount.name);
            return;
          }
        }

        // 2. Khôi phục từ localStorage nếu code/tên hợp lệ trong danh sách API
        if (currentLoc) {
          let matched: LocationProvince | undefined;
          if (currentLoc.code) {
            matched = list.find((p) => p.code === currentLoc.code);
          }
          if (!matched && currentLoc.name) {
            const normName = normalizeVietnamese(currentLoc.name);
            matched = list.find((p) => {
              const pNorm = normalizeVietnamese(p.name);
              return pNorm === normName || pNorm.includes(normName) || normName.includes(pNorm);
            });
          }
          if (matched) {
            setSelectedProvince(matched);
            localStorage.setItem('user_location_info', JSON.stringify({ code: matched.code, name: matched.name }));
            localStorage.setItem('user_location', matched.name);
            return;
          }
        }

        // 3. Mặc định Thành phố Hồ Chí Minh (code: "79")
        const defaultHCM = list.find((p) => p.code === '79') || list[0];
        if (defaultHCM) {
          setSelectedProvince(defaultHCM);
          localStorage.setItem('user_location_info', JSON.stringify({ code: defaultHCM.code, name: defaultHCM.name }));
          localStorage.setItem('user_location', defaultHCM.name);
        }
      } catch (err: any) {
        console.error('Lỗi khi nạp dữ liệu tỉnh/thành:', err);
        if (isMounted) {
          setProvincesError('Không thể kết nối máy chủ để lấy danh sách tỉnh/thành.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingProvinces(false);
        }
      }
    }

    initLocation();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectLocation = (province: LocationProvince) => {
    setSelectedProvince(province);
    try {
      localStorage.setItem('user_location_info', JSON.stringify({ code: province.code, name: province.name }));
      localStorage.setItem('user_location', province.name);
    } catch {
      // ignore
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('location_changed', {
          detail: { code: province.code, name: province.name },
        })
      );
    }

    setIsLocationOpen(false);
    setLocationSearch('');
  };

  const handleRetryLoadProvinces = async () => {
    clearProvincesCache();
    await loadProvinces();
  };

  const filteredProvinces = provinces.filter((p) =>
    matchesLocationSearch(p, locationSearch)
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
      {/* 1. TOP UTILITY & BENEFIT BAR (CHUẨN CELLPHONES: XOAY CHỮ VÒNG TRÒN MARQUEE) */}
      <div className={styles.topAnnouncementBar}>
        <div className={styles.topBarContainer}>
          {/* Left: Ticker/Marquee Track xoay chữ liên tục */}
          <div className={styles.marqueeContainer}>
            <div className={styles.marqueeTrack}>
              {[1, 2].map((loopIdx) => (
                <React.Fragment key={loopIdx}>
                  <span className={styles.topBenefitItem}>
                    <Zap size={13} color="#fef08a" />
                    <span>Lên đời tiết kiệm</span>
                  </span>
                  <span className={styles.topDot}>•</span>
                  <span className={styles.topBenefitItem}>
                    <Award size={13} color="#93c5fd" />
                    <span>Sản phẩm <strong>Chính hãng - Xuất VAT đầy đủ</strong></span>
                  </span>
                  <span className={styles.topDot}>•</span>
                  <span className={styles.topBenefitItem}>
                    <Truck size={13} color="#86efac" />
                    <span><strong>Giao nhanh - Miễn phí</strong> cho đơn 300k</span>
                  </span>
                  <span className={styles.topDot}>•</span>
                  <span className={styles.topBenefitItem}>
                    <RotateCcw size={13} color="#fca5a5" />
                    <span><strong>Thu cũ giá ngon</strong> - Lên đời tiết kiệm</span>
                  </span>
                  <span className={styles.topDot}>•</span>
                  <span className={styles.topBenefitItem}>
                    <span>🛡️ Bảo hành 12 tháng 1 đổi 1</span>
                  </span>
                  <span className={styles.topDot}>•</span>
                  <span className={styles.topBenefitItem}>
                    <span>💳 Trả góp 0% lãi suất qua thẻ tín dụng</span>
                  </span>
                  <span className={styles.topDot}>•</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right: Quick Utility Links (Cửa hàng, Tra cứu, Hotline) */}
          <div className={styles.topBarRight}>
            <Link href="/stores" className={styles.topUtilityLink}>
              <Store size={13} />
              <span>Cửa hàng gần bạn</span>
            </Link>
            <span className={styles.topDivider}>|</span>
            <Link href="/account/orders" className={styles.topUtilityLink}>
              <FileText size={13} />
              <span>Tra cứu đơn hàng</span>
            </Link>
            <span className={styles.topDivider}>|</span>
            <a href="tel:18002097" className={styles.topUtilityLink}>
              <PhoneCall size={13} />
              <span>1800 2097</span>
            </a>
          </div>
        </div>
      </div>

      <header 
        className={`${styles.navHeader} ${isDropdownOpen || isSearchOpen || isBagOpen || isCategoryOpen || isLocationOpen || scrolled ? styles.navHeaderActive : ''}`}
        onMouseLeave={handleMouseLeaveNav}
      >
        {/* Main Nav Container */}
        <div className={styles.navContainer}>
          {/* Logo & Category Button Group */}
          <div className={styles.navLeft}>
            {/* TruongStore Logo (To, rõ nét, phong cách CellphoneS) */}
            <Link 
              href="/" 
              className={styles.cpsLogo}
              onMouseEnter={() => {
                setActiveCategory(null);
                setIsCategoryOpen(false);
                setIsLocationOpen(false);
                setIsBagOpen(false);
                setIsSearchOpen(false);
              }}
              aria-label="TruongStore Trang chủ"
            >
              <div className={styles.brandLogo}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.logoSvg}>
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#ffffff" />
                  <path d="M2 17L12 22L22 17" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className={styles.logoText}>truong</span>
                <span className={styles.logoS}>Store</span>
              </div>
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
                  <LayoutGrid size={17} strokeWidth={2.4} />
                  <span>Danh mục</span>
                  <ChevronDown size={15} strokeWidth={2.4} className={`${styles.categoryChevron} ${isCategoryOpen ? styles.chevronRotated : ''}`} />
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
                  title={selectedProvince.name}
                >
                  <MapPin size={15} strokeWidth={2.4} />
                  <span>{selectedProvince.name.replace(/^Thành phố\s+/i, 'TP. ')}</span>
                  <ChevronDown size={14} strokeWidth={2.4} className={`${styles.locationChevron} ${isLocationOpen ? styles.locationChevronRotated : ''}`} />
                </button>

                {/* Modal / Dropdown chọn Tỉnh Thành */}
                {isLocationOpen && (
                  <div className={styles.locationDropdown} role="dialog" aria-modal="true" aria-label="Chọn tỉnh thành">
                    <div className={styles.locationHeaderBar}>
                      <div className={styles.locationSearchBox}>
                        <Search size={15} className={styles.locationSearchIcon} />
                        <input 
                          type="text"
                          placeholder="Tìm tỉnh, thành phố (VD: ha noi, hcm)..."
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          className={styles.locationSearchInput}
                          autoFocus
                          aria-label="Tìm kiếm tỉnh thành"
                        />
                        {locationSearch && (
                          <button
                            type="button"
                            onClick={() => setLocationSearch('')}
                            className={styles.locationSearchClear}
                            aria-label="Xóa từ khóa tìm kiếm"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                      <button 
                        type="button" 
                        className={styles.locationCloseBtn}
                        onClick={() => {
                          setIsLocationOpen(false);
                          setLocationSearch('');
                        }}
                        aria-label="Đóng popup chọn tỉnh thành"
                      >
                        Đóng <X size={15} />
                      </button>
                    </div>

                    <div className={styles.locationBody}>
                      <p className={styles.locationSubtitle}>
                        Vui lòng chọn tỉnh, thành phố để đồng bộ khu vực mua sắm & dịch vụ
                      </p>

                      {/* Loading State (Skeleton) */}
                      {isLoadingProvinces && (
                        <div className={styles.locationSkeletonGrid}>
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className={styles.locationSkeletonItem}>
                              <div className={styles.skeletonText} />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Error State */}
                      {!isLoadingProvinces && provincesError && (
                        <div className={styles.locationErrorBox}>
                          <AlertCircle size={22} className={styles.errorIcon} />
                          <p className={styles.errorMsg}>{provincesError}</p>
                          <button
                            type="button"
                            className={styles.retryBtn}
                            onClick={handleRetryLoadProvinces}
                          >
                            <RotateCcw size={14} />
                            <span>Thử lại</span>
                          </button>
                        </div>
                      )}

                      {/* Empty State */}
                      {!isLoadingProvinces && !provincesError && filteredProvinces.length === 0 && (
                        <div className={styles.locationEmptyBox}>
                          <Search size={24} className={styles.emptyIcon} />
                          <p className={styles.emptyMsg}>
                            Không tìm thấy tỉnh/thành phố phù hợp với từ khóa <strong>"{locationSearch}"</strong>
                          </p>
                          <button
                            type="button"
                            className={styles.clearSearchBtn}
                            onClick={() => setLocationSearch('')}
                          >
                            Xóa bộ lọc tìm kiếm
                          </button>
                        </div>
                      )}

                      {/* Danh sách 34 tỉnh/thành (2 cột Desktop / 1 cột Mobile) */}
                      {!isLoadingProvinces && !provincesError && filteredProvinces.length > 0 && (
                        <div className={styles.locationGrid}>
                          {filteredProvinces.map((prov) => {
                            const isSelected = prov.code === selectedProvince.code;
                            return (
                              <button
                                key={prov.code}
                                type="button"
                                className={`${styles.locationItem} ${isSelected ? styles.locationItemActive : ''}`}
                                onClick={() => handleSelectLocation(prov)}
                                title={prov.name}
                              >
                                <span className={styles.locationItemName}>{prov.name}</span>
                                {isSelected && (
                                  <Check size={15} strokeWidth={2.8} className={styles.locationCheckIcon} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KHUNG TÌM KIẾM TRỰC TIẾP & POPOVER ĐỀ XUẤT THEO Ý ADMIN (CHUẨN IMAGE 1 & 3) */}
          <div className={styles.searchWrapper} ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Bạn muốn mua gì hôm nay?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setIsSearchOpen(true);
                  setIsCategoryOpen(false);
                  setIsLocationOpen(false);
                  setIsBagOpen(false);
                  setIsUserMenuOpen(false);
                }}
                aria-label="Tìm kiếm sản phẩm"
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.searchClearBtn}
                  onClick={() => setSearchQuery('')}
                  aria-label="Xóa nội dung tìm kiếm"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* POPOVER TÌM KIẾM ĐỀ XUẤT DO ADMIN QUẢN LÝ (CHUẨN IMAGE 3) */}
            {isSearchOpen && (
              <div className={styles.searchPopover}>
                {/* 1. Banner Chiến Dịch Hot Của Admin */}
                {ADMIN_SEARCH_CONFIG.banner && (
                  <div
                    className={styles.adminSearchBanner}
                    onClick={() => handleSelectTrendingItem(ADMIN_SEARCH_CONFIG.banner.targetQuery, ADMIN_SEARCH_CONFIG.banner.href)}
                  >
                    <div className={styles.adminBannerLeft}>
                      <img
                        src={ADMIN_SEARCH_CONFIG.banner.imageUrl}
                        alt="Promo"
                        className={styles.adminBannerImg}
                      />
                      <div className={styles.adminBannerInfo}>
                        <span className={styles.adminBannerTitle}>
                          {ADMIN_SEARCH_CONFIG.banner.title}
                        </span>
                        <span className={styles.adminBannerSub}>
                          {ADMIN_SEARCH_CONFIG.banner.subtitle}
                        </span>
                      </div>
                    </div>
                    <span className={styles.adminBannerCta}>
                      {ADMIN_SEARCH_CONFIG.banner.ctaText}
                    </span>
                  </div>
                )}

                {/* 2. Tiêu Đề Xu Hướng Tìm Kiếm */}
                <div className={styles.searchTrendingHeader}>
                  <Flame size={15} color="#f97316" />
                  <span>{ADMIN_SEARCH_CONFIG.trendingTitle || 'Xu hướng tìm kiếm'}</span>
                </div>

                {/* 3. Lưới 2 Cột Các Từ Khóa / Sản Phẩm Đề Xuất Của Admin */}
                <div className={styles.searchTrendingGrid}>
                  {ADMIN_SEARCH_CONFIG.trendingItems.map((item) => (
                    <div
                      key={item.id}
                      className={styles.searchTrendingItem}
                      onClick={() => handleSelectTrendingItem(item.query || item.name, item.href)}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className={styles.searchTrendingImg}
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://res.cloudinary.com/c7w3ycu9/image/upload/w_100,h_100,c_pad,b_white,q_auto,f_auto/v1793711824/products/iphone-17-pro-256-gb.webp';
                        }}
                      />
                      <span className={styles.searchTrendingName}>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Actions (Bag & User) */}
          <div className={styles.actionIcons}>
            {/* Bag Button & Interactive Dropdown */}
            <div className={styles.bagWrapper}>
              <button
                onClick={() => {
                  setIsBagOpen(!isBagOpen);
                  setIsSearchOpen(false);
                  setIsUserMenuOpen(false);
                  setActiveCategory(null);
                }}
                className={styles.bagButton}
                aria-label="Giỏ hàng"
              >
                <span className={`${styles.bagIcon} ${isCartBumping ? styles.bagIconWiggle : ''}`}>
                  <ShoppingBag size={16} strokeWidth={2.2} />
                </span>
                <span className={styles.bagLabelText}>Giỏ hàng</span>
                {cartCount > 0 && (
                  <span
                    key={cartCount}
                    className={`${styles.cartBadge} ${isCartBumping ? styles.cartBadgeBump : ''}`}
                  >
                    {cartCount}
                  </span>
                )}
                {isCartBumping && (
                  <>
                    <span className={styles.cartPulseRing} aria-hidden="true" />
                    <span className={styles.floatingPlusCount} aria-hidden="true">
                      +{addedCartDiff > 0 ? addedCartDiff : 1}
                    </span>
                  </>
                )}
              </button>

              {/* Interactive Mini Cart Popover Panel */}
              {isBagOpen && (
                <div className={styles.bagDropdown} onClick={(e) => e.stopPropagation()}>
                  {/* Header */}
                  <div className={styles.bagHeader}>
                    <div className={styles.bagHeaderLeft}>
                      <div className={styles.bagHeaderIconWrap}>
                        <ShoppingBag size={15} strokeWidth={2.4} />
                      </div>
                      <span className={styles.bagHeaderTitle}>Giỏ hàng của bạn</span>
                      {cartCount > 0 && (
                        <span className={styles.bagHeaderBadge}>{cartCount} sản phẩm</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className={styles.bagCloseBtn}
                      onClick={() => setIsBagOpen(false)}
                      aria-label="Đóng"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Body */}
                  {cartItems.length === 0 ? (
                    <div className={styles.bagEmptyState}>
                      <div className={styles.bagEmptyIcon}>
                        <ShoppingBag size={34} strokeWidth={1.5} />
                      </div>
                      <p className={styles.bagEmptyTitle}>Giỏ hàng của bạn đang trống</p>
                      <p className={styles.bagEmptyDesc}>
                        Hãy khám phá hàng ngàn siêu phẩm công nghệ với ưu đãi hấp dẫn hôm nay!
                      </p>
                      <Link
                        href="/category/phone-tablet"
                        className={styles.bagEmptyBtn}
                        onClick={() => setIsBagOpen(false)}
                      >
                        Khám phá sản phẩm
                      </Link>
                      <Link
                        href="/orders"
                        className={styles.bagOrdersLink}
                        onClick={() => setIsBagOpen(false)}
                      >
                        <Clock size={13} />
                        <span>Xem đơn hàng đã mua</span>
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* Scrollable Items List */}
                      <div className={styles.bagItemsList}>
                        {cartItems.map((item) => (
                          <div key={item.variantId || item.cartItemId} className={styles.bagItemRow}>
                            <Link
                              href={item.slug ? `/products/${item.slug}` : '/cart'}
                              className={styles.bagItemImageWrap}
                              onClick={() => setIsBagOpen(false)}
                            >
                              <img
                                src={item.imageUrl || '/placeholder.png'}
                                alt={item.name}
                                className={styles.bagItemImage}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&q=80';
                                }}
                              />
                            </Link>

                            <div className={styles.bagItemInfo}>
                              <Link
                                href={item.slug ? `/products/${item.slug}` : '/cart'}
                                className={styles.bagItemName}
                                title={item.name}
                                onClick={() => setIsBagOpen(false)}
                              >
                                {item.name}
                              </Link>

                              {item.attributes && Object.values(item.attributes).filter(Boolean).length > 0 && (
                                <div className={styles.bagItemVariantPill}>
                                  {Object.values(item.attributes).filter(Boolean).join(' • ')}
                                </div>
                              )}

                              <div className={styles.bagItemPriceRow}>
                                <span className={styles.bagItemPrice}>
                                  {item.price ? item.price.toLocaleString('vi-VN') + '₫' : '0₫'}
                                </span>
                                <span className={styles.bagItemQty}>x{item.quantity}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className={styles.bagItemRemoveBtn}
                              title="Xóa sản phẩm"
                              aria-label={`Xóa ${item.name}`}
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (item.variantId) {
                                  await removeItem(item.variantId);
                                }
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className={styles.bagFooter}>
                        {/* Free Shipping Hint */}
                        <div className={styles.bagShippingHint}>
                          <span className={styles.bagShippingIcon}>🚚</span>
                          <span>Miễn phí giao hàng cho đơn từ <strong>300.000₫</strong></span>
                        </div>

                        {/* Subtotal */}
                        <div className={styles.bagSubtotalRow}>
                          <span className={styles.bagSubtotalLabel}>Tạm tính:</span>
                          <span className={styles.bagSubtotalValue}>
                            {cartSubtotal.toLocaleString('vi-VN')}₫
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className={styles.bagActions}>
                          <Link
                            href="/cart"
                            className={styles.bagCheckoutBtn}
                            onClick={() => setIsBagOpen(false)}
                          >
                            <span>Xem chi tiết giỏ hàng</span>
                            <ChevronRight size={15} strokeWidth={2.4} />
                          </Link>

                          <Link
                            href="/orders"
                            className={styles.bagOrdersLink}
                            onClick={() => setIsBagOpen(false)}
                          >
                            <Clock size={13} />
                            <span>Xem đơn hàng đã mua</span>
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

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
                className={styles.loginNavBtn}
                aria-label="Đăng nhập"
                title="Đăng nhập tài khoản"
              >
                <span>Đăng nhập</span>
                <CircleUser size={16} strokeWidth={2.2} />
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
