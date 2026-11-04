import { apiClient } from './api';
import {
  CheckoutPreviewData,
  CheckoutCalculateRequest,
  CheckoutCalculateResponse,
  CheckoutSubmitRequest,
  CheckoutSubmitResponse,
  LocationProvince,
  LocationDistrict,
  LocationWard,
  StoreLocation,
  PaymentMethodItem,
  CouponItem,
} from '@/types/checkout';

export function redirectToLogin(fromPath: string = '/checkout'): string {
  const target = `/login?from=${encodeURIComponent(fromPath)}`;
  if (typeof window !== 'undefined') {
    window.location.href = target;
  }
  return target;
}

let cachedProvinces: LocationProvince[] | null = null;

export const clearProvincesCache = () => {
  cachedProvinces = null;
};

export const checkoutService = {
  // 1. Lấy thông tin preview checkout
  async getPreview(variantIds: number[], quantities?: number[]): Promise<CheckoutPreviewData> {
    const params = new URLSearchParams();
    params.set('variantIds', variantIds.join(','));
    if (quantities && quantities.length > 0) {
      params.set('quantities', quantities.join(','));
    }
    try {
      const response = await apiClient.get<CheckoutPreviewData>(`/checkout/preview?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        redirectToLogin('/checkout');
      }
      throw error;
    }
  },

  // 2. Tính toán lại giá khi đổi hình thức giao hàng, voucher (Public)
  async calculate(request: CheckoutCalculateRequest): Promise<CheckoutCalculateResponse> {
    const response = await apiClient.post<CheckoutCalculateResponse>('/checkout/calculate', request);
    return response.data;
  },

  // 3. Đặt hàng (Bắt buộc Authenticated, 401 redirect sang login)
  async submitCheckout(request: CheckoutSubmitRequest, idempotencyKey?: string): Promise<CheckoutSubmitResponse> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    try {
      const response = await apiClient.post<CheckoutSubmitResponse>('/checkout', request, { headers });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        redirectToLogin('/checkout');
      }
      throw error;
    }
  },

  // 4. Lấy danh sách tỉnh/thành (Có cache bộ nhớ trong phiên làm việc)
  async getProvinces(): Promise<LocationProvince[]> {
    if (cachedProvinces && cachedProvinces.length > 0) {
      return cachedProvinces;
    }
    const response = await apiClient.get<LocationProvince[]>('/locations/provinces');
    cachedProvinces = response.data;
    return response.data;
  },

  // 5. Lấy danh sách quận/huyện
  async getDistricts(province: string): Promise<LocationDistrict[]> {
    const response = await apiClient.get<LocationDistrict[]>(`/locations/districts?province=${encodeURIComponent(province)}`);
    return response.data;
  },

  // 6. Lấy danh sách phường/xã
  async getWards(province: string, district: string): Promise<LocationWard[]> {
    const response = await apiClient.get<LocationWard[]>(
      `/locations/wards?province=${encodeURIComponent(province)}&district=${encodeURIComponent(district)}`
    );
    return response.data;
  },

  // 7. Lấy danh sách cửa hàng
  async getStores(province?: string, district?: string): Promise<StoreLocation[]> {
    const params = new URLSearchParams();
    if (province) params.set('province', province);
    if (district) params.set('district', district);
    const response = await apiClient.get<StoreLocation[]>(`/stores?${params.toString()}`);
    return response.data;
  },

  // 8. Lấy danh sách phương thức thanh toán hoạt động
  async getPaymentMethods(): Promise<PaymentMethodItem[]> {
    const response = await apiClient.get<PaymentMethodItem[]>('/payment-methods');
    return response.data;
  },

  // 9. Lấy danh sách voucher hợp lệ
  async getAvailableCoupons(minOrder?: number): Promise<CouponItem[]> {
    const params = new URLSearchParams();
    if (minOrder !== undefined) params.set('minOrder', minOrder.toString());
    const response = await apiClient.get<CouponItem[]>(`/vouchers/available?${params.toString()}`);
    return response.data;
  },

  // 10. Xác thực mã voucher
  async validateCoupon(code: string, orderAmount: number): Promise<{ valid: boolean; discount: number; message?: string }> {
    const response = await apiClient.post('/vouchers/validate', { code, orderAmount });
    return response.data;
  },
};
