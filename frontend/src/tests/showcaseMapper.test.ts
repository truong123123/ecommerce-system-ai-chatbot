import { describe, it, expect } from 'vitest';
import { toProduct, toBanner } from '../lib/mappers/showcaseMapper';
import { ApiProduct, ApiBanner } from '../types/showcase';

describe('showcaseMapper: toProduct', () => {
  it('correctly maps valid API product without fabricating mock data', () => {
    const apiProduct: ApiProduct = {
      id: 17,
      name: 'Apple Watch Series 10',
      slug: 'apple-watch-series-10',
      categoryId: 11,
      categoryName: 'Đồng hồ thông minh',
      categorySlug: 'dong-ho',
      brandId: 1,
      brandName: 'Apple',
      description: 'Màn hình OLED',
      primaryImage: 'https://images.unsplash.com/watch.jpg',
      price: 11490000,
      maxPrice: 11490000, // No discount
      isActive: true,
      isHot: true,
      isNew: true,
    };

    const product = toProduct(apiProduct);

    expect(product.id).toBe('17');
    expect(product.name).toBe('Apple Watch Series 10');
    expect(product.price).toBe(11490000);
    // CRITICAL: Must NOT fabricate oldPrice = price * 1.2
    expect(product.oldPrice).toBeNull();
    // CRITICAL: Must NOT fabricate discountPercent
    expect(product.discountPercent).toBeNull();
    // CRITICAL: Must NOT fabricate rating: 5
    expect(product.rating).toBeNull();
    // CRITICAL: Must NOT fabricate promo or installment text
    expect(product.tmemberDiscountText).toBeNull();
    expect(product.installmentText).toBeNull();
    expect(product.category).toBe('dong-ho');
  });

  it('correctly calculates real discount when maxPrice is genuinely higher than price', () => {
    const apiProductWithDiscount: ApiProduct = {
      id: 20,
      name: 'Tai nghe Sony WH-1000XM5',
      slug: 'sony-wh-1000xm5',
      categoryId: 12,
      categoryName: 'Âm thanh',
      categorySlug: 'audio',
      brandId: 4,
      brandName: 'Sony',
      primaryImage: 'https://images.unsplash.com/sony.jpg',
      price: 6990000,
      maxPrice: 8990000, // Genuine old price
      isActive: true,
    };

    const product = toProduct(apiProductWithDiscount);

    expect(product.price).toBe(6990000);
    expect(product.oldPrice).toBe(8990000);
    // (8990000 - 6990000) / 8990000 * 100 = 22.2% -> 22%
    expect(product.discountPercent).toBe(22);
    expect(product.category).toBe('am-thanh');
  });

  it('preserves genuine rating only when provided by backend API', () => {
    const apiProductWithRating: ApiProduct = {
      id: 22,
      name: 'Garmin Forerunner 165',
      slug: 'garmin-forerunner-165',
      categoryId: 11,
      categorySlug: 'dong-ho',
      price: 6690000,
      rating: 4.8,
      reviewCount: 35,
    };

    const product = toProduct(apiProductWithRating);
    expect(product.rating).toBe(4.8);
    expect(product.reviewCount).toBe(35);
  });
});

describe('showcaseMapper: toBanner', () => {
  it('correctly maps API banner to ViewModel', () => {
    const apiBanner: ApiBanner = {
      id: 4,
      title: 'Apple Watch Ultra 2',
      imageUrl: 'https://images.unsplash.com/ultra2.jpg',
      primaryBtnLink: '/products/apple-watch-ultra-2',
      isActive: true,
    };

    const banner = toBanner(apiBanner);
    expect(banner.id).toBe('4');
    expect(banner.title).toBe('Apple Watch Ultra 2');
    expect(banner.imageUrl).toBe('https://images.unsplash.com/ultra2.jpg');
    expect(banner.targetLink).toBe('/products/apple-watch-ultra-2');
  });
});
