package com.aqua_shop.v1.dto.res;

import com.aqua_shop.v1.enums.FishDiet;
import com.aqua_shop.v1.enums.FishTemperament;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@Schema(description = "Thông tin cá cảnh (productType = FISH)")
public class FishDetailResponse {

    @Schema(description = "Tên khoa học")
    String scientificName;

    @Schema(description = "Tính cách: PEACEFUL | SEMI_AGGRESSIVE | AGGRESSIVE")
    FishTemperament temperament;

    @Schema(description = "Chế độ ăn: OMNIVORE | CARNIVORE | HERBIVORE")
    FishDiet diet;

    @Schema(description = "Bể tối thiểu (lít)")
    Integer minTankSizeLiters;

    @Schema(description = "Nhiệt độ nước min (°C)")
    BigDecimal waterTempMinC;

    @Schema(description = "Nhiệt độ nước max (°C)")
    BigDecimal waterTempMaxC;

    @Schema(description = "pH min")
    BigDecimal phMin;

    @Schema(description = "pH max")
    BigDecimal phMax;

    @Schema(description = "Size trưởng thành (cm)")
    BigDecimal maxSizeCm;

    @Schema(description = "Cá bầy đàn")
    Boolean isSchooling;

    @Schema(description = "Số cá tối thiểu nếu bầy đàn")
    Integer minSchoolSize;
}
