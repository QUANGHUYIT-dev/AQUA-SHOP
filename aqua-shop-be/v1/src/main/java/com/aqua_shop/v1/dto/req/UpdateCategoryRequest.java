package com.aqua_shop.v1.dto.req;

import com.aqua_shop.v1.enums.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCategoryRequest {
    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;

    @NotBlank(message = "Slug không được để trống")
    private String slug;

    private String description;

    @NotNull(message = "Loại danh mục không được để trống")
    private CategoryType categoryType;

    private String parentId;

    private Integer sortOrder;
}
