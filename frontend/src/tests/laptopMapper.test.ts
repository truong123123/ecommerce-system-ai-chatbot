import { describe, it, expect } from 'vitest';
import {
  extractSpecs,
  resolveBrandSlug,
  toLaptopBanner,
  toLaptopProduct,
} from '../lib/mappers/laptopMapper';
import { ApiProduct, ApiBanner } from '../types/showcase';

describe('laptopMapper: toLaptopProduct', () => {
  it('correctly maps valid laptop without fabricating fake prices, ratings or promos (hiding badges)', () => {
    const apiProduct: ApiProduct = {
      id: 16,
      name: 'Laptop ASUS TUF Gaming F15 FX506HF',
      slug: 'laptop-asus-tuf-gaming-f15',
      categoryId: 7,
      categoryName: 'Laptop',
      categorySlug: 'laptop',
      brandId: 5,
      brandName: 'Asus',
      primaryImage: 'https://images.unsplash.com/laptop.jpg',
      price: 16990000,
      maxPrice: 16990000, // No discount -> badges must be hidden
      isActive: true,
      variants: [
        {
          variantId: 101,
          attributes: JSON.stringify({
            cpu: 'i5-11400H',
            gpu: 'RTX 2050',
            ram: '16GB',
            ssd: '512GB',
            screen: '15.6" FHD 144Hz',
          }),
        },
      ],
    };

    const product = toLaptopProduct(apiProduct);

    expect(product.id).toBe('16');
    expect(product.name).toBe('Laptop ASUS TUF Gaming F15 FX506HF');
    expect(product.price).toBe(16990000);

    // CRITICAL: Must NOT fabricate oldPrice = price * 1.1 when maxPrice is not greater
    expect(product.oldPrice).toBeNull();
    // CRITICAL: Must NOT fabricate discount percentage (badge must stay hidden)
    expect(product.discountPercent).toBeNull();
    // CRITICAL: Must NOT fabricate rating: 5
    expect(product.rating).toBeNull();
    // CRITICAL: Must NOT fabricate Tmember 1% or T-Student 3%
    expect(product.tmemberText).toBeNull();
    expect(product.studentText).toBeNull();
    expect(product.installmentText).toBeNull();

    // Specs correctly extracted from JSON string
    expect(product.specs).toBe('i5-11400H | RTX 2050 | 16GB 512GB | 15.6" FHD 144Hz');
  });

  it('correctly computes genuine discount when maxPrice is strictly greater than price', () => {
    const apiProductWithDiscount: ApiProduct = {
      id: 18,
      name: 'Laptop HP Omnibook 5 AI',
      slug: 'laptop-hp-omnibook-5-ai',
      categoryId: 7,
      categorySlug: 'laptop',
      brandName: 'HP',
      price: 24000000,
      maxPrice: 30000000, // Genuine 20% discount
    };

    const product = toLaptopProduct(apiProductWithDiscount);

    expect(product.price).toBe(24000000);
    expect(product.oldPrice).toBe(30000000);
    // (30000000 - 24000000) / 30000000 * 100 = 20%
    expect(product.discountPercent).toBe(20);
  });

  it('hides specs pill when variant attributes are absent', () => {
    const apiProductWithoutSpecs: ApiProduct = {
      id: 19,
      name: 'Màn hình ASUS ProArt PA278CV',
      slug: 'man-hinh-asus-proart',
      categoryId: 8,
      categorySlug: 'man-hinh',
      price: 9990000,
      maxPrice: null,
      variants: [],
    };

    const product = toLaptopProduct(apiProductWithoutSpecs);
    expect(product.specs).toBeNull();
    expect(product.oldPrice).toBeNull();
    expect(product.discountPercent).toBeNull();
  });

  it('preserves genuine rating only when provided by backend API', () => {
    const apiProductWithRating: ApiProduct = {
      id: 25,
      name: 'MacBook Air M3 16GB',
      slug: 'macbook-air-m3-16gb',
      categoryId: 2,
      categorySlug: 'macbook',
      brandName: 'Apple',
      price: 27990000,
      rating: 4.9,
      reviewCount: 42,
    };

    const product = toLaptopProduct(apiProductWithRating);
    expect(product.rating).toBe(4.9);
    expect(product.reviewCount).toBe(42);
  });
});

describe('laptopMapper: extractSpecs', () => {
  it('extracts specs from serialized JSON attributes string', () => {
    const jsonStr = JSON.stringify({
      cpu: 'R7-8845HS',
      gpu: 'RTX 3050',
      ram: '16GB',
      ssd: '512GB',
      screen: '15.6 inch FHD 144Hz',
    });

    const specs = extractSpecs(jsonStr);
    expect(specs).toBe('R7-8845HS | RTX 3050 | 16GB 512GB | 15.6 inch FHD 144Hz');
  });

  it('extracts specs from parsed object attributes', () => {
    const obj = {
      cpu: 'M3 Pro',
      gpu: '18-core GPU',
      ram: '18GB',
      ssd: '512GB',
      screen: '14.2 inch Liquid Retina XDR',
    };

    const specs = extractSpecs(obj);
    expect(specs).toBe('M3 Pro | 18-core GPU | 18GB 512GB | 14.2 inch Liquid Retina XDR');
  });

  it('returns null when attributes are empty or invalid', () => {
    expect(extractSpecs(null)).toBeNull();
    expect(extractSpecs(undefined)).toBeNull();
    expect(extractSpecs({})).toBeNull();
  });
});

describe('laptopMapper: resolveBrandSlug', () => {
  it('maps brand names correctly to backend slugs', () => {
    expect(resolveBrandSlug('MacBook')).toBe('apple');
    expect(resolveBrandSlug('ASUS')).toBe('asus');
    expect(resolveBrandSlug('Lenovo')).toBe('lenovo');
    expect(resolveBrandSlug('Tất cả')).toBeUndefined();
    expect(resolveBrandSlug('all')).toBeUndefined();
    expect(resolveBrandSlug('')).toBeUndefined();
    expect(resolveBrandSlug(undefined)).toBeUndefined();
  });
});

describe('laptopMapper: toLaptopBanner', () => {
  it('maps API banner to ViewModel', () => {
    const apiBanner: ApiBanner = {
      id: 5,
      title: 'Laptop Gaming Mới',
      imageUrl: 'https://images.unsplash.com/banner.jpg',
      primaryBtnLink: '/products?keyword=laptop',
      isActive: true,
    };

    const banner = toLaptopBanner(apiBanner);
    expect(banner.id).toBe('5');
    expect(banner.title).toBe('Laptop Gaming Mới');
    expect(banner.imageUrl).toBe('https://images.unsplash.com/banner.jpg');
    expect(banner.targetLink).toBe('/products?keyword=laptop');
    expect(banner.badgeText).toBe('Laptop & PC');
  });
});
