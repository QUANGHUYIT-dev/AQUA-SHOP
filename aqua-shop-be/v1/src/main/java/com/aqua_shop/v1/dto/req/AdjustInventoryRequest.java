package com.aqua_shop.v1.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Điều chỉnh tồn kho thủ công theo SKU")
public class AdjustInventoryRequest {

    @NotNull(message = "Số lượng thay đổi không được để trống")
    @Schema(description = "Số lượng thay đổi (+ nhập, - xuất)", example = "10")
    Integer quantityChange;

    @Schema(description = "Ghi chú lý do điều chỉnh", example = "Nhập hàng đợt 2")
    String note;
}
