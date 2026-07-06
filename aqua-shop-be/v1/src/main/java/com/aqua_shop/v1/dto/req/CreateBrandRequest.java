package com.aqua_shop.v1.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateBrandRequest {

    @NotBlank(message = "Tên thương hiệu không được để trống")
    String name;

    String logoUrl;

    String country;

    String description;

}
