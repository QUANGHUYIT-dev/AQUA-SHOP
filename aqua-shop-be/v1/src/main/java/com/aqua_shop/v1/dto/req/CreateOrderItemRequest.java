package com.aqua_shop.v1.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Dòng sản phẩm khi tạo đơn trực tiếp")
public class CreateOrderItemRequest {

    @NotBlank(message = "SKU không được để trống")
    @Schema(description = "SKU variant", example = "NEON-RED-M")
    String sku;

    @Min(value = 1, message = "Số lượng phải >= 1")
    @Schema(description = "Số lượng", example = "2")
    int quantity;
}
