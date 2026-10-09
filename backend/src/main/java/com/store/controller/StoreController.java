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

    @GetMapping("/provinces")
    public ResponseEntity<List<String>> getProvinces() {
        return ResponseEntity.ok(warehouseRepository.findDistinctStoreProvinces());
    }

    @GetMapping
    public ResponseEntity<List<StoreDto>> getStores(
            @RequestParam(value = "province", required = false) String province,
            @RequestParam(value = "district", required = false) String district,
            @RequestParam(value = "keyword", required = false) String keyword
    ) {
        List<Warehouse> stores = warehouseRepository.findByIsStoreTrueAndIsActiveTrue();

        List<StoreDto> dtoList = stores.stream()
                .filter(w -> {
                    if (province != null && !province.trim().isEmpty() && !province.equalsIgnoreCase("Tất cả")) {
                        if (w.getProvince() == null || !matchesNormalized(w.getProvince(), province.trim())) {
                            return false;
                        }
                    }
                    if (district != null && !district.trim().isEmpty() && !district.equalsIgnoreCase("Tất cả")) {
                        if (w.getDistrict() == null || !matchesNormalized(w.getDistrict(), district.trim())) {
                            return false;
                        }
                    }
                    if (keyword != null && !keyword.trim().isEmpty()) {
                        String kw = keyword.trim();
                        boolean nameMatch = matchesNormalized(w.getName(), kw);
                        boolean addrMatch = matchesNormalized(w.getAddress(), kw);
                        boolean phoneMatch = w.getPhone() != null && w.getPhone().contains(kw);
                        if (!nameMatch && !addrMatch && !phoneMatch) {
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

    private boolean matchesNormalized(String source, String target) {
        if (source == null || target == null) return false;
        String s = stripAccents(source.toLowerCase());
        String t = stripAccents(target.toLowerCase());
        return s.contains(t) || source.toLowerCase().contains(target.toLowerCase());
    }

    private String stripAccents(String s) {
        if (s == null) return "";
        String normalized = java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "").replace('đ', 'd').replace('Đ', 'd');
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStoreById(@PathVariable Integer id) {
        return warehouseRepository.findById(id)
                .filter(w -> Boolean.TRUE.equals(w.getIsStore()) && Boolean.TRUE.equals(w.getIsActive()))
                .map(w -> ResponseEntity.ok(StoreDto.builder()
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
                        .build()))
                .orElse(ResponseEntity.notFound().build());
    }
}
