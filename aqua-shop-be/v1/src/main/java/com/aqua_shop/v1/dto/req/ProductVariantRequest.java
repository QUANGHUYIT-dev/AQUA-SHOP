package com.aqua_shop.v1.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/**
 * Một biến thể bán được — đơn vị có SKU, giá và tồn kho riêng.
 * Khách chọn variant khi mua; BE trừ kho theo SKU của variant này.
 */
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Biến thể sản phẩm: SKU + giá + tồn kho + thuộc tính (size/volume/color)")
public class ProductVariantRequest {

    @Schema(description = "ID variant (VARxxxx). Chỉ gửi khi UPDATE variant có sẵn. Tạo mới thì bỏ trống.", example = "VAR0001")
    String variantId;

    @Size(max = 50, message = "SKU tối đa 50 ký tự")
    @Schema(description = "Mã SKU duy nhất toàn hệ thống. Optional — BE tự sinh từ brand + modelCode + attributes nếu bỏ trống.", example = "CHIHIROS-WRGB2-60")
    String sku;

    @Valid
    @Schema(description = "Thuộc tính phân biệt biến thể: size (đèn), volume (chai phân), color (cá)")
    VariantAttributesRequest attributes;

    @NotNull(message = "Giá biến thể không được để trống")
    @DecimalMin(value = "0.01", message = "Giá phải lớn hơn 0")
    @Schema(description = "Giá gốc (VND)", example = "3200000")
    BigDecimal price;

    @Schema(description = "Giá khuyến mãi (VND). Optional, phải ≤ price.", example = "2990000")
    BigDecimal salePrice;

    @Min(value = 0, message = "Số lượng tồn kho không được âm")
    @Schema(description = "Số lượng tồn kho của biến thể này", example = "10")
    Integer stockQuantity;

    @Schema(description = "Cân nặng gram (ship fee). Optional.", example = "850")
    BigDecimal weightGrams;

    @Schema(description = "Variant mặc định hiển thị trên trang SP. Nếu không gửi, BE chọn variant đầu tiên.", example = "true")
    Boolean isDefault;
}
