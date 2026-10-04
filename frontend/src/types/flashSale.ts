// ================================================================
// FLASH SALE DATA CONTRACT & INTERFACES (Next.js 14 TypeScript)
// ================================================================

export type PublishStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED';
export type RuntimeStatus = 'NO_SLOT' | 'UPCOMING' | 'RUNNING' | 'WAITING_NEXT' | 'ENDED';

/**
 * 1. Product trong mỗi slot của Flash Sale
 */
export interface FlashSaleProduct {
  id: number;
  productId?: number;
  productSlug?: string;
  name: string;
  sku?: string;
  image: string;
  imageUrl?: string;
  salePrice: number;
  originalPrice: number;
  sold: number;
  soldCount?: number;
  quota: number;
  totalStock?: number;
  discountPercent?: number;
  status?: string;
  slotId?: number;
  maxQuantityPerUser?: number;
  displayOrder?: number;
  availableInventory?: number;
  version?: number;
}

/**
 * 2. Khung giờ Flash Sale (Mỗi slot có danh sách products riêng)
 */
export interface FlashSaleSlot {
  id: number;
  campaignId?: number;
  start: string; // ISO-8601 with timezone: "2026-10-04T12:00:00+07:00"
  end: string;   // ISO-8601 with timezone: "2026-10-04T14:00:00+07:00"
  startTime?: string; // alias
  endTime?: string;   // alias
  label?: string;
  status?: 'UPCOMING' | 'ACTIVE' | 'ENDED' | 'upcoming' | 'live' | 'ended';
  isActive?: boolean;
  isOvernight?: boolean;
  productCount?: number;
  totalSold?: number;
  totalQuota?: number;
  revenue?: number;
  version?: number;
  products: FlashSaleProduct[];
}

/**
 * 3. Chiến dịch Flash Sale
 */
export interface FlashSaleCampaign {
  id: number;
  campaignId: number;
  title: string;
  note?: string;
  disclaimer?: string;
  startTime?: string;
  endTime?: string;
  calculatedStartAt?: string;
  calculatedEndAt?: string;
  status?: string;
  publishStatus?: PublishStatus;
  runtimeStatus?: RuntimeStatus;
  computedStatus?: string;
  isActive?: boolean;
  version?: number;
  updatedBy?: string;
  createdAt?: string;
  serverNow?: string;
  slots: FlashSaleSlot[];
  timeSlots?: FlashSaleSlot[];
  products?: FlashSaleProduct[];
  totalProductsCount?: number;
  totalSoldQuantity?: number;
  totalSlotsCount?: number;
  totalQuota?: number;
  totalRevenue?: number;
}

/**
 * 4. Phân trang & Thống kê danh sách Campaign
 */
export interface CampaignStats {
  runningCount: number;
  upcomingCount: number;
  endedCount: number;
  draftOrPausedCount: number;
  totalSoldAll: number;
  totalRevenueAll: number;
}

export interface CampaignListPagination {
  content: FlashSaleCampaign[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  stats: CampaignStats;
}

/**
 * 5. Wrapper response từ Backend API
 */
export interface FlashSaleApiResponse {
  campaign: FlashSaleCampaign | null;
  serverTime: string;
}

// ================================================================
// PAYLOADS CHO CÁC THAO TÁC ADMIN
// ================================================================

export type FlashSaleItem = FlashSaleProduct & {
  slotId?: number;
  maxQuantityPerUser?: number;
  progressPercent?: number;
};

export type FlashSaleTimeSlot = FlashSaleSlot;

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

export interface CampaignSlotPayload {
  label?: string;
  startTime: string; // ISO format with timezone (Asia/Ho_Chi_Minh)
  endTime: string;   // ISO format with timezone (Asia/Ho_Chi_Minh)
  isActive?: boolean;
}

export interface BulkCreateSlotsPayload {
  startDate: string;        // yyyy-MM-dd
  endDate: string;          // yyyy-MM-dd
  dailyStartTime: string;   // HH:mm
  dailyEndTime: string;     // HH:mm
  slotDurationMinutes: number; // e.g. 120
  breakMinutes?: number;    // e.g. 0 or 30
  daysOfWeek?: number[];    // 1 (Thứ 2) .. 7 (Chủ Nhật)
  dryRun?: boolean;
}

export interface BulkCreateSlotsPreviewResult {
  slots: FlashSaleSlot[];
  totalSlots: number;
  warnings: string[];
  isDryRun: boolean;
}

export interface DuplicateCampaignPayload {
  newTitle?: string;
  shiftDays?: number;
  copyProducts?: boolean;
}

export interface AddCampaignItemPayload {
  productId: number;
  slotId?: number;
  salePrice: number;
  originalPrice?: number;
  totalStock: number;
  maxQuantityPerUser?: number;
}

export interface BatchItemRequest {
  productId: number;
  salePrice?: number;
  originalPrice?: number;
  discountPercent?: number;
  totalStock?: number;
  maxQuantityPerUser?: number;
}

export interface AddSlotProductsBatchPayload {
  items: BatchItemRequest[];
}

export interface UpdateCampaignItemPayload {
  slotId?: number;
  salePrice?: number;
  originalPrice?: number;
  totalStock?: number;
  maxQuantityPerUser?: number;
  status?: string;
}

export interface ReorderProductsPayload {
  itemIds: number[];
}

// ================================================================
// BÁO CÁO & AUDIT LOG
// ================================================================

export interface SlotReportItem {
  slotId: number;
  label: string;
  timeRange: string;
  status: string;
  productCount: number;
  quota: number;
  sold: number;
  sellThroughRate: number;
  revenue: number;
}

export interface ProductReportItem {
  itemId: number;
  productId: number;
  productName: string;
  sku: string;
  imageUrl: string;
  originalPrice: number;
  salePrice: number;
  quota: number;
  sold: number;
  sellThroughRate: number;
  revenue: number;
  availableInventory: number;
}

export interface FlashSaleReport {
  campaignId: number;
  campaignTitle: string;
  totalSlots: number;
  totalProducts: number;
  totalQuota: number;
  totalSold: number;
  sellThroughRate: number;
  totalRevenue: number;
  cancelledReservations: number;
  slotReports: SlotReportItem[];
  productReports: ProductReportItem[];
}

export interface FlashSaleAuditLog {
  id: number;
  campaignId: number;
  action: string;
  details: string;
  performedBy: string;
  createdAt: string;
}
