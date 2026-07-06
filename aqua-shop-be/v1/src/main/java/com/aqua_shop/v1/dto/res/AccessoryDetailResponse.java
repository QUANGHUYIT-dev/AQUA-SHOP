package com.aqua_shop.v1.dto.res;

import com.aqua_shop.v1.enums.AccessoryType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@Schema(description = "Thông tin phụ kiện/thiết bị (productType = ACCESSORY)")
public class AccessoryDetailResponse {

    @Schema(description = "Loại: FILTER | LIGHT | SUBSTRATE | CO2 | DECORATION | TOOL | FOOD | MEDICATION | TANK | OTHER")
    AccessoryType accessoryType;

    @Schema(description = "Chất liệu")
    String material;

    @Schema(description = "Bể tương thích min (lít)")
    Integer compatibleTankMinLiters;

    @Schema(description = "Bể tương thích max (lít)")
    Integer compatibleTankMaxLiters;

    @Schema(description = "Công suất (W)")
    BigDecimal powerWattage;

    @Schema(description = "Lưu lượng (L/h)")
    Integer flowRateLph;

    @Schema(description = "Bảo hành (tháng)")
    Integer warrantyMonths;

    @Schema(description = "Thông số kỹ thuật (text)")
    String specifications;
}
