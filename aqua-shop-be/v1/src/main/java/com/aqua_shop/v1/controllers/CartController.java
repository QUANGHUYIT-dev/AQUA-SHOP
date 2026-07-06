package com.aqua_shop.v1.controllers;

import com.aqua_shop.v1.dto.ApiResponse;
import com.aqua_shop.v1.dto.req.AddCartItemRequest;
import com.aqua_shop.v1.dto.req.UpdateCartItemRequest;
import com.aqua_shop.v1.dto.res.CartItemResponse;
import com.aqua_shop.v1.dto.res.CartResponse;
import com.aqua_shop.v1.services.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Cart", description = "Giỏ hàng — yêu cầu đăng nhập. Gửi variant.sku khi thêm sản phẩm.")
@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @Operation(summary = "Xem giỏ hàng", description = "Tự tạo giỏ trống nếu chưa có")
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart() {
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .message("Get cart successfully")
                .data(cartService.getCart())
                .build());
    }

    @Operation(summary = "Thêm vào giỏ", description = "Trùng SKU → cộng dồn quantity. Không trừ kho — chỉ validate tồn.")
    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartItemResponse>> addItem(@Valid @RequestBody AddCartItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<CartItemResponse>builder()
                .message("Add cart item successfully")
                .data(cartService.addItem(request))
                .build());
    }

    @Operation(summary = "Cập nhật số lượng dòng")
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartItemResponse>> updateItem(
            @PathVariable String cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(ApiResponse.<CartItemResponse>builder()
                .message("Update cart item successfully")
                .data(cartService.updateItem(cartItemId, request))
                .build());
    }

    @Operation(summary = "Xóa 1 dòng khỏi giỏ")
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<Void>> removeItem(@PathVariable String cartItemId) {
        cartService.removeItem(cartItemId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Remove cart item successfully")
                .build());
    }

    @Operation(summary = "Xóa toàn bộ giỏ")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Clear cart successfully")
                .build());
    }
}
