import {
  FlashSaleCampaign,
  FlashSaleItem,
  FlashSaleTimeSlot,
  CampaignSlotPayload,
  AddCampaignItemPayload,
  UpdateCampaignItemPayload,
  FlashSaleCheckoutPayload,
  FlashSaleCheckoutResult,
} from '../types/flashSale';
import { apiClient } from './api';

export const flashSaleService = {
  // ================================================================
  // PUBLIC USER APIS: Dữ liệu thật từ /flash-sales/active
  // TUYỆT ĐỐI không dùng mock / fallback dữ liệu mẫu
  // ================================================================

  /**
   * Lấy chiến dịch Flash Sale đang hoạt động (kèm khung giờ & sản phẩm thật)
   * GET /api/v1/flash-sales/active
   */
  async getActiveCampaign(): Promise<FlashSaleCampaign | null> {
    try {
      const res = await apiClient.get<FlashSaleCampaign>('/flash-sales/active');
      if (!res.data || res.status === 204) {
        return null;
      }
      return res.data;
    } catch (err: any) {
      // Khi API lỗi hoặc 404/204: trả về null để giao diện ẩn, tuyệt đối không dùng mock
      return null;
    }
  },

  /**
   * Alias cho getActiveCampaign dùng ở Admin Dashboard
   */
  async fetchCampaignFromApi(): Promise<FlashSaleCampaign | null> {
    return this.getActiveCampaign();
  },

  /**
   * Đặt mua nhanh Flash Sale
   * POST /api/v1/flash-sale/checkout
   */
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
    const res = await apiClient.get<FlashSaleCampaign[]>('/admin/flash-sales');
    return res.data || [];
  },

  async getCampaignById(id: number): Promise<FlashSaleCampaign> {
    const res = await apiClient.get<FlashSaleCampaign>(`/admin/flash-sales/${id}`);
    return res.data;
  },

  async createCampaign(payload: any): Promise<FlashSaleCampaign> {
    const res = await apiClient.post<FlashSaleCampaign>('/admin/flash-sales', payload);
    return res.data;
  },

  async updateCampaign(id: number, payload: any): Promise<FlashSaleCampaign> {
    const res = await apiClient.put<FlashSaleCampaign>(`/admin/flash-sales/${id}`, payload);
    return res.data;
  },

  async updateCampaignStatus(id: number, status: string): Promise<any> {
    const res = await apiClient.patch(`/admin/flash-sales/${id}/status`, { status });
    return res.data;
  },

  async deleteCampaign(id: number): Promise<void> {
    await apiClient.delete(`/admin/flash-sales/${id}`);
  },

  // ================================================================
  // ADMIN SLOT MANAGEMENT (Quản lý khung giờ trong campaign)
  // POST / PUT / DELETE /admin/flash-sales/{campaignId}/slots
  // ================================================================

  async addSlot(campaignId: number, payload: CampaignSlotPayload): Promise<FlashSaleTimeSlot> {
    const res = await apiClient.post<FlashSaleTimeSlot>(`/admin/flash-sales/${campaignId}/slots`, payload);
    return res.data;
  },

  async updateSlot(campaignId: number, slotId: number, payload: CampaignSlotPayload): Promise<FlashSaleTimeSlot> {
    const res = await apiClient.put<FlashSaleTimeSlot>(`/admin/flash-sales/${campaignId}/slots/${slotId}`, payload);
    return res.data;
  },

  async deleteSlot(campaignId: number, slotId: number): Promise<void> {
    await apiClient.delete(`/admin/flash-sales/${campaignId}/slots/${slotId}`);
  },

  // ================================================================
  // ADMIN ITEM MANAGEMENT (Sản phẩm trong campaign và khung giờ)
  // POST /admin/flash-sales/{campaignId}/items
  // PUT /admin/flash-sales/items/{itemId}
  // DELETE /admin/flash-sales/items/{itemId}
  // ================================================================

  async addItem(campaignId: number, payload: AddCampaignItemPayload): Promise<FlashSaleItem> {
    const res = await apiClient.post<FlashSaleItem>(`/admin/flash-sales/${campaignId}/items`, payload);
    return res.data;
  },

  async updateItem(itemId: number, payload: UpdateCampaignItemPayload): Promise<FlashSaleItem> {
    const res = await apiClient.put<FlashSaleItem>(`/admin/flash-sales/items/${itemId}`, payload);
    return res.data;
  },

  async removeItem(itemId: number): Promise<void> {
    await apiClient.delete(`/admin/flash-sales/items/${itemId}`);
  },
};
