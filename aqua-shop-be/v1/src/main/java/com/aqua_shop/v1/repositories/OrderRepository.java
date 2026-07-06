package com.aqua_shop.v1.repositories;

import com.aqua_shop.v1.entity.Order;
import com.aqua_shop.v1.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    @EntityGraph(attributePaths = {"items", "items.variant"})
    Optional<Order> findWithItemsByOrderIdAndCustomer_CustomerId(String orderId, String customerId);

    Page<Order> findByCustomer_CustomerIdOrderByCreatedAtDesc(String customerId, Pageable pageable);

    Page<Order> findByCustomer_CustomerIdAndStatusOrderByCreatedAtDesc(
            String customerId, OrderStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"items", "items.variant", "customer"})
    Optional<Order> findWithItemsByOrderId(String orderId);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);
}
