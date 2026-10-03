package com.store.controller;

import com.store.dto.BrandDto;
import com.store.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/brands")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    public ResponseEntity<List<BrandDto>> getBrands(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false, defaultValue = "true") boolean activeOnly
    ) {
        if (categorySlug != null && !categorySlug.trim().isEmpty()) {
            return ResponseEntity.ok(brandService.getBrandsByCategorySlug(categorySlug.trim()));
        }
        if (categoryId != null) {
            return ResponseEntity.ok(brandService.getBrandsByCategory(categoryId));
        }
        return ResponseEntity.ok(brandService.getAllBrands(activeOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandDto> getBrandById(@PathVariable Integer id) {
        return ResponseEntity.ok(brandService.getBrandById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<BrandDto> getBrandBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(brandService.getBrandBySlug(slug));
    }

    @PostMapping
    public ResponseEntity<BrandDto> createBrand(@RequestBody BrandDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(brandService.createBrand(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BrandDto> updateBrand(
            @PathVariable Integer id,
            @RequestBody BrandDto request
    ) {
        return ResponseEntity.ok(brandService.updateBrand(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Integer id) {
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }
}
