package com.aqua_shop.v1.services.Impl;

import com.aqua_shop.v1.dto.res.OrderHistoryResponse;
import com.aqua_shop.v1.entity.Order;
import com.aqua_shop.v1.entity.OrderHistory;
import com.aqua_shop.v1.enums.OrderHistoryActorType;
import com.aqua_shop.v1.enums.OrderStatus;
import com.aqua_shop.v1.enums.PaymentStatus;
import com.aqua_shop.v1.exceptions.CustomException;
import com.aqua_shop.v1.exceptions.ErrorCode;
import com.aqua_shop.v1.repositories.OrderHistoryRepository;
import com.aqua_shop.v1.repositories.OrderRepository;
import com.aqua_shop.v1.services.OrderHistoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderHistoryServiceImpl implements OrderHistoryService {

    OrderHistoryRepository orderHistoryRepository;
    OrderRepository orderRepository;

    @Override
    @Transactional
    public void recordOrderCreated(Order order, String customerId) {
        String note = order.getStatus() == OrderStatus.CONFIRMED
                ? "Đặt hàng thành công — đã thanh toán ví"
                : "Đặt hàng thành công — chờ xác nhận";

        recordStatusChange(
                order,
                null,
                order.getStatus(),
                null,
                order.getPaymentStatus(),
                note,
                customerId,
                OrderHistoryActorType.CUSTOMER
        );
    }

    @Override
    @Transactional
    public void recordOrderCancelled(
            Order order,
            OrderStatus previousStatus,
            PaymentStatus previousPaymentStatus,
            String customerId,
            String reason) {
        recordStatusChange(
                order,
                previousStatus,
                OrderStatus.CANCELLED,
                previousPaymentStatus,
                order.getPaymentStatus(),
                "Khách hàng hủy đơn: " + reason,
                customerId,
                OrderHistoryActorType.CUSTOMER
        );
    }

    @Override
    @Transactional
    public void recordStatusChange(
            Order order,
            OrderStatus fromStatus,
            OrderStatus toStatus,
            PaymentStatus fromPaymentStatus,
            PaymentStatus toPaymentStatus,
            String note,
            String changedBy,
            OrderHistoryActorType actorType) {
        OrderHistory history = OrderHistory.builder()
                .order(order)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .fromPaymentStatus(fromPaymentStatus)
                .toPaymentStatus(toPaymentStatus)
                .note(note)
                .changedBy(changedBy)
                .actorType(actorType)
                .build();

        order.getHistories().add(history);
        orderHistoryRepository.save(history);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderHistoryResponse> getOrderHistory(String orderId, String customerId) {
        orderRepository.findWithItemsByOrderIdAndCustomer_CustomerId(orderId, customerId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND, orderId));

        return orderHistoryRepository.findByOrder_OrderIdOrderByCreatedAtAsc(orderId).stream()
                .map(this::toResponse)
                .toList();
    }

    private OrderHistoryResponse toResponse(OrderHistory history) {
        return OrderHistoryResponse.builder()
                .orderHistoryId(history.getOrderHistoryId())
                .fromStatus(history.getFromStatus())
                .toStatus(history.getToStatus())
                .fromPaymentStatus(history.getFromPaymentStatus())
                .toPaymentStatus(history.getToPaymentStatus())
                .note(history.getNote())
                .changedBy(history.getChangedBy())
                .actorType(history.getActorType())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
