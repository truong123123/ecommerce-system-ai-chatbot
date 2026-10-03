package com.store.controller;

import com.store.dto.flashsale.*;
import com.store.service.FlashSaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/flash-sales")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AdminFlashSaleController {

    private final FlashSaleService flashSaleService;

    @GetMapping
    public ResponseEntity<List<FlashSaleCampaignDto>> getAllCampaigns() {
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
        } catch (IllegalArgumentException e) {
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
        } catch (IllegalArgumentException e) {
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
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCampaign(@PathVariable Long id) {
        try {
            flashSaleService.deleteCampaign(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa chiến dịch Flash Sale thành công."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<?> addItem(
            @PathVariable Long id,
            @Valid @RequestBody AddFlashSaleItemRequest request
    ) {
        try {
            FlashSaleItemDto item = flashSaleService.addItemToCampaign(id, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(item);
        } catch (IllegalArgumentException e) {
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
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeItem(@PathVariable Long itemId) {
        try {
            flashSaleService.removeItemFromCampaign(itemId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm khỏi Flash Sale thành công."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi xóa sản phẩm: " + e.getMessage()));
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
        } catch (IllegalArgumentException e) {
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
        } catch (IllegalArgumentException e) {
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
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi khi xóa khung giờ: " + e.getMessage()));
        }
    }
}
