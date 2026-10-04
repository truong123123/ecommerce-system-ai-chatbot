package com.store.service;

import com.store.dto.flashsale.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public interface FlashSaleService {

    // Public API
    FlashSaleCampaignDto getActiveCampaign();
    List<FlashSaleCampaignDto> getAllCampaigns();
    FlashSaleCampaignDto getCampaignById(Long id);
    Map<String, Object> checkPurchaseEligibility(Long itemId, Long customerId);

    // Admin Campaign Management
    List<FlashSaleCampaignDto> getAdminCampaigns();
    Map<String, Object> getAdminCampaignsPaginated(int page, int size, String sort, String q, String runtimeStatus, String publishStatus);
    FlashSaleCampaignDto createCampaign(CreateFlashSaleRequest request);
    FlashSaleCampaignDto updateCampaign(Long id, CreateFlashSaleRequest request);
    void updateCampaignStatus(Long id, String status);
    void deleteCampaign(Long id);
    FlashSaleCampaignDto duplicateCampaign(Long id, DuplicateCampaignRequest request);

    // Admin Slot Management
    FlashSaleTimeSlotDto addSlotToCampaign(Long campaignId, CreateFlashSaleSlotRequest request);
    BulkCreateSlotsPreviewResponse bulkCreateSlots(Long campaignId, BulkCreateSlotsRequest request);
    FlashSaleTimeSlotDto updateCampaignSlot(Long campaignId, Long slotId, CreateFlashSaleSlotRequest request);
    void deleteCampaignSlot(Long campaignId, Long slotId);
    FlashSaleTimeSlotDto duplicateSlot(Long campaignId, Long slotId, OffsetDateTime targetStartTime);
    void copyProductsFromSlot(Long campaignId, Long targetSlotId, Long sourceSlotId);

    // Admin Product Management
    FlashSaleItemDto addItemToCampaign(Long campaignId, AddFlashSaleItemRequest request);
    List<FlashSaleItemDto> addProductsBatchToSlot(Long campaignId, Long slotId, AddSlotProductsBatchRequest request);
    FlashSaleItemDto updateCampaignItem(Long itemId, UpdateFlashSaleItemRequest request);
    void reorderSlotProducts(Long campaignId, Long slotId, ReorderSlotProductsRequest request);
    void removeItemFromCampaign(Long itemId);

    // Admin Reporting & Audit Log
    FlashSaleReportDto getCampaignReport(Long campaignId);
    List<FlashSaleAuditLogDto> getCampaignAuditLogs(Long campaignId);

    // Concurrency / Purchase
    void validateAndLockFlashSalePurchase(Long itemId, Long customerId, int requestedQty);
    void recordFlashSalePurchase(Long itemId, Long customerId, Long orderId, int quantity);

    // Legacy/Multi-Slot support
    FlashSaleSlotsResponseDto getModernSlots();
    List<FlashSaleProductDto> getProductsBySlotId(Long slotId);
    FlashSaleCheckoutResponse checkoutSlotProduct(FlashSaleCheckoutRequest request);
    List<AdminSlotDto> getAdminSlots();
    AdminSlotDto getAdminSlotById(Long slotId);
    AdminSlotDto createSlot(CreateSlotRequest request);
    AdminSlotDto updateSlot(Long slotId, CreateSlotRequest request);
    void deleteSlot(Long slotId);
    AdminSlotProductDto addProductToSlot(Long slotId, AddSlotProductRequest request);
    AdminSlotProductDto updateSlotProduct(Long productEntryId, AddSlotProductRequest request);
    void removeSlotProduct(Long productEntryId);
}
