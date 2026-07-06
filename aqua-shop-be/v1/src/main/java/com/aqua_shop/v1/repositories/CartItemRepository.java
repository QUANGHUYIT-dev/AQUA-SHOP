package com.aqua_shop.v1.repositories;

import com.aqua_shop.v1.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, String> {

    Optional<CartItem> findByCartItemIdAndCart_CartId(String cartItemId, String cartId);

    Optional<CartItem> findByCart_CartIdAndVariant_VariantId(String cartId, String variantId);
}
