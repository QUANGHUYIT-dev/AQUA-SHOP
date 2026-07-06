package com.aqua_shop.v1.mappers;

import com.aqua_shop.v1.dto.req.CreateBannerRequest;
import com.aqua_shop.v1.dto.req.UpdateBannerRequest;
import com.aqua_shop.v1.dto.res.BannerResponse;
import com.aqua_shop.v1.entity.Banner;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface BannerMapper {

    @Mapping(source = "bannerId", target = "bannerId")
    @Mapping(source = "brand.brandId", target = "brandId")
    @Mapping(source = "brand.name", target = "brandName")
    @Mapping(source = "brand.slug", target = "brandSlug")
    BannerResponse toBannerResponse(Banner banner);

    @Mapping(target = "bannerId", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    Banner toBanner(CreateBannerRequest request);

    @Mapping(target = "bannerId", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateBannerFromRequest(UpdateBannerRequest request, @MappingTarget Banner banner);
}
