import { API_BASE_URL } from '../env';
import { logError } from '../logger';
import { SHOWCASE_CONFIG } from '../../config/showcase';
import { ApiBrandSchema, BrandFilter } from '../../types/showcase';
import { toBrandFilter } from '../mappers/showcaseMapper';
import { z } from 'zod';

const BrandsResponseSchema = z.array(ApiBrandSchema);

/**
 * Fetch available brands for a category from backend.
 */
export async function getBrands(categorySlug?: string): Promise<BrandFilter[]> {
  const query = new URLSearchParams();
  if (categorySlug) {
    query.set('categorySlug', categorySlug);
  }
  query.set('activeOnly', 'true');

  const queryString = query.toString();
  const url = `${API_BASE_URL}/brands${queryString ? `?${queryString}` : ''}`;

  try {
    const res = await fetch(url, {
      next: {
        revalidate: SHOWCASE_CONFIG.REVALIDATE_SECONDS,
        tags: [SHOWCASE_CONFIG.CACHE_TAG],
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch brands: HTTP ${res.status} ${res.statusText}`);
    }

    const rawJson = await res.json();
    const parseResult = BrandsResponseSchema.safeParse(rawJson);

    if (!parseResult.success) {
      logError('getBrands:ZodValidation', parseResult.error, { url });
      if (Array.isArray(rawJson)) {
        return rawJson
          .map((item) => {
            const parsed = ApiBrandSchema.safeParse(item);
            return parsed.success ? toBrandFilter(parsed.data) : null;
          })
          .filter((item): item is BrandFilter => item !== null);
      }
      return [];
    }

    return parseResult.data.map(toBrandFilter);
  } catch (error) {
    logError('getBrands', error, { url });
    // Brands failure shouldn't crash the showcase; return empty array
    return [];
  }
}
