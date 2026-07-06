package com.aqua_shop.v1.dto.res;

import com.aqua_shop.v1.enums.CategoryType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class CategoryResponse {

    private String categoryId;
    private String name;
    private String slug;
    private String description;
    private CategoryType categoryType;

    private String parentId;
    private String parentName;

    private List<CategoryResponse> children;

    private Integer sortOrder;
    private Boolean isActive;
}