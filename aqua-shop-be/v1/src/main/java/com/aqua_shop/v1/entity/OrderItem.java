package com.aqua_shop.v1.entity;

import com.aqua_shop.v1.annotations.GenericIdCode;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "order_items")
public class OrderItem extends BaseEntity {

    @Id
    @GenericIdCode(prefix = "OIT", seqName = "order_item_seq")
    @Column(name = "order_item_id", length = 10)
    String orderItemId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    ProductVariant variant;

    @Column(name = "sku", nullable = false, length = 50)
    String sku;

    @Column(name = "product_id", length = 10)
    String productId;

    @Column(name = "product_name", length = 300)
    String productName;

    @Column(name = "thumbnail_url", length = 500)
    String thumbnailUrl;

    @Column(name = "variant_size", length = 50)
    String variantSize;

    @Column(name = "variant_volume", length = 50)
    String variantVolume;

    @Column(name = "variant_color", length = 50)
    String variantColor;

    @Column(name = "quantity", nullable = false)
    Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    BigDecimal unitPrice;

    @Column(name = "line_total", nullable = false, precision = 14, scale = 2)
    BigDecimal lineTotal;
}
