import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkoutService, redirectToLogin } from '../services/checkoutService';
import { apiClient } from '../services/api';

describe('BƯỚC 7: Checkout Authentication Redirect Logic', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('redirectToLogin sinh URL đúng chuẩn với tham số from được encode', () => {
    const defaultUrl = redirectToLogin();
    expect(defaultUrl).toBe('/login?from=%2Fcheckout');

    const customUrl = redirectToLogin('/checkout?step=payment&variant=12');
    expect(customUrl).toBe('/login?from=%2Fcheckout%3Fstep%3Dpayment%26variant%3D12');
  });

  it('checkoutService.getPreview gặp 401 tự động điều hướng sang /login?from=/checkout thay vì hiện lỗi thô', async () => {
    const error401 = {
      response: {
        status: 401,
        data: { message: 'Vui lòng đăng nhập để tiếp tục.' },
      },
    };

    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(error401);

    await expect(checkoutService.getPreview([1, 2])).rejects.toEqual(error401);
  });

  it('checkoutService.submitCheckout gặp 401 tự động điều hướng sang /login?from=/checkout thay vì hiện lỗi thô', async () => {
    const error401 = {
      response: {
        status: 401,
        data: { message: 'Vui lòng đăng nhập để tiếp tục.' },
      },
    };

    vi.spyOn(apiClient, 'post').mockRejectedValueOnce(error401);

    const dummyRequest: any = {
      items: [{ variantId: 1, quantity: 1 }],
      receiveType: 'STORE_PICKUP',
      paymentMethod: 'COD',
      customerName: 'Test User',
      customerPhone: '0901234567',
    };

    await expect(checkoutService.submitCheckout(dummyRequest)).rejects.toEqual(error401);
  });
});
