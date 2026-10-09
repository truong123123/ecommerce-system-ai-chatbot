import apiClient from './apiClient';

export interface ProductComparisonItem {
  productId: number;
  name: string;
  slug: string;
  brandName?: string;
  categoryName?: string;
  imageUrl?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  specs: Record<string, string>;
}

export interface ComparisonAttributeRow {
  key: string;
  label: string;
  values: Record<string, string>; // productId as string -> string
  isDifferent: boolean;
}

export interface ComparisonGroup {
  groupName: string;
  attributes: ComparisonAttributeRow[];
}

export interface ComparisonResponse {
  products: ProductComparisonItem[];
  attributeGroups: ComparisonGroup[];
}

export const comparisonService = {
  async getComparison(productIds: number[]): Promise<ComparisonResponse> {
    const res = await apiClient.get<ComparisonResponse>(`/products/compare?ids=${productIds.join(',')}`);
    return res.data;
  },
};
