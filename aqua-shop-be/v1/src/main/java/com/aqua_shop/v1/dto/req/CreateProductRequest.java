package com.aqua_shop.v1.dto.req;

import com.aqua_shop.v1.enums.ProductStatus;
import com.aqua_shop.v1.enums.ProductType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Body tạo sản phẩm mới (POST /products).
 * <p>
 * FE gửi đúng 1 block detail theo {@code productType}:
 * <ul>
 *   <li>PLANT → {@code plantDetail} (bắt buộc)</li>
 *   <li>FISH → {@code fishDetail} (bắt buộc)</li>
 *   <li>ACCESSORY → {@code accessoryDetail} (bắt buộc)</li>
 * </ul>
 * Luôn cần ít nhất 1 phần tử trong {@code variants} (giá, tồn kho, SKU).
 */
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Request tạo sản phẩm. Gửi plantDetail/fishDetail/accessoryDetail tùy productType.")
public class CreateProductRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 300, message = "Tên sản phẩm tối đa 300 ký tự")
    @Schema(description = "Tên hiển thị trên shop (marketing). VD: \"Đèn LED Chihiros WRGB2\"", example = "Đèn LED Chihiros WRGB2")
    String name;

    @Size(max = 50, message = "Mã model tối đa 50 ký tự")
    @Schema(description = "Mã model cố định để sinh SKU & tra cứu kho. Khác tên hiển thị. VD: WRGB2, ANUBIAS-NANA. Optional — nếu bỏ trống BE fallback parse từ name.", example = "WRGB2")
    String modelCode;

    @Schema(description = "Mô tả chi tiết HTML/text dài (tab mô tả sản phẩm)")
    String description;

    @Size(max = 500, message = "Mô tả ngắn tối đa 500 ký tự")
    @Schema(description = "Mô tả ngắn hiển thị ở card/list sản phẩm")
    String shortDescription;

    @NotNull(message = "Loại sản phẩm không được để trống")
    @Schema(description = "Loại SP: PLANT (cây) | FISH (cá) | ACCESSORY (phụ kiện/thiết bị)", example = "ACCESSORY")
    ProductType productType;

    @NotBlank(message = "Danh mục không được để trống")
    @Schema(description = "ID danh mục (categoryId). Phải khớp productType: PLANT→category PLANT, FISH→FISH, ACCESSORY→EQUIPMENT/CHEMICAL/...", example = "CATE0005")
    String categoryId;

    @Schema(description = "ID thương hiệu (brandId). Optional.", example = "BRD0001")
    String brandId;

    @Schema(description = "Trạng thái bán. Mặc định ACTIVE nếu không gửi.", example = "ACTIVE")
    ProductStatus status;

    @Schema(description = "URL ảnh đại diện (thumbnail) trên card sản phẩm")
    String thumbnailUrl;

    @NotEmpty(message = "Sản phẩm phải có ít nhất một biến thể")
    @Valid
    @Schema(description = "Danh sách biến thể (SKU, giá, tồn). Cây/cá thường 1 variant; đèn/phân nhiều variant theo size/volume.")
    List<ProductVariantRequest> variants;

    @Valid
    @Schema(description = "Bắt buộc khi productType = PLANT")
    PlantDetailRequest plantDetail;

    @Valid
    @Schema(description = "Bắt buộc khi productType = FISH")
    FishDetailRequest fishDetail;

    @Valid
    @Schema(description = "Bắt buộc khi productType = ACCESSORY")
    AccessoryDetailRequest accessoryDetail;

    @Valid
    @Schema(description = "Gallery ảnh sản phẩm. Optional.")
    List<ProductImageRequest> images;
}
