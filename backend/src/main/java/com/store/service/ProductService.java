package com.store.service;

import com.store.dto.CreateProductRequest;
import com.store.dto.ProductDetailDto;
import com.store.dto.ProductPageResponseDto;
import com.store.dto.ProductResponseDto;
import com.store.dto.UpdateProductRequest;

import java.util.List;

public interface ProductService {
    List<ProductResponseDto> getProducts(Integer categoryId, String categorySlug, Integer brandId, String keyword);
    ProductPageResponseDto getProducts(
            Integer categoryId,
            String categorySlug,
            Integer brandId,
            String brandSlug,
            String keyword,
            Boolean isHot,
            Boolean isNew,
            java.math.BigDecimal minPrice,
            java.math.BigDecimal maxPrice,
            Integer page,
            Integer size,
            Integer limit,
            Boolean activeOnly
    );
    List<ProductResponseDto> getProducts(
            Integer categoryId,
            String categorySlug,
            Integer brandId,
            String keyword,
            Boolean isHot,
            Boolean isNew,
            java.math.BigDecimal minPrice,
            java.math.BigDecimal maxPrice,
            Integer limit,
            Boolean activeOnly
    );
    ProductDetailDto getProductDetailById(Long id);
    ProductDetailDto getProductDetailBySlug(String slug);
    ProductResponseDto createProduct(CreateProductRequest request);
    ProductResponseDto updateProduct(Long id, UpdateProductRequest request);
    void deleteProduct(Long id);
}
