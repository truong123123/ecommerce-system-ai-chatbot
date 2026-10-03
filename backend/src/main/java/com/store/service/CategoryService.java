package com.store.service;

import com.store.dto.CategoryRequest;
import com.store.dto.CategoryTreeDto;

import java.util.List;

public interface CategoryService {
    List<CategoryTreeDto> getCategoryTree(boolean activeOnly);
    List<CategoryTreeDto> getAllCategories(boolean activeOnly);
    CategoryTreeDto getCategoryById(Integer id);
    CategoryTreeDto getCategoryBySlug(String slug);
    CategoryTreeDto createCategory(CategoryRequest request);
    CategoryTreeDto updateCategory(Integer id, CategoryRequest request);
    void deleteCategory(Integer id);
    List<Integer> getCategoryAndDescendantIds(Integer categoryId);
}
