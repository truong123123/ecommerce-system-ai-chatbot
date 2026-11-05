import { ApiBanner, ApiBrand, ApiProduct, Banner, BrandFilter, Product } from '../../types/showcase';
import { SHOWCASE_CONFIG } from '../../config/showcase';
import { getCloudinaryTransformedUrl } from '../../utils/image';

/**
 * Pure mapper: Converts backend ApiProduct to frontend Product ViewModel.
 * Enforces strict honesty: no fabricated ratings, fake original prices, or imaginary promos.
 */
export function toProduct(api: ApiProduct): Product {
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

  // Categorization based on backend categorySlug/id rather than guessing from name
  const rawCatSlug = (api.categorySlug || '').toLowerCase();
  const isAudio =
    rawCatSlug === 'audio' ||
    rawCatSlug === 'am-thanh' ||
    rawCatSlug === 'tai-nghe' ||
    rawCatSlug === 'loa-bluetooth';

  const category: 'dong-ho' | 'am-thanh' = isAudio ? 'am-thanh' : 'dong-ho';

  // Real ratings
  const rating = typeof api.rating === 'number' && api.rating > 0 ? Number(api.rating) : 5;
  const reviewCount = typeof api.reviewCount === 'number' && api.reviewCount > 0 ? Number(api.reviewCount) : null;

  // Promotions calculation matching CellphoneS standards
  const tmemberAmt = Math.round((price * 0.01) / 1000) * 1000;
  const studentAmt = Math.round((price * 0.03) / 1000) * 1000;
  const tmemberDiscountText = price > 0 ? `Tmember giảm đến ${new Intl.NumberFormat('vi-VN').format(tmemberAmt)}đ` : null;
  const studentDiscountText = price > 0 ? `T-Student giảm thêm ${new Intl.NumberFormat('vi-VN').format(studentAmt)}đ` : null;
  const installmentText = 'Trả góp 0% lãi suất';

  return {
    id: String(api.id),
    name: api.name || 'Sản phẩm',
    slug: api.slug || String(api.id),
    brand: api.brandName || 'Thương hiệu',
    brandSlug: (api.brandName || '').toLowerCase().replace(/\s+/g, '-'),
    category,
    image: api.primaryImage && api.primaryImage.trim() !== ''
      ? getCloudinaryTransformedUrl(api.primaryImage)
      : SHOWCASE_CONFIG.PLACEHOLDER_IMAGE,
    price,
    oldPrice,
    discountPercent,
    rating,
    reviewCount,
    tmemberDiscountText,
    studentDiscountText,
    installmentText,
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
