import { apiClient } from './api';
import { CartData } from '../types/cart';

export const cartService = {
  // Lấy dữ liệu giỏ hàng
  async getCart(selectedVariantIds?: number[], couponCode?: string): Promise<CartData> {
    const params: Record<string, any> = {};
    if (selectedVariantIds !== undefined) {
      params.selectedVariantIds = selectedVariantIds.length > 0 ? selectedVariantIds.join(',') : 'none';
    }
    if (couponCode) {
      params.couponCode = couponCode;
    }
    const res = await apiClient.get<CartData>('/cart', { params });
    return res.data;
  },

  // Thêm sản phẩm vào giỏ
  async addItem(variantId: number, quantity: number = 1, productId?: number): Promise<CartData> {
    const res = await apiClient.post<CartData>('/cart/items', {
      variantId,
      productId,
      quantity,
    });
    return res.data;
  },

  // Cập nhật số lượng
  async updateQuantity(variantId: number, quantity: number): Promise<CartData> {
    const res = await apiClient.put<CartData>(`/cart/items/${variantId}`, {
      quantity,
    });
    return res.data;
  },

  // Xóa sản phẩm khỏi giỏ
  async removeItem(variantId: number): Promise<CartData> {
    const res = await apiClient.delete<CartData>(`/cart/items/${variantId}`);
    return res.data;
  },

  // Xóa toàn bộ giỏ
  async clearCart(): Promise<CartData> {
    const res = await apiClient.delete<CartData>('/cart');
    return res.data;
  },

  // Áp dụng mã giảm giá
  async applyCoupon(couponCode: string, selectedVariantIds?: number[]): Promise<CartData> {
    const res = await apiClient.post<CartData>('/cart/apply-coupon', {
      couponCode,
      selectedVariantIds,
    });
    return res.data;
  },

  // Tiến hành đặt hàng / Checkout
  async checkout(payload: {
    selectedVariantIds: number[];
    addressId?: number;
    receiverName?: string;
    receiverPhone?: string;
    shippingAddress?: string;
    couponCode?: string;
    paymentMethod?: string;
    note?: string;
  }): Promise<{ message: string; orderId: number; totalAmount: number; status: string }> {
    const res = await apiClient.post('/cart/checkout', payload);
    return res.data;
  },
};
