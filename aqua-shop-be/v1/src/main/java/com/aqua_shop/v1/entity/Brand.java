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
@Table(name = "brands")
public class Brand extends BaseEntity {

    @Id
    @GenericIdCode(prefix = "BRD", seqName = "brand_seq")
    @Column(name = "brand_id", length = 10)
    String brandId;

    @Column(name = "name", nullable = false, unique = true, length = 150)
    String name;

    @Column(name = "logo_url", length = 500)
    String logoUrl;

    @Column(name = "slug", unique = true, nullable = false, length = 150)
    String slug;

    @Column(name = "country", length = 100)
    String country;

    @Column(name = "description", length = 500)
    String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    Boolean isActive = true;
}
