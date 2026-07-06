package com.aqua_shop.v1.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Tạo banner gắn thương hiệu")
public class CreateBannerRequest {

    @NotBlank
    @Schema(description = "ID thương hiệu (BRD...)")
    String brandId;

    @Schema(description = "Tiêu đề trên banner — mặc định dùng tên hãng nếu bỏ trống")
    String title;

    @Schema(description = "Mô tả phụ")
    String subtitle;

    @NotBlank
    @Schema(description = "URL ảnh banner")
    String imageUrl;

    @Schema(description = "Thứ tự hiển thị")
    Integer sortOrder;
}
