package com.aqua_shop.v1.services;

import com.aqua_shop.v1.dto.res.OrderHistoryResponse;
import com.aqua_shop.v1.entity.Order;
import com.aqua_shop.v1.enums.OrderHistoryActorType;
import com.aqua_shop.v1.enums.OrderStatus;
import com.aqua_shop.v1.enums.PaymentStatus;

import java.util.List;

public interface OrderHistoryService {

    void recordOrderCreated(Order order, String customerId);

    void recordOrderCancelled(
            Order order,
            OrderStatus previousStatus,
            PaymentStatus previousPaymentStatus,
            String customerId,
            String reason);

    void recordStatusChange(
            Order order,
            OrderStatus fromStatus,
            OrderStatus toStatus,
            PaymentStatus fromPaymentStatus,
            PaymentStatus toPaymentStatus,
            String note,
            String changedBy,
            OrderHistoryActorType actorType
    );

    List<OrderHistoryResponse> getOrderHistory(String orderId, String customerId);
}
