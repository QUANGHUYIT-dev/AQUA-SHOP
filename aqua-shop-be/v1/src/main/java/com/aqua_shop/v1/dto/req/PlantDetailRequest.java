package com.aqua_shop.v1.dto.req;

import com.aqua_shop.v1.enums.LightLevel;
import com.aqua_shop.v1.enums.PlantDifficulty;
import com.aqua_shop.v1.enums.PlantPlacement;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/**
 * Thông tin chuyên biệt cho sản phẩm loại PLANT (cây thủy sinh).
 * Gắn 1-1 với Product, không nằm trong variant.
 */
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Chi tiết cây thủy sinh. Bắt buộc khi productType = PLANT.")
public class PlantDetailRequest {

    @Schema(description = "Tên khoa học. VD: \"Anubias barteri var. nana\"", example = "Anubias barteri var. nana")
    String scientificName;

    @Schema(description = "Độ khó chăm sóc: EASY | MEDIUM | HARD", example = "EASY")
    PlantDifficulty difficulty;

    @Schema(description = "Mức ánh sáng cần: LOW | MEDIUM | HIGH", example = "LOW")
    LightLevel lightLevel;

    @Schema(description = "Có cần bơm CO2 không. Mặc định false.", example = "false")
    Boolean co2Required;

    @Schema(description = "Vị trí trồng: FOREGROUND | MIDGROUND | BACKGROUND | FLOATING | ATTACHED", example = "ATTACHED")
    PlantPlacement placement;

    @Schema(description = "Tốc độ sinh trưởng (text tự do). VD: \"Chậm\", \"Nhanh\"", example = "Chậm")
    String growthRate;

    @Schema(description = "Chiều cao tối đa khi trưởng thành (cm). Khác size variant — đây là size sinh học.", example = "10")
    BigDecimal maxHeightCm;
}
