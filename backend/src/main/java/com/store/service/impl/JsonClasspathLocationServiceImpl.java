package com.store.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.dto.checkout.LocationDto;
import com.store.service.LocationService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
public class JsonClasspathLocationServiceImpl implements LocationService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private List<LocationDto.Province> provinces = new ArrayList<>();

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("data/vietnam_locations.json");
            try (InputStream is = resource.getInputStream()) {
                provinces = objectMapper.readValue(is, new TypeReference<List<LocationDto.Province>>() {});
                log.info("Nạp thành công {} tỉnh thành từ vietnam_locations.json vào cache bộ nhớ", provinces.size());
            }
        } catch (Exception e) {
            log.error("Không thể đọc vietnam_locations.json:", e);
            provinces = new ArrayList<>();
        }
    }

    @Override
    public List<LocationDto.Province> getProvinces() {
        return Collections.unmodifiableList(provinces);
    }

    @Override
    public List<LocationDto.District> getDistricts(String provinceNameOrCode) {
        if (provinceNameOrCode == null || provinceNameOrCode.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String query = provinceNameOrCode.trim().toLowerCase();
        for (LocationDto.Province p : provinces) {
            if (p.getCode().equalsIgnoreCase(query) || p.getName().toLowerCase().contains(query)) {
                return p.getDistricts() != null ? p.getDistricts() : Collections.emptyList();
            }
        }
        return Collections.emptyList();
    }

    @Override
    public List<String> getWards(String provinceNameOrCode, String districtNameOrCode) {
        if (districtNameOrCode == null || districtNameOrCode.trim().isEmpty()) {
            return Collections.emptyList();
        }
        List<LocationDto.District> districts = getDistricts(provinceNameOrCode);
        String query = districtNameOrCode.trim().toLowerCase();
        for (LocationDto.District d : districts) {
            if (d.getCode().equalsIgnoreCase(query) || d.getName().toLowerCase().contains(query)) {
                return d.getWards() != null ? d.getWards() : Collections.emptyList();
            }
        }
        return Collections.emptyList();
    }

    @Override
    public boolean isValidLocation(String province, String district, String ward) {
        if (province == null || province.trim().isEmpty()) return false;
        // Kiểm tra tỉnh có tồn tại
        String pQuery = province.trim().toLowerCase();
        boolean provFound = provinces.stream()
                .anyMatch(p -> p.getCode().equalsIgnoreCase(pQuery) || p.getName().toLowerCase().contains(pQuery));
        return provFound;
    }
}
