package com.aqua_shop.v1.services;

import com.aqua_shop.v1.dto.req.CreateBannerRequest;
import com.aqua_shop.v1.dto.req.UpdateBannerRequest;
import com.aqua_shop.v1.dto.res.BannerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BannerService {

    BannerResponse createBanner(CreateBannerRequest request);

    BannerResponse updateBanner(String bannerId, UpdateBannerRequest request);

    BannerResponse getBannerById(String bannerId);

    Page<BannerResponse> filterBanners(String search, String brandId, Boolean isActive, Pageable pageable);

    List<BannerResponse> getActiveBanners();

    BannerResponse deleteBanner(String bannerId);
}
