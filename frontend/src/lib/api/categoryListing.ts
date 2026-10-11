import { API_BASE_URL } from '@/lib/env';
import { CategoryTreeItem } from '@/services/categoryService';
import { BrandItem } from '@/services/brandService';
import { ProductItem, ProductPageResponse } from '@/services/productService';

export interface CategoryFetchFilters {
  categorySlug: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}

/**
 * Fetch category metadata by slug with Next.js ISR revalidation.
 * Returns null when category does not exist (404).
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryTreeItem | null> {
  if (!slug || slug.trim() === '') return null;

  try {
    const res = await fetch(`${API_BASE_URL}/categories/slug/${encodeURIComponent(slug.trim())}`, {
      next: { revalidate: 60, tags: ['category', 'showcase'] },
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      console.error(`[categoryListing] getCategoryBySlug failed with status ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`[categoryListing] getCategoryBySlug network error for slug "${slug}":`, error);
    return null;
  }
}

/**
 * Fetch all categories to build hierarchical breadcrumbs and subcategory relationships.
 */
export async function getAllCategories(): Promise<CategoryTreeItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories?tree=false&activeOnly=true`, {
      next: { revalidate: 300, tags: ['category'] },
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error('[categoryListing] getAllCategories network error:', error);
    return [];
  }
}

/**
 * Fetch brands specifically associated with this category.
 */
export async function getBrandsByCategory(categorySlug: string): Promise<BrandItem[]> {
  if (!categorySlug) return [];

  try {
    const res = await fetch(
      `${API_BASE_URL}/brands?categorySlug=${encodeURIComponent(categorySlug.trim())}&activeOnly=true`,
      {
        next: { revalidate: 120, tags: ['brands', 'category'] },
      }
    );

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error(`[categoryListing] getBrandsByCategory network error for "${categorySlug}":`, error);
    return [];
  }
}

/**
 * Fetch server-paged products for category with optional brand and price filters.
 * Backend uses 1-indexed page numbers.
 */
export async function getCategoryProductsPaged(
  filters: CategoryFetchFilters
): Promise<ProductPageResponse> {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const size = filters.size && filters.size > 0 ? filters.size : 20;

  const query = new URLSearchParams();
  query.append('categorySlug', filters.categorySlug);
  if (filters.brandSlug) query.append('brandSlug', filters.brandSlug);
  if (filters.minPrice != null && filters.minPrice >= 0) {
    query.append('minPrice', filters.minPrice.toString());
  }
  if (filters.maxPrice != null && filters.maxPrice > 0) {
    query.append('maxPrice', filters.maxPrice.toString());
  }
  query.append('page', page.toString());
  query.append('size', size.toString());
  query.append('activeOnly', 'true');

  const endpoint = `${API_BASE_URL}/products/paged?${query.toString()}`;

  try {
    const res = await fetch(endpoint, {
      next: { revalidate: 60, tags: ['category-products', 'showcase'] },
    });

    if (!res.ok) {
      throw new Error(`API products/paged returned status ${res.status}`);
    }

    const data: ProductPageResponse = await res.json();
    return {
      items: data.items || [],
      totalElements: data.totalElements ?? 0,
      totalPages: data.totalPages ?? 0,
      currentPage: data.currentPage ?? page,
      pageSize: data.pageSize ?? size,
    };
  } catch (error) {
    console.error('[categoryListing] getCategoryProductsPaged error:', error);
    throw error;
  }
}
