package com.aqua_shop.v1.entity;

import com.aqua_shop.v1.annotations.GenericIdCode;
import com.aqua_shop.v1.enums.OrderHistoryActorType;
import com.aqua_shop.v1.enums.OrderStatus;
import com.aqua_shop.v1.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "order_histories")
public class OrderHistory extends BaseEntity {

    @Id
    @GenericIdCode(prefix = "OHT", seqName = "order_history_seq")
    @Column(name = "order_history_id", length = 10)
    String orderHistoryId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 20)
    OrderStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 20)
    OrderStatus toStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_payment_status", length = 20)
    PaymentStatus fromPaymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_payment_status", length = 20)
    PaymentStatus toPaymentStatus;

    @Column(name = "note", length = 500)
    String note;

    @Column(name = "changed_by", length = 50)
    String changedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "actor_type", nullable = false, length = 20)
    OrderHistoryActorType actorType;
}
