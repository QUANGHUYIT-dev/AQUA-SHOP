package com.aqua_shop.v1.dto.res;

import com.aqua_shop.v1.enums.OrderStatus;
import com.aqua_shop.v1.enums.OrderType;
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
@Schema(description = "Đơn hàng tóm tắt cho admin")
public class AdminOrderSummaryResponse {

    String orderId;
    String customerId;
    String customerName;
    OrderType orderType;
    OrderStatus status;
    PaymentMethod paymentMethod;
    PaymentStatus paymentStatus;
    String receiverName;
    String receiverPhone;
    BigDecimal totalAmount;
    Integer totalItems;
    LocalDateTime createdAt;
}
