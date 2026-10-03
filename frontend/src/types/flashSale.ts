export interface FlashSaleSlot {
  id: number;
  start_at: string;
  end_at: string;
  status: 'upcoming' | 'live' | 'ended';
}

export interface FlashSaleSlotsResponse {
  server_time: string;
  slots: FlashSaleSlot[];
}

export interface FlashSaleProduct {
  product_id: number;
  name: string;
  image: string;
  sale_price: number;
  original_price: number;
  quota: number;
  sold: number;
  remaining: number;
  slug: string;
}

export interface FlashSaleCheckoutPayload {
  slot_id: number;
  product_id: number;
  phone: string;
}

export interface FlashSaleCheckoutResult {
  code: 'SUCCESS' | 'SOLD_OUT' | 'SLOT_NOT_LIVE' | 'ALREADY_PURCHASED';
  message: string;
  purchase_id?: number;
  product_id?: number;
  product_name?: string;
  sale_price?: number;
  remaining?: number;
}

// ================================================================
// CAMPAIGN & SLOT SYSTEM (Source of Truth: Postgres flash_sale_campaign)
// ================================================================

export interface FlashSaleTimeSlot {
  id: number;
  campaignId?: number;
  label: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  status?: 'upcoming' | 'live' | 'ended';
  productCount?: number;
}

export interface FlashSaleItem {
  id: number;
  campaignId?: number;
  slotId?: number;
  productId: number;
  productSlug?: string;
  name: string;
  imageUrl: string;
  originalPrice: number;
  salePrice: number;
  discountPercent?: number;
  soldCount: number;
  totalStock: number;
  maxQuantityPerUser?: number;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'OUT_OF_STOCK' | 'EXPIRED' | string;
  progressPercent?: number;
}

export interface FlashSaleCampaign {
  campaignId: number;
  title: string;
  disclaimer: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  computedStatus?: string;
  isActive?: boolean;
  createdAt?: string;
  serverNow?: string;
  timeSlots: FlashSaleTimeSlot[];
  products: FlashSaleItem[];
  totalProductsCount?: number;
  totalSoldQuantity?: number;
  totalSlotsCount?: number;
}

export interface CampaignSlotPayload {
  label?: string;
  startTime: string; // ISO format
  endTime: string;   // ISO format
  isActive?: boolean;
}

export interface AddCampaignItemPayload {
  productId: number;
  slotId: number;
  salePrice: number;
  totalStock: number;
  maxQuantityPerUser?: number;
}

export interface UpdateCampaignItemPayload {
  salePrice?: number;
  totalStock?: number;
  maxQuantityPerUser?: number;
  slotId?: number;
}
