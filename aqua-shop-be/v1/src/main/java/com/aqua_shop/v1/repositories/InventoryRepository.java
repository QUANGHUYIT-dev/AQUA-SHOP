package com.aqua_shop.v1.repositories;

import com.aqua_shop.v1.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, String> {

    @EntityGraph(attributePaths = {"variant", "variant.product"})
    Optional<Inventory> findBySku(String sku);

    @EntityGraph(attributePaths = {"variant", "variant.product"})
    Optional<Inventory> findByVariant_VariantId(String variantId);

    @EntityGraph(attributePaths = {"variant", "variant.product"})
    Optional<Inventory> findWithDetailsByInventoryId(String inventoryId);

    @EntityGraph(attributePaths = {"variant", "variant.product"})
    Page<Inventory> findBySkuContainingIgnoreCase(String sku, Pageable pageable);

    @EntityGraph(attributePaths = {"variant", "variant.product"})
    Page<Inventory> findAllBy(Pageable pageable);
}
