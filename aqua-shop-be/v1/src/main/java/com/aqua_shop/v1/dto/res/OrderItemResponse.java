package com.aqua_shop.v1.dto.res;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@Schema(description = "Dòng sản phẩm trong đơn hàng (snapshot)")
public class OrderItemResponse {

    @Schema(description = "ID dòng đơn", example = "OIT0001")
    String orderItemId;

    @Schema(description = "SKU tại thời điểm đặt")
    String sku;

    @Schema(description = "ID sản phẩm")
    String productId;

    @Schema(description = "Tên sản phẩm tại thời điểm đặt")
    String productName;

    @Schema(description = "Ảnh đại diện")
    String thumbnailUrl;

    @Schema(description = "Kích thước variant")
    String variantSize;

    @Schema(description = "Dung tích variant")
    String variantVolume;

    @Schema(description = "Màu variant")
    String variantColor;

    @Schema(description = "Số lượng")
    Integer quantity;

    @Schema(description = "Đơn giá tại thời điểm đặt")
    BigDecimal unitPrice;

    @Schema(description = "Thành tiền dòng")
    BigDecimal lineTotal;
}
