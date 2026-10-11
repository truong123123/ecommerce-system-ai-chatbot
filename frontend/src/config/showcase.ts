/**
 * Showcase Configuration Constants
 * Centralized settings for tabs, categories, brand filters, and cache revalidation.
 */

export interface ShowcaseTab {
  id: string;
  label: string;
  categorySlug: string;
}

export interface NeedPill {
  id: string;
  label: string;
}

export const WATCH_TABS: readonly ShowcaseTab[] = [
  { id: 'dong-ho', label: 'ĐỒNG HỒ', categorySlug: 'dong-ho' },
  { id: 'am-thanh', label: 'ÂM THANH', categorySlug: 'audio' },
] as const;

/**
 * Need / feature pills.
 * Note: Feature filtering is pending backend support for query `?need=...`.
 * Until backend adds support, `ENABLE_NEED_FILTER` is set to false to prevent non-functional UI pills.
 */
export const ENABLE_NEED_FILTER = false;

export const NEED_PILLS: readonly NeedPill[] = [
  { id: 'sport', label: 'Tập luyện thể thao' },
  { id: 'call', label: 'Nghe gọi' },
  { id: 'band', label: 'Vòng đeo tay thông minh' },
  { id: 'kids', label: 'Định vị trẻ em' },
  { id: 'health', label: 'Đo huyết áp' },
  { id: 'waterproof', label: 'Chống nước' },
] as const;

export const DEFAULT_BRANDS_LIST: readonly string[] = [
  'Tất cả',
  'Apple',
  'Samsung',
  'Xiaomi',
  'Huawei',
  'Garmin',
  'Amazfit',
  'Marshall',
  'Sony',
  'Soundpeats',
] as const;

export const SHOWCASE_CONFIG = {
  REVALIDATE_SECONDS: 60,
  CACHE_TAG: 'showcase',
  DEFAULT_LIMIT: 8,
  PLACEHOLDER_IMAGE: '/images/placeholder-product.svg',
} as const;
