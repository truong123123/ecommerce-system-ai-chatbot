package com.store.controller;

import com.store.dto.checkout.StoreDto;
import com.store.entity.Warehouse;
import com.store.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/stores")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class StoreController {

    private final WarehouseRepository warehouseRepository;

    @GetMapping
    public ResponseEntity<List<StoreDto>> getStores(
            @RequestParam(value = "province", required = false) String province,
            @RequestParam(value = "district", required = false) String district
    ) {
        List<Warehouse> stores = warehouseRepository.findByIsStoreTrueAndIsActiveTrue();

        List<StoreDto> dtoList = stores.stream()
                .filter(w -> {
                    if (province != null && !province.trim().isEmpty() && !province.equalsIgnoreCase("Tất cả")) {
                        if (w.getProvince() == null || !w.getProvince().toLowerCase().contains(province.trim().toLowerCase())) {
                            return false;
                        }
                    }
                    if (district != null && !district.trim().isEmpty() && !district.equalsIgnoreCase("Tất cả")) {
                        if (w.getDistrict() == null || !w.getDistrict().toLowerCase().contains(district.trim().toLowerCase())) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(w -> StoreDto.builder()
                        .storeId(w.getWarehouseId())
                        .name(w.getName())
                        .address(w.getAddress())
                        .province(w.getProvince())
                        .district(w.getDistrict())
                        .ward(w.getWard())
                        .phone(w.getPhone())
                        .openHours(w.getOpenHours())
                        .latitude(w.getLatitude())
                        .longitude(w.getLongitude())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }
}
