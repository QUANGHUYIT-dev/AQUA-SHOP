package com.aqua_shop.v1.dto.res;

import com.aqua_shop.v1.enums.OrderHistoryActorType;
import com.aqua_shop.v1.enums.OrderStatus;
import com.aqua_shop.v1.enums.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@Schema(description = "Lịch sử thay đổi trạng thái đơn hàng")
public class OrderHistoryResponse {

    @Schema(description = "ID bản ghi lịch sử", example = "OHT0001")
    String orderHistoryId;

    @Schema(description = "Trạng thái đơn trước (null nếu mới tạo)")
    OrderStatus fromStatus;

    @Schema(description = "Trạng thái đơn sau")
    OrderStatus toStatus;

    @Schema(description = "Trạng thái thanh toán trước")
    PaymentStatus fromPaymentStatus;

    @Schema(description = "Trạng thái thanh toán sau")
    PaymentStatus toPaymentStatus;

    @Schema(description = "Ghi chú / mô tả sự kiện")
    String note;

    @Schema(description = "Người thực hiện (customerId hoặc SYSTEM)")
    String changedBy;

    @Schema(description = "Loại người thực hiện")
    OrderHistoryActorType actorType;

    @Schema(description = "Thời điểm thay đổi")
    LocalDateTime createdAt;
}
