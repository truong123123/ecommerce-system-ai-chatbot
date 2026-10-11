import { ApiBanner, ApiBrand, ApiProduct, Banner, BrandFilter, Product } from '../../types/showcase';
import { SHOWCASE_CONFIG } from '../../config/showcase';

/**
 * Pure mapper: Converts backend ApiProduct to frontend Product ViewModel.
 * Enforces strict honesty: no fabricated ratings, fake original prices, or imaginary promos.
 */
export function toProduct(api: ApiProduct): Product {
  const price = Number(api.price) || 0;
  const maxPrice = api.maxPrice ? Number(api.maxPrice) : null;

  // Real discount calculation only: only valid when maxPrice > price
  const hasRealDiscount = maxPrice !== null && maxPrice > price;
  const oldPrice = hasRealDiscount ? maxPrice : null;
  const discountPercent = hasRealDiscount && oldPrice
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : null;

  // Categorization based on backend categorySlug/id rather than guessing from name
  const rawCatSlug = (api.categorySlug || '').toLowerCase();
  const isAudio =
    rawCatSlug === 'audio' ||
    rawCatSlug === 'am-thanh' ||
    rawCatSlug === 'tai-nghe' ||
    rawCatSlug === 'loa-bluetooth';

  const category: 'dong-ho' | 'am-thanh' = isAudio ? 'am-thanh' : 'dong-ho';

  // Real ratings only: null if backend does not provide
  const rating = typeof api.rating === 'number' && api.rating > 0 ? Number(api.rating) : null;
  const reviewCount = typeof api.reviewCount === 'number' && api.reviewCount > 0 ? Number(api.reviewCount) : null;

  return {
    id: String(api.id),
    name: api.name || 'Sản phẩm',
    slug: api.slug || String(api.id),
    brand: api.brandName || 'Thương hiệu',
    brandSlug: (api.brandName || '').toLowerCase().replace(/\s+/g, '-'),
    category,
    image: api.primaryImage && api.primaryImage.trim() !== ''
      ? api.primaryImage
      : SHOWCASE_CONFIG.PLACEHOLDER_IMAGE,
    price,
    oldPrice,
    discountPercent,
    rating,
    reviewCount,
    tmemberDiscountText: null, // Backend does not return this in catalog response; omit to keep UI honest
    installmentText: null,      // Backend does not return this in catalog response; omit to keep UI honest
    isHot: Boolean(api.isHot),
    isNew: Boolean(api.isNew),
  };
}

/**
 * Pure mapper: Converts backend ApiBanner to frontend Banner ViewModel.
 */
export function toBanner(api: ApiBanner): Banner {
  return {
    id: String(api.id),
    title: api.title || 'Ưu đãi nổi bật',
    imageUrl: api.imageUrl && api.imageUrl.trim() !== ''
      ? api.imageUrl
      : SHOWCASE_CONFIG.PLACEHOLDER_IMAGE,
    targetLink: api.primaryBtnLink && api.primaryBtnLink.trim() !== ''
      ? api.primaryBtnLink
      : '/products',
    badgeText: 'Ưu đãi độc quyền',
  };
}

/**
 * Pure mapper: Converts backend ApiBrand to frontend BrandFilter.
 */
export function toBrandFilter(api: ApiBrand): BrandFilter {
  return {
    id: api.brandId,
    name: api.name,
    slug: api.slug,
  };
}
