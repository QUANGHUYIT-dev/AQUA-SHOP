package com.aqua_shop.v1.controllers;

import com.aqua_shop.v1.dto.ApiResponse;
import com.aqua_shop.v1.dto.req.CreateBannerRequest;
import com.aqua_shop.v1.dto.req.UpdateBannerRequest;
import com.aqua_shop.v1.dto.res.BannerResponse;
import com.aqua_shop.v1.services.BannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Banner", description = "Banner trang chủ theo thương hiệu — click xem sản phẩm hãng")
@RestController
@RequestMapping("/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    @Operation(summary = "Danh sách banner đang hiển thị (public)")
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<?>> getActiveBanners() {
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Get active banners successfully")
                .data(bannerService.getActiveBanners())
                .build());
    }

    @Operation(summary = "Lọc banner (admin)")
    @GetMapping
    public ResponseEntity<ApiResponse<?>> filterBanners(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String brandId,
            @RequestParam(required = false) Boolean isActive,
            @PageableDefault(size = 10, page = 0, sort = "sortOrder", direction = Sort.Direction.ASC)
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Filter banners successfully")
                .data(bannerService.filterBanners(search, brandId, isActive, pageable))
                .build());
    }

    @Operation(summary = "Chi tiết banner")
    @GetMapping("/{bannerId}")
    public ResponseEntity<ApiResponse<BannerResponse>> getBannerById(@PathVariable String bannerId) {
        return ResponseEntity.ok(ApiResponse.<BannerResponse>builder()
                .message("Get banner successfully")
                .data(bannerService.getBannerById(bannerId))
                .build());
    }

    @Operation(summary = "Tạo banner")
    @PostMapping
    public ResponseEntity<ApiResponse<BannerResponse>> createBanner(
            @Valid @RequestBody CreateBannerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<BannerResponse>builder()
                .message("Create banner successfully")
                .data(bannerService.createBanner(request))
                .build());
    }

    @Operation(summary = "Cập nhật banner")
    @PutMapping("/{bannerId}")
    public ResponseEntity<ApiResponse<BannerResponse>> updateBanner(
            @PathVariable String bannerId,
            @Valid @RequestBody UpdateBannerRequest request) {
        return ResponseEntity.ok(ApiResponse.<BannerResponse>builder()
                .message("Update banner successfully")
                .data(bannerService.updateBanner(bannerId, request))
                .build());
    }

    @Operation(summary = "Ẩn banner (soft delete)")
    @DeleteMapping("/{bannerId}")
    public ResponseEntity<ApiResponse<BannerResponse>> deleteBanner(@PathVariable String bannerId) {
        return ResponseEntity.ok(ApiResponse.<BannerResponse>builder()
                .message("Delete banner successfully")
                .data(bannerService.deleteBanner(bannerId))
                .build());
    }
}
