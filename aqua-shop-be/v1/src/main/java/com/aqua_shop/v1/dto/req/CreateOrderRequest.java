package com.aqua_shop.v1.dto.req;

import com.aqua_shop.v1.enums.OrderType;
import com.aqua_shop.v1.enums.PaymentMethod;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Tạo đơn trực tiếp — dùng cho POS (orderType=OFFLINE)")
public class CreateOrderRequest {

    @NotNull(message = "Loại đơn không được để trống")
    @Schema(description = "OFFLINE = bán tại quầy", example = "OFFLINE")
    OrderType orderType;

    @NotEmpty(message = "Danh sách sản phẩm không được rỗng")
    @Valid
    @Schema(description = "Các dòng hàng")
    List<CreateOrderItemRequest> items;

    @Schema(description = "Tên khách (tùy chọn)", example = "Khách lẻ")
    String receiverName;

    @Schema(description = "SĐT khách (tùy chọn)", example = "0900000000")
    String receiverPhone;

    @Schema(description = "Ghi chú đơn")
    String note;

    @Schema(description = "CASH | COD | BANK_TRANSFER", example = "CASH")
    PaymentMethod paymentMethod;
}
