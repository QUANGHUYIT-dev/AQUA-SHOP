package com.aqua_shop.v1.repositories;

import com.aqua_shop.v1.entity.Cart;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, String> {

    @EntityGraph(attributePaths = {"items", "items.variant", "items.variant.product"})
    Optional<Cart> findWithItemsByCustomer_CustomerId(String customerId);

    boolean existsByCustomer_CustomerId(String customerId);
}
