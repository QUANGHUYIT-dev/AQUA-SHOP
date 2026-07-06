package com.aqua_shop.v1.dto.res;

import com.aqua_shop.v1.enums.OrderStatus;
import com.aqua_shop.v1.enums.PaymentMethod;
import com.aqua_shop.v1.enums.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@Schema(description = "Đơn hàng tóm tắt (danh sách)")
public class OrderSummaryResponse {

    @Schema(description = "ID đơn hàng")
    String orderId;

    @Schema(description = "Trạng thái đơn")
    OrderStatus status;

    @Schema(description = "Phương thức thanh toán")
    PaymentMethod paymentMethod;

    @Schema(description = "Trạng thái thanh toán")
    PaymentStatus paymentStatus;

    @Schema(description = "Tổng thanh toán")
    BigDecimal totalAmount;

    @Schema(description = "Tổng số lượng sản phẩm")
    Integer totalItems;

    @Schema(description = "Thời gian tạo đơn")
    LocalDateTime createdAt;
}
