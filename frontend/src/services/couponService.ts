import apiClient from './apiClient';

export interface CouponItem {
  couponId: number;
  code: string;
  type: 'percent' | 'fixed';
  discountType?: 'percent' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  reservedCount: number;
  maxUsagePerUser: number;
  isActive: boolean;
  title?: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  categoryId?: number;
  brandId?: number;
  productId?: number;
  isExpired?: boolean;
}

export interface CreateCouponPayload {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  maxUsagePerUser?: number;
  isActive?: boolean;
  title?: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  categoryId?: number;
  brandId?: number;
  productId?: number;
}

export const couponService = {
  async getAdminCoupons(): Promise<CouponItem[]> {
    const res = await apiClient.get<CouponItem[]>('/admin/coupons');
    return res.data;
  },

  async createCoupon(payload: CreateCouponPayload): Promise<CouponItem> {
    const res = await apiClient.post<CouponItem>('/admin/coupons', payload);
    return res.data;
  },

  async updateCoupon(id: number, payload: CreateCouponPayload): Promise<CouponItem> {
    const res = await apiClient.put<CouponItem>(`/admin/coupons/${id}`, payload);
    return res.data;
  },

  async deleteCoupon(id: number): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/admin/coupons/${id}`);
    return res.data;
  },

  async toggleStatus(id: number): Promise<CouponItem> {
    const res = await apiClient.patch<CouponItem>(`/admin/coupons/${id}/toggle-status`, {});
    return res.data;
  },
};
