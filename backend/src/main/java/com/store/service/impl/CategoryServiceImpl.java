package com.store.service.impl;

import com.store.dto.CategoryRequest;
import com.store.dto.CategoryTreeDto;
import com.store.entity.Category;
import com.store.repository.CategoryRepository;
import com.store.repository.ProductRepository;
import com.store.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryTreeDto> getCategoryTree(boolean activeOnly) {
        List<Category> allCategories = activeOnly
                ? categoryRepository.findByIsActiveTrueOrderBySortOrderAscNameAsc()
                : categoryRepository.findAllByOrderBySortOrderAscNameAsc();

        return buildTree(allCategories);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryTreeDto> getAllCategories(boolean activeOnly) {
        List<Category> allCategories = activeOnly
                ? categoryRepository.findByIsActiveTrueOrderBySortOrderAscNameAsc()
                : categoryRepository.findAllByOrderBySortOrderAscNameAsc();

        return allCategories.stream().map(this::mapToTreeDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryTreeDto getCategoryById(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục với ID: " + id));
        return mapToTreeDto(category);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryTreeDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục với slug: " + slug));
        return mapToTreeDto(category);
    }

    @Override
    @Transactional
    public CategoryTreeDto createCategory(CategoryRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên danh mục không được để trống");
        }

        String slug = (request.getSlug() != null && !request.getSlug().trim().isEmpty())
                ? request.getSlug().trim()
                : generateSlug(request.getName());

        if (categoryRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis() % 10000;
        }

        if (request.getParentId() != null) {
            categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh mục cha không tồn tại với ID: " + request.getParentId()));
        }

        Category category = Category.builder()
                .name(request.getName().trim())
                .slug(slug)
                .parentId(request.getParentId())
                .imageUrl(request.getImageUrl())
                .iconUrl(request.getIconUrl())
                .description(request.getDescription())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        Category saved = categoryRepository.save(category);
        return mapToTreeDto(saved);
    }

    @Override
    @Transactional
    public CategoryTreeDto updateCategory(Integer id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục với ID: " + id));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            category.setName(request.getName().trim());
        }

        if (request.getSlug() != null && !request.getSlug().trim().isEmpty()) {
            String newSlug = request.getSlug().trim();
            if (categoryRepository.existsBySlugAndCategoryIdNot(newSlug, id)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug đã tồn tại ở danh mục khác: " + newSlug);
            }
            category.setSlug(newSlug);
        }

        // Kiểm tra vòng lặp nếu thay đổi parentId
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh mục không thể là cha của chính nó");
            }
            // Kiểm tra parent mới có phải là con cháu của category này không
            List<Integer> descendantIds = getCategoryAndDescendantIds(id);
            if (descendantIds.contains(request.getParentId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh mục cha không thể là danh mục con hoặc cháu của chính nó");
            }

            categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh mục cha không tồn tại"));
            category.setParentId(request.getParentId());
        } else {
            category.setParentId(null);
        }

        if (request.getImageUrl() != null) category.setImageUrl(request.getImageUrl());
        if (request.getIconUrl() != null) category.setIconUrl(request.getIconUrl());
        if (request.getDescription() != null) category.setDescription(request.getDescription());
        if (request.getSortOrder() != null) category.setSortOrder(request.getSortOrder());
        if (request.getIsActive() != null) category.setIsActive(request.getIsActive());
        category.setUpdatedAt(OffsetDateTime.now());

        Category saved = categoryRepository.save(category);
        return mapToTreeDto(saved);
    }

    @Override
    @Transactional
    public void deleteCategory(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục với ID: " + id));

        // 1. Kiểm tra có category con không
        if (categoryRepository.countByParentId(id) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Không thể xóa vì danh mục đang có danh mục con. Vui lòng chuyển hoặc xóa danh mục con trước.");
        }

        // 2. Kiểm tra có product nào thuộc category không
        if (productRepository.countByCategoryCategoryId(id) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Không thể xóa vì đang có sản phẩm thuộc danh mục này. Bạn có thể sử dụng chức năng Ẩn danh mục thay vì xóa.");
        }

        categoryRepository.delete(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Integer> getCategoryAndDescendantIds(Integer categoryId) {
        List<Category> allCategories = categoryRepository.findAll();
        List<Integer> result = new ArrayList<>();
        collectDescendantIds(categoryId, allCategories, result, new HashSet<>());
        return result;
    }

    private void collectDescendantIds(Integer currentId, List<Category> all, List<Integer> result, Set<Integer> visited) {
        if (visited.contains(currentId)) return;
        visited.add(currentId);
        result.add(currentId);

        for (Category c : all) {
            if (currentId.equals(c.getParentId())) {
                collectDescendantIds(c.getCategoryId(), all, result, visited);
            }
        }
    }

    private List<CategoryTreeDto> buildTree(List<Category> categories) {
        Map<Integer, CategoryTreeDto> dtoMap = new LinkedHashMap<>();
        for (Category c : categories) {
            dtoMap.put(c.getCategoryId(), mapToTreeDto(c));
        }

        List<CategoryTreeDto> rootNodes = new ArrayList<>();
        Set<Integer> visited = new HashSet<>();

        for (Category c : categories) {
            CategoryTreeDto currentDto = dtoMap.get(c.getCategoryId());
            Integer pId = c.getParentId();

            if (pId == null || !dtoMap.containsKey(pId) || pId.equals(c.getCategoryId())) {
                rootNodes.add(currentDto);
            } else {
                CategoryTreeDto parentDto = dtoMap.get(pId);
                // Tránh chu trình vô hạn
                if (!visited.contains(c.getCategoryId())) {
                    parentDto.getChildren().add(currentDto);
                }
            }
            visited.add(c.getCategoryId());
        }

        return rootNodes;
    }

    private CategoryTreeDto mapToTreeDto(Category c) {
        return CategoryTreeDto.builder()
                .categoryId(c.getCategoryId())
                .parentId(c.getParentId())
                .name(c.getName())
                .slug(c.getSlug())
                .imageUrl(c.getImageUrl())
                .iconUrl(c.getIconUrl())
                .description(c.getDescription())
                .sortOrder(c.getSortOrder())
                .isActive(c.getIsActive())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .children(new ArrayList<>())
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
