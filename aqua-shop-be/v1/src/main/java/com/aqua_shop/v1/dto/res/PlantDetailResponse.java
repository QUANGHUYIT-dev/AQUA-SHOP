package com.aqua_shop.v1.dto.res;

import com.aqua_shop.v1.enums.LightLevel;
import com.aqua_shop.v1.enums.PlantDifficulty;
import com.aqua_shop.v1.enums.PlantPlacement;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@Schema(description = "Thông tin cây thủy sinh (productType = PLANT)")
public class PlantDetailResponse {

    @Schema(description = "Tên khoa học")
    String scientificName;

    @Schema(description = "Độ khó: EASY | MEDIUM | HARD")
    PlantDifficulty difficulty;

    @Schema(description = "Ánh sáng: LOW | MEDIUM | HIGH")
    LightLevel lightLevel;

    @Schema(description = "Cần CO2")
    Boolean co2Required;

    @Schema(description = "Vị trí trồng: FOREGROUND | MIDGROUND | BACKGROUND | FLOATING | ATTACHED")
    PlantPlacement placement;

    @Schema(description = "Tốc độ sinh trưởng")
    String growthRate;

    @Schema(description = "Chiều cao tối đa trưởng thành (cm)")
    BigDecimal maxHeightCm;
}
