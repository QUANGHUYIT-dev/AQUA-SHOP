package com.aqua_shop.v1.mappers;

import com.aqua_shop.v1.dto.res.ProductResponse;
import com.aqua_shop.v1.dto.res.ProductSummaryResponse;
import com.aqua_shop.v1.entity.Product;
import com.aqua_shop.v1.entity.ProductVariant;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Mapper(componentModel = "spring", uses = {ProductDetailMapper.class, ProductVariantMapper.class})
public interface ProductMapper {

    @Mapping(source = "category.categoryId", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "brand.brandId", target = "brandId")
    @Mapping(source = "brand.name", target = "brandName")
    @Mapping(target = "minPrice", ignore = true)
    @Mapping(target = "maxPrice", ignore = true)
    @Mapping(target = "totalStock", ignore = true)
    @Mapping(target = "variantCount", ignore = true)
    @Mapping(target = "availableSizes", ignore = true)
    @Mapping(target = "availableVolumes", ignore = true)
    ProductSummaryResponse toProductSummaryResponse(Product product);

    @Mapping(source = "category.categoryId", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "brand.brandId", target = "brandId")
    @Mapping(source = "brand.name", target = "brandName")
    @Mapping(target = "minPrice", ignore = true)
    @Mapping(target = "maxPrice", ignore = true)
    @Mapping(target = "totalStock", ignore = true)
    ProductResponse toProductResponse(Product product);

    @AfterMapping
    default void enrichSummary(@MappingTarget ProductSummaryResponse.ProductSummaryResponseBuilder builder, Product product) {
        applyVariantAggregates(builder, product.getVariants());
    }

    @AfterMapping
    default void enrichResponse(@MappingTarget ProductResponse.ProductResponseBuilder builder, Product product) {
        applyVariantAggregates(builder, product.getVariants());
    }

    private static void applyVariantAggregates(
            ProductSummaryResponse.ProductSummaryResponseBuilder builder,
            List<ProductVariant> variants) {
        if (variants == null || variants.isEmpty()) {
            builder.minPrice(null).maxPrice(null).displayListPrice(null).totalStock(0).variantCount(0)
                    .availableSizes(List.of()).availableVolumes(List.of());
            return;
        }

        ProductVariant cheapestVariant = cheapestByEffectivePrice(variants);

        builder.minPrice(variants.stream().map(ProductMapper::effectivePrice).min(Comparator.naturalOrder()).orElse(null));
        builder.maxPrice(variants.stream().map(ProductMapper::effectivePrice).max(Comparator.naturalOrder()).orElse(null));
        builder.displayListPrice(
                cheapestVariant != null ? cheapestVariant.getPrice() : null);
        builder.totalStock(variants.stream().mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0).sum());
        builder.variantCount(variants.size());
        builder.availableSizes(collectSizes(variants));
        builder.availableVolumes(collectVolumes(variants));
    }

    private static void applyVariantAggregates(
            ProductResponse.ProductResponseBuilder builder,
            List<ProductVariant> variants) {
        if (variants == null || variants.isEmpty()) {
            builder.minPrice(null).maxPrice(null).totalStock(0);
            return;
        }

        builder.minPrice(variants.stream().map(ProductMapper::effectivePrice).min(Comparator.naturalOrder()).orElse(null));
        builder.maxPrice(variants.stream().map(ProductMapper::effectivePrice).max(Comparator.naturalOrder()).orElse(null));
        builder.totalStock(variants.stream().mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0).sum());
    }

    static BigDecimal effectivePrice(ProductVariant variant) {
        if (variant.getSalePrice() != null) {
            return variant.getSalePrice();
        }
        return variant.getPrice();
    }

    private static ProductVariant cheapestByEffectivePrice(List<ProductVariant> variants) {
        return variants.stream()
                .min(Comparator.comparing(ProductMapper::effectivePrice))
                .orElse(null);
    }

    private static List<String> collectSizes(List<ProductVariant> variants) {
        return variants.stream()
                .map(variant -> variant.getAttributes() != null ? variant.getAttributes().getSize() : null)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .distinct()
                .toList();
    }

    private static List<String> collectVolumes(List<ProductVariant> variants) {
        return variants.stream()
                .map(variant -> variant.getAttributes() != null ? variant.getAttributes().getVolume() : null)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .distinct()
                .toList();
    }
}
