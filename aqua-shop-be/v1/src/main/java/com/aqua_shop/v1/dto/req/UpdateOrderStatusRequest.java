package com.aqua_shop.v1.dto.req;

import com.aqua_shop.v1.enums.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Cập nhật trạng thái đơn hàng (admin)")
public class UpdateOrderStatusRequest {

    @NotNull(message = "Trạng thái không được để trống")
    @Schema(description = "Trạng thái mới")
    OrderStatus status;

    @Schema(description = "Ghi chú thay đổi")
    String note;
}
