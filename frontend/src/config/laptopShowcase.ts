/**
 * Laptop Showcase Configuration Constants
 * Centralized settings for tabs, categories, brand filters, and cache revalidation.
 */

export interface LaptopTabConfig {
  id: string;
  label: string;
  categorySlug: string;
}

export interface NeedPillConfig {
  id: string;
  label: string;
  iconUrl?: string;
}

export const LAPTOP_TABS: readonly LaptopTabConfig[] = [
  { id: 'laptop', label: 'LAPTOP', categorySlug: 'laptop' },
  { id: 'man-hinh', label: 'MÀN HÌNH MÁY TÍNH', categorySlug: 'man-hinh' },
  { id: 'pc', label: 'PC', categorySlug: 'pc' },
  { id: 'phu-kien-may-tinh', label: 'PHỤ KIỆN MÁY TÍNH', categorySlug: 'phu-kien-may-tinh' },
] as const;

/**
 * Need / feature pills.
 * TẠM ẨN: Backend chưa hỗ trợ query `?need=...` trên endpoint `/api/v1/products`.
 * Cần backend bổ sung filter theo nhu cầu sử dụng (gaming, văn phòng, sinh viên...) trước khi bật lại.
 */
export const ENABLE_NEED_FILTER = false;

export const NEED_PILLS: readonly NeedPillConfig[] = [
  { id: 'all', label: 'Tất cả nhu cầu' },
  { id: 'office', label: 'Văn phòng' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'slim', label: 'Mỏng nhẹ' },
  { id: 'graphic', label: 'Đồ họa - kỹ thuật' },
  { id: 'student', label: 'Sinh viên' },
  { id: 'touch', label: 'Cảm ứng' },
] as const;

export const DEFAULT_LAPTOP_BRANDS: readonly string[] = [
  'Tất cả',
  'MacBook',
  'ASUS',
  'Lenovo',
  'MSI',
  'Acer',
  'HP',
  'Dell',
  'LG',
  'Gigabyte',
  'Masstel',
] as const;

export const LAPTOP_CONFIG = {
  REVALIDATE_SECONDS: 60,
  CACHE_TAG: 'showcase',
  DEFAULT_LIMIT: 8,
  PLACEHOLDER_IMAGE: '/images/placeholder-product.svg',
} as const;
