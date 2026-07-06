package com.aqua_shop.v1.services.Impl;

import com.aqua_shop.v1.dto.req.CreateBrandRequest;
import com.aqua_shop.v1.dto.req.UpdateBrandRequest;
import com.aqua_shop.v1.dto.res.BrandResponse;
import com.aqua_shop.v1.entity.Brand;
import com.aqua_shop.v1.exceptions.CustomException;
import com.aqua_shop.v1.exceptions.ErrorCode;
import com.aqua_shop.v1.mappers.BrandMapper;
import com.aqua_shop.v1.repositories.BrandRepository;
import com.aqua_shop.v1.services.BrandService;
import com.aqua_shop.v1.utils.StringUtils;
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
public class BrandServiceImpl implements BrandService {

    BrandMapper brandMapper;
    BrandRepository brandRepository;

    @Override
    @Transactional
    public BrandResponse createBrand(CreateBrandRequest request) {
        log.info("Đang tạo brand mới: {}", request.getName());

        String name = request.getName().trim();
        String slug = StringUtils.toSlug(name);

        if (brandRepository.existsByNameIgnoreCase(name)) {
            throw new CustomException(ErrorCode.BRAND_NAME_ALREADY_EXISTS, name);
        }
        if (brandRepository.existsBySlug(slug)) {
            throw new CustomException(ErrorCode.BRAND_SLUG_ALREADY_EXISTS, slug);
        }

        Brand brand = brandMapper.toBrand(request);
        brand.setName(name);
        brand.setSlug(slug);
        brand.setIsActive(true);

        return brandMapper.toBrandResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public BrandResponse updateBrand(String brandId, UpdateBrandRequest request) {
        log.info("Đang cập nhật brand có ID: {}", brandId);

        Brand brand = findBrandOrThrow(brandId);
        brandMapper.updateBrandFromRequest(request, brand);

        if (request.getName() != null && !request.getName().isBlank()) {
            String name = request.getName().trim();
            String slug = StringUtils.toSlug(name);

            if (brandRepository.existsByNameIgnoreCaseAndBrandIdNot(name, brandId)) {
                throw new CustomException(ErrorCode.BRAND_NAME_ALREADY_EXISTS, name);
            }
            if (brandRepository.existsBySlugAndBrandIdNot(slug, brandId)) {
                throw new CustomException(ErrorCode.BRAND_SLUG_ALREADY_EXISTS, slug);
            }

            brand.setName(name);
            brand.setSlug(slug);
        }

        return brandMapper.toBrandResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional(readOnly = true)
    public BrandResponse getBrandById(String brandId) {
        return brandMapper.toBrandResponse(findBrandOrThrow(brandId));
    }

    @Override
    @Transactional(readOnly = true)
    public BrandResponse getBrandBySlug(String slug) {
        log.info("Đang tìm kiếm brand theo slug: {}", slug);

        Brand brand = brandRepository.findBySlugAndIsActiveTrue(slug)
                .orElseThrow(() -> new CustomException(ErrorCode.BRAND_NOT_FOUND, slug));

        return brandMapper.toBrandResponse(brand);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BrandResponse> filterBrands(String search, Boolean isActive, Pageable pageable) {
        return brandRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(root.get("slug")), like),
                        cb.like(cb.lower(root.get("country")), like)
                ));
            }

            if (isActive != null) {
                predicates.add(cb.equal(root.get("isActive"), isActive));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable).map(brandMapper::toBrandResponse);
    }

    @Override
    @Transactional
    public BrandResponse deleteBrand(String brandId) {
        log.info("Đang khóa (soft delete) brand có ID: {}", brandId);

        Brand brand = findBrandOrThrow(brandId);
        brand.setIsActive(false);
        return brandMapper.toBrandResponse(brandRepository.save(brand));
    }

    private Brand findBrandOrThrow(String brandId) {
        return brandRepository.findById(brandId)
                .orElseThrow(() -> new CustomException(ErrorCode.BRAND_NOT_FOUND, brandId));
    }
}
