package com.aqua_shop.v1.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Đặt tồn kho tuyệt đối theo SKU")
public class SetInventoryQuantityRequest {

    @NotNull(message = "Số lượng tồn không được để trống")
    @Min(value = 0, message = "Số lượng tồn không được âm")
    @Schema(description = "Số lượng tồn mới", example = "50")
    Integer quantityOnHand;

    @Schema(description = "Ghi chú lý do điều chỉnh", example = "Kiểm kê kho")
    String note;
}
