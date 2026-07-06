package com.aqua_shop.v1.controllers;

import com.aqua_shop.v1.dto.ApiResponse;
import com.aqua_shop.v1.dto.req.CreateProductRequest;
import com.aqua_shop.v1.dto.req.UpdateProductRequest;
import com.aqua_shop.v1.dto.res.ProductResponse;
import com.aqua_shop.v1.enums.ProductStatus;
import com.aqua_shop.v1.enums.ProductType;
import com.aqua_shop.v1.services.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@Tag(name = "Product", description = """
        Quản lý sản phẩm thủy sinh (cây / cá / phụ kiện).
        Cấu trúc: Product (thông tin chung) + ProductVariant[] (SKU, giá, tồn kho).
        FE chọn variant khi mua; gửi variant.sku lên Order sau này.
        """)
@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "Tạo sản phẩm", description = "Gửi plantDetail | fishDetail | accessoryDetail tùy productType. Cần ≥ 1 variant.")
    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<ProductResponse>builder()
                .message("Create product successfully")
                .data(productService.createProduct(request))
                .build());
    }

    @Operation(summary = "Lọc & phân trang sản phẩm", description = "Trả ProductSummaryResponse (rút gọn, có availableSizes/Volumes). Pagination: ?page=0&size=10&sort=createdAt,desc")
    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<?>> filterProducts(
            @Parameter(description = "Tìm theo name, slug, modelCode, shortDescription, SKU variant")
            @RequestParam(required = false) String search,
            @Parameter(description = "PLANT | FISH | ACCESSORY")
            @RequestParam(required = false) ProductType productType,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String brandId,
            @Parameter(description = "ACTIVE | INACTIVE | OUT_OF_STOCK")
            @RequestParam(required = false) ProductStatus status,
            @Parameter(description = "Lọc variant có giá hiệu dụng (salePrice ?? price) ≥ minPrice")
            @RequestParam(required = false) BigDecimal minPrice,
            @Parameter(description = "Lọc variant có giá hiệu dụng ≤ maxPrice")
            @RequestParam(required = false) BigDecimal maxPrice,
            @PageableDefault(size = 10, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Filter products successfully")
                .data(productService.filterProducts(search, productType, categoryId, brandId, status, minPrice, maxPrice, pageable))
                .build());
    }

    @Operation(summary = "Top sản phẩm bán chạy", description = "Gom số lượng đã bán từ đơn COMPLETED/DELIVERED. Không đủ dữ liệu thì bổ sung SP mới nhất.")
    @GetMapping("/top-selling")
    public ResponseEntity<ApiResponse<?>> getTopSellingProducts(
            @Parameter(description = "Số lượng sản phẩm trả về")
            @RequestParam(defaultValue = "8") int size) {
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Get top selling products successfully")
                .data(productService.getTopSellingProducts(size))
                .build());
    }

    @Operation(summary = "Chi tiết theo slug", description = "Trang public SP. Chỉ trả ACTIVE / OUT_OF_STOCK.")
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(
            @Parameter(description = "Slug URL, VD: den-led-chihiros-wrgb2") @PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .message("Get product by slug successfully")
                .data(productService.getProductBySlug(slug))
                .build());
    }

    @Operation(summary = "Chi tiết theo ID", description = "Admin / nội bộ. Trả mọi status.")
    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable String productId) {
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .message("Get product by id successfully")
                .data(productService.getProductById(productId))
                .build());
    }

    @Operation(summary = "Cập nhật sản phẩm", description = "Partial update — chỉ gửi field cần đổi.")
    @PutMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable String productId,
            @Valid @RequestBody UpdateProductRequest request) {
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .message("Update product successfully")
                .data(productService.updateProduct(productId, request))
                .build());
    }

    @Operation(summary = "Ngừng bán (soft delete)", description = "Set status = INACTIVE. Không xóa DB.")
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> deleteProduct(@PathVariable String productId) {
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .message("Delete product successfully")
                .data(productService.deleteProduct(productId))
                .build());
    }
}
