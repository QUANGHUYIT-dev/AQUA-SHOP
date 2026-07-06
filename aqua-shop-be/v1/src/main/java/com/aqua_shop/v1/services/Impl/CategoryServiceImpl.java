package com.aqua_shop.v1.services.Impl;

import com.aqua_shop.v1.dto.req.CreateCategoryRequest;
import com.aqua_shop.v1.dto.req.UpdateCategoryRequest;
import com.aqua_shop.v1.dto.res.CategoryResponse;
import com.aqua_shop.v1.entity.Category;
import com.aqua_shop.v1.exceptions.CustomException;
import com.aqua_shop.v1.exceptions.ErrorCode;
import com.aqua_shop.v1.mappers.CategoryMapper;
import com.aqua_shop.v1.repositories.CategoryRepository;
import com.aqua_shop.v1.services.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        log.info("Đang tạo danh mục mới: {}", request.getName());

        Category category = Category.builder()
                .name(request.getName())
                .slug(com.aqua_shop.v1.utils.StringUtils.toSlug(request.getName()))
                .description(request.getDescription())
                .categoryType(request.getCategoryType())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .isActive(true)
                .build();

        if (StringUtils.hasText(request.getParentId())) {
            Category parentCategory = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND, request.getParentId()));
            category.setParent(parentCategory);
        }

        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toCategoryResponse(savedCategory);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(String id, UpdateCategoryRequest request) {
        log.info("Đang cập nhật danh mục có ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND, id));

        if (!category.getSlug().equals(request.getSlug()) && categoryRepository.existsBySlug(request.getSlug())) {
            throw new CustomException(ErrorCode.CATEGORY_SLUG_ALREADY_EXISTS, request.getSlug());
        }

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setCategoryType(request.getCategoryType());
        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }

        if (StringUtils.hasText(request.getParentId())) {

            if (id.equals(request.getParentId())) {
                throw new CustomException(ErrorCode.CATEGORY_CANNOT_BELONG_TO_ITSELF);
            }

            Category newParent = categoryRepository.findById(String.valueOf(request.getParentId()))
                    .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND, request.getParentId()));

            if (isChildOf(newParent, category)) {
                throw new CustomException(ErrorCode.CATEGORY_CANNOT_BELONG_TO_ITS_CHILD);
            }

            category.setParent(newParent);
        } else {
            category.setParent(null);
        }

        Category updatedCategory = categoryRepository.save(category);
        return categoryMapper.toCategoryResponse(updatedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoryTree() {
        log.info("Đang lấy danh sách cây danh mục...");
        List<Category> rootCategories = categoryRepository.findByParentIsNull();
        return categoryMapper.toCategoryResponseList(rootCategories);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND, slug));
        return categoryMapper.toCategoryResponse(category);
    }

    @Override
    @Transactional
    public void deleteCategory(String id) {
        log.warn("Đang khóa (Soft Delete) danh mục có ID: {}", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND, id));
        category.setIsActive(false);
        categoryRepository.save(category);
    }

    public boolean isChildOf(Category possibleParent, Category currentCategory) {
        Category parent = possibleParent.getParent();
        while (parent != null) {
            if (parent.getCategoryId().equals(currentCategory.getCategoryId())) {
                return true;
            }
            parent = parent.getParent();
        }
        return false;
    }
}