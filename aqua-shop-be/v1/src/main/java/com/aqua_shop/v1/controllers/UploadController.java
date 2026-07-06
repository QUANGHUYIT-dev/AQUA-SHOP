package com.aqua_shop.v1.controllers;

import com.aqua_shop.v1.dto.ApiResponse;
import com.aqua_shop.v1.dto.req.DeleteCloudinaryImageRequest;
import com.aqua_shop.v1.dto.res.CloudinaryUploadResponse;
import com.aqua_shop.v1.enums.UploadFolder;
import com.aqua_shop.v1.services.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "Upload", description = "Upload ảnh lên Cloudinary. Trả về url + publicId để gán vào Product.")
@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryService cloudinaryService;

    @Operation(summary = "Upload 1 ảnh", description = "Upload lên Cloudinary. Dùng url trả về cho thumbnailUrl hoặc ProductImage.imageUrl.")
    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CloudinaryUploadResponse>> uploadImage(
            @Parameter(description = "File ảnh (JPEG, PNG, WebP, GIF)", required = true)
            @RequestPart("file") MultipartFile file,
            @Parameter(description = "Thư mục lưu trên Cloudinary", schema = @Schema(defaultValue = "PRODUCTS"))
            @RequestParam(defaultValue = "PRODUCTS") UploadFolder folder) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<CloudinaryUploadResponse>builder()
                .message("Upload image successfully")
                .data(cloudinaryService.uploadImage(file, folder))
                .build());
    }

    @Operation(summary = "Upload nhiều ảnh")
    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<CloudinaryUploadResponse>>> uploadImages(
            @Parameter(description = "Danh sách file ảnh", required = true)
            @RequestPart("files") List<MultipartFile> files,
            @Parameter(description = "Thư mục lưu trên Cloudinary", schema = @Schema(defaultValue = "PRODUCTS"))
            @RequestParam(defaultValue = "PRODUCTS") UploadFolder folder) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<List<CloudinaryUploadResponse>>builder()
                .message("Upload images successfully")
                .data(cloudinaryService.uploadImages(files, folder))
                .build());
    }

    @Operation(summary = "Xóa ảnh trên Cloudinary", description = "Dùng publicId nhận được khi upload")
    @DeleteMapping("/image")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@Valid @RequestBody DeleteCloudinaryImageRequest request) {
        cloudinaryService.deleteImage(request.getPublicId());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Delete image successfully")
                .build());
    }
}
