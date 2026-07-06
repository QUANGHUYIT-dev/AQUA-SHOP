package com.aqua_shop.v1.controllers;

import com.aqua_shop.v1.dto.ApiResponse;
import com.aqua_shop.v1.dto.req.CancelOrderRequest;
import com.aqua_shop.v1.dto.req.CheckoutRequest;
import com.aqua_shop.v1.dto.req.CreateOrderRequest;
import com.aqua_shop.v1.dto.res.OrderHistoryResponse;
import com.aqua_shop.v1.dto.res.OrderResponse;
import com.aqua_shop.v1.dto.res.OrderSummaryResponse;
import com.aqua_shop.v1.enums.OrderStatus;
import com.aqua_shop.v1.services.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Order", description = "Đặt hàng từ giỏ — yêu cầu đăng nhập")
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "Checkout từ giỏ hàng", description = "Validate tồn → tạo đơn ONLINE → giữ hàng (HOLD) → xóa giỏ")
    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(@Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<OrderResponse>builder()
                .message("Checkout successfully")
                .data(orderService.checkout(request))
                .build());
    }

    @Operation(summary = "Tạo đơn trực tiếp (POS)", description = "orderType=OFFLINE — trừ kho ngay, yêu cầu quyền staff")
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<OrderResponse>builder()
                .message("Create order successfully")
                .data(orderService.createOrder(request))
                .build());
    }

    @Operation(summary = "Danh sách đơn của tôi")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderSummaryResponse>>> getMyOrders(
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 10, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.<Page<OrderSummaryResponse>>builder()
                .message("Get orders successfully")
                .data(orderService.getMyOrders(status, pageable))
                .build());
    }

    @Operation(summary = "Chi tiết đơn hàng")
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable String orderId) {
        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .message("Get order successfully")
                .data(orderService.getOrderById(orderId))
                .build());
    }

    @Operation(summary = "Lịch sử đơn hàng", description = "Timeline thay đổi trạng thái đơn + thanh toán")
    @GetMapping("/{orderId}/history")
    public ResponseEntity<ApiResponse<List<OrderHistoryResponse>>> getOrderHistory(@PathVariable String orderId) {
        return ResponseEntity.ok(ApiResponse.<List<OrderHistoryResponse>>builder()
                .message("Get order history successfully")
                .data(orderService.getOrderHistory(orderId))
                .build());
    }

    @Operation(summary = "Hủy đơn", description = "Chỉ PENDING/CONFIRMED. Hoàn kho + hoàn ví nếu đã trả bằng WALLET")
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable String orderId,
            @Valid @RequestBody CancelOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .message("Cancel order successfully")
                .data(orderService.cancelOrder(orderId, request))
                .build());
    }
}
