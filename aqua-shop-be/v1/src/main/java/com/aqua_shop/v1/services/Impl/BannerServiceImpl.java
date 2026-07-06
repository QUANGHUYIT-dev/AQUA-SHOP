package com.aqua_shop.v1.services.Impl;

import com.aqua_shop.v1.dto.req.CreateBannerRequest;
import com.aqua_shop.v1.dto.req.UpdateBannerRequest;
import com.aqua_shop.v1.dto.res.BannerResponse;
import com.aqua_shop.v1.entity.Banner;
import com.aqua_shop.v1.entity.Brand;
import com.aqua_shop.v1.exceptions.CustomException;
import com.aqua_shop.v1.exceptions.ErrorCode;
import com.aqua_shop.v1.mappers.BannerMapper;
import com.aqua_shop.v1.repositories.BannerRepository;
import com.aqua_shop.v1.repositories.BrandRepository;
import com.aqua_shop.v1.services.BannerService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BannerServiceImpl implements BannerService {

    BannerRepository bannerRepository;
    BrandRepository brandRepository;
    BannerMapper bannerMapper;

    @Override
    @Transactional
    public BannerResponse createBanner(CreateBannerRequest request) {
        log.info("Đang tạo banner cho brand: {}", request.getBrandId());

        Brand brand = findActiveBrandOrThrow(request.getBrandId());
        Banner banner = bannerMapper.toBanner(request);
        banner.setBrand(brand);
        banner.setImageUrl(request.getImageUrl().trim());
        banner.setTitle(normalizeOptionalText(request.getTitle()));
        banner.setSubtitle(normalizeOptionalText(request.getSubtitle()));
        banner.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        banner.setIsActive(true);

        return bannerMapper.toBannerResponse(bannerRepository.save(banner));
    }

    @Override
    @Transactional
    public BannerResponse updateBanner(String bannerId, UpdateBannerRequest request) {
        log.info("Đang cập nhật banner: {}", bannerId);

        Banner banner = findBannerWithBrandOrThrow(bannerId);
        bannerMapper.updateBannerFromRequest(request, banner);

        if (request.getBrandId() != null && !request.getBrandId().isBlank()) {
            banner.setBrand(findActiveBrandOrThrow(request.getBrandId()));
        }

        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            banner.setImageUrl(request.getImageUrl().trim());
        }

        if (request.getTitle() != null) {
            banner.setTitle(normalizeOptionalText(request.getTitle()));
        }

        if (request.getSubtitle() != null) {
            banner.setSubtitle(normalizeOptionalText(request.getSubtitle()));
        }

        return bannerMapper.toBannerResponse(bannerRepository.save(banner));
    }

    @Override
    @Transactional(readOnly = true)
    public BannerResponse getBannerById(String bannerId) {
        return bannerMapper.toBannerResponse(findBannerWithBrandOrThrow(bannerId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BannerResponse> filterBanners(
            String search,
            String brandId,
            Boolean isActive,
            Pageable pageable) {
        return bannerRepository.findAll((root, query, cb) -> {
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("brand", JoinType.LEFT);
            }

            List<Predicate> predicates = new ArrayList<>();
            Join<Object, Object> brandJoin = root.join("brand", JoinType.LEFT);

            if (search != null && !search.isBlank()) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("subtitle")), like),
                        cb.like(cb.lower(brandJoin.get("name")), like)
                ));
            }

            if (brandId != null && !brandId.isBlank()) {
                predicates.add(cb.equal(brandJoin.get("brandId"), brandId));
            }

            if (isActive != null) {
                predicates.add(cb.equal(root.get("isActive"), isActive));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable).map(bannerMapper::toBannerResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BannerResponse> getActiveBanners() {
        return bannerRepository.findByIsActiveTrueAndBrand_IsActiveTrueOrderBySortOrderAscCreatedAtDesc()
                .stream()
                .map(bannerMapper::toBannerResponse)
                .toList();
    }

    @Override
    @Transactional
    public BannerResponse deleteBanner(String bannerId) {
        log.info("Đang ẩn banner: {}", bannerId);

        Banner banner = findBannerWithBrandOrThrow(bannerId);
        banner.setIsActive(false);
        return bannerMapper.toBannerResponse(bannerRepository.save(banner));
    }

    private Banner findBannerWithBrandOrThrow(String bannerId) {
        Banner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new CustomException(ErrorCode.BANNER_NOT_FOUND, bannerId));

        if (banner.getBrand() != null) {
            banner.getBrand().getName();
        }

        return banner;
    }

    private Brand findActiveBrandOrThrow(String brandId) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new CustomException(ErrorCode.BRAND_NOT_FOUND, brandId));

        if (!Boolean.TRUE.equals(brand.getIsActive())) {
            throw new CustomException(ErrorCode.BRAND_INACTIVE, brand.getName());
        }

        return brand;
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
