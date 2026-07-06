package com.aqua_shop.v1.dto.res;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@Schema(description = "Thuộc tính variant (nested). FE có thể dùng field phẳng size/volume/color trên ProductVariantResponse.")
public class VariantAttributesResponse {

    @Schema(description = "Kích thước. VD: 60cm")
    String size;

    @Schema(description = "Dung tích. VD: 500ml")
    String volume;

    @Schema(description = "Màu. VD: Red")
    String color;
}
