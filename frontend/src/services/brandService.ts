import { apiClient } from './api';

export interface BrandItem {
  brandId: number;
  name: string;
  slug: string;
  country?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandRequest {
  name: string;
  slug?: string;
  country?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export const brandService = {
  async getBrands(params?: { categoryId?: number; categorySlug?: string; activeOnly?: boolean }): Promise<BrandItem[]> {
    try {
      const res = await apiClient.get<BrandItem[]>('/brands', {
        params: {
          categoryId: params?.categoryId,
          categorySlug: params?.categorySlug,
          activeOnly: params?.activeOnly ?? true,
        },
      });
      return res.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thương hiệu:', error);
      return [];
    }
  },

  async getBrandById(id: number): Promise<BrandItem | null> {
    try {
      const res = await apiClient.get<BrandItem>(`/brands/${id}`);
      return res.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thương hiệu ${id}:`, error);
      return null;
    }
  },

  async createBrand(data: BrandRequest): Promise<BrandItem> {
    const res = await apiClient.post<BrandItem>('/brands', data);
    return res.data;
  },

  async updateBrand(id: number, data: BrandRequest): Promise<BrandItem> {
    const res = await apiClient.put<BrandItem>(`/brands/${id}`, data);
    return res.data;
  },

  async deleteBrand(id: number): Promise<void> {
    await apiClient.delete(`/brands/${id}`);
  },
};
