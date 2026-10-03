package com.store.service.impl;

import com.store.dto.BrandDto;
import com.store.entity.Brand;
import com.store.repository.BrandRepository;
import com.store.repository.CategoryRepository;
import com.store.repository.ProductRepository;
import com.store.service.BrandService;
import com.store.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;

    @Override
    @Transactional(readOnly = true)
    public List<BrandDto> getAllBrands(boolean activeOnly) {
        List<Brand> brands = activeOnly
                ? brandRepository.findByIsActiveTrueOrderBySortOrderAscNameAsc()
                : brandRepository.findAllByOrderBySortOrderAscNameAsc();

        return brands.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BrandDto> getBrandsByCategory(Integer categoryId) {
        if (categoryId == null) {
            return getAllBrands(true);
        }

        List<Integer> categoryIds = categoryService.getCategoryAndDescendantIds(categoryId);
        if (categoryIds.isEmpty()) {
            return List.of();
        }

        List<Brand> brands = brandRepository.findDistinctBrandsByCategoryIds(categoryIds);
        return brands.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BrandDto> getBrandsByCategorySlug(String categorySlug) {
        if (categorySlug == null || categorySlug.trim().isEmpty()) {
            return getAllBrands(true);
        }
        return categoryRepository.findBySlug(categorySlug.trim())
                .map(cat -> getBrandsByCategory(cat.getCategoryId()))
                .orElse(List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public BrandDto getBrandById(Integer id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thương hiệu với ID: " + id));
        return mapToDto(brand);
    }

    @Override
    @Transactional(readOnly = true)
    public BrandDto getBrandBySlug(String slug) {
        Brand brand = brandRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thương hiệu với slug: " + slug));
        return mapToDto(brand);
    }

    @Override
    @Transactional
    public BrandDto createBrand(BrandDto request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên thương hiệu không được để trống");
        }

        String slug = (request.getSlug() != null && !request.getSlug().trim().isEmpty())
                ? request.getSlug().trim()
                : generateSlug(request.getName());

        if (brandRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis() % 10000;
        }

        Brand brand = Brand.builder()
                .name(request.getName().trim())
                .slug(slug)
                .country(request.getCountry())
                .logoUrl(request.getLogoUrl())
                .description(request.getDescription())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        Brand saved = brandRepository.save(brand);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public BrandDto updateBrand(Integer id, BrandDto request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thương hiệu với ID: " + id));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            brand.setName(request.getName().trim());
        }

        if (request.getSlug() != null && !request.getSlug().trim().isEmpty()) {
            String newSlug = request.getSlug().trim();
            if (brandRepository.existsBySlugAndBrandIdNot(newSlug, id)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug đã tồn tại ở thương hiệu khác: " + newSlug);
            }
            brand.setSlug(newSlug);
        }

        if (request.getCountry() != null) brand.setCountry(request.getCountry());
        if (request.getLogoUrl() != null) brand.setLogoUrl(request.getLogoUrl());
        if (request.getDescription() != null) brand.setDescription(request.getDescription());
        if (request.getSortOrder() != null) brand.setSortOrder(request.getSortOrder());
        if (request.getIsActive() != null) brand.setIsActive(request.getIsActive());
        brand.setUpdatedAt(OffsetDateTime.now());

        Brand saved = brandRepository.save(brand);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void deleteBrand(Integer id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thương hiệu với ID: " + id));

        if (productRepository.countByBrandBrandId(id) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Không thể xóa vì đang có sản phẩm thuộc thương hiệu này. Bạn có thể sử dụng chức năng Ẩn thương hiệu thay vì xóa.");
        }

        brandRepository.delete(brand);
    }

    private BrandDto mapToDto(Brand b) {
        return BrandDto.builder()
                .brandId(b.getBrandId())
                .name(b.getName())
                .slug(b.getSlug())
                .country(b.getCountry())
                .logoUrl(b.getLogoUrl())
                .description(b.getDescription())
                .sortOrder(b.getSortOrder())
                .isActive(b.getIsActive())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }

    private String generateSlug(String input) {
        if (input == null) return UUID.randomUUID().toString();
        String nowhitespace = input.trim().replaceAll("\\s+", "-");
        String normalized = java.text.Normalizer.normalize(nowhitespace, java.text.Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9-]", "");
    }
}
