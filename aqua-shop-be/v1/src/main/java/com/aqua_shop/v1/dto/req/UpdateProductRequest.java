package com.aqua_shop.v1.dto.req;

import com.aqua_shop.v1.enums.ProductStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Body cập nhật sản phẩm (PUT /products/{productId}).
 * Chỉ gửi field cần đổi — field null sẽ không bị ghi đè.
 * Không thể đổi {@code productType} sau khi tạo.
 */
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Request cập nhật sản phẩm (partial update). Gửi field nào cần sửa.")
public class UpdateProductRequest {

    @Size(max = 300, message = "Tên sản phẩm tối đa 300 ký tự")
    @Schema(description = "Tên hiển thị mới. Đổi name → slug tự cập nhật.")
    String name;

    @Size(max = 50, message = "Mã model tối đa 50 ký tự")
    @Schema(description = "Mã model mới. Gửi chuỗi rỗng \"\" để xóa modelCode.")
    String modelCode;

    @Schema(description = "Mô tả chi tiết")
    String description;

    @Size(max = 500, message = "Mô tả ngắn tối đa 500 ký tự")
    @Schema(description = "Mô tả ngắn")
    String shortDescription;

    @Schema(description = "ID danh mục mới (phải khớp productType hiện tại)")
    String categoryId;

    @Schema(description = "ID brand mới. Gửi \"\" để bỏ brand.")
    String brandId;

    @Schema(description = "Trạng thái: ACTIVE | INACTIVE | OUT_OF_STOCK")
    ProductStatus status;

    @Schema(description = "URL thumbnail mới")
    String thumbnailUrl;

    @Valid
    @Schema(description = "Cập nhật variants: có variantId → sửa; không variantId → thêm mới; variant không có trong list → xóa.")
    List<ProductVariantRequest> variants;

    @Valid
    @Schema(description = "Cập nhật thông tin cây (chỉ SP loại PLANT)")
    PlantDetailRequest plantDetail;

    @Valid
    @Schema(description = "Cập nhật thông tin cá (chỉ SP loại FISH)")
    FishDetailRequest fishDetail;

    @Valid
    @Schema(description = "Cập nhật thông tin phụ kiện (chỉ SP loại ACCESSORY)")
    AccessoryDetailRequest accessoryDetail;

    @Valid
    @Schema(description = "Thay toàn bộ gallery ảnh (gửi list mới sẽ replace hết ảnh cũ)")
    List<ProductImageRequest> images;
}
