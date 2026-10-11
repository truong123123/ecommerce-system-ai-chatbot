import React, { Suspense } from 'react';
import { getLaptopBanners, getLaptopProducts } from '@/lib/api/laptops';
import { LAPTOP_TABS } from '@/config/laptopShowcase';
import { logError } from '@/lib/logger';
import { LaptopBanner, LaptopProduct } from '@/types/laptop';
import { ErrorState } from '@/components/common/ErrorState';
import { LaptopShowcaseClient } from './LaptopShowcaseClient';
import { LaptopShowcaseSkeleton } from './laptop/LaptopShowcaseSkeleton';

export interface LaptopShowcaseProps {
  searchParams?: {
    laptopTab?: string;
    laptopBrand?: string;
    tab?: string;
    brand?: string;
  };
}

/**
 * Async Server Component: Fetches laptop products and banners on the server
 * with Next.js App Router cache revalidation (tags: ['showcase'], revalidate: 60).
 * Eliminates waterfalls, fake data fallbacks, and client-side filtering.
 */
async function LaptopShowcaseData({ searchParams }: LaptopShowcaseProps) {
  const activeTabId =
    searchParams?.laptopTab ||
    (searchParams?.tab && LAPTOP_TABS.some((t) => t.id === searchParams.tab)
      ? searchParams.tab
      : 'laptop');

  const selectedTab =
    LAPTOP_TABS.find((t) => t.id === activeTabId) || LAPTOP_TABS[0];
  const currentCategorySlug = selectedTab.categorySlug;

  const rawBrand = searchParams?.laptopBrand || searchParams?.brand;
  const activeBrandName =
    rawBrand && rawBrand.trim() !== '' && rawBrand !== 'all' ? rawBrand : 'Tất cả';

  let products: LaptopProduct[] = [];
  let banners: LaptopBanner[] = [];
  let hasFetchError = false;

  try {
    // Parallel fetching: Banner failure does NOT prevent products from rendering
    const [productsResult, bannersResult] = await Promise.allSettled([
      getLaptopProducts({
        categorySlug: currentCategorySlug,
        brand: activeBrandName,
      }),
      getLaptopBanners(),
    ]);

    if (productsResult.status === 'fulfilled') {
      products = productsResult.value;
    } else {
      hasFetchError = true;
      logError('LaptopShowcase:getLaptopProducts', productsResult.reason);
    }

    if (bannersResult.status === 'fulfilled') {
      banners = bannersResult.value;
    } else {
      logError('LaptopShowcase:getLaptopBanners', bannersResult.reason);
    }
  } catch (error) {
    hasFetchError = true;
    logError('LaptopShowcase:RootFetch', error);
  }

  // Error boundary state: Render standard ErrorState rather than inventing fake data
  if (hasFetchError && products.length === 0) {
    return (
      <div style={{ maxWidth: 1240, margin: '32px auto', padding: '0 16px' }}>
        <ErrorState
          message="Không thể kết nối máy chủ để tải danh sách laptop. Vui lòng thử lại sau."
          onRetry={() => {
            if (typeof window !== 'undefined') window.location.reload();
          }}
        />
      </div>
    );
  }

  // Schema.org ItemList JSON-LD structured data for SEO
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
      <LaptopShowcaseClient
        initialProducts={products}
        banners={banners}
        activeTab={selectedTab.id}
        activeBrand={activeBrandName}
        currentCategorySlug={currentCategorySlug}
      />
    </>
  );
}

/**
 * Server Component wrapped with React Suspense for progressive streaming.
 */
export function LaptopShowcase(props: LaptopShowcaseProps) {
  return (
    <Suspense fallback={<LaptopShowcaseSkeleton />}>
      <LaptopShowcaseData {...props} />
    </Suspense>
  );
}

export default LaptopShowcase;
