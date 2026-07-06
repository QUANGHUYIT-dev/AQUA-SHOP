package com.aqua_shop.v1.entity;

import com.aqua_shop.v1.enums.AccessoryType;
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
@Table(name = "accessory_details")
public class AccessoryDetail extends BaseEntity {

    @Id
    @Column(name = "product_id", length = 10)
    String productId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "product_id")
    Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "accessory_type", nullable = false, length = 20)
    AccessoryType accessoryType;

    @Column(name = "material", length = 100)
    String material;

    @Column(name = "compatible_tank_min_liters")
    Integer compatibleTankMinLiters;

    @Column(name = "compatible_tank_max_liters")
    Integer compatibleTankMaxLiters;

    @Column(name = "power_wattage", precision = 6, scale = 1)
    BigDecimal powerWattage;

    @Column(name = "flow_rate_lph")
    Integer flowRateLph;

    @Column(name = "warranty_months")
    Integer warrantyMonths;

    @Column(name = "specifications", length = 1000)
    String specifications;
}
