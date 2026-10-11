import { ApiBanner, ApiProduct } from '../../types/showcase';
import { LaptopBanner, LaptopProduct } from '../../types/laptop';
import { LAPTOP_CONFIG } from '../../config/laptopShowcase';

/**
 * Extracts human-readable technical specifications from variant attributes.
 * Handles both serialized JSON strings and parsed attribute objects.
 */
export function extractSpecs(attributes: unknown): string | null {
  if (!attributes) return null;

  let parsed = attributes;
  if (typeof attributes === 'string') {
    try {
      parsed = JSON.parse(attributes);
    } catch {
      const trimmed = attributes.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
  }

  if (typeof parsed === 'object' && parsed !== null) {
    const record = parsed as Record<string, unknown>;
    const cpu = typeof record.cpu === 'string' ? record.cpu.trim() : '';
    const gpu = typeof record.gpu === 'string' ? record.gpu.trim() : '';
    const ram = typeof record.ram === 'string' ? record.ram.trim() : '';
    const ssd = typeof record.ssd === 'string' ? record.ssd.trim() : '';
    const screen = typeof record.screen === 'string' ? record.screen.trim() : '';

    const ramSsd = [ram, ssd].filter(Boolean).join(' ').trim();
    const parts = [cpu, gpu, ramSsd, screen].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(' | ');
    }
  }

  return null;
}

/**
 * Normalizes user-facing brand names into URL-friendly backend brand slugs.
 * E.g., 'MacBook' maps to 'apple', 'Tất cả' maps to undefined.
 */
export function resolveBrandSlug(brand?: string): string | undefined {
  if (!brand) return undefined;
  const trimmed = brand.trim().toLowerCase();
  if (trimmed === 'tất cả' || trimmed === 'all') return undefined;
  if (trimmed === 'macbook') return 'apple';
  return trimmed.replace(/\s+/g, '-');
}

/**
 * Pure mapper: Converts backend ApiProduct to frontend LaptopProduct ViewModel.
 * Enforces strict honesty: NO fabricated ratings, NO artificial 10% price markup,
 * NO fictional student/tmember promos.
 */
export function toLaptopProduct(api: ApiProduct): LaptopProduct {
  const price = Number(api.price) || 0;
  const maxPrice = api.maxPrice ? Number(api.maxPrice) : null;

  // Real discount calculation only: genuine when maxPrice is strictly greater than price
  const hasRealDiscount = maxPrice !== null && maxPrice > price;
  const oldPrice = hasRealDiscount ? maxPrice : null;
  const discountPercent =
    hasRealDiscount && oldPrice
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null;

  // Real specifications extracted from variant attributes
  const firstVariantAttrs = api.variants && api.variants.length > 0 ? api.variants[0].attributes : undefined;
  const specs = extractSpecs(firstVariantAttrs);

  // Real ratings only: null if backend does not supply
  const rating =
    typeof api.rating === 'number' && api.rating > 0 ? Number(api.rating) : null;
  const reviewCount =
    typeof api.reviewCount === 'number' && api.reviewCount > 0 ? Number(api.reviewCount) : null;

  return {
    id: String(api.id),
    name: api.name || 'Sản phẩm',
    slug: api.slug || String(api.id),
    brand: api.brandName || 'ASUS',
    brandSlug: resolveBrandSlug(api.brandName || '') || 'asus',
    category: (api.categorySlug || 'laptop').toLowerCase(),
    image:
      api.primaryImage && api.primaryImage.trim() !== ''
        ? api.primaryImage
        : LAPTOP_CONFIG.PLACEHOLDER_IMAGE,
    price,
    oldPrice,
    discountPercent,
    specs,
    rating,
    reviewCount,
    tmemberText: null, // Backend does not return this in catalog response; omit to keep UI honest
    studentText: null, // Backend does not return this in catalog response; omit to keep UI honest
    installmentText: null, // Backend does not return this in catalog response; omit to keep UI honest
    isFastDelivery: true,
    isNewArrival: Boolean(api.isNew),
  };
}

/**
 * Pure mapper: Converts backend ApiBanner to frontend LaptopBanner ViewModel.
 */
export function toLaptopBanner(api: ApiBanner): LaptopBanner {
  return {
    id: String(api.id),
    title: api.title || 'Ưu đãi nổi bật',
    imageUrl:
      api.imageUrl && api.imageUrl.trim() !== ''
        ? api.imageUrl
        : LAPTOP_CONFIG.PLACEHOLDER_IMAGE,
    targetLink:
      api.primaryBtnLink && api.primaryBtnLink.trim() !== ''
        ? api.primaryBtnLink
        : '/products?keyword=laptop',
    badgeText: 'Laptop & PC',
  };
}
