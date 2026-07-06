package com.aqua_shop.v1.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Thêm sản phẩm vào giỏ hàng")
public class AddCartItemRequest {

    @NotBlank(message = "SKU không được để trống")
    @Schema(description = "Mã SKU variant — lấy từ ProductVariantResponse.sku", example = "CHIHIROS-WRGB2-60")
    String sku;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    @Schema(description = "Số lượng thêm vào giỏ", example = "1")
    Integer quantity;
}
