import React, { Suspense } from 'react';
import { getProducts } from '../../lib/api/products';
import { getBanners } from '../../lib/api/banners';
import { getBrands } from '../../lib/api/brands';
import { DEFAULT_BRANDS_LIST, SHOWCASE_CONFIG, WATCH_TABS } from '../../config/showcase';
import { logError } from '../../lib/logger';
import { Product, Banner } from '../../types/showcase';
import { WatchAudioShowcaseClient } from './watch-audio/WatchAudioShowcaseClient';
import { ShowcaseSkeleton } from './watch-audio/ShowcaseSkeleton';
import { ErrorState } from './watch-audio/ErrorState';

interface WatchAudioShowcaseProps {
  searchParams?: {
    tab?: string;
    brand?: string;
    need?: string;
  };
}

/**
 * Async Server Component: Fetches products, banners, and brands with Next.js App Router cache revalidation.
 * Zero client-side fetch waterfalls; full SSR HTML output for SEO.
 */
async function WatchAudioShowcaseData({ searchParams }: WatchAudioShowcaseProps) {
  const activeTabId = searchParams?.tab || 'dong-ho';
  const selectedTab = WATCH_TABS.find((t) => t.id === activeTabId) || WATCH_TABS[0];
  const currentCategorySlug = selectedTab.categorySlug;

  const rawBrandParam = searchParams?.brand;
  const activeBrandName = rawBrandParam && rawBrandParam.trim() !== '' ? rawBrandParam : 'Tất cả';
  const brandSlug =
    activeBrandName !== 'Tất cả'
      ? activeBrandName.toLowerCase().replace(/\s+/g, '-')
      : undefined;

  let products: Product[] = [];
  let banners: Banner[] = [];
  let availableBrands: string[] = [...DEFAULT_BRANDS_LIST];
  let hasFetchError = false;

  try {
    // Isolated parallel fetching: Banners failure does NOT crash products and vice-versa
    const [productsResult, bannersResult, brandsResult] = await Promise.allSettled([
      getProducts({
        categorySlug: currentCategorySlug,
        brandSlug,
        limit: SHOWCASE_CONFIG.DEFAULT_LIMIT,
      }),
      getBanners(),
      getBrands(currentCategorySlug),
    ]);

    if (productsResult.status === 'fulfilled') {
      products = productsResult.value;
    } else {
      hasFetchError = true;
      logError('WatchAudioShowcase:getProducts', productsResult.reason);
    }

    if (bannersResult.status === 'fulfilled') {
      banners = bannersResult.value;
    } else {
      logError('WatchAudioShowcase:getBanners', bannersResult.reason);
    }

    if (brandsResult.status === 'fulfilled' && brandsResult.value.length > 0) {
      const fetchedBrandNames = brandsResult.value.map((b) => b.name);
      availableBrands = ['Tất cả', ...Array.from(new Set(fetchedBrandNames))];
    }
  } catch (error) {
    hasFetchError = true;
    logError('WatchAudioShowcase:RootFetch', error);
  }

  // Error boundary state: Never fall back to fake mock data
  if (hasFetchError && products.length === 0) {
    return (
      <div style={{ maxWidth: 1240, margin: '32px auto', padding: '0 16px' }}>
        <ErrorState
          message="Không thể kết nối máy chủ để tải sản phẩm. Vui lòng thử lại sau."
          onRetry={() => {
            if (typeof window !== 'undefined') window.location.reload();
          }}
        />
      </div>
    );
  }

  // Generate valid Schema.org JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Danh mục ${selectedTab.label}`,
    numberOfItems: products.length,
    itemListElement: products.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: item.name,
        image: item.image,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'VND',
          price: item.price,
          availability: 'https://schema.org/InStock',
        },
        ...(item.rating !== null
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: item.rating,
                reviewCount: item.reviewCount || 1,
              },
            }
          : {}),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WatchAudioShowcaseClient
        initialProducts={products}
        banners={banners}
        availableBrands={availableBrands}
        activeTab={activeTabId}
        activeBrand={activeBrandName}
        currentCategorySlug={currentCategorySlug}
      />
    </>
  );
}

/**
 * Server Component wrapped with React Suspense for progressive streaming and zero layout shift.
 */
export function WatchAudioShowcase(props: WatchAudioShowcaseProps) {
  return (
    <Suspense fallback={<ShowcaseSkeleton />}>
      <WatchAudioShowcaseData {...props} />
    </Suspense>
  );
}
export default WatchAudioShowcase;
