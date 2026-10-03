package com.store.service;

import com.store.dto.BrandDto;

import java.util.List;

public interface BrandService {
    List<BrandDto> getAllBrands(boolean activeOnly);
    List<BrandDto> getBrandsByCategory(Integer categoryId);
    List<BrandDto> getBrandsByCategorySlug(String categorySlug);
    BrandDto getBrandById(Integer id);
    BrandDto getBrandBySlug(String slug);
    BrandDto createBrand(BrandDto request);
    BrandDto updateBrand(Integer id, BrandDto request);
    void deleteBrand(Integer id);
}
