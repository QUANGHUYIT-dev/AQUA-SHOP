package com.aqua_shop.v1.dto.req;

import com.aqua_shop.v1.enums.FishDiet;
import com.aqua_shop.v1.enums.FishTemperament;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/**
 * Thông tin chuyên biệt cho sản phẩm loại FISH (cá cảnh).
 * Gắn 1-1 với Product. Màu/morph có thể đặt thêm ở variant.attributes.color.
 */
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Chi tiết cá cảnh. Bắt buộc khi productType = FISH.")
public class FishDetailRequest {

    @Schema(description = "Tên khoa học. VD: \"Betta splendens\"", example = "Betta splendens")
    String scientificName;

    @Schema(description = "Tính cách: PEACEFUL | SEMI_AGGRESSIVE | AGGRESSIVE", example = "AGGRESSIVE")
    FishTemperament temperament;

    @Schema(description = "Chế độ ăn: OMNIVORE | CARNIVORE | HERBIVORE", example = "CARNIVORE")
    FishDiet diet;

    @Schema(description = "Thể tích bể tối thiểu (lít)", example = "20")
    Integer minTankSizeLiters;

    @Schema(description = "Nhiệt độ nước tối thiểu (°C). Phải ≤ waterTempMaxC.", example = "24")
    BigDecimal waterTempMinC;

    @Schema(description = "Nhiệt độ nước tối đa (°C)", example = "28")
    BigDecimal waterTempMaxC;

    @Schema(description = "pH tối thiểu. Phải ≤ phMax.", example = "6.0")
    BigDecimal phMin;

    @Schema(description = "pH tối đa", example = "7.5")
    BigDecimal phMax;

    @Schema(description = "Kích thước trưởng thành (cm). Khác variant — đây là size sinh học.", example = "7")
    BigDecimal maxSizeCm;

    @Schema(description = "Cá đánh bầy (schooling). Mặc định false.", example = "false")
    Boolean isSchooling;

    @Schema(description = "Số cá tối thiểu nếu isSchooling = true", example = "6")
    Integer minSchoolSize;
}
