package com.aqua_shop.v1.services.Impl;

import com.aqua_shop.v1.dto.req.AddCartItemRequest;
import com.aqua_shop.v1.dto.req.UpdateCartItemRequest;
import com.aqua_shop.v1.dto.res.CartItemResponse;
import com.aqua_shop.v1.dto.res.CartResponse;
import com.aqua_shop.v1.entity.Cart;
import com.aqua_shop.v1.entity.CartItem;
import com.aqua_shop.v1.entity.Customer;
import com.aqua_shop.v1.entity.Product;
import com.aqua_shop.v1.entity.ProductVariant;
import com.aqua_shop.v1.entity.VariantAttributes;
import com.aqua_shop.v1.enums.ProductStatus;
import com.aqua_shop.v1.exceptions.CustomException;
import com.aqua_shop.v1.exceptions.ErrorCode;
import com.aqua_shop.v1.repositories.CartItemRepository;
import com.aqua_shop.v1.repositories.CartRepository;
import com.aqua_shop.v1.repositories.ProductVariantRepository;
import com.aqua_shop.v1.services.AuthenticationService;
import com.aqua_shop.v1.services.CartService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartServiceImpl implements CartService {

    CartRepository cartRepository;
    CartItemRepository cartItemRepository;
    ProductVariantRepository productVariantRepository;
    AuthenticationService authenticationService;

    @Override
    @Transactional
    public CartResponse getCart() {
        Customer customer = authenticationService.getCurrentCustomer();
        return buildCartResponse(getOrCreateCart(customer));
    }

    @Override
    @Transactional
    public CartItemResponse addItem(AddCartItemRequest request) {
        Customer customer = authenticationService.getCurrentCustomer();
        Cart cart = getOrCreateCart(customer);

        ProductVariant variant = findVariantBySkuOrThrow(request.getSku());
        validatePurchasable(variant);

        int quantityToAdd = request.getQuantity();
        String variantId = variant.getVariantId();

        CartItem existingItem = cartItemRepository
                .findByCart_CartIdAndVariant_VariantId(cart.getCartId(), variantId)
                .orElse(null);

        int totalQuantity = quantityToAdd + (existingItem != null ? existingItem.getQuantity() : 0);
        validateStock(variant, totalQuantity);

        CartItem cartItem;
        if (existingItem != null) {
            existingItem.setQuantity(totalQuantity);
            existingItem.setUnitPrice(resolveEffectivePrice(variant));
            cartItem = existingItem;
        } else {
            cartItem = CartItem.builder()
                    .cart(cart)
                    .variant(variant)
                    .quantity(quantityToAdd)
                    .unitPrice(resolveEffectivePrice(variant))
                    .build();
            cart.getItems().add(cartItem);
        }

        cartRepository.save(cart);
        log.info("Khách {} thêm SKU {} x{} vào giỏ {}", customer.getCustomerId(), variant.getSku(), quantityToAdd);
        return buildCartItemResponse(cartItem);
    }

    @Override
    @Transactional
    public CartItemResponse updateItem(String cartItemId, UpdateCartItemRequest request) {
        Customer customer = authenticationService.getCurrentCustomer();
        Cart cart = getCartWithItemsOrThrow(customer.getCustomerId());

        CartItem cartItem = findCartItemOrThrow(cart, cartItemId);
        ProductVariant variant = cartItem.getVariant();

        validatePurchasable(variant);
        validateStock(variant, request.getQuantity());

        cartItem.setQuantity(request.getQuantity());
        cartItem.setUnitPrice(resolveEffectivePrice(variant));
        cartRepository.save(cart);

        log.info("Khách {} cập nhật dòng {} thành số lượng {}", customer.getCustomerId(), cartItemId, request.getQuantity());
        return buildCartItemResponse(cartItem);
    }

    @Override
    @Transactional
    public void removeItem(String cartItemId) {
        Customer customer = authenticationService.getCurrentCustomer();
        Cart cart = getCartWithItemsOrThrow(customer.getCustomerId());

        CartItem cartItem = findCartItemOrThrow(cart, cartItemId);
        cart.getItems().remove(cartItem);
        cartRepository.save(cart);

        log.info("Khách {} xóa dòng {} khỏi giỏ", customer.getCustomerId(), cartItemId);
    }

    @Override
    @Transactional
    public void clearCart() {
        Customer customer = authenticationService.getCurrentCustomer();
        cartRepository.findWithItemsByCustomer_CustomerId(customer.getCustomerId())
                .ifPresent(cart -> {
                    cart.getItems().clear();
                    cartRepository.save(cart);
                    log.info("Khách {} xóa toàn bộ giỏ hàng", customer.getCustomerId());
                });
    }

    private Cart getOrCreateCart(Customer customer) {
        return cartRepository.findWithItemsByCustomer_CustomerId(customer.getCustomerId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .customer(customer)
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    private Cart getCartWithItemsOrThrow(String customerId) {
        return cartRepository.findWithItemsByCustomer_CustomerId(customerId)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_NOT_FOUND));
    }

    private CartItem findCartItemOrThrow(Cart cart, String cartItemId) {
        return cartItemRepository.findByCartItemIdAndCart_CartId(cartItemId, cart.getCartId())
                .orElseThrow(() -> new CustomException(ErrorCode.CART_ITEM_NOT_FOUND, cartItemId));
    }

    private ProductVariant findVariantBySkuOrThrow(String sku) {
        String normalizedSku = normalizeSku(sku);
        return productVariantRepository.findBySku(normalizedSku)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_VARIANT_SKU_NOT_FOUND, normalizedSku));
    }

    private String normalizeSku(String sku) {
        if (sku == null || sku.isBlank()) {
            throw new CustomException(ErrorCode.PRODUCT_VARIANT_SKU_NOT_FOUND, sku);
        }
        return sku.trim().toUpperCase();
    }

    private void validatePurchasable(ProductVariant variant) {
        Product product = variant.getProduct();
        if (product == null) {
            throw new CustomException(ErrorCode.PRODUCT_NOT_FOUND, "unknown");
        }

        if (product.getStatus() == ProductStatus.INACTIVE) {
            throw new CustomException(ErrorCode.CART_PRODUCT_UNAVAILABLE, product.getName());
        }
    }

    private void validateStock(ProductVariant variant, int requestedQuantity) {
        if (requestedQuantity <= 0) {
            throw new CustomException(ErrorCode.PRODUCT_INVALID_DEDUCT_QUANTITY);
        }

        int available = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        if (available < requestedQuantity) {
            throw new CustomException(
                    ErrorCode.PRODUCT_INSUFFICIENT_STOCK,
                    variant.getSku(),
                    available,
                    requestedQuantity
            );
        }
    }

    private BigDecimal resolveEffectivePrice(ProductVariant variant) {
        if (variant.getSalePrice() != null) {
            return variant.getSalePrice();
        }
        return variant.getPrice();
    }

    private CartResponse buildCartResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .sorted(Comparator.comparing(CartItem::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::buildCartItemResponse)
                .toList();

        int totalItems = items.stream()
                .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                .sum();

        BigDecimal subtotal = items.stream()
                .map(CartItemResponse::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .cartId(cart.getCartId())
                .items(items)
                .totalItems(totalItems)
                .subtotal(subtotal)
                .build();
    }

    private CartItemResponse buildCartItemResponse(CartItem cartItem) {
        ProductVariant variant = cartItem.getVariant();
        Product product = variant.getProduct();
        VariantAttributes attributes = variant.getAttributes();

        int stockQuantity = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        int quantity = cartItem.getQuantity() != null ? cartItem.getQuantity() : 0;
        BigDecimal unitPrice = cartItem.getUnitPrice() != null ? cartItem.getUnitPrice() : BigDecimal.ZERO;

        return CartItemResponse.builder()
                .cartItemId(cartItem.getCartItemId())
                .variantId(variant.getVariantId())
                .sku(variant.getSku())
                .productId(product != null ? product.getProductId() : null)
                .productName(product != null ? product.getName() : null)
                .thumbnailUrl(product != null ? product.getThumbnailUrl() : null)
                .size(attributes != null ? attributes.getSize() : null)
                .volume(attributes != null ? attributes.getVolume() : null)
                .color(attributes != null ? attributes.getColor() : null)
                .unitPrice(unitPrice)
                .quantity(quantity)
                .lineTotal(unitPrice.multiply(BigDecimal.valueOf(quantity)))
                .stockQuantity(stockQuantity)
                .inStock(stockQuantity >= quantity)
                .build();
    }
}
