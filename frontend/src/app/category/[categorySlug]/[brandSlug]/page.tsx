import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { CategoryListingPage } from '@/components/category/CategoryListingPage';
import {
  getCategoryBySlug,
  getAllCategories,
  getBrandsByCategory,
  getCategoryProductsPaged,
} from '@/lib/api/categoryListing';
import {
  parseCategorySearchParams,
  buildCategoryQueryString,
  validateAndGetRedirectUrl,
} from '@/lib/category/categorySearchParams';

interface PageProps {
  params: {
    categorySlug: string;
    brandSlug: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.categorySlug);
  if (!category) {
    return {
      title: 'Không tìm thấy danh mục | truongngstore',
      description: 'Danh mục sản phẩm không tồn tại.',
    };
  }

  const brands = await getBrandsByCategory(params.categorySlug);
  const activeBrand = brands.find(
    (b) => b.slug.toLowerCase() === params.brandSlug.toLowerCase()
  );
  const brandName = activeBrand ? activeBrand.name : params.brandSlug;

  const parsed = parseCategorySearchParams(searchParams, params.categorySlug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truongngstore.vn';
  const basePath = `/category/${params.categorySlug}/${params.brandSlug}`;

  // Faceted navigation SEO rules:
  // - Filtered by price: noindex, follow.
  //   IMPORTANT: Canonical is omitted when noindex is active to avoid conflicting signals to search engines.
  // - Standard pagination / base brand category: self-canonical, index, follow.
  const hasPriceFilter = parsed.minPrice !== undefined || parsed.maxPrice !== undefined;
  const canonicalPath = `${basePath}${buildCategoryQueryString({ page: parsed.page })}`;

  const pageSuffix = parsed.page > 1 ? ` - Trang ${parsed.page}` : '';

  return {
    title: `${category.name} ${brandName} chính hãng giá tốt, trả góp 0%${pageSuffix} | truongngstore`,
    description: `Mua sắm các sản phẩm ${category.name} từ thương hiệu ${brandName} chính hãng, cam kết chất lượng, bảo hành uy tín tại truongngstore.`,
    ...(hasPriceFilter
      ? {
          robots: { index: false, follow: true },
        }
      : {
          robots: { index: true, follow: true },
          alternates: {
            canonical: `${siteUrl}${canonicalPath}`,
          },
        }),
  };
}

export default async function CategoryBrandPage({ params, searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams || {});
  const parsedFilters = parseCategorySearchParams(
    resolvedSearchParams,
    params.categorySlug
  );

  const basePath = `/category/${params.categorySlug}/${params.brandSlug}`;

  // 1. Fetch category metadata
  const category = await getCategoryBySlug(params.categorySlug);
  if (!category) {
    notFound();
  }

  // 2. Fetch metadata and products concurrently
  const [allCatsResult, brandsResult, productsResult] = await Promise.allSettled([
    getAllCategories(),
    getBrandsByCategory(params.categorySlug),
    getCategoryProductsPaged({
      categorySlug: params.categorySlug,
      brandSlug: params.brandSlug,
      minPrice: parsedFilters.minPrice,
      maxPrice: parsedFilters.maxPrice,
      page: parsedFilters.page,
      size: 20,
    }),
  ]);

  const allCategories = allCatsResult.status === 'fulfilled' ? allCatsResult.value : [];
  const brands = brandsResult.status === 'fulfilled' ? brandsResult.value : [];

  if (productsResult.status === 'rejected') {
    throw new Error(
      `Không thể tải sản phẩm cho ${params.categorySlug}/${params.brandSlug}: ${productsResult.reason}`
    );
  }

  const productsData = productsResult.value;

  // 3. Page validation & out-of-bounds redirect
  const redirectUrl = validateAndGetRedirectUrl(
    basePath,
    resolvedSearchParams.page,
    parsedFilters.page,
    productsData.totalPages,
    { minPrice: parsedFilters.minPrice, maxPrice: parsedFilters.maxPrice }
  );

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return (
    <CategoryListingPage
      category={category}
      allCategories={allCategories}
      brands={brands}
      brandSlug={params.brandSlug}
      productsData={productsData}
      currentFilters={parsedFilters}
      basePath={basePath}
    />
  );
}
