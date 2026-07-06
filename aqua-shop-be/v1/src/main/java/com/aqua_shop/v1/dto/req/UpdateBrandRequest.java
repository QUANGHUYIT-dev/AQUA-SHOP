package com.aqua_shop.v1.dto.req;

import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateBrandRequest {

    @Size(max = 150, message = "Tên thương hiệu tối đa 150 ký tự")
    String name;

    String logoUrl;

    String country;

    @Size(max = 500, message = "Mô tả tối đa 500 ký tự")
    String description;

    Boolean isActive;
}
