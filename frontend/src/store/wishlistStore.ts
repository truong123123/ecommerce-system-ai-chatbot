import { create } from 'zustand';
import { apiClient } from '../services/api';
import { authService } from '../services/authService';

export interface WishlistProduct {
  id: number;
  productId: number;
  name: string;
  slug: string;
  primaryImage: string;
  price: number;
  maxPrice: number;
  oldPrice: number | null;
  isActive: boolean;
  inStock: boolean;
  categoryName: string;
  brandName: string;
  addedAt: string;
}

interface WishlistState {
  items: WishlistProduct[];
  wishlistIds: number[];
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  wishlistIds: [],
  loading: false,

  fetchWishlist: async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      set({ items: [], wishlistIds: [] });
      return;
    }

    set({ loading: true });
    try {
      const res = await apiClient.get<WishlistProduct[]>('/wishlist');
      const items = res.data || [];
      const ids = items.map((i) => i.productId);
      set({ items, wishlistIds: ids });
    } catch (err) {
      console.error('Fetch wishlist error:', err);
    } finally {
      set({ loading: false });
    }
  },

  toggleWishlist: async (productId: number) => {
    const user = authService.getCurrentUser();
    if (!user) {
      if (typeof window !== 'undefined') {
        window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
      }
      return false;
    }

    const { wishlistIds, items } = get();
    const isCurrentlyWishlisted = wishlistIds.includes(productId);

    if (isCurrentlyWishlisted) {
      // Optimistic update
      set({
        wishlistIds: wishlistIds.filter((id) => id !== productId),
        items: items.filter((item) => item.productId !== productId),
      });

      try {
        await apiClient.delete(`/wishlist/${productId}`);
        return false;
      } catch (err) {
        // Rollback
        set({ wishlistIds, items });
        console.error('Remove wishlist error:', err);
        return true;
      }
    } else {
      // Optimistic addition
      set({ wishlistIds: [...wishlistIds, productId] });

      try {
        const res = await apiClient.post<WishlistProduct>(`/wishlist/${productId}`);
        if (res.data) {
          set((state) => ({ items: [res.data, ...state.items] }));
        }
        return true;
      } catch (err) {
        // Rollback
        set({ wishlistIds });
        console.error('Add wishlist error:', err);
        return false;
      }
    }
  },

  removeFromWishlist: async (productId: number) => {
    const { wishlistIds, items } = get();
    set({
      wishlistIds: wishlistIds.filter((id) => id !== productId),
      items: items.filter((item) => item.productId !== productId),
    });

    try {
      await apiClient.delete(`/wishlist/${productId}`);
    } catch (err) {
      set({ wishlistIds, items });
      console.error('Remove wishlist error:', err);
    }
  },

  isInWishlist: (productId: number) => {
    return get().wishlistIds.includes(productId);
  },
}));
