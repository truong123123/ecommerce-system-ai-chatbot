package com.store.controller;

import com.store.dto.CategoryRequest;
import com.store.dto.CategoryTreeDto;
import com.store.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryTreeDto>> getCategories(
            @RequestParam(required = false, defaultValue = "false") boolean tree,
            @RequestParam(required = false, defaultValue = "true") boolean activeOnly
    ) {
        if (tree) {
            return ResponseEntity.ok(categoryService.getCategoryTree(activeOnly));
        }
        return ResponseEntity.ok(categoryService.getAllCategories(activeOnly));
    }

    @GetMapping("/tree")
    public ResponseEntity<List<CategoryTreeDto>> getCategoryTree(
            @RequestParam(required = false, defaultValue = "true") boolean activeOnly
    ) {
        return ResponseEntity.ok(categoryService.getCategoryTree(activeOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryTreeDto> getCategoryById(@PathVariable Integer id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<CategoryTreeDto> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(categoryService.getCategoryBySlug(slug));
    }

    @PostMapping
    public ResponseEntity<CategoryTreeDto> createCategory(@RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryTreeDto> updateCategory(
            @PathVariable Integer id,
            @RequestBody CategoryRequest request
    ) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}

