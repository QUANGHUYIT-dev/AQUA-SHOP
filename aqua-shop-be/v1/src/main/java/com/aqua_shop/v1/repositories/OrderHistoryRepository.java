package com.aqua_shop.v1.repositories;

import com.aqua_shop.v1.entity.OrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderHistoryRepository extends JpaRepository<OrderHistory, String> {

    List<OrderHistory> findByOrder_OrderIdOrderByCreatedAtAsc(String orderId);
}
