package com.aqua_shop.v1.mappers;

import com.aqua_shop.v1.dto.res.CategoryResponse;
import com.aqua_shop.v1.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResponse toCategoryResponse(String id, String name);

    @Mapping(source = "parent.categoryId", target = "parentId")
    @Mapping(source = "parent.name", target = "parentName")
    @Mapping(source = "children", target = "children")
    CategoryResponse toCategoryResponse(Category category);

    List<CategoryResponse> toCategoryResponseList(List<Category> categories);

}
