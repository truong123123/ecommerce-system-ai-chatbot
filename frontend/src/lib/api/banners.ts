import { API_BASE_URL } from '../env';
import { logError } from '../logger';
import { SHOWCASE_CONFIG } from '../../config/showcase';
import { ApiBannerSchema, Banner } from '../../types/showcase';
import { toBanner } from '../mappers/showcaseMapper';
import { z } from 'zod';

const BannersResponseSchema = z.array(ApiBannerSchema);

/**
 * Fetch banners from backend and filter for watch & audio showcase.
 */
export async function getBanners(): Promise<Banner[]> {
  const url = `${API_BASE_URL}/banners`;

  try {
    const res = await fetch(url, {
      next: {
        revalidate: SHOWCASE_CONFIG.REVALIDATE_SECONDS,
        tags: [SHOWCASE_CONFIG.CACHE_TAG],
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch banners: HTTP ${res.status} ${res.statusText}`);
    }

    const rawJson = await res.json();
    const parseResult = BannersResponseSchema.safeParse(rawJson);

    if (!parseResult.success) {
      logError('getBanners:ZodValidation', parseResult.error, { url });
      if (Array.isArray(rawJson)) {
        return rawJson
          .map((item) => {
            const parsed = ApiBannerSchema.safeParse(item);
            return parsed.success ? toBanner(parsed.data) : null;
          })
          .filter((item): item is Banner => item !== null);
      }
      return [];
    }

    // Filter relevant banners for watch and audio
    const relevant = parseResult.data.filter((b) => {
      const title = (b.title || '').toLowerCase();
      const link = (b.primaryBtnLink || '').toLowerCase();
      const isWatchAudio =
        title.includes('watch') ||
        title.includes('đồng hồ') ||
        title.includes('tai nghe') ||
        title.includes('âm thanh') ||
        title.includes('audio') ||
        link.includes('watch') ||
        link.includes('audio');
      return isWatchAudio && b.isActive !== false;
    });

    const finalBanners = relevant.length > 0 ? relevant : parseResult.data.slice(0, 2);
    return finalBanners.slice(0, 2).map(toBanner);
  } catch (error) {
    logError('getBanners', error, { url });
    throw error;
  }
}
