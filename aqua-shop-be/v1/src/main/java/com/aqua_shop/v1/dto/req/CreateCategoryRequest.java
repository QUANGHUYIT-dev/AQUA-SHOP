package com.aqua_shop.v1.dto.req;

import com.aqua_shop.v1.entity.Category;
import com.aqua_shop.v1.enums.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateCategoryRequest {

    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Loại danh mục không được để trống")
    private CategoryType categoryType;

    private String parentId;

    private Integer sortOrder;

}
