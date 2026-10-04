package com.store.controller;

import com.store.dto.flashsale.*;
import com.store.service.FlashSaleService;
import jakarta.persistence.OptimisticLockException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/flash-sales")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AdminFlashSaleController {

    private final FlashSaleService flashSaleService;

    @ExceptionHandler({ObjectOptimisticLockingFailureException.class, OptimisticLockException.class})
    public ResponseEntity<?> handleOptimisticLockingFailure(Exception e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "code", "OPTIMISTIC_LOCK_CONFLICT",
                "message", "Dữ liệu đã được người khác thay đổi, vui lòng tải lại trang để xem cập nhật mới nhất."
        ));
    }

    // ==========================================
    // CAMPAIGN LIST & DETAILS
    // ==========================================

    @GetMapping
    public ResponseEntity<?> getCampaigns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String runtimeStatus,
            @RequestParam(required = false) String publishStatus
    ) {
        return ResponseEntity.ok(flashSaleService.getAdminCampaignsPaginated(page, size, sort, q, runtimeStatus, publishStatus));
    }

    @GetMapping("/all")
    public ResponseEntity<List<FlashSaleCampaignDto>> getAllCampaignsSimple() {
        return ResponseEntity.ok(flashSaleService.getAdminCampaigns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCampaignById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(flashSaleService.getCampaignById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createCampaign(@Valid @RequestBody CreateFlashSaleRequest request) {
        try {
            FlashSaleCampaignDto created = flashSaleService.createCampaign(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCampaign(
            @PathVariable Long id,
            @Valid @RequestBody CreateFlashSaleRequest request
    ) {
        try {
            FlashSaleCampaignDto updated = flashSaleService.updateCampaign(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu tham số status."));
        }
        try {
            flashSaleService.updateCampaignStatus(id, status);
            return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công.", "status", status));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<?> duplicateCampaign(
            @PathVariable Long id,
            @RequestBody(required = false) DuplicateCampaignRequest request
    ) {
        try {
            if (request == null) {
                request = DuplicateCampaignRequest.builder().shiftDays(0).copyProducts(true).build();
            }
            FlashSaleCampaignDto duplicated = flashSaleService.duplicateCampaign(id, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(duplicated);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCampaign(@PathVariable Long id) {
        try {
            flashSaleService.deleteCampaign(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa chiến dịch Flash Sale thành công."));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ==========================================
    // CAMPAIGN SLOTS MANAGEMENT
    // ==========================================

    @PostMapping("/{campaignId}/slots")
    public ResponseEntity<?> addSlot(
            @PathVariable Long campaignId,
            @Valid @RequestBody CreateFlashSaleSlotRequest request
    ) {
        try {
            FlashSaleTimeSlotDto slot = flashSaleService.addSlotToCampaign(campaignId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(slot);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{campaignId}/slots/bulk")
    public ResponseEntity<?> bulkCreateSlots(
            @PathVariable Long campaignId,
            @Valid @RequestBody BulkCreateSlotsRequest request
    ) {
        try {
            BulkCreateSlotsPreviewResponse response = flashSaleService.bulkCreateSlots(campaignId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{campaignId}/slots/{slotId}")
    public ResponseEntity<?> updateSlot(
            @PathVariable Long campaignId,
            @PathVariable Long slotId,
            @Valid @RequestBody CreateFlashSaleSlotRequest request
    ) {
        try {
            FlashSaleTimeSlotDto slot = flashSaleService.updateCampaignSlot(campaignId, slotId, request);
            return ResponseEntity.ok(slot);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{campaignId}/slots/{slotId}")
    public ResponseEntity<?> deleteSlot(
            @PathVariable Long campaignId,
            @PathVariable Long slotId
    ) {
        try {
            flashSaleService.deleteCampaignSlot(campaignId, slotId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa khung giờ thành công."));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi khi xóa khung giờ: " + e.getMessage()));
        }
    }

    @PostMapping("/{campaignId}/slots/{slotId}/duplicate")
    public ResponseEntity<?> duplicateSlot(
            @PathVariable Long campaignId,
            @PathVariable Long slotId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime targetStartTime
    ) {
        try {
            FlashSaleTimeSlotDto slot = flashSaleService.duplicateSlot(campaignId, slotId, targetStartTime);
            return ResponseEntity.status(HttpStatus.CREATED).body(slot);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{campaignId}/slots/{targetSlotId}/copy-from/{sourceSlotId}")
    public ResponseEntity<?> copyProductsFromSlot(
            @PathVariable Long campaignId,
            @PathVariable Long targetSlotId,
            @PathVariable Long sourceSlotId
    ) {
        try {
            flashSaleService.copyProductsFromSlot(campaignId, targetSlotId, sourceSlotId);
            return ResponseEntity.ok(Map.of("message", "Sao chép sản phẩm thành công."));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ==========================================
    // CAMPAIGN PRODUCTS MANAGEMENT
    // ==========================================

    @PostMapping("/{campaignId}/slots/{slotId}/products")
    public ResponseEntity<?> addItemToSlot(
            @PathVariable Long campaignId,
            @PathVariable Long slotId,
            @Valid @RequestBody AddFlashSaleItemRequest request
    ) {
        try {
            request.setSlotId(slotId);
            FlashSaleItemDto item = flashSaleService.addItemToCampaign(campaignId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(item);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{campaignId}/items")
    public ResponseEntity<?> addItem(
            @PathVariable Long campaignId,
            @Valid @RequestBody AddFlashSaleItemRequest request
    ) {
        try {
            FlashSaleItemDto item = flashSaleService.addItemToCampaign(campaignId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(item);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{campaignId}/slots/{slotId}/products/batch")
    public ResponseEntity<?> addProductsBatchToSlot(
            @PathVariable Long campaignId,
            @PathVariable Long slotId,
            @Valid @RequestBody AddSlotProductsBatchRequest request
    ) {
        try {
            List<FlashSaleItemDto> items = flashSaleService.addProductsBatchToSlot(campaignId, slotId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(items);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateItem(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateFlashSaleItemRequest request
    ) {
        try {
            FlashSaleItemDto item = flashSaleService.updateCampaignItem(itemId, request);
            return ResponseEntity.ok(item);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{campaignId}/slots/{slotId}/products/reorder")
    public ResponseEntity<?> reorderSlotProducts(
            @PathVariable Long campaignId,
            @PathVariable Long slotId,
            @Valid @RequestBody ReorderSlotProductsRequest request
    ) {
        try {
            flashSaleService.reorderSlotProducts(campaignId, slotId, request);
            return ResponseEntity.ok(Map.of("message", "Cập nhật thứ tự sản phẩm thành công."));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeItem(@PathVariable Long itemId) {
        try {
            flashSaleService.removeItemFromCampaign(itemId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm khỏi Flash Sale thành công."));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi xóa sản phẩm: " + e.getMessage()));
        }
    }

    // ==========================================
    // CAMPAIGN REPORT & AUDIT LOG
    // ==========================================

    @GetMapping("/{campaignId}/report")
    public ResponseEntity<?> getCampaignReport(@PathVariable Long campaignId) {
        try {
            FlashSaleReportDto report = flashSaleService.getCampaignReport(campaignId);
            return ResponseEntity.ok(report);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{campaignId}/audit-log")
    public ResponseEntity<?> getCampaignAuditLogs(@PathVariable Long campaignId) {
        try {
            List<FlashSaleAuditLogDto> logs = flashSaleService.getCampaignAuditLogs(campaignId);
            return ResponseEntity.ok(logs);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
