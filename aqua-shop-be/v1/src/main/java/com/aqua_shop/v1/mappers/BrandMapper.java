package com.aqua_shop.v1.mappers;

import com.aqua_shop.v1.dto.req.CreateBrandRequest;
import com.aqua_shop.v1.dto.req.UpdateBrandRequest;
import com.aqua_shop.v1.dto.res.BrandResponse;
import com.aqua_shop.v1.entity.Brand;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface BrandMapper {

    BrandResponse toBrandResponse(Brand brand);

    @Mapping(target = "brandId", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "slug", ignore = true)
    Brand toBrand(CreateBrandRequest request);

    @Mapping(target = "brandId", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateBrandFromRequest(UpdateBrandRequest request, @MappingTarget Brand brand);
}
