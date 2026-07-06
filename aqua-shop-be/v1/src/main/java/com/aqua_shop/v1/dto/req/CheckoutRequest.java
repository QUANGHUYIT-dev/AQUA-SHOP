package com.aqua_shop.v1.dto.req;

import com.aqua_shop.v1.enums.PaymentMethod;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Đặt hàng từ giỏ hàng hiện tại")
public class CheckoutRequest {

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    @Schema(description = "Địa chỉ nhận hàng", example = "123 Nguyễn Văn Linh, Q7, TP.HCM")
    String shippingAddress;

    @NotBlank(message = "Tên người nhận không được để trống")
    @Schema(description = "Họ tên người nhận")
    String receiverName;

    @NotBlank(message = "Số điện thoại người nhận không được để trống")
    @Schema(description = "SĐT người nhận", example = "0901234567")
    String receiverPhone;

    @Schema(description = "Ghi chú đơn hàng")
    String note;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    @Schema(description = "COD | WALLET | BANK_TRANSFER", example = "COD")
    PaymentMethod paymentMethod;

    @DecimalMin(value = "0", message = "Phí ship không được âm")
    @Schema(description = "Phí vận chuyển (VND)", example = "30000")
    BigDecimal shippingFee;
}
