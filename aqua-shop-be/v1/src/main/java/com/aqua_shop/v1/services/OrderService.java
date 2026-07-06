package com.aqua_shop.v1.services;

import com.aqua_shop.v1.dto.req.CancelOrderRequest;
import com.aqua_shop.v1.dto.req.CheckoutRequest;
import com.aqua_shop.v1.dto.req.CreateOrderRequest;
import com.aqua_shop.v1.dto.req.UpdateOrderStatusRequest;
import com.aqua_shop.v1.dto.res.AdminOrderSummaryResponse;
import com.aqua_shop.v1.dto.res.OrderHistoryResponse;
import com.aqua_shop.v1.dto.res.OrderResponse;
import com.aqua_shop.v1.dto.res.OrderSummaryResponse;
import com.aqua_shop.v1.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {

    OrderResponse checkout(CheckoutRequest request);

    OrderResponse createOrder(CreateOrderRequest request);

    OrderResponse getOrderById(String orderId);

    Page<OrderSummaryResponse> getMyOrders(OrderStatus status, Pageable pageable);

    OrderResponse cancelOrder(String orderId, CancelOrderRequest request);

    List<OrderHistoryResponse> getOrderHistory(String orderId);

    Page<AdminOrderSummaryResponse> getAdminOrders(OrderStatus status, Pageable pageable);

    OrderResponse getAdminOrderById(String orderId);

    OrderResponse updateOrderStatus(String orderId, UpdateOrderStatusRequest request);
}
