package com.aqua_shop.v1.repositories;

import com.aqua_shop.v1.entity.OrderItem;
import com.aqua_shop.v1.enums.OrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, String> {

    @Query("""
            SELECT oi.productId, SUM(oi.quantity)
            FROM OrderItem oi
            JOIN oi.order o
            WHERE oi.productId IS NOT NULL
              AND o.status IN :statuses
            GROUP BY oi.productId
            ORDER BY SUM(oi.quantity) DESC
            """)
    List<Object[]> findTopSellingProductIds(
            @Param("statuses") Collection<OrderStatus> statuses,
            Pageable pageable);

    @Query("""
            SELECT oi.productId, SUM(oi.quantity)
            FROM OrderItem oi
            JOIN oi.order o
            WHERE oi.productId IN :productIds
              AND o.status IN :statuses
            GROUP BY oi.productId
            """)
    List<Object[]> sumSoldQuantitiesByProductIds(
            @Param("productIds") Collection<String> productIds,
            @Param("statuses") Collection<OrderStatus> statuses);
}
