package com.store.controller;

import com.store.dto.checkout.LocationDto;
import com.store.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/locations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class LocationController {

    private final LocationService locationService;

    @GetMapping("/provinces")
    public ResponseEntity<List<LocationDto.Province>> getProvinces() {
        return ResponseEntity.ok(locationService.getProvinces());
    }

    @GetMapping("/districts")
    public ResponseEntity<List<LocationDto.District>> getDistricts(
            @RequestParam(value = "provinceCode", required = false) String provinceCode,
            @RequestParam(value = "province", required = false) String province
    ) {
        String p = provinceCode != null && !provinceCode.isEmpty() ? provinceCode : province;
        return ResponseEntity.ok(locationService.getDistricts(p));
    }

    @GetMapping("/wards")
    public ResponseEntity<List<String>> getWards(
            @RequestParam(value = "provinceCode", required = false) String provinceCode,
            @RequestParam(value = "province", required = false) String province,
            @RequestParam(value = "districtCode", required = false) String districtCode,
            @RequestParam(value = "district", required = false) String district
    ) {
        String p = provinceCode != null && !provinceCode.isEmpty() ? provinceCode : province;
        String d = districtCode != null && !districtCode.isEmpty() ? districtCode : district;
        return ResponseEntity.ok(locationService.getWards(p, d));
    }
}
