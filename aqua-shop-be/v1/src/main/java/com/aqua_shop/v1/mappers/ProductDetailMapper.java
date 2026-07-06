package com.aqua_shop.v1.mappers;

import com.aqua_shop.v1.dto.req.AccessoryDetailRequest;
import com.aqua_shop.v1.dto.req.FishDetailRequest;
import com.aqua_shop.v1.dto.req.PlantDetailRequest;
import com.aqua_shop.v1.dto.req.ProductImageRequest;
import com.aqua_shop.v1.dto.res.AccessoryDetailResponse;
import com.aqua_shop.v1.dto.res.FishDetailResponse;
import com.aqua_shop.v1.dto.res.PlantDetailResponse;
import com.aqua_shop.v1.dto.res.ProductImageResponse;
import com.aqua_shop.v1.entity.AccessoryDetail;
import com.aqua_shop.v1.entity.FishDetail;
import com.aqua_shop.v1.entity.PlantDetail;
import com.aqua_shop.v1.entity.ProductImage;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ProductDetailMapper {

    PlantDetailResponse toPlantDetailResponse(PlantDetail detail);

    FishDetailResponse toFishDetailResponse(FishDetail detail);

    AccessoryDetailResponse toAccessoryDetailResponse(AccessoryDetail detail);

    ProductImageResponse toProductImageResponse(ProductImage image);

    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "product", ignore = true)
    PlantDetail toPlantDetail(PlantDetailRequest request);

    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "product", ignore = true)
    FishDetail toFishDetail(FishDetailRequest request);

    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "product", ignore = true)
    AccessoryDetail toAccessoryDetail(AccessoryDetailRequest request);

    @Mapping(target = "imageId", ignore = true)
    @Mapping(target = "product", ignore = true)
    ProductImage toProductImage(ProductImageRequest request);

    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updatePlantDetail(PlantDetailRequest request, @MappingTarget PlantDetail detail);

    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateFishDetail(FishDetailRequest request, @MappingTarget FishDetail detail);

    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateAccessoryDetail(AccessoryDetailRequest request, @MappingTarget AccessoryDetail detail);
}
