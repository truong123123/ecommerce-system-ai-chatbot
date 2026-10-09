package com.store.service.impl;

import com.store.dto.inventory.AdjustStockRequest;
import com.store.dto.inventory.InventoryItemDto;
import com.store.dto.inventory.InventoryMovementDto;
import com.store.dto.inventory.WarehouseDto;
import com.store.entity.*;
import com.store.repository.*;
import com.store.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository movementRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductVariantRepository variantRepository;
    private final StaffRepository staffRepository;

    private InventoryItemDto toItemDto(Inventory inv) {
        int qty = inv.getQuantity() != null ? inv.getQuantity() : 0;
        int reserved = inv.getReservedQty() != null ? inv.getReservedQty() : 0;
        int available = Math.max(0, qty - reserved);
        int reorder = inv.getReorderLevel() != null ? inv.getReorderLevel() : 10;

        String status = "IN_STOCK";
        if (available <= 0) {
            status = "OUT_OF_STOCK";
        } else if (available <= reorder) {
            status = "LOW_STOCK";
        }

        Warehouse w = inv.getWarehouse();
        ProductVariant v = inv.getVariant();
        Product p = v != null ? v.getProduct() : null;

        return InventoryItemDto.builder()
                .warehouseId(w != null ? w.getWarehouseId() : null)
                .warehouseName(w != null ? w.getName() : null)
                .warehouseAddress(w != null ? w.getAddress() : null)
                .variantId(v != null ? v.getVariantId() : null)
                .productId(p != null ? p.getProductId() : null)
                .productName(p != null ? p.getName() : null)
                .sku(v != null ? v.getSku() : null)
                .attributes(v != null && v.getAttributes() != null ? v.getAttributes().toString() : null)
                .quantity(qty)
                .reservedQty(reserved)
                .availableQty(available)
                .reorderLevel(reorder)
                .status(status)
                .updatedAt(inv.getUpdatedAt())
                .build();
    }

    private InventoryMovementDto toMovementDto(InventoryMovement m) {
        return InventoryMovementDto.builder()
                .movementId(m.getMovementId())
                .warehouseId(m.getWarehouse() != null ? m.getWarehouse().getWarehouseId() : null)
                .warehouseName(m.getWarehouse() != null ? m.getWarehouse().getName() : null)
                .variantId(m.getVariant() != null ? m.getVariant().getVariantId() : null)
                .sku(m.getVariant() != null ? m.getVariant().getSku() : null)
                .productName(m.getVariant() != null && m.getVariant().getProduct() != null ? m.getVariant().getProduct().getName() : null)
                .changeQty(m.getChangeQty())
                .reason(m.getReason())
                .referenceId(m.getReferenceId())
                .staffName(m.getStaff() != null ? m.getStaff().getFullName() : "Hệ thống")
                .createdAt(m.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryItemDto> getAdminInventory(Integer warehouseId, String status, String keyword) {
        List<Inventory> all = inventoryRepository.findAllWithDetails();

        return all.stream()
                .filter(inv -> {
                    if (warehouseId != null && !warehouseId.equals(inv.getId().getWarehouseId())) {
                        return false;
                    }
                    if (keyword != null && !keyword.trim().isEmpty()) {
                        String kw = keyword.trim().toLowerCase();
                        String productName = inv.getVariant() != null && inv.getVariant().getProduct() != null
                                ? inv.getVariant().getProduct().getName().toLowerCase() : "";
                        String sku = inv.getVariant() != null ? inv.getVariant().getSku().toLowerCase() : "";
                        String wName = inv.getWarehouse() != null ? inv.getWarehouse().getName().toLowerCase() : "";
                        if (!productName.contains(kw) && !sku.contains(kw) && !wName.contains(kw)) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(this::toItemDto)
                .filter(dto -> {
                    if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) {
                        return status.equalsIgnoreCase(dto.getStatus());
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InventoryItemDto adjustStock(AdjustStockRequest req, String staffEmail) {
        Warehouse warehouse = warehouseRepository.findById(req.getWarehouseId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy kho hàng ID: " + req.getWarehouseId()));

        ProductVariant variant = variantRepository.findById(req.getVariantId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy biến thể sản phẩm ID: " + req.getVariantId()));

        Staff staff = null;
        if (staffEmail != null) {
            staff = staffRepository.findByEmailIgnoreCase(staffEmail).orElse(null);
        }

        InventoryId id = new InventoryId(req.getWarehouseId(), req.getVariantId());
        Inventory inv = inventoryRepository.findById(id).orElseGet(() -> {
            Inventory newInv = new Inventory();
            newInv.setId(id);
            newInv.setWarehouse(warehouse);
            newInv.setVariant(variant);
            newInv.setQuantity(0);
            newInv.setReservedQty(0);
            newInv.setReorderLevel(10);
            newInv.setUpdatedAt(OffsetDateTime.now());
            return newInv;
        });

        int currentQty = inv.getQuantity() != null ? inv.getQuantity() : 0;
        int currentReserved = inv.getReservedQty() != null ? inv.getReservedQty() : 0;
        int delta = 0;
        String opType = req.getType().toUpperCase();

        if ("IMPORT".equals(opType)) {
            delta = req.getChangeQty();
            inv.setQuantity(currentQty + delta);
        } else if ("EXPORT".equals(opType)) {
            int available = currentQty - currentReserved;
            if (available < req.getChangeQty()) {
                throw new IllegalArgumentException("Không đủ tồn kho khả dụng để xuất. Khả dụng: " + available + ", yêu cầu xuất: " + req.getChangeQty());
            }
            delta = -req.getChangeQty();
            inv.setQuantity(currentQty + delta);
        } else if ("ADJUST".equals(opType)) {
            int newQty = req.getChangeQty();
            if (newQty < currentReserved) {
                throw new IllegalArgumentException("Số lượng tồn mới (" + newQty + ") không thể nhỏ hơn số lượng đang giữ chỗ (" + currentReserved + ")");
            }
            delta = newQty - currentQty;
            inv.setQuantity(newQty);
        } else {
            throw new IllegalArgumentException("Loại thao tác không hợp lệ: " + req.getType());
        }

        inv.setUpdatedAt(OffsetDateTime.now());
        Inventory saved = inventoryRepository.save(inv);

        // Sanitize reason for database constraint check
        String validReason = "adjustment";
        if (req.getReason() != null) {
            String r = req.getReason().trim().toLowerCase();
            if (List.of("purchase", "sale", "return", "adjustment", "damaged", "import", "export", "reserve", "release", "consume").contains(r)) {
                validReason = r;
            } else if ("IMPORT".equals(opType)) {
                validReason = "import";
            } else if ("EXPORT".equals(opType)) {
                validReason = "export";
            }
        }

        InventoryMovement movement = InventoryMovement.builder()
                .warehouse(warehouse)
                .variant(variant)
                .changeQty(delta)
                .reason(validReason)
                .staff(staff)
                .createdAt(OffsetDateTime.now())
                .build();
        movementRepository.save(movement);

        return toItemDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseDto> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
                .map(w -> WarehouseDto.builder()
                        .warehouseId(w.getWarehouseId())
                        .name(w.getName())
                        .address(w.getAddress())
                        .province(w.getProvince())
                        .district(w.getDistrict())
                        .ward(w.getWard())
                        .phone(w.getPhone())
                        .latitude(w.getLatitude())
                        .longitude(w.getLongitude())
                        .openHours(w.getOpenHours())
                        .isStore(w.getIsStore())
                        .isActive(w.getIsActive())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryMovementDto> getMovementsByVariant(Long variantId) {
        return movementRepository.findByVariantIdWithDetails(variantId).stream()
                .map(this::toMovementDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryMovementDto> getRecentMovements() {
        return movementRepository.findRecentMovements().stream()
                .limit(50)
                .map(this::toMovementDto)
                .collect(Collectors.toList());
    }
}
