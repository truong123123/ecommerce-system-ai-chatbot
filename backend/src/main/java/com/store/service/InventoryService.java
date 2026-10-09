package com.store.service;

import com.store.dto.inventory.AdjustStockRequest;
import com.store.dto.inventory.InventoryItemDto;
import com.store.dto.inventory.InventoryMovementDto;
import com.store.dto.inventory.WarehouseDto;

import java.util.List;

public interface InventoryService {

    List<InventoryItemDto> getAdminInventory(Integer warehouseId, String status, String keyword);

    InventoryItemDto adjustStock(AdjustStockRequest request, String staffEmail);

    List<WarehouseDto> getAllWarehouses();

    List<InventoryMovementDto> getMovementsByVariant(Long variantId);

    List<InventoryMovementDto> getRecentMovements();
}
