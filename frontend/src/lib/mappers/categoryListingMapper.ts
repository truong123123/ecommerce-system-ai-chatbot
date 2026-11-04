import { ProductItem } from '@/services/productService';
import { SharedProduct } from '@/components/common/ProductCard';
import { extractSpecs as extractLaptopSpecs } from './laptopMapper';
import { getCloudinaryTransformedUrl } from '@/utils/image';

export const PLACEHOLDER_IMG = '/images/placeholder-product.svg';

/**
 * Calculates discount percent strictly when maxPrice > price.
 * Returns null if no genuine discount exists.
 */
export function calculateDiscountPercent(
  price: number,
  maxPrice?: number | null
): number | null {
  if (maxPrice == null || maxPrice <= price || price <= 0) {
    return null;
  }
  return Math.round(((maxPrice - price) / maxPrice) * 100);
}

/**
 * Resolves safe product image URL, falling back strictly to local SVG placeholder.
 */
export function getSafeImageUrl(item: ProductItem): string {
  if (item.primaryImage && item.primaryImage.trim() !== '') {
    return getCloudinaryTransformedUrl(item.primaryImage.trim());
  }
  if (item.images && item.images.length > 0 && item.images[0]?.trim() !== '') {
    return getCloudinaryTransformedUrl(item.images[0].trim());
  }
  return PLACEHOLDER_IMG;
}

/**
 * Extracts technical specs from variant attributes if available.
 */
export function extractSpecs(
  attributes: string | Record<string, unknown> | null | undefined
): string | null {
  return extractLaptopSpecs(attributes);
}

/**
 * Pure mapper: Converts ProductItem from productService to SharedProduct for ProductCard.
 * Enforces strict honesty:
 * - NO hardcoded "★ 5.0" rating.
 * - NO fabricated 1% Tmember calculation.
 * - NO artificial installment badges.
 * - Real discounts calculated only when maxPrice > price.
 * - Image strictly falls back to local placeholder SVG.
 */
export function toCategoryListingProduct(item: ProductItem): SharedProduct {
  const price = Number(item.price) || 0;
  const maxPrice = item.maxPrice != null ? Number(item.maxPrice) : null;

  const hasRealDiscount = maxPrice !== null && maxPrice > price;
  const oldPrice = hasRealDiscount ? maxPrice : null;
  const discountPercent = calculateDiscountPercent(price, maxPrice);

  const image = getSafeImageUrl(item);

  const firstVariantAttrs =
    item.variants && item.variants.length > 0 ? item.variants[0].attributes : undefined;
  const specs = extractSpecs(firstVariantAttrs);

  return {
    id: String(item.id),
    name: item.name || 'Sản phẩm',
    slug: item.slug || String(item.id),
    brand: item.brandName || undefined,
    brandSlug: item.brandName
      ? item.brandName.toLowerCase().replace(/\s+/g, '-')
      : undefined,
    category: item.categorySlug || undefined,
    image,
    price,
    oldPrice,
    discountPercent,
    specs,
    rating: null, // Backend ProductItem does not supply rating; omit to avoid fake 5-star
    reviewCount: null,
    tmemberText: null, // Omit imaginary 1% Tmember calculation
    studentText: null,
    installmentText: null, // Omit unverified installment claims
    isFastDelivery: true,
  };
}
