package com.aqua_shop.v1.repositories;

import com.aqua_shop.v1.entity.ProductVariant;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, String> {

    Optional<ProductVariant> findBySku(String sku);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM ProductVariant v WHERE v.sku = :sku")
    Optional<ProductVariant> findBySkuForUpdate(@Param("sku") String sku);

    boolean existsBySku(String sku);

    boolean existsBySkuAndVariantIdNot(String sku, String variantId);

    @Query(
            value = """
                    SELECT v FROM ProductVariant v
                    JOIN FETCH v.product p
                    WHERE (:search IS NULL OR :search = ''
                           OR LOWER(v.sku) LIKE LOWER(CONCAT('%', :search, '%'))
                           OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))
                    """,
            countQuery = """
                    SELECT COUNT(v) FROM ProductVariant v
                    JOIN v.product p
                    WHERE (:search IS NULL OR :search = ''
                           OR LOWER(v.sku) LIKE LOWER(CONCAT('%', :search, '%'))
                           OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))
                    """)
    Page<ProductVariant> searchForInventory(
            @Param("search") String search,
            Pageable pageable);
}
