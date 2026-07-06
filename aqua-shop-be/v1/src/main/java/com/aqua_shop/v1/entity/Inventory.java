package com.aqua_shop.v1.entity;

import com.aqua_shop.v1.annotations.GenericIdCode;
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
@Table(name = "inventories")
public class Inventory extends BaseEntity {

    @Id
    @GenericIdCode(prefix = "INV", seqName = "inventory_seq")
    @Column(name = "inventory_id", length = 10)
    String inventoryId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false, unique = true)
    ProductVariant variant;

    @Column(name = "sku", nullable = false, unique = true, length = 50)
    String sku;

    @Column(name = "quantity_on_hand", nullable = false)
    @Builder.Default
    Integer quantityOnHand = 0;

    /** Số lượng đang giữ cho đơn online chưa hoàn tất */
    @Column(name = "quantity_on_hold", nullable = false)
    @Builder.Default
    Integer quantityOnHold = 0;
}
