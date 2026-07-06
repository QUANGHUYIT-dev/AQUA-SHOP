package com.aqua_shop.v1.controllers;

import com.aqua_shop.v1.dto.ApiResponse;
import com.aqua_shop.v1.dto.req.ProductImageRequest;
import com.aqua_shop.v1.dto.req.UpdateProductImageRequest;
import com.aqua_shop.v1.dto.res.ProductImageResponse;
import com.aqua_shop.v1.services.ProductImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "Product Image", description = "Gallery ảnh sản phẩm. Upload qua /upload → Cloudinary + lưu DB. Hoặc gắn URL ngoài qua JSON.")
@RestController
@RequestMapping("/products/{productId}/images")
@RequiredArgsConstructor
public class ProductImageController {

    private final ProductImageService productImageService;

    @Operation(summary = "Danh sách ảnh gallery", description = "Sắp xếp theo sortOrder ASC")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductImageResponse>>> getImages(@PathVariable String productId) {
        return ResponseEntity.ok(ApiResponse.<List<ProductImageResponse>>builder()
                .message("Get product images successfully")
                .data(productImageService.getImagesByProductId(productId))
                .build());
    }

    @Operation(summary = "Thêm ảnh bằng URL", description = "URL ngoài hoặc đã upload qua /uploads. Gửi kèm publicId nếu có.")
    @PostMapping
    public ResponseEntity<ApiResponse<ProductImageResponse>> addImage(
            @PathVariable String productId,
            @Valid @RequestBody ProductImageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<ProductImageResponse>builder()
                .message("Add product image successfully")
                .data(productImageService.addImage(productId, request))
                .build());
    }

    @Operation(summary = "Upload + gắn gallery (flow chính)", description = "Upload Cloudinary và lưu ProductImage trong 1 request")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductImageResponse>> uploadAndAttach(
            @PathVariable String productId,
            @Parameter(description = "File ảnh", required = true)
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String altText,
            @RequestParam(required = false) Integer sortOrder,
            @RequestParam(required = false) Boolean isPrimary) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<ProductImageResponse>builder()
                .message("Upload and attach product image successfully")
                .data(productImageService.uploadAndAttach(productId, file, altText, sortOrder, isPrimary))
                .build());
    }

    @Operation(summary = "Upload nhiều ảnh + gắn gallery")
    @PostMapping(value = "/upload/batch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<ProductImageResponse>>> uploadAndAttachBatch(
            @PathVariable String productId,
            @Parameter(description = "Danh sách file ảnh", required = true)
            @RequestPart("files") List<MultipartFile> files,
            @RequestParam(required = false) String altText,
            @RequestParam(required = false) Boolean isPrimary) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<List<ProductImageResponse>>builder()
                .message("Upload and attach product images successfully")
                .data(productImageService.uploadAndAttachBatch(productId, files, altText, isPrimary))
                .build());
    }

    @Operation(summary = "Cập nhật ảnh", description = "Partial update — chỉ gửi field cần đổi")
    @PutMapping("/{imageId}")
    public ResponseEntity<ApiResponse<ProductImageResponse>> updateImage(
            @PathVariable String productId,
            @PathVariable Long imageId,
            @Valid @RequestBody UpdateProductImageRequest request) {
        return ResponseEntity.ok(ApiResponse.<ProductImageResponse>builder()
                .message("Update product image successfully")
                .data(productImageService.updateImage(productId, imageId, request))
                .build());
    }

    @Operation(summary = "Đặt ảnh primary", description = "Ảnh hiển thị đầu tiên trong gallery")
    @PutMapping("/{imageId}/primary")
    public ResponseEntity<ApiResponse<ProductImageResponse>> setPrimaryImage(
            @PathVariable String productId,
            @PathVariable Long imageId) {
        return ResponseEntity.ok(ApiResponse.<ProductImageResponse>builder()
                .message("Set primary product image successfully")
                .data(productImageService.setPrimaryImage(productId, imageId))
                .build());
    }

    @Operation(summary = "Xóa ảnh khỏi gallery", description = "Xóa DB + Cloudinary nếu có publicId")
    @DeleteMapping("/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable String productId,
            @PathVariable Long imageId) {
        productImageService.deleteImage(productId, imageId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Delete product image successfully")
                .build());
    }
}
