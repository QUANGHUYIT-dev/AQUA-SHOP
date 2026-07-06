package com.aqua_shop.v1.dto.res;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@Schema(description = "Ảnh gallery sản phẩm")
public class ProductImageResponse {

    @Schema(description = "ID ảnh")
    Long imageId;

    @Schema(description = "URL ảnh")
    String imageUrl;

    @Schema(description = "Cloudinary publicId — có khi ảnh upload qua Cloudinary")
    String publicId;

    @Schema(description = "Alt text")
    String altText;

    @Schema(description = "Thứ tự hiển thị")
    Integer sortOrder;

    @Schema(description = "Ảnh chính trong gallery")
    Boolean isPrimary;
}
