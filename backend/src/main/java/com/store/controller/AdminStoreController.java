package com.store.controller;

import com.store.entity.Warehouse;
import com.store.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admin/stores")
@RequiredArgsConstructor
public class AdminStoreController {

    private final WarehouseRepository warehouseRepository;

    @GetMapping
    public ResponseEntity<List<Warehouse>> getAllStores() {
        return ResponseEntity.ok(warehouseRepository.findByIsStoreTrueOrderByWarehouseIdAsc());
    }

    @PostMapping
    public ResponseEntity<?> createStore(@RequestBody Warehouse req) {
        if (req.getName() == null || req.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tên chi nhánh không được để trống"));
        }
        if (req.getAddress() == null || req.getAddress().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Địa chỉ chi nhánh không được để trống"));
        }
        if (req.getProvince() == null || req.getProvince().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tỉnh/Thành phố không được để trống"));
        }

        Warehouse store = Warehouse.builder()
                .name(req.getName().trim())
                .address(req.getAddress().trim())
                .province(req.getProvince().trim())
                .district(req.getDistrict() != null ? req.getDistrict().trim() : null)
                .ward(req.getWard() != null ? req.getWard().trim() : null)
                .phone(req.getPhone() != null ? req.getPhone().trim() : null)
                .openHours(req.getOpenHours() != null ? req.getOpenHours().trim() : "08:00 - 22:00")
                .isStore(true)
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .isRegionalHub(req.getIsRegionalHub() != null ? req.getIsRegionalHub() : false)
                .region(req.getRegion() != null ? req.getRegion().trim() : null)
                .build();

        Warehouse saved = warehouseRepository.save(store);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStore(@PathVariable Integer id, @RequestBody Warehouse req) {
        Optional<Warehouse> storeOpt = warehouseRepository.findById(id);
        if (storeOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy chi nhánh với ID: " + id));
        }

        Warehouse existing = storeOpt.get();
        if (req.getName() != null) existing.setName(req.getName().trim());
        if (req.getAddress() != null) existing.setAddress(req.getAddress().trim());
        if (req.getProvince() != null) existing.setProvince(req.getProvince().trim());
        if (req.getDistrict() != null) existing.setDistrict(req.getDistrict().trim());
        if (req.getWard() != null) existing.setWard(req.getWard().trim());
        if (req.getPhone() != null) existing.setPhone(req.getPhone().trim());
        if (req.getOpenHours() != null) existing.setOpenHours(req.getOpenHours().trim());
        if (req.getIsActive() != null) existing.setIsActive(req.getIsActive());
        if (req.getIsRegionalHub() != null) existing.setIsRegionalHub(req.getIsRegionalHub());
        if (req.getRegion() != null) existing.setRegion(req.getRegion().trim());

        Warehouse updated = warehouseRepository.save(existing);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleStoreStatus(@PathVariable Integer id) {
        Optional<Warehouse> storeOpt = warehouseRepository.findById(id);
        if (storeOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy chi nhánh với ID: " + id));
        }

        Warehouse store = storeOpt.get();
        boolean newStatus = !(store.getIsActive() != null && store.getIsActive());
        store.setIsActive(newStatus);
        warehouseRepository.save(store);

        return ResponseEntity.ok(Map.of(
                "message", newStatus ? "Đã mở lại hoạt động chi nhánh" : "Đã tạm dừng hoạt động chi nhánh",
                "warehouseId", store.getWarehouseId(),
                "isActive", newStatus
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStore(@PathVariable Integer id) {
        if (!warehouseRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy chi nhánh với ID: " + id));
        }
        warehouseRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Xóa chi nhánh thành công!"));
    }
}
