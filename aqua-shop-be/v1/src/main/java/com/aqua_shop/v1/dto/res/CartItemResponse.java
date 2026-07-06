package com.aqua_shop.v1.dto.res;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@Schema(description = "Dòng sản phẩm trong giỏ hàng")
public class CartItemResponse {

    @Schema(description = "ID dòng giỏ hàng", example = "CIT0001")
    String cartItemId;

    @Schema(description = "ID variant", example = "VAR0001")
    String variantId;

    @Schema(description = "SKU variant", example = "CHIHIROS-WRGB2-60")
    String sku;

    @Schema(description = "ID sản phẩm", example = "PRD0001")
    String productId;

    @Schema(description = "Tên sản phẩm")
    String productName;

    @Schema(description = "Ảnh đại diện sản phẩm")
    String thumbnailUrl;

    @Schema(description = "Kích thước variant")
    String size;

    @Schema(description = "Dung tích variant")
    String volume;

    @Schema(description = "Màu variant")
    String color;

    @Schema(description = "Đơn giá tại thời điểm thêm vào giỏ (salePrice ?? price)")
    BigDecimal unitPrice;

    @Schema(description = "Số lượng trong giỏ")
    Integer quantity;

    @Schema(description = "Thành tiền dòng = unitPrice × quantity")
    BigDecimal lineTotal;

    @Schema(description = "Tồn kho hiện tại của variant")
    Integer stockQuantity;

    @Schema(description = "Còn đủ hàng cho số lượng trong giỏ")
    Boolean inStock;
}
