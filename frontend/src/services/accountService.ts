import { apiClient } from './api';

export interface CustomerProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  gender: string | null;
  birthDate: string | null;
  loyaltyPoints: number;
  tierName: string;
  orderCount: number;
  wishlistCount: number;
  createdAt: string;
}

export interface CustomerAddress {
  id: number;
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
  fullAddress: string;
}

export interface CustomerOrderItem {
  orderItemId: number;
  productId: number;
  variantId: number;
  productName: string;
  productImage: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  canReview: boolean;
  reviewId?: number | null;
}

export interface CustomerOrder {
  orderId: number;
  orderCode: string;
  orderDate: string;
  status: string;
  statusLabel: string;
  totalAmount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  paymentMethod: string;
  paymentStatus: string;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  storeName: string | null;
  items: CustomerOrderItem[];
}

export const accountService = {
  async getProfile(): Promise<CustomerProfile> {
    const res = await apiClient.get<CustomerProfile>('/account/profile');
    return res.data;
  },

  async updateProfile(data: { fullName: string; phone?: string; gender?: string; birthDate?: string }): Promise<CustomerProfile> {
    const res = await apiClient.put<CustomerProfile>('/account/profile', data);
    return res.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const res = await apiClient.put<{ message: string }>('/account/password', data);
    return res.data;
  },

  async getAddresses(): Promise<CustomerAddress[]> {
    const res = await apiClient.get<CustomerAddress[]>('/account/addresses');
    return res.data;
  },

  async addAddress(data: Omit<CustomerAddress, 'id' | 'fullAddress'>): Promise<CustomerAddress> {
    const res = await apiClient.post<CustomerAddress>('/account/addresses', data);
    return res.data;
  },

  async updateAddress(id: number, data: Partial<CustomerAddress>): Promise<CustomerAddress> {
    const res = await apiClient.put<CustomerAddress>(`/account/addresses/${id}`, data);
    return res.data;
  },

  async deleteAddress(id: number): Promise<void> {
    await apiClient.delete(`/account/addresses/${id}`);
  },

  async setDefaultAddress(id: number): Promise<CustomerAddress> {
    const res = await apiClient.put<CustomerAddress>(`/account/addresses/${id}/default`);
    return res.data;
  },

  async getOrders(status?: string): Promise<CustomerOrder[]> {
    const res = await apiClient.get<CustomerOrder[]>('/account/orders', {
      params: status && status !== 'ALL' ? { status } : {}
    });
    return res.data;
  },

  async getOrderDetail(id: number): Promise<CustomerOrder> {
    const res = await apiClient.get<CustomerOrder>(`/account/orders/${id}`);
    return res.data;
  },

  async cancelOrder(id: number): Promise<any> {
    const res = await apiClient.put(`/orders/${id}/status`, { status: 'cancelled' });
    return res.data;
  }
};
