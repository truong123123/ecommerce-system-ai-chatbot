export interface CustomerInfo {
  customerId?: number;
  fullName: string;
  email: string;
  phone: string;
  membershipTier?: 'S-NULL' | 'S-Student' | 'S-VIP' | string;
  loyaltyPoints?: number;
}

export interface AddressPreview {
  addressId?: number;
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward?: string;
  streetAddress: string;
}

export interface ItemPreview {
  variantId: number;
  productId: number;
  productName: string;
  sku?: string;
  color?: string;
  storage?: string;
  imageUrl?: string;
  quantity: number;
  originalPrice: number;
  salePrice: number;
  isFlashSale: boolean;
  flashSaleDiscountPercent?: number;
}

export interface CheckoutPreviewData {
  customer: CustomerInfo | null;
  defaultAddress: AddressPreview | null;
  items: ItemPreview[];
  subtotal: number;
  directDiscount: number;
  totalAmount: number;
  freeShippingThreshold: number;
  isFreeShipping: boolean;
}

export interface LocationProvince {
  code: string;
  name: string;
}

export interface LocationDistrict {
  code: string;
  name: string;
}

export interface LocationWard {
  code: string;
  name: string;
}

export interface StoreLocation {
  storeId: number;
  name: string;
  address: string;
  province: string;
  district: string;
  phone?: string;
  openHours?: string;
}

export interface PaymentMethodItem {
  methodCode: string;
  methodName: string;
  description?: string;
  iconUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface AppliedVoucher {
  code: string;
  discount: number;
  description: string;
}

export interface CheckoutCalculateRequest {
  items: { variantId: number; quantity: number }[];
  couponCode?: string;
  receiveType: 'STORE_PICKUP' | 'HOME_DELIVERY';
  province?: string;
}

export interface CheckoutCalculateResponse {
  totalItems: number;
  subtotal: number;
  directDiscount: number;
  voucherDiscount: number;
  shippingFee: number;
  totalAmount: number;
  totalSavings: number;
  isFreeShipping: boolean;
  freeShippingThreshold: number;
  appliedVoucher?: AppliedVoucher | null;
}

export interface InvoiceInfoRequest {
  taxCode: string;
  companyName: string;
  companyAddress: string;
  invoiceEmail: string;
}

export interface CheckoutSubmitRequest {
  receiveType: 'STORE_PICKUP' | 'HOME_DELIVERY';
  storeId?: number | null;
  shippingAddress?: {
    receiverName: string;
    receiverPhone: string;
    province: string;
    district: string;
    ward: string;
    streetAddress: string;
  } | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  couponCode?: string | null;
  paymentMethod: string;
  customerNote?: string;
  requireInvoice: boolean;
  invoiceInfo?: InvoiceInfoRequest | null;
  items: { variantId: number; quantity: number }[];
}

export interface CheckoutSubmitResponse {
  orderId: number;
  orderCode: string;
  paymentMethod: string;
  paymentUrl?: string | null;
  qrCodeUrl?: string | null;
  totalAmount: number;
  status: string;
  message: string;
  paymentTimeoutMinutes?: number;
  storeHoldHours?: number;
}

export interface CouponItem {
  couponId: number;
  code: string;
  description?: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  isValid?: boolean;
}
