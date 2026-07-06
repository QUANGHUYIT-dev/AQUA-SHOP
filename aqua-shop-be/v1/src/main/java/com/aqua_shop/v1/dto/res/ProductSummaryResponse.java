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
 * Response rút gọn cho list/grid sản phẩm (GET /products).
 * Không có variants chi tiết — dùng availableSizes/availableVolumes để hiển thị tag nhanh.
 */
@Getter
@Setter
@Builder
@Schema(description = "Sản phẩm rút gọn cho trang danh sách / tìm kiếm")
public class ProductSummaryResponse {

    @Schema(description = "ID sản phẩm")
    String productId;

    @Schema(description = "Tên hiển thị")
    String name;

    @Schema(description = "Mã model")
    String modelCode;

    @Schema(description = "Slug URL")
    String slug;

    @Schema(description = "Mô tả ngắn")
    String shortDescription;

    @Schema(description = "PLANT | FISH | ACCESSORY")
    ProductType productType;

    @Schema(description = "ID danh mục")
    String categoryId;

    @Schema(description = "Tên danh mục")
    String categoryName;

    @Schema(description = "ID brand")
    String brandId;

    @Schema(description = "Tên brand")
    String brandName;

    @Schema(description = "Giá thấp nhất (variant rẻ nhất)")
    BigDecimal minPrice;

    @Schema(description = "Giá gốc (price) của variant có giá hiệu dụng thấp nhất — dùng gạch ngang trên card khi có khuyến mãi")
    BigDecimal displayListPrice;

    @Schema(description = "Giá cao nhất")
    BigDecimal maxPrice;

    @Schema(description = "Tổng số lượng đã bán (đơn COMPLETED/DELIVERED)")
    Integer totalSold;

    @Schema(description = "Tổng tồn kho tất cả variant")
    Integer totalStock;

    @Schema(description = "Số lượng variant")
    Integer variantCount;

    @Schema(description = "Các size có sẵn gom từ variants. VD: [\"45cm\",\"60cm\"] — hiển thị tag trên card")
    List<String> availableSizes;

    @Schema(description = "Các dung tích có sẵn. VD: [\"100ml\",\"500ml\"]")
    List<String> availableVolumes;

    @Schema(description = "Trạng thái bán")
    ProductStatus status;

    @Schema(description = "URL thumbnail")
    String thumbnailUrl;

    @Schema(description = "Ngày tạo")
    LocalDateTime createdAt;
}
