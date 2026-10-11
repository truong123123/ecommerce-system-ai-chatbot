import React from 'react';
import Link from 'next/link';
import { CategoryTreeItem } from '@/services/categoryService';
import { BrandItem } from '@/services/brandService';
import { ProductPageResponse } from '@/services/productService';
import { ProductCard } from '@/components/common/ProductCard';
import { toCategoryListingProduct } from '@/lib/mappers/categoryListingMapper';
import { CategoryFiltersClient } from './CategoryFiltersClient';
import { CategoryPagination } from './CategoryPagination';
import {
  ParsedCategorySearchParams,
  getPriceRangesForCategory,
} from '@/lib/category/categorySearchParams';
import styles from './CategoryListingPage.module.css';

export interface CategoryListingViewProps {
  category: CategoryTreeItem;
  allCategories: CategoryTreeItem[];
  brands: BrandItem[];
  brandSlug?: string;
  productsData: ProductPageResponse;
  currentFilters: ParsedCategorySearchParams;
  basePath: string;
}

export const CategoryListingPage: React.FC<CategoryListingViewProps> = ({
  category,
  allCategories,
  brands,
  brandSlug,
  productsData,
  currentFilters,
  basePath,
}) => {
  // Determine active brand
  const activeBrand = brandSlug
    ? brands.find((b) => b.slug.toLowerCase() === brandSlug.toLowerCase()) || null
    : null;

  // Determine parent category for breadcrumbs
  const parentCategory = category.parentId
    ? allCategories.find((c) => c.categoryId === category.parentId) || null
    : null;

  // Subcategories (child categories if any)
  const subCategories = allCategories.filter((c) => c.parentId === category.categoryId);

  // Price ranges
  const priceRanges = getPriceRangesForCategory(category.slug);

  // Check if requested brand does not belong to this category
  const isInvalidBrandForCategory = Boolean(brandSlug && brands.length > 0 && !activeBrand);

  // JSON-LD ItemList
  const jsonLdItemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name}${activeBrand ? ` ${activeBrand.name}` : ''}`,
    numberOfItems: productsData.items.length,
    itemListElement: productsData.items.map((prod, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: prod.name,
        url: `/products/${prod.slug}`,
        image: prod.primaryImage || undefined,
        offers: {
          '@type': 'Offer',
          price: prod.price,
          priceCurrency: 'VND',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  // JSON-LD BreadcrumbList
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: '/' },
  ];
  if (parentCategory) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: breadcrumbItems.length + 1,
      name: parentCategory.name,
      item: `/category/${parentCategory.slug}`,
    });
  }
  breadcrumbItems.push({
    '@type': 'ListItem',
    position: breadcrumbItems.length + 1,
    name: category.name,
    item: `/category/${category.slug}`,
  });
  if (activeBrand) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: breadcrumbItems.length + 1,
      name: activeBrand.name,
      item: `/category/${category.slug}/${activeBrand.slug}`,
    });
  }

  const jsonLdBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      {productsData.items.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
        />
      )}

      {/* 1. Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Đường dẫn điều hướng">
        <Link href="/">Trang chủ</Link>
        <span className={styles.breadcrumbSeparator} aria-hidden="true">/</span>

        {parentCategory && (
          <>
            <Link href={`/category/${parentCategory.slug}`}>{parentCategory.name}</Link>
            <span className={styles.breadcrumbSeparator} aria-hidden="true">/</span>
          </>
        )}

        {brandSlug && activeBrand ? (
          <>
            <Link href={`/category/${category.slug}`}>{category.name}</Link>
            <span className={styles.breadcrumbSeparator} aria-hidden="true">/</span>
            <span className={styles.breadcrumbCurrent} aria-current="location">
              {activeBrand.name}
            </span>
          </>
        ) : (
          <span className={styles.breadcrumbCurrent} aria-current="location">
            {category.name}
          </span>
        )}
      </nav>

      {/* 2. Category Title & Product count */}
      <div className={styles.headerSection}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.pageTitle}>
            {category.name}
            {activeBrand ? ` ${activeBrand.name}` : ''}
          </h1>
          <span
            className={styles.productCount}
            aria-live="polite"
            aria-atomic="true"
          >
            ({productsData.totalElements} sản phẩm)
          </span>
        </div>
      </div>

      {/* 3. Filter Section (Client Component for instant transitions) */}
      <CategoryFiltersClient
        categorySlug={category.slug}
        brandSlug={brandSlug}
        brands={brands}
        subCategories={subCategories}
        priceRanges={priceRanges}
        selectedPriceId={currentFilters.selectedPriceId}
        currentMinPrice={currentFilters.minPrice}
        currentMaxPrice={currentFilters.maxPrice}
      />

      {/* 4. Products Grid / Empty States */}
      {isInvalidBrandForCategory ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">🔍</div>
          <h2 className={styles.emptyTitle}>Thương hiệu không thuộc danh mục này</h2>
          <p className={styles.emptyText}>
            Thương hiệu &quot;{brandSlug}&quot; hiện không có sản phẩm nào thuộc danh mục &quot;{category.name}&quot;.
          </p>
          <Link href={`/category/${category.slug}`} className={styles.actionBtn}>
            Xem tất cả sản phẩm {category.name}
          </Link>
        </div>
      ) : productsData.items.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">📦</div>
          <h2 className={styles.emptyTitle}>Không tìm thấy sản phẩm phù hợp</h2>
          <p className={styles.emptyText}>
            Rất tiếc, hiện chưa có sản phẩm nào phù hợp với bộ lọc bạn đã chọn. Vui lòng thử chọn mức giá hoặc thương hiệu khác.
          </p>
          <Link href={`/category/${category.slug}`} className={styles.actionBtn}>
            Xóa bộ lọc
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.productGrid}>
            {productsData.items.map((prod) => (
              <ProductCard
                key={prod.id}
                product={toCategoryListingProduct(prod)}
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ))}
          </div>

          {/* 5. Pagination */}
          <CategoryPagination
            basePath={basePath}
            currentPage={productsData.currentPage}
            totalPages={productsData.totalPages}
            minPrice={currentFilters.minPrice}
            maxPrice={currentFilters.maxPrice}
          />
        </>
      )}
    </div>
  );
};
