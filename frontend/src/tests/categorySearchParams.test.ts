import { describe, it, expect } from 'vitest';
import {
  parseCategorySearchParams,
  buildCategoryQueryString,
  buildPaginationUrl,
  validateAndGetRedirectUrl,
  getPriceRangesForCategory,
  ENABLE_SORT,
} from '../lib/category/categorySearchParams';

describe('categorySearchParams: ENABLE_SORT feature flag', () => {
  it('is disabled because backend does not support dynamic sorting', () => {
    expect(ENABLE_SORT).toBe(false);
  });
});

describe('categorySearchParams: parseCategorySearchParams', () => {
  it('normalizes valid page numbers', () => {
    const parsed = parseCategorySearchParams({ page: '3' }, 'dien-thoai');
    expect(parsed.page).toBe(3);
  });

  it('falls back to page 1 on invalid, negative, or zero page parameters', () => {
    expect(parseCategorySearchParams({ page: '-5' }, 'laptop').page).toBe(1);
    expect(parseCategorySearchParams({ page: '0' }, 'laptop').page).toBe(1);
    expect(parseCategorySearchParams({ page: 'not-a-number' }, 'laptop').page).toBe(1);
    expect(parseCategorySearchParams({ page: '' }, 'laptop').page).toBe(1);
    expect(parseCategorySearchParams(undefined, 'laptop').page).toBe(1);
  });

  it('handles array values from multi-valued query parameters safely', () => {
    const parsed = parseCategorySearchParams({ page: ['4', '5'] }, 'laptop');
    expect(parsed.page).toBe(4);
  });

  it('validates price filters and ignores ranges where minPrice > maxPrice', () => {
    // Malicious or reversed prices
    const reversed = parseCategorySearchParams(
      { minPrice: '20000000', maxPrice: '10000000' },
      'laptop'
    );
    expect(reversed.minPrice).toBeUndefined();
    expect(reversed.maxPrice).toBeUndefined();

    // Valid price range
    const valid = parseCategorySearchParams(
      { minPrice: '10000000', maxPrice: '15000000' },
      'laptop'
    );
    expect(valid.minPrice).toBe(10000000);
    expect(valid.maxPrice).toBe(15000000);
  });

  it('identifies category-specific preset price ranges', () => {
    // Computer category
    const laptopParsed = parseCategorySearchParams(
      { minPrice: '10000000', maxPrice: '15000000' },
      'laptop'
    );
    expect(laptopParsed.selectedPriceId).toBe('10m-15m');

    // Phone / general category
    const phoneParsed = parseCategorySearchParams(
      { minPrice: '2000000', maxPrice: '4000000' },
      'dien-thoai'
    );
    expect(phoneParsed.selectedPriceId).toBe('2m-4m');
  });
});

describe('categorySearchParams: buildCategoryQueryString', () => {
  it('returns empty string for default first page without filters', () => {
    expect(buildCategoryQueryString({ page: 1 })).toBe('');
    expect(buildCategoryQueryString({})).toBe('');
  });

  it('appends page parameter only when page > 1', () => {
    expect(buildCategoryQueryString({ page: 2 })).toBe('?page=2');
    expect(buildCategoryQueryString({ page: 5 })).toBe('?page=5');
  });

  it('builds clean query string with price bounds', () => {
    expect(
      buildCategoryQueryString({ minPrice: 10000000, maxPrice: 15000000 })
    ).toBe('?minPrice=10000000&maxPrice=15000000');

    expect(
      buildCategoryQueryString({ minPrice: 10000000, maxPrice: 15000000, page: 3 })
    ).toBe('?minPrice=10000000&maxPrice=15000000&page=3');
  });
});

describe('categorySearchParams: buildPaginationUrl', () => {
  it('builds crawlable pagination links preserving price filters', () => {
    const url1 = buildPaginationUrl(
      '/category/laptop',
      { minPrice: 10000000, maxPrice: 15000000 },
      1
    );
    expect(url1).toBe('/category/laptop?minPrice=10000000&maxPrice=15000000');

    const url2 = buildPaginationUrl(
      '/category/laptop',
      { minPrice: 10000000, maxPrice: 15000000 },
      2
    );
    expect(url2).toBe('/category/laptop?minPrice=10000000&maxPrice=15000000&page=2');
  });

  it('builds clean URLs when paging without filters', () => {
    expect(buildPaginationUrl('/category/laptop', {}, 1)).toBe('/category/laptop');
    expect(buildPaginationUrl('/category/laptop', {}, 3)).toBe('/category/laptop?page=3');
    expect(buildPaginationUrl('/category/laptop/asus', {}, 2)).toBe('/category/laptop/asus?page=2');
  });
});

describe('categorySearchParams: filter change resets page to 1', () => {
  it('omits page parameter when applying new filter so user starts at page 1', () => {
    const newFilterUrl = buildPaginationUrl(
      '/category/laptop',
      { minPrice: 20000000, maxPrice: 30000000 },
      1
    );
    // Page 1 is default, query string has no &page=1
    expect(newFilterUrl).toBe('/category/laptop?minPrice=20000000&maxPrice=30000000');
    expect(newFilterUrl).not.toContain('page=');
  });
});

describe('categorySearchParams: validateAndGetRedirectUrl', () => {
  const basePath = '/category/laptop';
  const filters = { minPrice: 10000000, maxPrice: 20000000 };

  it('redirects to page 1 when raw page query is not a positive integer (e.g. 0, -1, abc)', () => {
    expect(validateAndGetRedirectUrl(basePath, '0', 1, 5, filters)).toBe(
      '/category/laptop?minPrice=10000000&maxPrice=20000000'
    );
    expect(validateAndGetRedirectUrl(basePath, '-3', 1, 5, filters)).toBe(
      '/category/laptop?minPrice=10000000&maxPrice=20000000'
    );
    expect(validateAndGetRedirectUrl(basePath, 'invalid', 1, 5, filters)).toBe(
      '/category/laptop?minPrice=10000000&maxPrice=20000000'
    );
  });

  it('redirects to max available page when parsed page exceeds totalPages', () => {
    const redirectUrl = validateAndGetRedirectUrl(basePath, '99', 99, 6, filters);
    expect(redirectUrl).toBe('/category/laptop?minPrice=10000000&maxPrice=20000000&page=6');
  });

  it('redirects to page 1 when totalPages is 0 but user accesses page > 1', () => {
    const redirectUrl = validateAndGetRedirectUrl(basePath, '3', 3, 0, filters);
    expect(redirectUrl).toBe('/category/laptop?minPrice=10000000&maxPrice=20000000');
  });

  it('returns null when page is within valid boundaries', () => {
    expect(validateAndGetRedirectUrl(basePath, '3', 3, 6, filters)).toBeNull();
    expect(validateAndGetRedirectUrl(basePath, '1', 1, 1, {})).toBeNull();
    expect(validateAndGetRedirectUrl(basePath, undefined, 1, 5, {})).toBeNull();
  });
});

