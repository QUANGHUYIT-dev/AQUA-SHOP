package com.aqua_shop.v1.services.Impl;

import com.aqua_shop.v1.dto.req.AccessoryDetailRequest;
import com.aqua_shop.v1.dto.req.CreateProductRequest;
import com.aqua_shop.v1.dto.req.FishDetailRequest;
import com.aqua_shop.v1.dto.req.PlantDetailRequest;
import com.aqua_shop.v1.dto.req.ProductVariantRequest;
import com.aqua_shop.v1.dto.req.UpdateProductRequest;
import com.aqua_shop.v1.dto.res.ProductResponse;
import com.aqua_shop.v1.dto.res.ProductSummaryResponse;
import com.aqua_shop.v1.entity.AccessoryDetail;
import com.aqua_shop.v1.entity.Brand;
import com.aqua_shop.v1.entity.Category;
import com.aqua_shop.v1.entity.FishDetail;
import com.aqua_shop.v1.entity.PlantDetail;
import com.aqua_shop.v1.entity.Product;
import com.aqua_shop.v1.entity.ProductVariant;
import com.aqua_shop.v1.entity.VariantAttributes;
import com.aqua_shop.v1.enums.CategoryType;
import com.aqua_shop.v1.enums.OrderStatus;
import com.aqua_shop.v1.enums.ProductStatus;
import com.aqua_shop.v1.enums.ProductType;
import com.aqua_shop.v1.exceptions.CustomException;
import com.aqua_shop.v1.exceptions.ErrorCode;
import com.aqua_shop.v1.mappers.ProductDetailMapper;
import com.aqua_shop.v1.mappers.ProductMapper;
import com.aqua_shop.v1.mappers.ProductVariantMapper;
import com.aqua_shop.v1.repositories.BrandRepository;
import com.aqua_shop.v1.repositories.CategoryRepository;
import com.aqua_shop.v1.repositories.OrderItemRepository;
import com.aqua_shop.v1.repositories.ProductRepository;
import com.aqua_shop.v1.repositories.ProductVariantRepository;
import com.aqua_shop.v1.services.ProductImageService;
import com.aqua_shop.v1.services.ProductService;
import com.aqua_shop.v1.utils.SkuGenerator;
import com.aqua_shop.v1.utils.StringUtils;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductServiceImpl implements ProductService {

    private static final Set<CategoryType> ACCESSORY_COMPATIBLE_CATEGORIES = EnumSet.of(
            CategoryType.EQUIPMENT,
            CategoryType.CHEMICAL,
            CategoryType.SUBSTRATE,
            CategoryType.FOOD,
            CategoryType.ACCESSORY
    );

    private static final Set<ProductStatus> PUBLIC_STATUSES = EnumSet.of(
            ProductStatus.ACTIVE,
            ProductStatus.OUT_OF_STOCK
    );

    private static final Set<OrderStatus> TOP_SELLING_ORDER_STATUSES = EnumSet.of(
            OrderStatus.COMPLETED,
            OrderStatus.DELIVERED
    );

    ProductRepository productRepository;
    ProductVariantRepository productVariantRepository;
    CategoryRepository categoryRepository;
    BrandRepository brandRepository;
    OrderItemRepository orderItemRepository;
    ProductMapper productMapper;
    ProductDetailMapper productDetailMapper;
    ProductVariantMapper productVariantMapper;
    ProductImageService productImageService;

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        log.info("Đang tạo sản phẩm mới: {}", request.getName());

        String name = request.getName().trim();
        String slug = StringUtils.toSlug(name);
        validateSlugUnique(slug, null);
        validateVariantRequests(request.getVariants(), null);

        Category category = resolveActiveCategory(request.getCategoryId());
        validateCategoryForProductType(category, request.getProductType());
        Brand brand = resolveOptionalActiveBrand(request.getBrandId());
        validateRequiredDetail(request);

        Product product = Product.builder()
                .name(name)
                .modelCode(normalizeModelCode(request.getModelCode()))
                .slug(slug)
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .productType(request.getProductType())
                .category(category)
                .brand(brand)
                .status(request.getStatus() != null ? request.getStatus() : ProductStatus.ACTIVE)
                .thumbnailUrl(request.getThumbnailUrl())
                .build();

        attachTypeDetail(product, request);
        attachVariants(product, request.getVariants());
        productImageService.attachImages(product, request.getImages());
        syncStockStatus(product);

        return productMapper.toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(String productId, UpdateProductRequest request) {
        log.info("Đang cập nhật sản phẩm có ID: {}", productId);

        Product product = findProductWithDetailsOrThrow(productId);

        if (request.getName() != null && !request.getName().isBlank()) {
            String name = request.getName().trim();
            String slug = StringUtils.toSlug(name);
            validateSlugUnique(slug, productId);
            product.setName(name);
            product.setSlug(slug);
        }

        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getShortDescription() != null) {
            product.setShortDescription(request.getShortDescription());
        }

        if (request.getModelCode() != null) {
            product.setModelCode(normalizeModelCode(request.getModelCode()));
        }

        if (request.getCategoryId() != null) {
            Category category = resolveActiveCategory(request.getCategoryId());
            validateCategoryForProductType(category, product.getProductType());
            product.setCategory(category);
        }

        if (request.getBrandId() != null) {
            product.setBrand(request.getBrandId().isBlank() ? null : resolveOptionalActiveBrand(request.getBrandId()));
        }

        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        if (request.getThumbnailUrl() != null) {
            product.setThumbnailUrl(request.getThumbnailUrl());
        }

        updateTypeDetail(product, request);

        if (request.getVariants() != null) {
            validateVariantRequests(request.getVariants(), productId);
            upsertVariants(product, request.getVariants());
        }

        if (request.getImages() != null) {
            productImageService.replaceAllImages(product, request.getImages());
        }

        syncStockStatus(product);

        return productMapper.toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(String productId) {
        return productMapper.toProductResponse(findProductWithDetailsOrThrow(productId));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        log.info("Đang tìm kiếm sản phẩm theo slug: {}", slug);

        Product product = productRepository.findBySlugAndStatusIn(slug, PUBLIC_STATUSES)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND, slug));

        return productMapper.toProductResponse(
                productRepository.findWithDetailsByProductId(product.getProductId())
                        .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND, slug))
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> filterProducts(
            String search,
            ProductType productType,
            String categoryId,
            String brandId,
            ProductStatus status,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable) {

        Page<ProductSummaryResponse> page = productRepository.findAll((root, query, cb) -> {
            Join<Object, Object> variantJoin = null;

            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("category", JoinType.LEFT);
                root.fetch("brand", JoinType.LEFT);
                root.fetch("variants", JoinType.LEFT);
                query.distinct(true);
            }

            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                variantJoin = root.join("variants", JoinType.LEFT);
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like)
                ));
            }

            if (productType != null) {
                predicates.add(cb.equal(root.get("productType"), productType));
            }

            if (categoryId != null && !categoryId.isBlank()) {
                List<String> categoryScopeIds = resolveCategoryScopeIds(categoryId);
                predicates.add(root.get("category").get("categoryId").in(categoryScopeIds));
            }

            if (brandId != null && !brandId.isBlank()) {
                predicates.add(cb.equal(root.get("brand").get("brandId"), brandId));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (minPrice != null || maxPrice != null) {
                if (variantJoin == null) {
                    variantJoin = root.join("variants", JoinType.INNER);
                }

                var effectivePrice = cb.<BigDecimal>selectCase()
                        .when(cb.isNotNull(variantJoin.get("salePrice")), variantJoin.get("salePrice"))
                        .otherwise(variantJoin.get("price"));

                if (minPrice != null) {
                    predicates.add(cb.greaterThanOrEqualTo(effectivePrice, minPrice));
                }
                if (maxPrice != null) {
                    predicates.add(cb.lessThanOrEqualTo(effectivePrice, maxPrice));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable).map(productMapper::toProductSummaryResponse);

        applySoldCounts(page.getContent());
        return page;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductSummaryResponse> getTopSellingProducts(int size) {
        int limit = Math.min(Math.max(size, 1), 24);
        List<Object[]> rankedRows = orderItemRepository.findTopSellingProductIds(
                TOP_SELLING_ORDER_STATUSES,
                PageRequest.of(0, limit));

        List<String> rankedIds = rankedRows.stream()
                .map(row -> (String) row[0])
                .filter(id -> id != null && !id.isBlank())
                .toList();

        List<ProductSummaryResponse> result = new ArrayList<>();

        if (!rankedIds.isEmpty()) {
            Map<String, Product> productsById = productRepository
                    .findByProductIdInAndStatusIn(rankedIds, PUBLIC_STATUSES)
                    .stream()
                    .collect(Collectors.toMap(
                            Product::getProductId,
                            product -> product,
                            (left, right) -> left,
                            LinkedHashMap::new));

            for (String productId : rankedIds) {
                Product product = productsById.get(productId);
                if (product == null) {
                    continue;
                }
                result.add(productMapper.toProductSummaryResponse(product));
                if (result.size() >= limit) {
                    applySoldCounts(result);
                    return result;
                }
            }
        }

        if (result.size() >= limit) {
            applySoldCounts(result);
            return result;
        }

        Set<String> existingIds = result.stream()
                .map(ProductSummaryResponse::getProductId)
                .collect(Collectors.toSet());

        Page<ProductSummaryResponse> fallbackPage = filterProducts(
                null,
                null,
                null,
                null,
                ProductStatus.ACTIVE,
                null,
                null,
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt")));

        for (ProductSummaryResponse product : fallbackPage.getContent()) {
            if (existingIds.contains(product.getProductId())) {
                continue;
            }
            result.add(product);
            if (result.size() >= limit) {
                break;
            }
        }

        applySoldCounts(result);
        return result;
    }

    private void applySoldCounts(List<ProductSummaryResponse> products) {
        if (products == null || products.isEmpty()) {
            return;
        }

        List<String> productIds = products.stream()
                .map(ProductSummaryResponse::getProductId)
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .toList();

        if (productIds.isEmpty()) {
            return;
        }

        Map<String, Integer> soldByProductId = orderItemRepository
                .sumSoldQuantitiesByProductIds(productIds, TOP_SELLING_ORDER_STATUSES)
                .stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> ((Number) row[1]).intValue(),
                        Integer::sum));

        for (ProductSummaryResponse product : products) {
            product.setTotalSold(soldByProductId.getOrDefault(product.getProductId(), 0));
        }
    }

    @Override
    @Transactional
    public ProductResponse deleteProduct(String productId) {
        log.info("Đang ngừng bán (soft delete) sản phẩm có ID: {}", productId);

        Product product = findProductWithDetailsOrThrow(productId);
        product.setStatus(ProductStatus.INACTIVE);
        return productMapper.toProductResponse(productRepository.save(product));
    }

    private Product findProductWithDetailsOrThrow(String productId) {
        Product product = productRepository.findWithDetailsByProductId(productId)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND, productId));
        // images lazy-load riêng — tránh MultipleBagFetchException khi fetch cùng variants
        product.getImages().size();
        return product;
    }

    private List<String> resolveCategoryScopeIds(String categoryId) {
        List<String> scopeIds = new ArrayList<>();
        scopeIds.add(categoryId);

        categoryRepository.findById(categoryId).ifPresent(category -> {
            if (category.getParent() == null) {
                categoryRepository.findChildrenByParentId(categoryId).stream()
                        .map(Category::getCategoryId)
                        .forEach(scopeIds::add);
            }
        });

        return scopeIds;
    }

    private Category resolveActiveCategory(String categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND, categoryId));

        if (!Boolean.TRUE.equals(category.getIsActive())) {
            throw new CustomException(ErrorCode.PRODUCT_CATEGORY_INACTIVE, categoryId);
        }

        return category;
    }

    private Brand resolveOptionalActiveBrand(String brandId) {
        if (brandId == null || brandId.isBlank()) {
            return null;
        }

        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new CustomException(ErrorCode.BRAND_NOT_FOUND, brandId));

        if (!Boolean.TRUE.equals(brand.getIsActive())) {
            throw new CustomException(ErrorCode.PRODUCT_BRAND_INACTIVE, brandId);
        }

        return brand;
    }

    private void validateCategoryForProductType(Category category, ProductType productType) {
        CategoryType categoryType = category.getCategoryType();
        boolean compatible = switch (productType) {
            case PLANT -> categoryType == CategoryType.PLANT;
            case FISH -> categoryType == CategoryType.FISH;
            case ACCESSORY -> ACCESSORY_COMPATIBLE_CATEGORIES.contains(categoryType);
        };

        if (!compatible) {
            throw new CustomException(
                    ErrorCode.PRODUCT_CATEGORY_TYPE_MISMATCH,
                    categoryType.getCode(),
                    productType.getCode()
            );
        }
    }

    private void validateRequiredDetail(CreateProductRequest request) {
        switch (request.getProductType()) {
            case PLANT -> {
                if (request.getPlantDetail() == null) {
                    throw new CustomException(ErrorCode.PRODUCT_DETAIL_REQUIRED, ProductType.PLANT.getCode());
                }
            }
            case FISH -> {
                if (request.getFishDetail() == null) {
                    throw new CustomException(ErrorCode.PRODUCT_DETAIL_REQUIRED, ProductType.FISH.getCode());
                }
            }
            case ACCESSORY -> {
                if (request.getAccessoryDetail() == null || request.getAccessoryDetail().getAccessoryType() == null) {
                    throw new CustomException(ErrorCode.PRODUCT_DETAIL_REQUIRED, ProductType.ACCESSORY.getCode());
                }
            }
        }
    }

    private void validateSlugUnique(String slug, String productId) {
        if (slug == null || slug.isBlank()) {
            return;
        }

        boolean exists = productId == null
                ? productRepository.existsBySlug(slug)
                : productRepository.existsBySlugAndProductIdNot(slug, productId);

        if (exists) {
            throw new CustomException(ErrorCode.PRODUCT_SLUG_ALREADY_EXISTS, slug);
        }
    }

    private void validateVariantRequests(List<ProductVariantRequest> variants, String productId) {
        if (variants == null || variants.isEmpty()) {
            throw new CustomException(ErrorCode.PRODUCT_VARIANT_REQUIRED);
        }

        Set<String> skuInRequest = new HashSet<>();
        for (ProductVariantRequest variantRequest : variants) {
            String sku = normalizeSku(variantRequest.getSku());
            if (sku != null) {
                if (!skuInRequest.add(sku)) {
                    throw new CustomException(ErrorCode.PRODUCT_VARIANT_SKU_DUPLICATED, sku);
                }
                validateSkuUnique(sku, variantRequest.getVariantId());
            }

            validatePrice(variantRequest.getPrice(), variantRequest.getSalePrice());
            validateStock(variantRequest.getStockQuantity() != null ? variantRequest.getStockQuantity() : 0);
        }

        if (productId != null) {
            for (ProductVariantRequest variantRequest : variants) {
                if (variantRequest.getVariantId() == null || variantRequest.getVariantId().isBlank()) {
                    continue;
                }

                ProductVariant existing = productVariantRepository.findById(variantRequest.getVariantId())
                        .orElseThrow(() -> new CustomException(
                                ErrorCode.PRODUCT_VARIANT_NOT_FOUND,
                                variantRequest.getVariantId()
                        ));

                if (!existing.getProduct().getProductId().equals(productId)) {
                    throw new CustomException(ErrorCode.PRODUCT_VARIANT_NOT_FOUND, variantRequest.getVariantId());
                }
            }
        }
    }

    private void validateSkuUnique(String sku, String variantId) {
        if (sku == null) {
            return;
        }

        boolean exists = variantId == null || variantId.isBlank()
                ? productVariantRepository.existsBySku(sku)
                : productVariantRepository.existsBySkuAndVariantIdNot(sku, variantId);

        if (exists) {
            throw new CustomException(ErrorCode.PRODUCT_SKU_ALREADY_EXISTS, sku);
        }
    }

    private void validatePrice(BigDecimal price, BigDecimal salePrice) {
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CustomException(ErrorCode.PRODUCT_INVALID_PRICE);
        }

        if (salePrice != null) {
            if (salePrice.compareTo(BigDecimal.ZERO) < 0 || salePrice.compareTo(price) > 0) {
                throw new CustomException(ErrorCode.PRODUCT_INVALID_SALE_PRICE);
            }
        }
    }

    private void validateStock(Integer stockQuantity) {
        if (stockQuantity != null && stockQuantity < 0) {
            throw new CustomException(ErrorCode.PRODUCT_INVALID_STOCK);
        }
    }

    private void validateRange(BigDecimal min, BigDecimal max, String minLabel, String maxLabel) {
        if (min != null && max != null && min.compareTo(max) > 0) {
            throw new CustomException(ErrorCode.PRODUCT_INVALID_DETAIL_RANGE, minLabel, maxLabel);
        }
    }

    private void validateFishDetail(FishDetailRequest request) {
        validateRange(request.getWaterTempMinC(), request.getWaterTempMaxC(), "waterTempMinC", "waterTempMaxC");
        validateRange(request.getPhMin(), request.getPhMax(), "phMin", "phMax");
    }

    private void validateAccessoryDetail(AccessoryDetailRequest request) {
        if (request.getCompatibleTankMinLiters() != null
                && request.getCompatibleTankMaxLiters() != null
                && request.getCompatibleTankMinLiters() > request.getCompatibleTankMaxLiters()) {
            throw new CustomException(
                    ErrorCode.PRODUCT_INVALID_DETAIL_RANGE,
                    "compatibleTankMinLiters",
                    "compatibleTankMaxLiters"
            );
        }
    }

    private String normalizeSku(String sku) {
        if (sku == null || sku.isBlank()) {
            return null;
        }
        return sku.trim().toUpperCase();
    }

    private String normalizeModelCode(String modelCode) {
        return SkuGenerator.normalizeModelCode(modelCode);
    }

    private void attachTypeDetail(Product product, CreateProductRequest request) {
        switch (request.getProductType()) {
            case PLANT -> {
                PlantDetail detail = productDetailMapper.toPlantDetail(request.getPlantDetail());
                if (detail.getCo2Required() == null) {
                    detail.setCo2Required(false);
                }
                detail.setProduct(product);
                product.setPlantDetail(detail);
            }
            case FISH -> {
                validateFishDetail(request.getFishDetail());
                FishDetail detail = productDetailMapper.toFishDetail(request.getFishDetail());
                if (detail.getIsSchooling() == null) {
                    detail.setIsSchooling(false);
                }
                detail.setProduct(product);
                product.setFishDetail(detail);
            }
            case ACCESSORY -> {
                validateAccessoryDetail(request.getAccessoryDetail());
                AccessoryDetail detail = productDetailMapper.toAccessoryDetail(request.getAccessoryDetail());
                detail.setProduct(product);
                product.setAccessoryDetail(detail);
            }
        }
    }

    private void updateTypeDetail(Product product, UpdateProductRequest request) {
        switch (product.getProductType()) {
            case PLANT -> {
                if (request.getPlantDetail() == null) {
                    return;
                }
                if (product.getPlantDetail() == null) {
                    PlantDetail detail = productDetailMapper.toPlantDetail(request.getPlantDetail());
                    detail.setProduct(product);
                    product.setPlantDetail(detail);
                } else {
                    productDetailMapper.updatePlantDetail(request.getPlantDetail(), product.getPlantDetail());
                }
            }
            case FISH -> {
                if (request.getFishDetail() == null) {
                    return;
                }
                validateFishDetail(request.getFishDetail());
                if (product.getFishDetail() == null) {
                    FishDetail detail = productDetailMapper.toFishDetail(request.getFishDetail());
                    detail.setProduct(product);
                    product.setFishDetail(detail);
                } else {
                    productDetailMapper.updateFishDetail(request.getFishDetail(), product.getFishDetail());
                }
            }
            case ACCESSORY -> {
                if (request.getAccessoryDetail() == null) {
                    return;
                }
                validateAccessoryDetail(request.getAccessoryDetail());
                if (product.getAccessoryDetail() == null) {
                    AccessoryDetail detail = productDetailMapper.toAccessoryDetail(request.getAccessoryDetail());
                    detail.setProduct(product);
                    product.setAccessoryDetail(detail);
                } else {
                    productDetailMapper.updateAccessoryDetail(request.getAccessoryDetail(), product.getAccessoryDetail());
                }
            }
        }
    }

    private void attachVariants(Product product, List<ProductVariantRequest> variantRequests) {
        Set<String> usedSkus = new HashSet<>();
        List<ProductVariant> variants = new ArrayList<>();
        for (ProductVariantRequest variantRequest : variantRequests) {
            variants.add(buildVariant(product, variantRequest, usedSkus));
        }
        normalizeDefaultVariant(variants);
        product.getVariants().addAll(variants);
    }

    private void upsertVariants(Product product, List<ProductVariantRequest> variantRequests) {
        Set<String> keepVariantIds = new HashSet<>();
        Set<String> usedSkus = product.getVariants().stream()
                .map(ProductVariant::getSku)
                .collect(Collectors.toCollection(HashSet::new));

        for (ProductVariantRequest variantRequest : variantRequests) {
            if (variantRequest.getVariantId() != null && !variantRequest.getVariantId().isBlank()) {
                ProductVariant existing = product.getVariants().stream()
                        .filter(variant -> variantRequest.getVariantId().equals(variant.getVariantId()))
                        .findFirst()
                        .orElseThrow(() -> new CustomException(
                                ErrorCode.PRODUCT_VARIANT_NOT_FOUND,
                                variantRequest.getVariantId()
                        ));

                String sku = normalizeSku(variantRequest.getSku());
                if (sku != null && !sku.equals(existing.getSku())) {
                    validateSkuUnique(sku, existing.getVariantId());
                    usedSkus.remove(existing.getSku());
                    registerSkuInBatch(sku, usedSkus);
                    existing.setSku(sku);
                }

                existing.setPrice(variantRequest.getPrice());
                existing.setSalePrice(variantRequest.getSalePrice());
                existing.setStockQuantity(
                        variantRequest.getStockQuantity() != null ? variantRequest.getStockQuantity() : 0
                );
                existing.setWeightGrams(variantRequest.getWeightGrams());
                existing.setIsDefault(Boolean.TRUE.equals(variantRequest.getIsDefault()));

                if (variantRequest.getAttributes() != null) {
                    if (existing.getAttributes() == null) {
                        existing.setAttributes(new VariantAttributes());
                    }
                    productVariantMapper.updateVariantAttributes(variantRequest.getAttributes(), existing.getAttributes());
                }

                keepVariantIds.add(existing.getVariantId());
            } else {
                product.getVariants().add(buildVariant(product, variantRequest, usedSkus));
            }
        }

        product.getVariants().removeIf(variant ->
                variant.getVariantId() != null && !keepVariantIds.contains(variant.getVariantId())
        );

        normalizeDefaultVariant(product.getVariants());
    }

    private ProductVariant buildVariant(Product product, ProductVariantRequest variantRequest, Set<String> usedSkus) {
        ProductVariant variant = productVariantMapper.toProductVariant(variantRequest);
        variant.setProduct(product);
        variant.setSku(resolveVariantSku(product, variantRequest, usedSkus));
        variant.setStockQuantity(variantRequest.getStockQuantity() != null ? variantRequest.getStockQuantity() : 0);
        variant.setIsDefault(Boolean.TRUE.equals(variantRequest.getIsDefault()));

        if (variantRequest.getAttributes() != null) {
            variant.setAttributes(productVariantMapper.toVariantAttributes(variantRequest.getAttributes()));
        } else if (variant.getAttributes() == null) {
            variant.setAttributes(new VariantAttributes());
        }

        return variant;
    }

    private String resolveVariantSku(Product product, ProductVariantRequest request, Set<String> usedSkus) {
        String sku = normalizeSku(request.getSku());
        if (sku == null) {
            sku = SkuGenerator.generate(
                    product.getName(),
                    product.getBrand() != null ? product.getBrand().getName() : null,
                    product.getModelCode(),
                    request.getAttributes()
            );
        }
        sku = SkuGenerator.truncate(sku, SkuGenerator.MAX_SKU_LENGTH);
        registerSkuInBatch(sku, usedSkus);
        validateSkuUnique(sku, request.getVariantId());
        return sku;
    }

    private void registerSkuInBatch(String sku, Set<String> usedSkus) {
        if (!usedSkus.add(sku)) {
            throw new CustomException(ErrorCode.PRODUCT_VARIANT_SKU_DUPLICATED, sku);
        }
    }

    private void normalizeDefaultVariant(List<ProductVariant> variants) {
        if (variants == null || variants.isEmpty()) {
            return;
        }

        boolean hasDefault = variants.stream().anyMatch(variant -> Boolean.TRUE.equals(variant.getIsDefault()));
        if (!hasDefault) {
            variants.get(0).setIsDefault(true);
            return;
        }

        boolean defaultAssigned = false;
        for (ProductVariant variant : variants) {
            if (Boolean.TRUE.equals(variant.getIsDefault())) {
                if (defaultAssigned) {
                    variant.setIsDefault(false);
                } else {
                    defaultAssigned = true;
                }
            }
        }
    }

    private void syncStockStatus(Product product) {
        int totalStock = product.getVariants().stream()
                .mapToInt(variant -> variant.getStockQuantity() != null ? variant.getStockQuantity() : 0)
                .sum();

        if (totalStock <= 0 && product.getStatus() == ProductStatus.ACTIVE) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
            return;
        }

        if (totalStock > 0 && product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            product.setStatus(ProductStatus.ACTIVE);
        }
    }
}
