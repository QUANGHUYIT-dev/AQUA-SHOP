package com.aqua_shop.v1.dto.req;

import com.aqua_shop.v1.enums.AccessoryType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/**
 * Thông tin chuyên biệt cho sản phẩm loại ACCESSORY (phụ kiện, thiết bị, hóa chất...).
 * Kích thước/dung tích bán (60cm, 500ml) nằm ở variant.attributes, không ở đây.
 */
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Chi tiết phụ kiện/thiết bị. Bắt buộc khi productType = ACCESSORY.")
public class AccessoryDetailRequest {

    @NotNull(message = "Loại phụ kiện không được để trống")
    @Schema(description = "Loại phụ kiện: FILTER | LIGHT | SUBSTRATE | CO2 | DECORATION | TOOL | FOOD | MEDICATION | TANK | OTHER", example = "LIGHT")
    AccessoryType accessoryType;

    @Schema(description = "Chất liệu. VD: \"Nhôm\", \"Nhựa ABS\"", example = "Nhôm")
    String material;

    @Schema(description = "Dung tích bể tương thích tối thiểu (lít)", example = "60")
    Integer compatibleTankMinLiters;

    @Schema(description = "Dung tích bể tương thích tối đa (lít)", example = "200")
    Integer compatibleTankMaxLiters;

    @Schema(description = "Công suất (W). Dùng cho đèn, máy sục...", example = "32.5")
    BigDecimal powerWattage;

    @Schema(description = "Lưu lượng (lít/giờ). Dùng cho máy lọc, bơm.", example = "600")
    Integer flowRateLph;

    @Schema(description = "Thời gian bảo hành (tháng)", example = "12")
    Integer warrantyMonths;

    @Schema(description = "Thông số kỹ thuật dạng text tự do (hiển thị tab specs)")
    String specifications;
}
