package com.aqua_shop.v1.entity;

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
@Table(name = "product_images")
public class ProductImage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    Long imageId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    Product product;

    @Column(name = "image_url", nullable = false, length = 500)
    String imageUrl;

    @Column(name = "public_id", length = 300)
    String publicId;

    @Column(name = "alt_text", length = 200)
    String altText;

    @Column(name = "sort_order")
    @Builder.Default
    Integer sortOrder = 0;

    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    Boolean isPrimary = false;
}
