package com.aqua_shop.v1.repositories;

import com.aqua_shop.v1.entity.InventoryHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryHistoryRepository extends JpaRepository<InventoryHistory, String> {

    List<InventoryHistory> findByInventory_SkuOrderByCreatedAtDesc(String sku);

    List<InventoryHistory> findByInventory_InventoryIdOrderByCreatedAtDesc(String inventoryId);
}
