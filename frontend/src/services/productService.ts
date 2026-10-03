import { apiClient } from './api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface CategoryItem {
  categoryId: number;
  parentId?: number | null;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface VariantItem {
  variantId: number;
  sku: string;
  attributes: any;
  costPrice: number;
  salePrice: number;
  isActive: boolean;
}

export interface ProductItem {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  brandId: number;
  brandName: string;
  description: string;
  primaryImage: string;
  price: number;
  maxPrice: number;
  isActive: boolean;
  isHot?: boolean;
  isNew?: boolean;
  variants: VariantItem[];
  images: string[];
}

export interface ProductQueryParams {
  categoryId?: number;
  categorySlug?: string;
  brandId?: number;
  brandSlug?: string;
  keyword?: string;
  isHot?: boolean;
  isNew?: boolean;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  page?: number;
  size?: number;
  activeOnly?: boolean;
}

export interface ProductPageResponse {
  items: ProductItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export const productService = {
  async fetchCategories(): Promise<CategoryItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, { cache: 'no-store' });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error('Lỗi khi tải danh mục:', e);
      return [];
    }
  },

  async fetchProducts(params?: ProductQueryParams): Promise<ProductItem[]> {
    try {
      const query = new URLSearchParams();
      if (params?.categoryId != null) query.append('categoryId', params.categoryId.toString());
      if (params?.categorySlug) query.append('categorySlug', params.categorySlug);
      if (params?.brandId != null) query.append('brandId', params.brandId.toString());
      if (params?.brandSlug) query.append('brandSlug', params.brandSlug);
      if (params?.keyword) query.append('keyword', params.keyword);
      if (params?.isHot != null) query.append('isHot', params.isHot.toString());
      if (params?.isNew != null) query.append('isNew', params.isNew.toString());
      if (params?.minPrice != null) query.append('minPrice', params.minPrice.toString());
      if (params?.maxPrice != null) query.append('maxPrice', params.maxPrice.toString());
      if (params?.limit != null) query.append('limit', params.limit.toString());
      if (params?.page != null) query.append('page', params.page.toString());
      if (params?.size != null) query.append('size', params.size.toString());
      if (params?.activeOnly != null) query.append('activeOnly', params.activeOnly.toString());

      const url = `${API_BASE_URL}/products${query.toString() ? '?' + query.toString() : ''}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error('Lỗi khi tải sản phẩm:', e);
      return [];
    }
  },

  async fetchProductsPaged(params?: ProductQueryParams): Promise<ProductPageResponse> {
    try {
      const query = new URLSearchParams();
      if (params?.categoryId != null) query.append('categoryId', params.categoryId.toString());
      if (params?.categorySlug) query.append('categorySlug', params.categorySlug);
      if (params?.brandId != null) query.append('brandId', params.brandId.toString());
      if (params?.brandSlug) query.append('brandSlug', params.brandSlug);
      if (params?.keyword) query.append('keyword', params.keyword);
      if (params?.isHot != null) query.append('isHot', params.isHot.toString());
      if (params?.isNew != null) query.append('isNew', params.isNew.toString());
      if (params?.minPrice != null) query.append('minPrice', params.minPrice.toString());
      if (params?.maxPrice != null) query.append('maxPrice', params.maxPrice.toString());
      if (params?.limit != null) query.append('limit', params.limit.toString());
      if (params?.page != null) query.append('page', params.page.toString());
      if (params?.size != null) query.append('size', params.size.toString());
      if (params?.activeOnly != null) query.append('activeOnly', params.activeOnly.toString());

      const url = `${API_BASE_URL}/products/paged${query.toString() ? '?' + query.toString() : ''}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        return { items: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: params?.size || 20 };
      }
      return await res.json();
    } catch (e) {
      console.error('Lỗi khi tải danh sách sản phẩm phân trang:', e);
      return { items: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: params?.size || 20 };
    }
  },

  async fetchProductBySlug(slug: string): Promise<ProductItem | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/products/slug/${slug}`, { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error('Lỗi khi tải chi tiết sản phẩm:', e);
      return null;
    }
  },

  async createProduct(data: any): Promise<ProductItem> {
    const res = await apiClient.post<ProductItem>('/products', data);
    return res.data;
  },

  async updateProduct(id: number, data: any): Promise<ProductItem> {
    const res = await apiClient.put<ProductItem>(`/products/${id}`, data);
    return res.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};

