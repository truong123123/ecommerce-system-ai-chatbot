import { API_BASE_URL } from '../env';
import { logError } from '../logger';
import { LAPTOP_CONFIG } from '../../config/laptopShowcase';
import { ApiProductSchema, ApiBannerSchema } from '../../types/showcase';
import { GetLaptopProductsParams, LaptopBanner, LaptopProduct } from '../../types/laptop';
import { resolveBrandSlug, toLaptopBanner, toLaptopProduct } from '../mappers/laptopMapper';
import { z } from 'zod';

const ProductsResponseSchema = z.array(ApiProductSchema);
const BannersResponseSchema = z.array(ApiBannerSchema);

/**
 * Fetch products for Laptop Showcase from Spring Boot backend using typed query parameters.
 * Eliminates client-side name.includes() guessing; enforces server-level filtering.
 */
export async function getLaptopProducts(params?: GetLaptopProductsParams): Promise<LaptopProduct[]> {
  const query = new URLSearchParams();

  const categorySlug = params?.categorySlug || 'laptop';
  query.set('categorySlug', categorySlug);

  const brandSlug = params?.brandSlug || resolveBrandSlug(params?.brand);
  if (brandSlug && brandSlug !== 'tat-ca' && brandSlug !== 'all') {
    query.set('brandSlug', brandSlug);
  }

  const limit = params?.limit ?? LAPTOP_CONFIG.DEFAULT_LIMIT;
  query.set('limit', String(limit));
  query.set('activeOnly', 'true');

  const queryString = query.toString();
  const url = `${API_BASE_URL}/products?${queryString}`;

  try {
    const res = await fetch(url, {
      next: {
        revalidate: LAPTOP_CONFIG.REVALIDATE_SECONDS,
        tags: [LAPTOP_CONFIG.CACHE_TAG],
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch laptop products: HTTP ${res.status} ${res.statusText}`);
    }

    const rawJson = await res.json();
    const parseResult = ProductsResponseSchema.safeParse(rawJson);

    if (!parseResult.success) {
      logError('getLaptopProducts:ZodValidation', parseResult.error, {
        url,
        count: Array.isArray(rawJson) ? rawJson.length : 0,
      });

      if (Array.isArray(rawJson)) {
        return rawJson
          .map((item) => {
            const parsed = ApiProductSchema.safeParse(item);
            return parsed.success ? toLaptopProduct(parsed.data) : null;
          })
          .filter((item): item is LaptopProduct => item !== null);
      }
      return [];
    }

    return parseResult.data.map(toLaptopProduct);
  } catch (error) {
    logError('getLaptopProducts', error, { url });
    throw error;
  }
}

/**
 * Fetch and filter vertical banners matching laptop, mac, pc, and monitor campaigns.
 */
export async function getLaptopBanners(): Promise<LaptopBanner[]> {
  const url = `${API_BASE_URL}/banners`;

  try {
    const res = await fetch(url, {
      next: {
        revalidate: LAPTOP_CONFIG.REVALIDATE_SECONDS,
        tags: [LAPTOP_CONFIG.CACHE_TAG],
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch banners: HTTP ${res.status} ${res.statusText}`);
    }

    const rawJson = await res.json();
    const parseResult = BannersResponseSchema.safeParse(rawJson);

    let bannersList = [];
    if (parseResult.success) {
      bannersList = parseResult.data;
    } else if (Array.isArray(rawJson)) {
      bannersList = rawJson
        .map((item) => {
          const parsed = ApiBannerSchema.safeParse(item);
          return parsed.success ? parsed.data : null;
        })
        .filter((b): b is z.infer<typeof ApiBannerSchema> => b !== null);
    }

    const relevant = bannersList.filter((b) => {
      const title = (b.title || '').toLowerCase();
      const link = (b.primaryBtnLink || '').toLowerCase();
      const isLaptopRelated =
        title.includes('laptop') ||
        title.includes('mac') ||
        title.includes('pc') ||
        title.includes('màn hình') ||
        link.includes('laptop') ||
        link.includes('mac') ||
        link.includes('pc');
      return isLaptopRelated && b.isActive !== false;
    });

    const selected = relevant.length > 0 ? relevant : bannersList.slice(0, 2);
    return selected.slice(0, 2).map(toLaptopBanner);
  } catch (error) {
    logError('getLaptopBanners', error, { url });
    throw error;
  }
}
