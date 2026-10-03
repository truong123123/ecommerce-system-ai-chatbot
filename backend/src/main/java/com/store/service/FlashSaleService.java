package com.store.service;

import com.store.dto.flashsale.*;

import java.util.List;
import java.util.Map;

public interface FlashSaleService {

    // Public
    FlashSaleCampaignDto getActiveCampaign();
    List<FlashSaleCampaignDto> getAllCampaigns();
    FlashSaleCampaignDto getCampaignById(Long id);
    Map<String, Object> checkPurchaseEligibility(Long itemId, Long customerId);

    // Admin
    List<FlashSaleCampaignDto> getAdminCampaigns();
    FlashSaleCampaignDto createCampaign(CreateFlashSaleRequest request);
    FlashSaleCampaignDto updateCampaign(Long id, CreateFlashSaleRequest request);
    void updateCampaignStatus(Long id, String status);
    void deleteCampaign(Long id);
    FlashSaleItemDto addItemToCampaign(Long campaignId, AddFlashSaleItemRequest request);
    FlashSaleItemDto updateCampaignItem(Long itemId, UpdateFlashSaleItemRequest request);
    void removeItemFromCampaign(Long itemId);

    // Campaign Time Slots Management (POST/PUT/DELETE /admin/flash-sales/{campaignId}/slots)
    FlashSaleTimeSlotDto addSlotToCampaign(Long campaignId, CreateFlashSaleSlotRequest request);
    FlashSaleTimeSlotDto updateCampaignSlot(Long campaignId, Long slotId, CreateFlashSaleSlotRequest request);
    void deleteCampaignSlot(Long campaignId, Long slotId);

    // Concurrency / Purchase
    void validateAndLockFlashSalePurchase(Long itemId, Long customerId, int requestedQty);
    void recordFlashSalePurchase(Long itemId, Long customerId, Long orderId, int quantity);

    // Modern CellphoneS Multi-Slot Flash Sale APIs
    FlashSaleSlotsResponseDto getModernSlots();
    List<FlashSaleProductDto> getProductsBySlotId(Long slotId);
    FlashSaleCheckoutResponse checkoutSlotProduct(FlashSaleCheckoutRequest request);

    // Admin Slot Management (hệ thống mới - flash_sale_slots + flash_sale_slot_products)
    List<AdminSlotDto> getAdminSlots();
    AdminSlotDto getAdminSlotById(Long slotId);
    AdminSlotDto createSlot(CreateSlotRequest request);
    AdminSlotDto updateSlot(Long slotId, CreateSlotRequest request);
    void deleteSlot(Long slotId);
    AdminSlotProductDto addProductToSlot(Long slotId, AddSlotProductRequest request);
    AdminSlotProductDto updateSlotProduct(Long productEntryId, AddSlotProductRequest request);
    void removeSlotProduct(Long productEntryId);
}
