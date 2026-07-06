package com.aqua_shop.v1.entity;

import com.aqua_shop.v1.annotations.GenericIdCode;
import com.aqua_shop.v1.enums.OrderStatus;
import com.aqua_shop.v1.enums.OrderType;
import com.aqua_shop.v1.enums.PaymentMethod;
import com.aqua_shop.v1.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "orders")
public class Order extends BaseEntity {

    @Id
    @GenericIdCode(prefix = "ORD", seqName = "order_seq")
    @Column(name = "order_id", length = 10)
    String orderId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    OrderStatus status = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false, length = 20)
    @Builder.Default
    OrderType orderType = OrderType.ONLINE;

    /** true khi đã trừ tồn thật (POS ngay, hoặc online sau COMPLETED) */
    @Column(name = "inventory_settled", nullable = false)
    @Builder.Default
    Boolean inventorySettled = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 50)
    @Builder.Default
    PaymentMethod paymentMethod = PaymentMethod.COD;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    @Builder.Default
    PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "shipping_address", nullable = false, length = 500)
    String shippingAddress;

    @Column(name = "receiver_name", nullable = false, length = 200)
    String receiverName;

    @Column(name = "receiver_phone", nullable = false, length = 20)
    String receiverPhone;

    @Column(name = "note", length = 500)
    String note;

    @Column(name = "subtotal", nullable = false, precision = 14, scale = 2)
    BigDecimal subtotal;

    @Column(name = "shipping_fee", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
    BigDecimal totalAmount;

    @Column(name = "total_items", nullable = false)
    @Builder.Default
    Integer totalItems = 0;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<OrderHistory> histories = new ArrayList<>();
}
