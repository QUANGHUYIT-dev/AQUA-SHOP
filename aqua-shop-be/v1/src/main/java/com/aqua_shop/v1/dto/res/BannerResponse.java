package com.aqua_shop.v1.dto.res;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@Schema(description = "Banner trang chủ — gắn thương hiệu, click xem SP của hãng")
public class BannerResponse {

    @Schema(description = "ID banner")
    String bannerId;

    @Schema(description = "ID thương hiệu")
    String brandId;

    @Schema(description = "Tên thương hiệu")
    String brandName;

    @Schema(description = "Slug thương hiệu")
    String brandSlug;

    @Schema(description = "Tiêu đề hiển thị trên banner")
    String title;

    @Schema(description = "Mô tả phụ")
    String subtitle;

    @Schema(description = "URL ảnh banner")
    String imageUrl;

    @Schema(description = "Thứ tự hiển thị (nhỏ trước)")
    Integer sortOrder;

    @Schema(description = "Đang hiển thị")
    Boolean isActive;
}
