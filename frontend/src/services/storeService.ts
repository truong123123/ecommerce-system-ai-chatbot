import apiClient from './apiClient';

export interface StoreItem {
  storeId: number;
  name: string;
  address: string;
  province?: string;
  district?: string;
  ward?: string;
  phone?: string;
  openHours?: string;
  latitude?: number;
  longitude?: number;
}

export const storeService = {
  async getStores(params?: { province?: string; district?: string; keyword?: string }): Promise<StoreItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.province && params.province !== 'Tất cả') searchParams.set('province', params.province);
    if (params?.district && params.district !== 'Tất cả') searchParams.set('district', params.district);
    if (params?.keyword) searchParams.set('keyword', params.keyword);

    const res = await apiClient.get<StoreItem[]>(`/stores?${searchParams.toString()}`);
    return res.data;
  },

  async getProvinces(): Promise<string[]> {
    const res = await apiClient.get<string[]>('/stores/provinces');
    return res.data;
  },

  async getStoreById(id: number): Promise<StoreItem> {
    const res = await apiClient.get<StoreItem>(`/stores/${id}`);
    return res.data;
  },
};
