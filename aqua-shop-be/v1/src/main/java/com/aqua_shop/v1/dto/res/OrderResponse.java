package com.aqua_shop.v1.dto.res;

import com.aqua_shop.v1.enums.OrderType;
import com.aqua_shop.v1.enums.OrderStatus;
import com.aqua_shop.v1.enums.PaymentMethod;
import com.aqua_shop.v1.enums.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@Schema(description = "Chi tiết đơn hàng")
public class OrderResponse {

    @Schema(description = "ID đơn hàng", example = "ORD0001")
    String orderId;

    @Schema(description = "ID khách hàng")
    String customerId;

    @Schema(description = "ONLINE | OFFLINE")
    OrderType orderType;

    @Schema(description = "Trạng thái đơn")
    OrderStatus status;

    @Schema(description = "Phương thức thanh toán")
    PaymentMethod paymentMethod;

    @Schema(description = "Trạng thái thanh toán")
    PaymentStatus paymentStatus;

    @Schema(description = "Địa chỉ giao hàng")
    String shippingAddress;

    @Schema(description = "Tên người nhận")
    String receiverName;

    @Schema(description = "SĐT người nhận")
    String receiverPhone;

    @Schema(description = "Ghi chú")
    String note;

    @Schema(description = "Tạm tính sản phẩm")
    BigDecimal subtotal;

    @Schema(description = "Phí ship")
    BigDecimal shippingFee;

    @Schema(description = "Tổng thanh toán = subtotal + shippingFee")
    BigDecimal totalAmount;

    @Schema(description = "Tổng số lượng sản phẩm")
    Integer totalItems;

    @Schema(description = "Danh sách dòng đơn hàng")
    List<OrderItemResponse> items;

    @Schema(description = "Lịch sử thay đổi trạng thái đơn (timeline)")
    List<OrderHistoryResponse> histories;

    @Schema(description = "Thời gian tạo đơn")
    LocalDateTime createdAt;
}
