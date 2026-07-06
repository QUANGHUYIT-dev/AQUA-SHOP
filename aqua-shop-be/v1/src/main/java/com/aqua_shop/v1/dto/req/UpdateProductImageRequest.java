package com.aqua_shop.v1.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Cập nhật ảnh gallery (partial update)")
public class UpdateProductImageRequest {

    @Schema(description = "URL ảnh mới")
    String imageUrl;

    @Schema(description = "Alt text mới")
    String altText;

    @Schema(description = "Thứ tự hiển thị mới")
    Integer sortOrder;

    @Schema(description = "Đặt làm ảnh primary. true → các ảnh khác bỏ primary.")
    Boolean isPrimary;
}
