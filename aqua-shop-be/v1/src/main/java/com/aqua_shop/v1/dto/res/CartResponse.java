package com.aqua_shop.v1.dto.res;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@Schema(description = "Giỏ hàng của khách đang đăng nhập")
public class CartResponse {

    @Schema(description = "ID giỏ hàng", example = "CRT0001")
    String cartId;

    @Schema(description = "Danh sách sản phẩm trong giỏ")
    List<CartItemResponse> items;

    @Schema(description = "Tổng số lượng sản phẩm (sum quantity)")
    Integer totalItems;

    @Schema(description = "Tổng tiền tạm tính (sum lineTotal)")
    BigDecimal subtotal;
}
