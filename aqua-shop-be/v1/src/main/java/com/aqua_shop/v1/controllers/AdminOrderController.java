package com.aqua_shop.v1.controllers;

import com.aqua_shop.v1.dto.ApiResponse;
import com.aqua_shop.v1.dto.req.UpdateOrderStatusRequest;
import com.aqua_shop.v1.dto.res.AdminOrderSummaryResponse;
import com.aqua_shop.v1.dto.res.OrderResponse;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin Order", description = "Quản lý đơn hàng — yêu cầu quyền ADMIN/STAFF/WAREHOUSE")
@RestController
@RequestMapping("/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @Operation(summary = "Danh sách đơn hàng (admin)")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminOrderSummaryResponse>>> getAdminOrders(
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 10, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.<Page<AdminOrderSummaryResponse>>builder()
                .message("Get admin orders successfully")
                .data(orderService.getAdminOrders(status, pageable))
                .build());
    }

    @Operation(summary = "Chi tiết đơn hàng (admin)")
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getAdminOrderById(@PathVariable String orderId) {
        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .message("Get admin order successfully")
                .data(orderService.getAdminOrderById(orderId))
                .build());
    }

    @Operation(summary = "Cập nhật trạng thái đơn", description = "Hủy đơn sẽ hoàn kho + hoàn ví nếu đã thanh toán WALLET")
    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable String orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .message("Update order status successfully")
                .data(orderService.updateOrderStatus(orderId, request))
                .build());
    }
}
