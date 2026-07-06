package com.aqua_shop.v1.dto.res;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Kết quả upload ảnh lên Cloudinary")
public class CloudinaryUploadResponse {

    @Schema(description = "URL HTTPS — dùng cho thumbnailUrl / imageUrl", example = "https://res.cloudinary.com/demo/image/upload/v123/aqua-shop/products/abc.jpg")
    String url;

    @Schema(description = "Public ID trên Cloudinary — dùng khi xóa ảnh", example = "aqua-shop/products/abc")
    String publicId;

    @Schema(description = "Định dạng file", example = "jpg")
    String format;

    @Schema(description = "Chiều rộng (px)", example = "1200")
    Integer width;

    @Schema(description = "Chiều cao (px)", example = "800")
    Integer height;

    @Schema(description = "Kích thước file (bytes)", example = "245760")
    Long bytes;
}
