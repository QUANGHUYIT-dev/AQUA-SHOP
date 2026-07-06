package com.aqua_shop.v1.repositories;

import com.aqua_shop.v1.entity.Banner;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, String>, JpaSpecificationExecutor<Banner> {

    @EntityGraph(attributePaths = {"brand"})
    List<Banner> findByIsActiveTrueAndBrand_IsActiveTrueOrderBySortOrderAscCreatedAtDesc();
}
