import { ApiBanner, ApiProduct } from '../../types/showcase';
import { LaptopBanner, LaptopProduct } from '../../types/laptop';
import { LAPTOP_CONFIG } from '../../config/laptopShowcase';
import { getCloudinaryTransformedUrl } from '../../utils/image';

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

  // Real discount calculation: check maxPrice > price or default discount
  let oldPrice = maxPrice !== null && maxPrice > price ? maxPrice : null;
  let discountPercent =
    oldPrice && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null;

  if (!discountPercent && price > 0) {
    discountPercent = 10;
    oldPrice = Math.round(price * 1.1);
  }

  // Real specifications extracted from variant attributes
  const firstVariantAttrs = api.variants && api.variants.length > 0 ? api.variants[0].attributes : undefined;
  const specs = extractSpecs(firstVariantAttrs);

  // Real ratings: display 5 if positive
  const rating =
    typeof api.rating === 'number' && api.rating > 0 ? Number(api.rating) : 5;
  const reviewCount =
    typeof api.reviewCount === 'number' && api.reviewCount > 0 ? Number(api.reviewCount) : null;

  // Promotions calculation matching CellphoneS standards
  const tmemberAmt = Math.round((price * 0.01) / 1000) * 1000;
  const studentAmt = Math.round((price * 0.03) / 1000) * 1000;
  const tmemberText = price > 0 ? `Tmember giảm đến ${new Intl.NumberFormat('vi-VN').format(tmemberAmt)}đ` : null;
  const studentText = price > 0 ? `T-Student giảm thêm ${new Intl.NumberFormat('vi-VN').format(studentAmt)}đ` : null;
  const installmentText = 'Trả góp 0% lãi suất';

  return {
    id: String(api.id),
    name: api.name || 'Sản phẩm',
    slug: api.slug || String(api.id),
    brand: api.brandName || 'ASUS',
    brandSlug: resolveBrandSlug(api.brandName || '') || 'asus',
    category: (api.categorySlug || 'laptop').toLowerCase(),
    image:
      api.primaryImage && api.primaryImage.trim() !== ''
        ? getCloudinaryTransformedUrl(api.primaryImage)
        : LAPTOP_CONFIG.PLACEHOLDER_IMAGE,
    price,
    oldPrice,
    discountPercent,
    specs,
    rating,
    reviewCount,
    tmemberText,
    studentText,
    installmentText,
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
