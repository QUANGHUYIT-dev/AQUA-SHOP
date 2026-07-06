package com.aqua_shop.v1.entity;

import com.aqua_shop.v1.annotations.GenericIdCode;
import com.aqua_shop.v1.enums.InventoryChangeType;
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
@Table(name = "inventory_histories")
public class InventoryHistory extends BaseEntity {

    @Id
    @GenericIdCode(prefix = "IVH", seqName = "inventory_history_seq")
    @Column(name = "inventory_history_id", length = 10)
    String inventoryHistoryId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inventory_id", nullable = false)
    Inventory inventory;

    @Enumerated(EnumType.STRING)
    @Column(name = "change_type", nullable = false, length = 30)
    InventoryChangeType changeType;

    @Column(name = "quantity_change", nullable = false)
    Integer quantityChange;

    @Column(name = "quantity_before", nullable = false)
    Integer quantityBefore;

    @Column(name = "quantity_after", nullable = false)
    Integer quantityAfter;

    @Column(name = "reference_type", length = 30)
    String referenceType;

    @Column(name = "reference_id", length = 50)
    String referenceId;

    @Column(name = "note", length = 500)
    String note;

    @Column(name = "changed_by", length = 50)
    String changedBy;
}
