package com.aqua_shop.v1.dto.res;

import com.aqua_shop.v1.enums.ProductStatus;
import com.aqua_shop.v1.enums.ProductType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response chi tiết sản phẩm (GET by id/slug, POST/PUT create/update).
 * Chỉ 1 trong 3 block plantDetail / fishDetail / accessoryDetail có dữ liệu, tùy productType.
 */
@Getter
@Setter
@Builder
@Schema(description = "Chi tiết đầy đủ sản phẩm + variants + detail theo loại")
public class ProductResponse {

    @Schema(description = "ID sản phẩm", example = "PRD0001")
    String productId;

    @Schema(description = "Tên hiển thị")
    String name;

    @Schema(description = "Mã model cố định (sinh SKU, tra cứu kho)", example = "WRGB2")
    String modelCode;

    @Schema(description = "Slug URL-friendly, dùng cho route /products/slug/{slug}", example = "den-led-chihiros-wrgb2")
    String slug;

    @Schema(description = "Mô tả dài")
    String description;

    @Schema(description = "Mô tả ngắn (card/list)")
    String shortDescription;

    @Schema(description = "PLANT | FISH | ACCESSORY")
    ProductType productType;

    @Schema(description = "ID danh mục")
    String categoryId;

    @Schema(description = "Tên danh mục (denormalized cho FE)")
    String categoryName;

    @Schema(description = "ID thương hiệu. Null nếu không có brand.")
    String brandId;

    @Schema(description = "Tên thương hiệu")
    String brandName;

    @Schema(description = "ACTIVE = đang bán | INACTIVE = ngừng | OUT_OF_STOCK = hết hàng (tự sync từ tồn kho)")
    ProductStatus status;

    @Schema(description = "URL ảnh đại diện")
    String thumbnailUrl;

    @Schema(description = "Giá thấp nhất trong các variant (ưu tiên salePrice nếu có)")
    BigDecimal minPrice;

    @Schema(description = "Giá cao nhất trong các variant")
    BigDecimal maxPrice;

    @Schema(description = "Tổng tồn kho = sum(stockQuantity) tất cả variant")
    Integer totalStock;

    @Schema(description = "Danh sách biến thể — FE render selector size/volume/color + giá từ đây")
    List<ProductVariantResponse> variants;

    @Schema(description = "Có dữ liệu khi productType = PLANT")
    PlantDetailResponse plantDetail;

    @Schema(description = "Có dữ liệu khi productType = FISH")
    FishDetailResponse fishDetail;

    @Schema(description = "Có dữ liệu khi productType = ACCESSORY")
    AccessoryDetailResponse accessoryDetail;

    @Schema(description = "Gallery ảnh")
    List<ProductImageResponse> images;

    @Schema(description = "Thời gian tạo")
    LocalDateTime createdAt;

    @Schema(description = "Thời gian cập nhật cuối")
    LocalDateTime updatedAt;
}
