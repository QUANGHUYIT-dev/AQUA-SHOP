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
@Table(name = "banners")
public class Banner extends BaseEntity {

    @Id
    @GenericIdCode(prefix = "BNR", seqName = "banner_seq")
    @Column(name = "banner_id", length = 10)
    String bannerId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id", nullable = false)
    Brand brand;

    @Column(name = "title", length = 200)
    String title;

    @Column(name = "subtitle", length = 300)
    String subtitle;

    @Column(name = "image_url", nullable = false, length = 500)
    String imageUrl;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    Integer sortOrder = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    Boolean isActive = true;
}
