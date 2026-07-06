package com.aqua_shop.v1.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Xóa ảnh trên Cloudinary theo publicId")
public class DeleteCloudinaryImageRequest {

    @NotBlank(message = "publicId không được để trống")
    @Schema(description = "Public ID trả về khi upload", example = "aqua-shop/products/abc")
    String publicId;
}
