import { API_BASE_URL } from '../env';
import { logError } from '../logger';
import { SHOWCASE_CONFIG } from '../../config/showcase';
import { ApiProductSchema, GetProductsParams, Product } from '../../types/showcase';
import { toProduct } from '../mappers/showcaseMapper';
import { z } from 'zod';

const ProductsResponseSchema = z.array(ApiProductSchema);

/**
 * Fetch products from backend with strict typed query parameters and Next.js revalidation.
 */
export async function getProducts(params?: GetProductsParams): Promise<Product[]> {
  const query = new URLSearchParams();

  if (params?.categorySlug) {
    query.set('categorySlug', params.categorySlug);
  }
  if (params?.brandSlug && params.brandSlug !== 'tat-ca' && params.brandSlug !== 'all') {
    query.set('brandSlug', params.brandSlug);
  }
  if (params?.brandId != null) {
    query.set('brandId', String(params.brandId));
  }
  // If backend supports need in future
  if (params?.need) {
    query.set('need', params.need);
  }

  const limit = params?.limit ?? SHOWCASE_CONFIG.DEFAULT_LIMIT;
  query.set('limit', String(limit));
  query.set('activeOnly', 'true');

  const queryString = query.toString();
  const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;

  try {
    const res = await fetch(url, {
      next: {
        revalidate: SHOWCASE_CONFIG.REVALIDATE_SECONDS,
        tags: [SHOWCASE_CONFIG.CACHE_TAG],
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch products: HTTP ${res.status} ${res.statusText}`);
    }

    const rawJson = await res.json();
    const parseResult = ProductsResponseSchema.safeParse(rawJson);

    if (!parseResult.success) {
      logError('getProducts:ZodValidation', parseResult.error, { url, count: Array.isArray(rawJson) ? rawJson.length : 0 });
      // If validation fails on non-critical fields, fall back to safe mapping
      if (Array.isArray(rawJson)) {
        return rawJson
          .map((item) => {
            const parsed = ApiProductSchema.safeParse(item);
            return parsed.success ? toProduct(parsed.data) : null;
          })
          .filter((item): item is Product => item !== null);
      }
      return [];
    }

    return parseResult.data.map(toProduct);
  } catch (error) {
    logError('getProducts', error, { url });
    throw error; // Propagate so caller or ErrorBoundary can react
  }
}
