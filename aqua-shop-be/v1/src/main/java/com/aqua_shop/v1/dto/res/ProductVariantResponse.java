package com.aqua_shop.v1.dto.res;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Biến thể trong response — đây là đơn vị khách chọn khi mua.
 * Gửi variant.sku (hoặc variantId) lên Order/Cart sau này.
 */
@Getter
@Setter
@Builder
@Schema(description = "Biến thể sản phẩm trong response")
public class ProductVariantResponse {

    @Schema(description = "ID variant", example = "VAR0001")
    String variantId;

    @Schema(description = "Mã SKU duy nhất — dùng trừ kho & tra cứu", example = "CHIHIROS-WRGB2-60")
    String sku;

    @Schema(description = "Kích thước (flatten từ attributes.size). Dùng render UI chọn variant.")
    String size;

    @Schema(description = "Dung tích (flatten từ attributes.volume)")
    String volume;

    @Schema(description = "Màu (flatten từ attributes.color)")
    String color;

    @Schema(description = "Object attributes gốc (size/volume/color). Trùng với 3 field phía trên.")
    VariantAttributesResponse attributes;

    @Schema(description = "Giá gốc (VND)")
    BigDecimal price;

    @Schema(description = "Giá khuyến mãi. Null = không giảm. FE hiển thị: salePrice ?? price")
    BigDecimal salePrice;

    @Schema(description = "Tồn kho variant này. 0 = hết hàng variant đó.")
    Integer stockQuantity;

    @Schema(description = "Cân nặng gram (vận chuyển)")
    BigDecimal weightGrams;

    @Schema(description = "Variant mặc định được chọn khi vào trang SP")
    Boolean isDefault;
}
