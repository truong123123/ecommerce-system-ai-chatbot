import { apiClient } from './api';

export interface CategoryTreeItem {
  categoryId: number;
  parentId: number | null;
  name: string;
  slug: string;
  imageUrl?: string | null;
  iconUrl?: string | null;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  children: CategoryTreeItem[];
}

export interface CategoryRequest {
  name: string;
  slug?: string;
  parentId?: number | null;
  imageUrl?: string | null;
  iconUrl?: string | null;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export const categoryService = {
  async getCategoryTree(activeOnly: boolean = true): Promise<CategoryTreeItem[]> {
    try {
      const res = await apiClient.get<CategoryTreeItem[]>('/categories/tree', {
        params: { activeOnly },
      });
      return res.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy cây danh mục:', error);
      return [];
    }
  },

  async getAllCategories(activeOnly: boolean = false): Promise<CategoryTreeItem[]> {
    try {
      const res = await apiClient.get<CategoryTreeItem[]>('/categories', {
        params: { activeOnly, tree: false },
      });
      return res.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách danh mục:', error);
      return [];
    }
  },

  async getCategoryById(id: number): Promise<CategoryTreeItem | null> {
    try {
      const res = await apiClient.get<CategoryTreeItem>(`/categories/${id}`);
      return res.data;
    } catch (error) {
      console.error(`Lỗi khi lấy danh mục ${id}:`, error);
      return null;
    }
  },

  async getCategoryBySlug(slug: string): Promise<CategoryTreeItem | null> {
    try {
      const res = await apiClient.get<CategoryTreeItem>(`/categories/slug/${slug}`);
      return res.data;
    } catch (error) {
      console.error(`Lỗi khi lấy danh mục slug ${slug}:`, error);
      return null;
    }
  },

  async createCategory(data: CategoryRequest): Promise<CategoryTreeItem> {
    const res = await apiClient.post<CategoryTreeItem>('/categories', data);
    return res.data;
  },

  async updateCategory(id: number, data: CategoryRequest): Promise<CategoryTreeItem> {
    const res = await apiClient.put<CategoryTreeItem>(`/categories/${id}`, data);
    return res.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};
