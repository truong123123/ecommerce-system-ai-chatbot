import { create } from 'zustand';
import { CartData, CartItem, CartSummary, CouponInfo } from '../types/cart';
import { cartService } from '../services/cartService';

const GUEST_CART_KEY = 'store_guest_cart_items';
const GUEST_COUPON_KEY = 'store_guest_coupon';

interface CartState {
  cartData: CartData | null;
  selectedVariantIds: number[];
  hasInitializedSelection: boolean;
  couponCode: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (
    variantId: number,
    quantity?: number,
    productId?: number,
    itemMeta?: Partial<CartItem>
  ) => Promise<void>;
  updateQuantity: (variantId: number, quantity: number) => Promise<void>;
  removeItem: (variantId: number) => Promise<void>;
  toggleSelect: (variantId: number) => Promise<void>;
  toggleSelectAll: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalCount: () => number;
}

const calculateGuestSummary = (
  items: CartItem[],
  selectedIds: number[],
  coupon: CouponInfo | null
): CartSummary => {
  const selectedItems = items.filter(
    (i) => selectedIds.includes(i.variantId) && i.inStock
  );
  const subtotal = selectedItems.reduce(
    (sum, i) => sum + Number(i.price) * i.quantity,
    0
  );
  const directDiscount = selectedItems.reduce(
    (sum, i) => sum + Number(i.discountAmount || 0) * i.quantity,
    0
  );

  let couponDiscount = 0;
  if (coupon && subtotal >= coupon.minOrderValue) {
    if (coupon.type === 'percentage') {
      couponDiscount = Math.round((subtotal * coupon.value) / 100);
    } else {
      couponDiscount = coupon.value;
    }
  }

  const shippingFee = subtotal >= 300000 || subtotal === 0 ? 0 : 30000;
  const total = Math.max(0, subtotal - couponDiscount + shippingFee);
  const totalSavings = directDiscount + couponDiscount;

  return {
    totalItems: items.length,
    selectedItemsCount: selectedItems.length,
    subtotal,
    directDiscount,
    couponDiscount,
    shippingFee,
    total,
    totalSavings,
  };
};

const getGuestCoupon = (code: string, subtotal: number): CouponInfo | null => {
  const upper = code.trim().toUpperCase();
  if (upper === 'APPLE500K') {
    if (subtotal < 10000000) return null;
    return {
      code: 'APPLE500K',
      discount: 500000,
      type: 'fixed',
      value: 500000,
      minOrderValue: 10000000,
      description: 'Giảm 500.000đ cho đơn hàng từ 10.000.000đ',
    };
  }
  if (upper === 'CHAOMUNG50K') {
    if (subtotal < 500000) return null;
    return {
      code: 'CHAOMUNG50K',
      discount: 500000,
      type: 'fixed',
      value: 50000,
      minOrderValue: 500000,
      description: 'Giảm 50.000đ cho đơn hàng từ 500.000đ',
    };
  }
  if (upper === 'VIPDISCOUNT10') {
    if (subtotal < 1000000) return null;
    const discount = Math.round(subtotal * 0.1);
    return {
      code: 'VIPDISCOUNT10',
      discount,
      type: 'percentage',
      value: 10,
      minOrderValue: 1000000,
      description: 'Giảm 10% cho khách hàng VIP từ 1.000.000đ',
    };
  }
  return null;
};

export const useCartStore = create<CartState>((set, get) => ({
  cartData: null,
  selectedVariantIds: [],
  hasInitializedSelection: false,
  couponCode: '',
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    const hasToken =
      typeof window !== 'undefined' &&
      !!(localStorage.getItem('token') || localStorage.getItem('auth_token'));

    if (hasToken) {
      try {
        // Đồng bộ các sản phẩm từ guest cart lên server nếu có
        if (typeof window !== 'undefined') {
          const guestRaw = localStorage.getItem(GUEST_CART_KEY);
          if (guestRaw) {
            try {
              const guestItems: CartItem[] = JSON.parse(guestRaw);
              for (const gi of guestItems) {
                await cartService.addItem(gi.variantId, gi.quantity, gi.productId);
              }
              localStorage.removeItem(GUEST_CART_KEY);
            } catch (e) {
              console.warn('Lỗi khi đồng bộ giỏ hàng khách lên server:', e);
            }
          }
        }

        const { selectedVariantIds, couponCode, hasInitializedSelection } = get();
        const data = await cartService.getCart(
          hasInitializedSelection ? selectedVariantIds : undefined,
          couponCode || undefined
        );

        const initialSelected = data.items
          .filter((i) => i.isSelected && i.inStock)
          .map((i) => i.variantId);

        set({
          cartData: data,
          selectedVariantIds: hasInitializedSelection ? selectedVariantIds : initialSelected,
          hasInitializedSelection: true,
          couponCode: data.appliedCoupon ? data.appliedCoupon.code : get().couponCode,
          isLoading: false,
        });
        return;
      } catch (err: any) {
        console.warn('Lỗi lấy giỏ hàng từ server, chuyển sang chế độ khách:', err);
      }
    }

    // Chế độ Khách (Guest Cart)
    if (typeof window !== 'undefined') {
      try {
        const guestRaw = localStorage.getItem(GUEST_CART_KEY);
        const guestItems: CartItem[] = guestRaw ? JSON.parse(guestRaw) : [];
        let { selectedVariantIds, couponCode, hasInitializedSelection } = get();

        if (!hasInitializedSelection && guestItems.length > 0) {
          selectedVariantIds = guestItems
            .filter((i) => i.inStock)
            .map((i) => i.variantId);
        }

        const coupon = couponCode ? getGuestCoupon(couponCode, 999999999) : null;
        const summary = calculateGuestSummary(guestItems, selectedVariantIds, coupon);

        set({
          cartData: {
            cartId: 0,
            items: guestItems,
            appliedCoupon: coupon,
            summary,
          },
          selectedVariantIds,
          hasInitializedSelection: true,
          isLoading: false,
        });
      } catch (e) {
        set({
          cartData: {
            cartId: 0,
            items: [],
            appliedCoupon: null,
            summary: {
              totalItems: 0,
              selectedItemsCount: 0,
              subtotal: 0,
              directDiscount: 0,
              couponDiscount: 0,
              shippingFee: 0,
              total: 0,
              totalSavings: 0,
            },
          },
          isLoading: false,
        });
      }
    } else {
      set({ isLoading: false });
    }
  },

  addItem: async (
    variantId: number,
    quantity = 1,
    productId?: number,
    itemMeta?: Partial<CartItem>
  ) => {
    set({ isLoading: true, error: null });
    const hasToken =
      typeof window !== 'undefined' &&
      !!(localStorage.getItem('token') || localStorage.getItem('auth_token'));

    if (hasToken) {
      try {
        const data = await cartService.addItem(variantId, quantity, productId);
        const selected = data.items
          .filter((i) => i.isSelected && i.inStock)
          .map((i) => i.variantId);

        set({
          cartData: data,
          selectedVariantIds: selected,
          isLoading: false,
        });
        return;
      } catch (err: any) {
        console.warn('Backend add item failed, fallback to local:', err);
      }
    }

    // Guest mode
    if (typeof window !== 'undefined') {
      const guestRaw = localStorage.getItem(GUEST_CART_KEY);
      let guestItems: CartItem[] = guestRaw ? JSON.parse(guestRaw) : [];
      const existingIdx = guestItems.findIndex((i) => i.variantId === variantId);

      if (existingIdx >= 0) {
        guestItems[existingIdx].quantity += quantity;
        guestItems[existingIdx].lineTotal =
          guestItems[existingIdx].price * guestItems[existingIdx].quantity;
      } else {
        const newItem: CartItem = {
          cartItemId: Date.now(),
          variantId,
          productId: productId || 1,
          name: itemMeta?.name || `Sản phẩm #${productId || variantId}`,
          sku: itemMeta?.sku || `SKU-${variantId}`,
          slug: itemMeta?.slug || 'san-pham',
          imageUrl:
            itemMeta?.imageUrl ||
            'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',
          price: itemMeta?.price ?? 10000000,
          originalPrice: itemMeta?.originalPrice ?? 12000000,
          discountAmount: itemMeta?.discountAmount ?? 2000000,
          quantity,
          stockQuantity: itemMeta?.stockQuantity ?? 50,
          inStock: itemMeta?.inStock ?? true,
          isSelected: true,
          lineTotal: (itemMeta?.price ?? 10000000) * quantity,
        };
        guestItems.push(newItem);
      }

      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestItems));
      const nextSelected = [...get().selectedVariantIds, variantId];
      const coupon = get().couponCode
        ? getGuestCoupon(get().couponCode, 999999999)
        : null;
      const summary = calculateGuestSummary(guestItems, nextSelected, coupon);

      set({
        cartData: {
          cartId: 0,
          items: guestItems,
          appliedCoupon: coupon,
          summary,
        },
        selectedVariantIds: nextSelected,
        isLoading: false,
      });
    }
  },

  updateQuantity: async (variantId: number, quantity: number) => {
    set({ isLoading: true, error: null });
    const hasToken =
      typeof window !== 'undefined' &&
      !!(localStorage.getItem('token') || localStorage.getItem('auth_token'));

    if (hasToken) {
      try {
        const data = await cartService.updateQuantity(variantId, quantity);
        set({ cartData: data, isLoading: false });
        return;
      } catch (err: any) {
        console.warn('Backend update quantity failed, fallback to local:', err);
      }
    }

    // Guest mode
    if (typeof window !== 'undefined') {
      const guestRaw = localStorage.getItem(GUEST_CART_KEY);
      let guestItems: CartItem[] = guestRaw ? JSON.parse(guestRaw) : [];
      if (quantity <= 0) {
        guestItems = guestItems.filter((i) => i.variantId !== variantId);
      } else {
        const item = guestItems.find((i) => i.variantId === variantId);
        if (item) {
          item.quantity = quantity;
          item.lineTotal = item.price * quantity;
        }
      }

      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestItems));
      const coupon = get().couponCode
        ? getGuestCoupon(get().couponCode, 999999999)
        : null;
      const summary = calculateGuestSummary(
        guestItems,
        get().selectedVariantIds,
        coupon
      );

      set({
        cartData: {
          cartId: 0,
          items: guestItems,
          appliedCoupon: coupon,
          summary,
        },
        isLoading: false,
      });
    }
  },

  removeItem: async (variantId: number) => {
    set({ isLoading: true, error: null });
    const hasToken =
      typeof window !== 'undefined' &&
      !!(localStorage.getItem('token') || localStorage.getItem('auth_token'));

    if (hasToken) {
      try {
        const data = await cartService.removeItem(variantId);
        const newSelected = get().selectedVariantIds.filter((id) => id !== variantId);
        set({
          cartData: data,
          selectedVariantIds: newSelected,
          isLoading: false,
        });
        return;
      } catch (err: any) {
        console.warn('Backend remove item failed, fallback to local:', err);
      }
    }

    // Guest mode
    if (typeof window !== 'undefined') {
      const guestRaw = localStorage.getItem(GUEST_CART_KEY);
      let guestItems: CartItem[] = guestRaw ? JSON.parse(guestRaw) : [];
      guestItems = guestItems.filter((i) => i.variantId !== variantId);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestItems));

      const newSelected = get().selectedVariantIds.filter((id) => id !== variantId);
      const coupon = get().couponCode
        ? getGuestCoupon(get().couponCode, 999999999)
        : null;
      const summary = calculateGuestSummary(guestItems, newSelected, coupon);

      set({
        cartData: {
          cartId: 0,
          items: guestItems,
          appliedCoupon: coupon,
          summary,
        },
        selectedVariantIds: newSelected,
        isLoading: false,
      });
    }
  },

  toggleSelect: async (variantId: number) => {
    const { selectedVariantIds, cartData, couponCode } = get();
    const item = cartData?.items.find((i) => i.variantId === variantId);
    if (!item || !item.inStock) return;

    let nextSelected: number[];
    if (selectedVariantIds.includes(variantId)) {
      nextSelected = selectedVariantIds.filter((id) => id !== variantId);
    } else {
      nextSelected = [...selectedVariantIds, variantId];
    }

    set({ selectedVariantIds: nextSelected, hasInitializedSelection: true, isLoading: true });

    const hasToken =
      typeof window !== 'undefined' &&
      !!(localStorage.getItem('token') || localStorage.getItem('auth_token'));

    if (hasToken) {
      try {
        const data = await cartService.getCart(nextSelected, couponCode || undefined);
        set({ cartData: data, selectedVariantIds: nextSelected, hasInitializedSelection: true, isLoading: false });
        return;
      } catch (err) {
        // fallback to local calculation
      }
    }

    if (cartData) {
      const coupon = couponCode ? getGuestCoupon(couponCode, 999999999) : null;
      const summary = calculateGuestSummary(cartData.items, nextSelected, coupon);
      set({
        cartData: {
          ...cartData,
          summary,
        },
        selectedVariantIds: nextSelected,
        hasInitializedSelection: true,
        isLoading: false,
      });
    }
  },

  toggleSelectAll: async () => {
    const { cartData, selectedVariantIds, couponCode } = get();
    if (!cartData) return;

    const availableItems = cartData.items.filter((i) => i.inStock);
    const isAllSelected =
      availableItems.length > 0 &&
      availableItems.every((i) => selectedVariantIds.includes(i.variantId));

    let nextSelected: number[] = [];
    if (!isAllSelected) {
      nextSelected = availableItems.map((i) => i.variantId);
    }

    set({ selectedVariantIds: nextSelected, hasInitializedSelection: true, isLoading: true });

    const hasToken =
      typeof window !== 'undefined' &&
      !!(localStorage.getItem('token') || localStorage.getItem('auth_token'));

    if (hasToken) {
      try {
        const data = await cartService.getCart(nextSelected, couponCode || undefined);
        set({ cartData: data, selectedVariantIds: nextSelected, hasInitializedSelection: true, isLoading: false });
        return;
      } catch (err) {
        // fallback
      }
    }

    const coupon = couponCode ? getGuestCoupon(couponCode, 999999999) : null;
    const summary = calculateGuestSummary(cartData.items, nextSelected, coupon);
    set({
      cartData: {
        ...cartData,
        summary,
      },
      selectedVariantIds: nextSelected,
      hasInitializedSelection: true,
      isLoading: false,
    });
  },

  applyCoupon: async (code: string) => {
    set({ isLoading: true, error: null });
    const { selectedVariantIds, cartData } = get();
    const hasToken =
      typeof window !== 'undefined' &&
      !!(localStorage.getItem('token') || localStorage.getItem('auth_token'));

    if (hasToken) {
      try {
        const data = await cartService.applyCoupon(code, selectedVariantIds);
        if (!data.appliedCoupon) {
          throw new Error('Mã giảm giá không hợp lệ hoặc đơn hàng chưa đạt giá trị tối thiểu');
        }
        set({
          cartData: data,
          couponCode: code,
          isLoading: false,
        });
        return;
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Mã giảm giá không hợp lệ';
        set({ isLoading: false, error: msg });
        throw new Error(msg);
      }
    }

    // Guest mode
    if (cartData) {
      const selectedItems = cartData.items.filter(
        (i) => selectedVariantIds.includes(i.variantId) && i.inStock
      );
      const subtotal = selectedItems.reduce(
        (sum, i) => sum + Number(i.price) * i.quantity,
        0
      );
      const coupon = getGuestCoupon(code, subtotal);
      if (!coupon) {
        const msg =
          'Mã giảm giá không hợp lệ hoặc đơn hàng chưa đạt giá trị áp dụng tối thiểu.';
        set({ isLoading: false, error: msg });
        throw new Error(msg);
      }

      const summary = calculateGuestSummary(cartData.items, selectedVariantIds, coupon);
      set({
        cartData: {
          ...cartData,
          appliedCoupon: coupon,
          summary,
        },
        couponCode: code,
        isLoading: false,
      });
    }
  },

  removeCoupon: async () => {
    set({ couponCode: '', isLoading: true });
    const { selectedVariantIds, cartData } = get();
    const hasToken =
      typeof window !== 'undefined' &&
      !!(localStorage.getItem('token') || localStorage.getItem('auth_token'));

    if (hasToken) {
      try {
        const data = await cartService.getCart(selectedVariantIds, undefined);
        set({ cartData: data, isLoading: false });
        return;
      } catch (err) {
        // fallback
      }
    }

    if (cartData) {
      const summary = calculateGuestSummary(cartData.items, selectedVariantIds, null);
      set({
        cartData: {
          ...cartData,
          appliedCoupon: null,
          summary,
        },
        isLoading: false,
      });
    }
  },

  clearCart: async () => {
    const hasToken =
      typeof window !== 'undefined' &&
      !!(localStorage.getItem('token') || localStorage.getItem('auth_token'));

    if (hasToken) {
      try {
        await cartService.clearCart();
      } catch (err) {
        console.error(err);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem(GUEST_CART_KEY);
      localStorage.removeItem(GUEST_COUPON_KEY);
    }

    set({
      cartData: {
        cartId: 0,
        items: [],
        appliedCoupon: null,
        summary: {
          totalItems: 0,
          selectedItemsCount: 0,
          subtotal: 0,
          directDiscount: 0,
          couponDiscount: 0,
          shippingFee: 0,
          total: 0,
          totalSavings: 0,
        },
      },
      selectedVariantIds: [],
      hasInitializedSelection: false,
      couponCode: '',
    });
  },

  getTotalCount: () => {
    const { cartData } = get();
    if (!cartData || !cartData.items) return 0;
    return cartData.items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
