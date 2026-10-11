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

  const parsed = parseCategorySearchParams(searchParams, params.categorySlug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truongngstore.vn';
  const basePath = `/category/${params.categorySlug}`;

  // Faceted navigation SEO rules:
  // - Filtered by price: noindex, follow.
  //   IMPORTANT: Canonical is omitted when noindex is active to avoid conflicting signals to search engines.
  // - Standard pagination / base category: self-canonical, index, follow.
  const hasPriceFilter = parsed.minPrice !== undefined || parsed.maxPrice !== undefined;
  const canonicalPath = `${basePath}${buildCategoryQueryString({ page: parsed.page })}`;

  const pageSuffix = parsed.page > 1 ? ` - Trang ${parsed.page}` : '';

  return {
    title: `${category.name} chính hãng giá tốt, trả góp 0%${pageSuffix} | truongngstore`,
    description:
      category.description ||
      `Mua sắm ${category.name} chính hãng, giá cạnh tranh nhất thị trường, hỗ trợ trả góp 0% tại truongngstore.`,
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

export default async function CategoryPage({ params, searchParams }: PageProps) {
  // Support safe access for searchParams across Next.js versions
  const resolvedSearchParams = await Promise.resolve(searchParams || {});
  const parsedFilters = parseCategorySearchParams(
    resolvedSearchParams,
    params.categorySlug
  );

  const basePath = `/category/${params.categorySlug}`;

  // 1. Fetch category metadata
  const category = await getCategoryBySlug(params.categorySlug);
  if (!category) {
    notFound();
  }

  // 2. Fetch all metadata and products concurrently with Promise.allSettled
  const [allCatsResult, brandsResult, productsResult] = await Promise.allSettled([
    getAllCategories(),
    getBrandsByCategory(params.categorySlug),
    getCategoryProductsPaged({
      categorySlug: params.categorySlug,
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
      `Không thể tải sản phẩm cho danh mục ${params.categorySlug}: ${productsResult.reason}`
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
      productsData={productsData}
      currentFilters={parsedFilters}
      basePath={basePath}
    />
  );
}
