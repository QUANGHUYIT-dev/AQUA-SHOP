package com.aqua_shop.v1.dto.res;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class BrandResponse {

    String brandId;
    String name;
    String logoUrl;
    String slug;
    String country;
    String description;
    Boolean isActive;
}
