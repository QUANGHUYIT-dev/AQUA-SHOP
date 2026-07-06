package com.aqua_shop.v1.services;

import com.aqua_shop.v1.dto.req.CreateBrandRequest;
import com.aqua_shop.v1.dto.req.UpdateBrandRequest;
import com.aqua_shop.v1.dto.res.BrandResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BrandService {

    BrandResponse createBrand(CreateBrandRequest request);

    BrandResponse updateBrand(String brandId, UpdateBrandRequest request);

    BrandResponse getBrandById(String brandId);

    BrandResponse getBrandBySlug(String slug);

    Page<BrandResponse> filterBrands(String search, Boolean isActive, Pageable pageable);

    BrandResponse deleteBrand(String brandId);
}
