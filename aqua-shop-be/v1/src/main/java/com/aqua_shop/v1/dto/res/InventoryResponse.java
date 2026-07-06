package com.aqua_shop.v1.dto.res;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@Schema(description = "Tồn kho theo SKU/variant")
public class InventoryResponse {

    @Schema(description = "ID tồn kho", example = "INV0001")
    String inventoryId;

    @Schema(description = "ID variant", example = "VAR0001")
    String variantId;

    @Schema(description = "SKU", example = "CHIHIROS-WRGB2-60")
    String sku;

    @Schema(description = "ID sản phẩm")
    String productId;

    @Schema(description = "Tên sản phẩm")
    String productName;

    @Schema(description = "Tồn kho thực tế (trong kho)")
    Integer quantityOnHand;

    @Schema(description = "Số lượng đang giữ cho đơn online")
    Integer quantityOnHold;

    @Schema(description = "Có thể bán = tồn thực - đang giữ")
    Integer quantityAvailable;

    @Schema(description = "Giá gốc variant (VND)")
    java.math.BigDecimal price;

    @Schema(description = "Giá khuyến mãi (VND)")
    java.math.BigDecimal salePrice;
}
