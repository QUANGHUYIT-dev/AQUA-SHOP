package com.aqua_shop.v1.services;

import com.aqua_shop.v1.dto.req.AddCartItemRequest;
import com.aqua_shop.v1.dto.req.UpdateCartItemRequest;
import com.aqua_shop.v1.dto.res.CartItemResponse;
import com.aqua_shop.v1.dto.res.CartResponse;

public interface CartService {

    CartResponse getCart();

    CartItemResponse addItem(AddCartItemRequest request);

    CartItemResponse updateItem(String cartItemId, UpdateCartItemRequest request);

    void removeItem(String cartItemId);

    void clearCart();
}
