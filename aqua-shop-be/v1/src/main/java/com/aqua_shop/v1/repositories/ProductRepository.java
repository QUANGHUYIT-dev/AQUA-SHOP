package com.aqua_shop.v1.repositories;

import com.aqua_shop.v1.entity.Product;
import com.aqua_shop.v1.enums.ProductStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String>, JpaSpecificationExecutor<Product> {

    @EntityGraph(attributePaths = {"category", "brand", "plantDetail", "fishDetail", "accessoryDetail", "variants"})
    Optional<Product> findWithDetailsByProductId(String productId);

    Optional<Product> findBySlugAndStatusIn(String slug, Collection<ProductStatus> statuses);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndProductIdNot(String slug, String productId);

    @EntityGraph(attributePaths = {"category", "brand", "variants"})
    List<Product> findByProductIdInAndStatusIn(
            Collection<String> productIds,
            Collection<ProductStatus> statuses);
}
