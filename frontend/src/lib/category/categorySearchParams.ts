/**
 * Feature flag: Backend does not currently support dynamic sorting parameters (it hardcodes createdAt DESC).
 * Client-side sorting on paged subsets yields incorrect e-commerce results.
 * Sorting UI is disabled until backend implements sort query parameter.
 */
export const ENABLE_SORT = false;

export interface PriceRangeOption {
  id: string;
  label: string;
  min?: number;
  max?: number;
}

export interface ParsedCategorySearchParams {
  page: number;
  minPrice?: number;
  maxPrice?: number;
  selectedPriceId?: string;
}

/**
 * Returns available price range filters based on category type.
 */
export function getPriceRangesForCategory(categorySlug: string): PriceRangeOption[] {
  const slug = (categorySlug || '').toLowerCase();
  const isComputer = slug.includes('laptop') || slug.includes('pc') || slug.includes('mac');

  if (isComputer) {
    return [
      { id: 'under-10m', label: 'Dưới 10 triệu', max: 10000000 },
      { id: '10m-15m', label: '10 - 15 triệu', min: 10000000, max: 15000000 },
      { id: '15m-20m', label: '15 - 20 triệu', min: 15000000, max: 20000000 },
      { id: '20m-30m', label: '20 - 30 triệu', min: 20000000, max: 30000000 },
      { id: 'over-30m', label: 'Trên 30 triệu', min: 30000000 },
    ];
  }

  return [
    { id: 'under-2m', label: 'Dưới 2 triệu', max: 2000000 },
    { id: '2m-4m', label: '2 - 4 triệu', min: 2000000, max: 4000000 },
    { id: '4m-7m', label: '4 - 7 triệu', min: 4000000, max: 7000000 },
    { id: '7m-13m', label: '7 - 13 triệu', min: 7000000, max: 13000000 },
    { id: '13m-20m', label: '13 - 20 triệu', min: 13000000, max: 20000000 },
    { id: 'over-20m', label: 'Trên 20 triệu', min: 20000000 },
  ];
}

/**
 * Validates and normalizes raw search params.
 * - Negative or non-numeric page numbers fallback to 1.
 * - If minPrice > maxPrice, invalid range is discarded.
 * - Matches custom or preset price ranges.
 */
export function parseCategorySearchParams(
  rawParams: Record<string, string | string[] | undefined> | undefined,
  categorySlug: string
): ParsedCategorySearchParams {
  const getParam = (key: string): string | undefined => {
    const val = rawParams?.[key];
    if (Array.isArray(val)) return val[0];
    return val;
  };

  // 1. Page number validation
  const rawPage = getParam('page');
  let page = 1;
  if (rawPage) {
    const parsedPage = parseInt(rawPage, 10);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      page = parsedPage;
    }
  }

  // 2. Price filter parsing
  const rawMin = getParam('minPrice');
  const rawMax = getParam('maxPrice');
  let minPrice: number | undefined = undefined;
  let maxPrice: number | undefined = undefined;

  if (rawMin) {
    const parsedMin = parseInt(rawMin, 10);
    if (!isNaN(parsedMin) && parsedMin >= 0) {
      minPrice = parsedMin;
    }
  }

  if (rawMax) {
    const parsedMax = parseInt(rawMax, 10);
    if (!isNaN(parsedMax) && parsedMax > 0) {
      maxPrice = parsedMax;
    }
  }

  // If minPrice > maxPrice, input is malicious or invalid; discard both
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    minPrice = undefined;
    maxPrice = undefined;
  }

  // 3. Match selected preset price ID for UI highlight
  const ranges = getPriceRangesForCategory(categorySlug);
  let selectedPriceId: string | undefined = undefined;
  if (minPrice !== undefined || maxPrice !== undefined) {
    const matched = ranges.find((r) => {
      const matchMin = r.min === undefined ? minPrice === undefined : r.min === minPrice;
      const matchMax = r.max === undefined ? maxPrice === undefined : r.max === maxPrice;
      return matchMin && matchMax;
    });
    if (matched) {
      selectedPriceId = matched.id;
    }
  }

  return {
    page,
    minPrice,
    maxPrice,
    selectedPriceId,
  };
}

/**
 * Builds a clean query string from filters.
 * Excludes default values (e.g. page=1) to keep URLs canonical and concise.
 */
export function buildCategoryQueryString(
  filters: { page?: number; minPrice?: number; maxPrice?: number }
): string {
  const params = new URLSearchParams();

  if (filters.minPrice !== undefined && filters.minPrice >= 0) {
    params.set('minPrice', filters.minPrice.toString());
  }

  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    params.set('maxPrice', filters.maxPrice.toString());
  }

  if (filters.page !== undefined && filters.page > 1) {
    params.set('page', filters.page.toString());
  }

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Builds full link URL for pagination.
 */
export function buildPaginationUrl(
  basePath: string,
  currentFilters: { minPrice?: number; maxPrice?: number },
  targetPage: number
): string {
  const qs = buildCategoryQueryString({
    minPrice: currentFilters.minPrice,
    maxPrice: currentFilters.maxPrice,
    page: targetPage,
  });
  return `${basePath}${qs}`;
}

/**
 * Evaluates whether current page query parameter is invalid or exceeds total pages.
 * Returns a canonical redirect URL if adjustment is needed, or null if page is valid.
 */
export function validateAndGetRedirectUrl(
  basePath: string,
  rawPageParam: string | string[] | undefined,
  parsedPage: number,
  totalPages: number,
  filters: { minPrice?: number; maxPrice?: number }
): string | null {
  const rawPageStr = Array.isArray(rawPageParam) ? rawPageParam[0] : rawPageParam;

  // 1. Raw page parameter is present on URL, but is not a valid positive integer string (e.g. '0', '-1', 'abc')
  if (rawPageStr !== undefined) {
    const isStrictPositiveInt = /^[1-9]\d*$/.test(rawPageStr.trim());
    if (!isStrictPositiveInt) {
      return buildPaginationUrl(basePath, filters, 1);
    }
  }

  // 2. Page exceeds total pages available
  if (totalPages > 0 && parsedPage > totalPages) {
    return buildPaginationUrl(basePath, filters, totalPages);
  }

  // 3. Category has no items (totalPages === 0), but user accessed page > 1
  if (totalPages === 0 && parsedPage > 1) {
    return buildPaginationUrl(basePath, filters, 1);
  }

  return null;
}

