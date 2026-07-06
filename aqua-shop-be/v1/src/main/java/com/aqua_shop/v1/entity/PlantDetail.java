package com.aqua_shop.v1.entity;

import com.aqua_shop.v1.enums.LightLevel;
import com.aqua_shop.v1.enums.PlantDifficulty;
import com.aqua_shop.v1.enums.PlantPlacement;
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
@Table(name = "plant_details")
public class PlantDetail extends BaseEntity {

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
    @Column(name = "difficulty", length = 20)
    PlantDifficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(name = "light_level", length = 20)
    LightLevel lightLevel;

    @Column(name = "co2_required", nullable = false)
    @Builder.Default
    Boolean co2Required = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "placement", length = 20)
    PlantPlacement placement;

    @Column(name = "growth_rate", length = 50)
    String growthRate;

    @Column(name = "max_height_cm", precision = 6, scale = 1)
    BigDecimal maxHeightCm;
}
