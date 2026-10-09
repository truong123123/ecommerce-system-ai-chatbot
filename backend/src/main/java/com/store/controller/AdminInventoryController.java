package com.store.controller;

import com.store.dto.inventory.AdjustStockRequest;
import com.store.dto.inventory.InventoryItemDto;
import com.store.dto.inventory.InventoryMovementDto;
import com.store.dto.inventory.WarehouseDto;
import com.store.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AdminInventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryItemDto>> getInventory(
            @RequestParam(required = false) Integer warehouseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(inventoryService.getAdminInventory(warehouseId, status, keyword));
    }

    @PostMapping("/adjust")
    public ResponseEntity<?> adjustStock(@Valid @RequestBody AdjustStockRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String staffEmail = auth != null ? auth.getName() : null;
        try {
            InventoryItemDto result = inventoryService.adjustStock(request, staffEmail);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/warehouses")
    public ResponseEntity<List<WarehouseDto>> getWarehouses() {
        return ResponseEntity.ok(inventoryService.getAllWarehouses());
    }

    @GetMapping("/movements/{variantId}")
    public ResponseEntity<List<InventoryMovementDto>> getMovementsByVariant(@PathVariable Long variantId) {
        return ResponseEntity.ok(inventoryService.getMovementsByVariant(variantId));
    }

    @GetMapping("/movements")
    public ResponseEntity<List<InventoryMovementDto>> getRecentMovements() {
        return ResponseEntity.ok(inventoryService.getRecentMovements());
    }
}
