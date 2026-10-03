export interface CartItem {
  cartItemId: number;
  variantId: number;
  productId: number;
  name: string;
  sku: string;
  slug: string;
  imageUrl: string;
  attributes?: Record<string, any>;
  price: number;
  originalPrice: number;
  discountAmount: number;
  quantity: number;
  stockQuantity: number;
  inStock: boolean;
  isSelected: boolean;
  lineTotal: number;
}

export interface CouponInfo {
  code: string;
  discount: number;
  type: string;
  value: number;
  minOrderValue: number;
  description: string;
}

export interface CartSummary {
  totalItems: number;
  selectedItemsCount: number;
  subtotal: number;
  directDiscount: number;
  couponDiscount: number;
  shippingFee: number;
  total: number;
  totalSavings: number;
}

export interface CartData {
  cartId: number;
  items: CartItem[];
  appliedCoupon: CouponInfo | null;
  summary: CartSummary;
}
