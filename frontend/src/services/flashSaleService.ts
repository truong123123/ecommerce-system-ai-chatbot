import {
  FlashSaleCampaign,
  FlashSaleSlot,
  FlashSaleProduct,
  CampaignSlotPayload,
  BulkCreateSlotsPayload,
  BulkCreateSlotsPreviewResult,
  DuplicateCampaignPayload,
  AddCampaignItemPayload,
  AddSlotProductsBatchPayload,
  UpdateCampaignItemPayload,
  FlashSaleCheckoutPayload,
  FlashSaleCheckoutResult,
  CampaignListPagination,
  FlashSaleReport,
  FlashSaleAuditLog,
} from '../types/flashSale';
import { apiClient } from './api';

export function normalizeCampaign(raw: any): FlashSaleCampaign | null {
  if (!raw) return null;
  if (raw.campaign === null) return null;
  const c = raw.campaign || raw;
  if (!c || (!c.id && !c.campaignId)) return null;

  const serverTime =
    raw.serverTime || raw.serverNow || c.serverTime || c.serverNow || new Date().toISOString();
  const rawSlots: any[] = c.slots || c.timeSlots || [];
  const rawProducts: any[] = c.products || [];

  // Chuẩn hóa toàn bộ sản phẩm của campaign
  const allProducts: FlashSaleProduct[] = rawProducts.map((p: any) => ({
    id: p.id,
    productId: p.productId || p.product_id || p.id,
    productSlug: p.productSlug || p.slug || '',
    name: p.name || '',
    sku: p.sku || '',
    image: p.image || p.imageUrl || p.image_url || '',
    imageUrl: p.imageUrl || p.image || '',
    salePrice: typeof p.salePrice === 'number' ? p.salePrice : Number(p.salePrice || p.sale_price || 0),
    originalPrice:
      typeof p.originalPrice === 'number'
        ? p.originalPrice
        : Number(p.originalPrice || p.original_price || 0),
    sold: typeof p.sold === 'number' ? p.sold : Number(p.soldCount || p.sold || 0),
    soldCount: typeof p.soldCount === 'number' ? p.soldCount : Number(p.sold || p.soldCount || 0),
    quota: typeof p.quota === 'number' ? p.quota : Number(p.totalStock || p.quota || 0),
    totalStock:
      typeof p.totalStock === 'number' ? p.totalStock : Number(p.quota || p.totalStock || 0),
    discountPercent: p.discountPercent || 0,
    status: p.status || 'AVAILABLE',
    slotId: p.slotId || p.slot_id,
    maxQuantityPerUser: p.maxQuantityPerUser || 1,
    displayOrder: p.displayOrder || 0,
    availableInventory: p.availableInventory || 0,
    version: p.version,
  }));

  // Chuẩn hóa từng slot và gán đúng danh sách products vào từng slot
  const slots: FlashSaleSlot[] = rawSlots.map((s: any) => {
    const slotId = s.id || s.slot_id || s.slotId;
    const start = s.start || s.startTime || s.start_at || s.start_time;
    const end = s.end || s.endTime || s.end_at || s.end_time;

    let slotProducts: FlashSaleProduct[] = [];
    if (Array.isArray(s.products) && s.products.length > 0) {
      slotProducts = s.products.map((p: any) => ({
        id: p.id,
        productId: p.productId || p.product_id || p.id,
        productSlug: p.productSlug || p.slug || '',
        name: p.name || '',
        sku: p.sku || '',
        image: p.image || p.imageUrl || p.image_url || '',
        imageUrl: p.imageUrl || p.image || '',
        salePrice: typeof p.salePrice === 'number' ? p.salePrice : Number(p.salePrice || p.sale_price || 0),
        originalPrice:
          typeof p.originalPrice === 'number'
            ? p.originalPrice
            : Number(p.originalPrice || p.original_price || 0),
        sold: typeof p.sold === 'number' ? p.sold : Number(p.soldCount || p.sold || 0),
        soldCount: typeof p.soldCount === 'number' ? p.soldCount : Number(p.sold || p.soldCount || 0),
        quota: typeof p.quota === 'number' ? p.quota : Number(p.totalStock || p.quota || 0),
        totalStock:
          typeof p.totalStock === 'number' ? p.totalStock : Number(p.quota || p.totalStock || 0),
        discountPercent: p.discountPercent || 0,
        status: p.status || 'AVAILABLE',
        slotId: slotId,
        maxQuantityPerUser: p.maxQuantityPerUser || 1,
        displayOrder: p.displayOrder || 0,
        availableInventory: p.availableInventory || 0,
        version: p.version,
      }));
    } else {
      slotProducts = allProducts.filter((p: any) => p.slotId === slotId);
    }

    const isOvernight = s.isOvernight !== undefined ? s.isOvernight : (
      start && end ? new Date(start).getDate() !== new Date(end).getDate() : false
    );

    return {
      id: slotId,
      campaignId: s.campaignId || c.campaignId || c.id,
      start,
      end,
      startTime: start,
      endTime: end,
      label: s.label || '',
      status: s.status,
      isActive: s.isActive !== false,
      isOvernight,
      productCount: slotProducts.length,
      totalSold: s.totalSold || slotProducts.reduce((sum, p) => sum + (p.sold || 0), 0),
      totalQuota: s.totalQuota || slotProducts.reduce((sum, p) => sum + (p.quota || 0), 0),
      revenue: s.revenue || slotProducts.reduce((sum, p) => sum + (p.salePrice * (p.sold || 0)), 0),
      version: s.version,
      products: slotProducts,
    };
  });

  return {
    id: c.id || c.campaignId,
    campaignId: c.campaignId || c.id,
    title: c.title || 'FLASHSALE',
    note: c.note || c.disclaimer || '',
    disclaimer: c.disclaimer || c.note || '',
    startTime: c.startTime || c.start_time,
    endTime: c.endTime || c.end_time,
    calculatedStartAt: c.calculatedStartAt || c.startTime,
    calculatedEndAt: c.calculatedEndAt || c.endTime,
    status: c.status || 'ACTIVE',
    publishStatus: c.publishStatus || c.status || 'DRAFT',
    runtimeStatus: c.runtimeStatus || c.computedStatus || 'NO_SLOT',
    computedStatus: c.computedStatus || c.runtimeStatus,
    isActive: c.isActive !== false,
    version: c.version,
    updatedBy: c.updatedBy || 'Admin',
    createdAt: c.createdAt,
    serverNow: serverTime,
    slots,
    timeSlots: slots,
    products: allProducts,
    totalProductsCount: c.totalProductsCount || allProducts.length,
    totalSoldQuantity: c.totalSoldQuantity || allProducts.reduce((sum, p) => sum + (p.sold || 0), 0),
    totalSlotsCount: c.totalSlotsCount || slots.length,
    totalQuota: c.totalQuota || allProducts.reduce((sum, p) => sum + (p.quota || 0), 0),
    totalRevenue: c.totalRevenue || allProducts.reduce((sum, p) => sum + (p.salePrice * (p.sold || 0)), 0),
  };
}

export const flashSaleService = {
  // ================================================================
  // PUBLIC USER APIS: Dữ liệu thật từ /flash-sales/active
  // ================================================================

  async getActiveCampaign(): Promise<FlashSaleCampaign | null> {
    try {
      const res = await apiClient.get<any>('/flash-sales/active', {
        params: { _t: Date.now() },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      if (!res.data || res.status === 204) {
        return null;
      }
      return normalizeCampaign(res.data);
    } catch (err: any) {
      return null;
    }
  },

  async fetchCampaignFromApi(): Promise<FlashSaleCampaign | null> {
    return this.getActiveCampaign();
  },

  async checkout(payload: FlashSaleCheckoutPayload): Promise<FlashSaleCheckoutResult> {
    try {
      const res = await apiClient.post<FlashSaleCheckoutResult>('/flash-sale/checkout', payload);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) {
        return err.response.data as FlashSaleCheckoutResult;
      }
      return {
        code: 'SOLD_OUT',
        message: 'Lỗi kết nối máy chủ khi đặt mua Flash Sale. Vui lòng thử lại.',
      };
    }
  },

  // ================================================================
  // ADMIN CAMPAIGN APIS (CRUD chiến dịch)
  // ================================================================

  async getAllCampaigns(): Promise<FlashSaleCampaign[]> {
    const res = await apiClient.get<any[]>('/admin/flash-sales/all');
    const rawList = res.data || [];
    return rawList.map((item) => normalizeCampaign(item)).filter(Boolean) as FlashSaleCampaign[];
  },

  async getCampaignsPaginated(params: {
    page?: number;
    size?: number;
    sort?: string;
    q?: string;
    runtimeStatus?: string;
    publishStatus?: string;
  }): Promise<CampaignListPagination> {
    const res = await apiClient.get<any>('/admin/flash-sales', { params });
    const data = res.data;
    const content = (data.content || []).map((item: any) => normalizeCampaign(item)).filter(Boolean) as FlashSaleCampaign[];
    return {
      content,
      page: data.page || 0,
      size: data.size || 10,
      totalElements: data.totalElements || content.length,
      totalPages: data.totalPages || 1,
      stats: data.stats || {
        runningCount: 0,
        upcomingCount: 0,
        endedCount: 0,
        draftOrPausedCount: 0,
        totalSoldAll: 0,
        totalRevenueAll: 0,
      },
    };
  },

  async getCampaignById(id: number): Promise<FlashSaleCampaign> {
    const res = await apiClient.get<any>(`/admin/flash-sales/${id}`);
    const normalized = normalizeCampaign(res.data);
    if (!normalized) {
      throw new Error(`Không tìm thấy campaign #${id}`);
    }
    return normalized;
  },

  async createCampaign(payload: any): Promise<FlashSaleCampaign> {
    const res = await apiClient.post<any>('/admin/flash-sales', payload);
    return normalizeCampaign(res.data) || res.data;
  },

  async updateCampaign(id: number, payload: any): Promise<FlashSaleCampaign> {
    const res = await apiClient.put<any>(`/admin/flash-sales/${id}`, payload);
    return normalizeCampaign(res.data) || res.data;
  },

  async updateCampaignStatus(id: number, status: string): Promise<any> {
    const res = await apiClient.patch(`/admin/flash-sales/${id}/status`, { status });
    return res.data;
  },

  async duplicateCampaign(id: number, payload?: DuplicateCampaignPayload): Promise<FlashSaleCampaign> {
    const res = await apiClient.post<any>(`/admin/flash-sales/${id}/duplicate`, payload || {});
    return normalizeCampaign(res.data) || res.data;
  },

  async deleteCampaign(id: number): Promise<void> {
    await apiClient.delete(`/admin/flash-sales/${id}`);
  },

  // ================================================================
  // ADMIN SLOT MANAGEMENT (Quản lý khung giờ trong campaign)
  // ================================================================

  async addSlot(campaignId: number, payload: CampaignSlotPayload): Promise<FlashSaleSlot> {
    const res = await apiClient.post<FlashSaleSlot>(`/admin/flash-sales/${campaignId}/slots`, payload);
    return res.data;
  },

  async bulkCreateSlots(campaignId: number, payload: BulkCreateSlotsPayload): Promise<BulkCreateSlotsPreviewResult> {
    const res = await apiClient.post<BulkCreateSlotsPreviewResult>(`/admin/flash-sales/${campaignId}/slots/bulk`, payload);
    return res.data;
  },

  async updateSlot(campaignId: number, slotId: number, payload: CampaignSlotPayload): Promise<FlashSaleSlot> {
    const res = await apiClient.put<FlashSaleSlot>(`/admin/flash-sales/${campaignId}/slots/${slotId}`, payload);
    return res.data;
  },

  async deleteSlot(campaignId: number, slotId: number): Promise<void> {
    await apiClient.delete(`/admin/flash-sales/${campaignId}/slots/${slotId}`);
  },

  async duplicateSlot(campaignId: number, slotId: number, targetStartTime: string): Promise<FlashSaleSlot> {
    const res = await apiClient.post<FlashSaleSlot>(
      `/admin/flash-sales/${campaignId}/slots/${slotId}/duplicate`,
      null,
      { params: { targetStartTime } }
    );
    return res.data;
  },

  async copyProductsFromSlot(campaignId: number, targetSlotId: number, sourceSlotId: number): Promise<void> {
    await apiClient.post(`/admin/flash-sales/${campaignId}/slots/${targetSlotId}/copy-from/${sourceSlotId}`);
  },

  // ================================================================
  // ADMIN ITEM MANAGEMENT (Sản phẩm trong slot)
  // ================================================================

  async addItem(campaignId: number, payload: AddCampaignItemPayload): Promise<FlashSaleProduct> {
    const res = await apiClient.post<FlashSaleProduct>(`/admin/flash-sales/${campaignId}/items`, payload);
    return res.data;
  },

  async addProductsBatchToSlot(campaignId: number, slotId: number, payload: AddSlotProductsBatchPayload): Promise<FlashSaleProduct[]> {
    const res = await apiClient.post<FlashSaleProduct[]>(`/admin/flash-sales/${campaignId}/slots/${slotId}/products/batch`, payload);
    return res.data;
  },

  async updateItem(itemId: number, payload: UpdateCampaignItemPayload): Promise<FlashSaleProduct> {
    const res = await apiClient.put<FlashSaleProduct>(`/admin/flash-sales/items/${itemId}`, payload);
    return res.data;
  },

  async reorderSlotProducts(campaignId: number, slotId: number, itemIds: number[]): Promise<void> {
    await apiClient.patch(`/admin/flash-sales/${campaignId}/slots/${slotId}/products/reorder`, { itemIds });
  },

  async removeItem(itemId: number): Promise<void> {
    await apiClient.delete(`/admin/flash-sales/items/${itemId}`);
  },

  // ================================================================
  // REPORTING & AUDIT LOG
  // ================================================================

  async getCampaignReport(campaignId: number): Promise<FlashSaleReport> {
    const res = await apiClient.get<FlashSaleReport>(`/admin/flash-sales/${campaignId}/report`);
    return res.data;
  },

  async getCampaignAuditLogs(campaignId: number): Promise<FlashSaleAuditLog[]> {
    const res = await apiClient.get<FlashSaleAuditLog[]>(`/admin/flash-sales/${campaignId}/audit-log`);
    return res.data;
  },
};
