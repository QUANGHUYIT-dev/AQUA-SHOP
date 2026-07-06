package com.aqua_shop.v1.services;

import com.aqua_shop.v1.dto.req.CreateCategoryRequest;
import com.aqua_shop.v1.dto.req.UpdateCategoryRequest;
import com.aqua_shop.v1.dto.res.CategoryResponse;
import com.aqua_shop.v1.entity.Category;

import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(CreateCategoryRequest request);
    CategoryResponse updateCategory(String id, UpdateCategoryRequest request);
    List<CategoryResponse> getCategoryTree();
    CategoryResponse getCategoryBySlug(String slug);
    void deleteCategory(String id);
    boolean isChildOf(Category possibleParent, Category currentCategory);
}
