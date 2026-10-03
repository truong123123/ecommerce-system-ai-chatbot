package com.store.repository;

import com.store.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    List<Category> findAllByOrderBySortOrderAscNameAsc();
    List<Category> findByIsActiveTrueOrderBySortOrderAscNameAsc();
    List<Category> findByParentIdIsNullAndIsActiveTrueOrderBySortOrderAscNameAsc();
    List<Category> findByParentIdAndIsActiveTrueOrderBySortOrderAscNameAsc(Integer parentId);
    List<Category> findByParentId(Integer parentId);
    long countByParentId(Integer parentId);
    boolean existsByParentId(Integer parentId);
    Optional<Category> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndCategoryIdNot(String slug, Integer categoryId);
}

