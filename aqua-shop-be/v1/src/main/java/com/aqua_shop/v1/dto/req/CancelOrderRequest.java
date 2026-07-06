package com.aqua_shop.v1.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Hủy đơn hàng")
public class CancelOrderRequest {

    @NotBlank(message = "Lý do hủy không được để trống")
    @Size(min = 5, max = 480, message = "Lý do hủy phải từ 5 đến 480 ký tự")
    @Schema(description = "Lý do khách hàng hủy đơn", example = "Đặt nhầm sản phẩm")
    String reason;
}
