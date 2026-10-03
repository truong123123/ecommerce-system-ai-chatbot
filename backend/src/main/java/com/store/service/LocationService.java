package com.store.service;

import com.store.dto.checkout.LocationDto;

import java.util.List;

public interface LocationService {
    List<LocationDto.Province> getProvinces();
    List<LocationDto.District> getDistricts(String provinceNameOrCode);
    List<String> getWards(String provinceNameOrCode, String districtNameOrCode);
    boolean isValidLocation(String province, String district, String ward);
}
