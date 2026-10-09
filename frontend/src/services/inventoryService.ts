import apiClient from './apiClient';

export interface InventoryItem {
  warehouseId: number;
  warehouseName: string;
  warehouseAddress: string;
  variantId: number;
  productId: number;
  productName: string;
  sku: string;
  attributes?: string;
  quantity: number;
  reservedQty: number;
  availableQty: number;
  reorderLevel: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  updatedAt: string;
}

export interface WarehouseItem {
  warehouseId: number;
  name: string;
  address: string;
  province?: string;
  district?: string;
  ward?: string;
  phone?: string;
  isStore: boolean;
  isActive: boolean;
}

export interface AdjustStockPayload {
  warehouseId: number;
  variantId: number;
  type: 'IMPORT' | 'EXPORT' | 'ADJUST';
  changeQty: number;
  reason: string;
  notes?: string;
}

export interface InventoryMovementItem {
  movementId: number;
  warehouseId: number;
  warehouseName: string;
  variantId: number;
  sku: string;
  productName: string;
  changeQty: number;
  reason: string;
  referenceId?: number;
  staffName: string;
  createdAt: string;
}

export const inventoryService = {
  async getInventory(params?: { warehouseId?: number; status?: string; keyword?: string }): Promise<InventoryItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.warehouseId) searchParams.set('warehouseId', params.warehouseId.toString());
    if (params?.status && params.status !== 'ALL') searchParams.set('status', params.status);
    if (params?.keyword) searchParams.set('keyword', params.keyword);

    const res = await apiClient.get<InventoryItem[]>(`/admin/inventory?${searchParams.toString()}`);
    return res.data;
  },

  async adjustStock(payload: AdjustStockPayload): Promise<InventoryItem> {
    const res = await apiClient.post<InventoryItem>('/admin/inventory/adjust', payload);
    return res.data;
  },

  async getWarehouses(): Promise<WarehouseItem[]> {
    const res = await apiClient.get<WarehouseItem[]>('/admin/inventory/warehouses');
    return res.data;
  },

  async getMovements(variantId: number): Promise<InventoryMovementItem[]> {
    const res = await apiClient.get<InventoryMovementItem[]>(`/admin/inventory/movements/${variantId}`);
    return res.data;
  },

  async getRecentMovements(): Promise<InventoryMovementItem[]> {
    const res = await apiClient.get<InventoryMovementItem[]>('/admin/inventory/movements');
    return res.data;
  },
};
