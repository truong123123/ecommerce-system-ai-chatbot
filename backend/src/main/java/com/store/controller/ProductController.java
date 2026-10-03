package com.store.controller;

import com.store.dto.*;
import com.store.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getProducts(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) Integer brandId,
            @RequestParam(required = false) String brandSlug,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isHot,
            @RequestParam(required = false) Boolean isNew,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false, defaultValue = "true") Boolean activeOnly
    ) {
        ProductPageResponseDto pageResult = productService.getProducts(
                categoryId, categorySlug, brandId, brandSlug, keyword, isHot, isNew, minPrice, maxPrice, page, size, limit, activeOnly
        );

        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Total-Count", String.valueOf(pageResult.getTotalElements()));
        headers.add("X-Total-Pages", String.valueOf(pageResult.getTotalPages()));
        headers.add("X-Current-Page", String.valueOf(pageResult.getCurrentPage()));
        headers.add("X-Page-Size", String.valueOf(pageResult.getPageSize()));

        return ResponseEntity.ok().headers(headers).body(pageResult.getItems());
    }

    @GetMapping("/paged")
    public ResponseEntity<ProductPageResponseDto> getProductsPaged(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) Integer brandId,
            @RequestParam(required = false) String brandSlug,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isHot,
            @RequestParam(required = false) Boolean isNew,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestParam(required = false, defaultValue = "true") Boolean activeOnly
    ) {
        return ResponseEntity.ok(productService.getProducts(
                categoryId, categorySlug, brandId, brandSlug, keyword, isHot, isNew, minPrice, maxPrice, page, size, null, activeOnly
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailDto> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductDetailById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductDetailDto> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductDetailBySlug(slug));
    }

    @PostMapping
    public ResponseEntity<ProductResponseDto> createProduct(@RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDto> updateProduct(
            @PathVariable Long id,
            @RequestBody UpdateProductRequest request
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
