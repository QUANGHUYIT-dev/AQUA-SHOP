package com.aqua_shop.v1.repositories;

import com.aqua_shop.v1.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, String>, JpaSpecificationExecutor<Brand> {

    Optional<Brand> findBySlug(String slug);

    Optional<Brand> findBySlugAndIsActiveTrue(String slug);

    boolean existsByNameIgnoreCase(String name);

    boolean existsBySlug(String slug);

    boolean existsByNameIgnoreCaseAndBrandIdNot(String name, String brandId);

    boolean existsBySlugAndBrandIdNot(String slug, String brandId);
}
