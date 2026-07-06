package com.aqua_shop.v1.entity;

import com.aqua_shop.v1.enums.FishDiet;
import com.aqua_shop.v1.enums.FishTemperament;
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
@Table(name = "fish_details")
public class FishDetail extends BaseEntity {

    @Id
    @Column(name = "product_id", length = 10)
    String productId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "product_id")
    Product product;

    @Column(name = "scientific_name", length = 200)
    String scientificName;

    @Enumerated(EnumType.STRING)
    @Column(name = "temperament", length = 20)
    FishTemperament temperament;

    @Enumerated(EnumType.STRING)
    @Column(name = "diet", length = 20)
    FishDiet diet;

    @Column(name = "min_tank_size_liters")
    Integer minTankSizeLiters;

    @Column(name = "water_temp_min_c", precision = 4, scale = 1)
    BigDecimal waterTempMinC;

    @Column(name = "water_temp_max_c", precision = 4, scale = 1)
    BigDecimal waterTempMaxC;

    @Column(name = "ph_min", precision = 3, scale = 1)
    BigDecimal phMin;

    @Column(name = "ph_max", precision = 3, scale = 1)
    BigDecimal phMax;

    @Column(name = "max_size_cm", precision = 5, scale = 1)
    BigDecimal maxSizeCm;

    @Column(name = "is_schooling", nullable = false)
    @Builder.Default
    Boolean isSchooling = false;

    @Column(name = "min_school_size")
    Integer minSchoolSize;
}
