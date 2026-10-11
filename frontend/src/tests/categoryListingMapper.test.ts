import { describe, it, expect } from 'vitest';
import {
  toCategoryListingProduct,
  calculateDiscountPercent,
  extractSpecs,
  getSafeImageUrl,
} from '../lib/mappers/categoryListingMapper';
import { ProductItem } from '../services/productService';

describe('categoryListingMapper: calculateDiscountPercent', () => {
  it('returns null when maxPrice is missing, equal or lower than current price', () => {
    expect(calculateDiscountPercent(1000000)).toBeNull();
    expect(calculateDiscountPercent(1000000, 1000000)).toBeNull();
    expect(calculateDiscountPercent(1500000, 1000000)).toBeNull();
    expect(calculateDiscountPercent(1000000, 0)).toBeNull();
  });

  it('calculates rounded discount percentage when maxPrice > price', () => {
    expect(calculateDiscountPercent(800000, 1000000)).toBe(20);
    expect(calculateDiscountPercent(750000, 1000000)).toBe(25);
    expect(calculateDiscountPercent(19990000, 24990000)).toBe(20);
  });
});

describe('categoryListingMapper: getSafeImageUrl', () => {
  it('uses primaryImage if available', () => {
    const item: Partial<ProductItem> = {
      primaryImage: 'https://example.com/phone.jpg',
      images: ['https://example.com/fallback.jpg'],
    };
    expect(getSafeImageUrl(item as ProductItem)).toBe('https://example.com/phone.jpg');
  });

  it('falls back to images[0] when primaryImage is empty', () => {
    const item: Partial<ProductItem> = {
      primaryImage: '',
      images: ['https://example.com/fallback.jpg'],
    };
    expect(getSafeImageUrl(item as ProductItem)).toBe('https://example.com/fallback.jpg');
  });

  it('falls back to local SVG placeholder if no images exist', () => {
    const item: Partial<ProductItem> = {
      primaryImage: undefined,
      images: [],
    };
    expect(getSafeImageUrl(item as ProductItem)).toBe('/images/placeholder-product.svg');
  });
});

describe('categoryListingMapper: extractSpecs', () => {
  it('extracts technical specifications from variant JSON string', () => {
    const jsonStr = JSON.stringify({
      cpu: 'Apple M3',
      ram: '16GB',
      ssd: '512GB',
      screen: '14.2 inch Liquid Retina XDR',
    });
    const specs = extractSpecs(jsonStr);
    expect(specs).toContain('Apple M3');
    expect(specs).toContain('16GB');
  });

  it('handles empty or plain string attributes gracefully', () => {
    expect(extractSpecs('')).toBeNull();
    expect(extractSpecs('   ')).toBeNull();
    expect(extractSpecs('Core i5 16GB')).toBe('Core i5 16GB');
  });

  it('returns null when no attributes are passed', () => {
    expect(extractSpecs(undefined)).toBeNull();
    expect(extractSpecs(null)).toBeNull();
  });
});

describe('categoryListingMapper: toCategoryListingProduct', () => {
  it('strictly preserves honest backend data and hides fake badges when fields are absent', () => {
    const rawProduct: ProductItem = {
      id: 88,
      name: 'Samsung Galaxy S24 Ultra 256GB',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'Mô tả S24 Ultra',
      categorySlug: 'dien-thoai',
      price: 29990000,
      maxPrice: 29990000, // No discount -> oldPrice and discount badge must be null
      primaryImage: 'https://example.com/s24u.jpg',
      categoryId: 1,
      categoryName: 'Điện thoại',
      brandId: 2,
      brandName: 'Samsung',
      isActive: true,
      variants: [],
      images: [],
    };

    const sharedProduct = toCategoryListingProduct(rawProduct);

    expect(sharedProduct.id).toBe('88');
    expect(sharedProduct.name).toBe('Samsung Galaxy S24 Ultra 256GB');
    expect(sharedProduct.slug).toBe('samsung-galaxy-s24-ultra');
    expect(sharedProduct.price).toBe(29990000);

    // CRITICAL HONESTY CHECKS:
    // 1. Must NOT fabricate oldPrice or discount percent
    expect(sharedProduct.oldPrice).toBeNull();
    expect(sharedProduct.discountPercent).toBeNull();

    // 2. Must NOT hardcode rating 5.0 or fake review count
    expect(sharedProduct.rating).toBeNull();
    expect(sharedProduct.reviewCount).toBeNull();

    // 3. Must NOT fabricate Tmember 1% or fake installment badge
    expect(sharedProduct.tmemberText).toBeNull();
    expect(sharedProduct.installmentText).toBeNull();

    // 4. Image must be preserved
    expect(sharedProduct.image).toBe('https://example.com/s24u.jpg');
  });

  it('correctly maps discount when backend returns maxPrice > price', () => {
    const rawProduct: ProductItem = {
      id: 99,
      name: 'iPhone 15 Pro Max 256GB',
      slug: 'iphone-15-pro-max-256gb',
      description: 'Mô tả iPhone 15',
      categorySlug: 'dien-thoai',
      price: 29490000,
      maxPrice: 34990000,
      primaryImage: 'https://example.com/iphone.jpg',
      categoryId: 1,
      categoryName: 'Điện thoại',
      brandId: 1,
      brandName: 'Apple',
      isActive: true,
      images: [],
      variants: [
        {
          variantId: 10,
          sku: 'IP-15PM-256',
          costPrice: 25000000,
          salePrice: 29490000,
          isActive: true,
          attributes: JSON.stringify({ ram: '8GB', ssd: '256GB' }),
        },
      ],
    };

    const sharedProduct = toCategoryListingProduct(rawProduct);

    expect(sharedProduct.oldPrice).toBe(34990000);
    expect(sharedProduct.discountPercent).toBe(16); // Math.round((34990000 - 29490000)/34990000 * 100) = 16%
    expect(sharedProduct.specs).toBe('8GB 256GB');
  });
});
