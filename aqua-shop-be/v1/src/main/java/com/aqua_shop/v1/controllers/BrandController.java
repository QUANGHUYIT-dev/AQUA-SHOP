package com.aqua_shop.v1.controllers;

import com.aqua_shop.v1.dto.ApiResponse;
import com.aqua_shop.v1.dto.req.CreateBrandRequest;
import com.aqua_shop.v1.dto.req.UpdateBrandRequest;
import com.aqua_shop.v1.dto.res.BrandResponse;
import com.aqua_shop.v1.services.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @PostMapping
    public ResponseEntity<ApiResponse<BrandResponse>> createBrand(
            @Valid @RequestBody CreateBrandRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<BrandResponse>builder()
                .message("Create brand successfully")
                .data(brandService.createBrand(request))
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> filterBrands(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @PageableDefault(size = 10, page = 0, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Filter brands successfully")
                .data(brandService.filterBrands(search, isActive, pageable))
                .build());
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.<BrandResponse>builder()
                .message("Get brand by slug successfully")
                .data(brandService.getBrandBySlug(slug))
                .build());
    }

    @GetMapping("/{brandId}")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(@PathVariable String brandId) {
        return ResponseEntity.ok(ApiResponse.<BrandResponse>builder()
                .message("Get brand by id successfully")
                .data(brandService.getBrandById(brandId))
                .build());
    }

    @PutMapping("/{brandId}")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrand(
            @PathVariable String brandId,
            @Valid @RequestBody UpdateBrandRequest request) {
        return ResponseEntity.ok(ApiResponse.<BrandResponse>builder()
                .message("Update brand successfully")
                .data(brandService.updateBrand(brandId, request))
                .build());
    }

    @DeleteMapping("/{brandId}")
    public ResponseEntity<ApiResponse<BrandResponse>> deleteBrand(@PathVariable String brandId) {
        return ResponseEntity.ok(ApiResponse.<BrandResponse>builder()
                .message("Delete brand successfully")
                .data(brandService.deleteBrand(brandId))
                .build());
    }
}
