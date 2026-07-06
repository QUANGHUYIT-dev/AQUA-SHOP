package com.aqua_shop.v1.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Ảnh trong gallery sản phẩm")
public class ProductImageRequest {

    @NotBlank(message = "URL ảnh không được để trống")
    @Schema(description = "URL ảnh (CDN/S3/Cloudinary). Khác thumbnailUrl — đây là gallery.", example = "https://res.cloudinary.com/demo/image/upload/aqua-shop/products/wrgb2-1.jpg")
    String imageUrl;

    @Schema(description = "Cloudinary publicId — tự điền khi upload qua /images/upload. Gửi kèm nếu đã upload qua /uploads trước.", example = "aqua-shop/products/wrgb2-1")
    String publicId;

    @Schema(description = "Alt text SEO / accessibility", example = "Đèn Chihiros WRGB2 góc nghiêng")
    String altText;

    @Schema(description = "Thứ tự hiển thị (0 = đầu tiên). Mặc định theo thứ tự trong array.", example = "0")
    Integer sortOrder;

    @Schema(description = "Ảnh chính trong gallery. Chỉ 1 ảnh primary; BE tự chọn ảnh đầu nếu không gửi.", example = "true")
    Boolean isPrimary;
}
