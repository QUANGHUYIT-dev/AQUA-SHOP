package com.aqua_shop.v1.repositories;

import com.aqua_shop.v1.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProduct_ProductIdOrderBySortOrderAsc(String productId);

    Optional<ProductImage> findByImageIdAndProduct_ProductId(Long imageId, String productId);

    long countByProduct_ProductId(String productId);
}
