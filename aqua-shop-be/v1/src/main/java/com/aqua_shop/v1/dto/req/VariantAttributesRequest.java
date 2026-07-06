package com.aqua_shop.v1.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

/**
 * Thuộc tính phân biệt giữa các variant của cùng 1 sản phẩm.
 * Không phải thông tin sinh học — dùng cho SKU và UI chọn biến thể.
 */
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Thuộc tính variant. Dùng field phù hợp loại SP — không cần gửi cả 3.")
public class VariantAttributesRequest {

    @Schema(description = "Kích thước vật lý. Dùng cho đèn, phụ kiện. VD: \"45cm\", \"60cm\"", example = "60cm")
    String size;

    @Schema(description = "Dung tích. Dùng cho phân nước, thuốc, hóa chất. VD: \"500ml\", \"100ml\"", example = "500ml")
    String volume;

    @Schema(description = "Màu sắc biến thể. Thường dùng cho cá (Red, Blue). Optional với cây/phụ kiện.", example = "Red")
    String color;
}
