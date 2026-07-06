package com.aqua_shop.v1.mappers;

import com.aqua_shop.v1.dto.req.ProductVariantRequest;
import com.aqua_shop.v1.dto.req.VariantAttributesRequest;
import com.aqua_shop.v1.dto.res.ProductVariantResponse;
import com.aqua_shop.v1.dto.res.VariantAttributesResponse;
import com.aqua_shop.v1.entity.ProductVariant;
import com.aqua_shop.v1.entity.VariantAttributes;
import org.mapstruct.AfterMapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ProductVariantMapper {

    @Mapping(target = "size", ignore = true)
    @Mapping(target = "volume", ignore = true)
    @Mapping(target = "color", ignore = true)
    ProductVariantResponse toProductVariantResponse(ProductVariant variant);

    VariantAttributesResponse toVariantAttributesResponse(VariantAttributes attributes);

    @Mapping(target = "variantId", ignore = true)
    @Mapping(target = "product", ignore = true)
    ProductVariant toProductVariant(ProductVariantRequest request);

    VariantAttributes toVariantAttributes(VariantAttributesRequest request);

    @Mapping(target = "variantId", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "sku", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateProductVariant(ProductVariantRequest request, @MappingTarget ProductVariant variant);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateVariantAttributes(VariantAttributesRequest request, @MappingTarget VariantAttributes attributes);

    @AfterMapping
    default void flattenAttributes(
            @MappingTarget ProductVariantResponse.ProductVariantResponseBuilder builder,
            ProductVariant variant) {
        VariantAttributes attributes = variant.getAttributes();
        if (attributes == null) {
            return;
        }
        builder.size(attributes.getSize());
        builder.volume(attributes.getVolume());
        builder.color(attributes.getColor());
    }
}
