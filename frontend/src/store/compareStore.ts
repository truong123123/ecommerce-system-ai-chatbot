import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompareProductItem {
  productId: number;
  name: string;
  slug?: string;
  imageUrl?: string;
  price?: number;
}

interface CompareState {
  selectedProducts: CompareProductItem[];
  addProduct: (product: CompareProductItem) => boolean;
  removeProduct: (productId: number) => void;
  clear: () => void;
  isSelected: (productId: number) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      selectedProducts: [],

      addProduct: (product) => {
        const { selectedProducts } = get();
        if (selectedProducts.some((p) => p.productId === product.productId)) {
          return true; // already added
        }
        if (selectedProducts.length >= 4) {
          alert('Bạn chỉ có thể so sánh tối đa 4 sản phẩm cùng một lúc.');
          return false;
        }
        set({ selectedProducts: [...selectedProducts, product] });
        return true;
      },

      removeProduct: (productId) => {
        set({
          selectedProducts: get().selectedProducts.filter((p) => p.productId !== productId),
        });
      },

      clear: () => {
        set({ selectedProducts: [] });
      },

      isSelected: (productId) => {
        return get().selectedProducts.some((p) => p.productId === productId);
      },
    }),
    {
      name: 'product-compare-storage',
    }
  )
);
