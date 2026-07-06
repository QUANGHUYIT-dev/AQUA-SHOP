package com.aqua_shop.v1.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Cập nhật banner")
public class UpdateBannerRequest {

    @Schema(description = "ID thương hiệu")
    String brandId;

    String title;
    String subtitle;
    String imageUrl;
    Integer sortOrder;
    Boolean isActive;
}
