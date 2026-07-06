package com.aqua_shop.v1.entity;

import com.aqua_shop.v1.annotations.GenericIdCode;
import com.aqua_shop.v1.enums.ProductStatus;
import com.aqua_shop.v1.enums.ProductType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "products")
public class Product extends BaseEntity {

    @Id
    @GenericIdCode(prefix = "PRD", seqName = "product_seq")
    @Column(name = "product_id", length = 10)
    String productId;

    @Column(name = "name", nullable = false, length = 300)
    String name;

    @Column(name = "model_code", length = 50)
    String modelCode;

    @Column(name = "slug", nullable = false, unique = true, length = 350)
    String slug;

    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @Column(name = "short_description", length = 500)
    String shortDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false, length = 20)
    ProductType productType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    Brand brand;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    ProductStatus status = ProductStatus.ACTIVE;

    @Column(name = "thumbnail_url", length = 500)
    String thumbnailUrl;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    PlantDetail plantDetail;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    FishDetail fishDetail;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    AccessoryDetail accessoryDetail;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<ProductVariant> variants = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<ProductImage> images = new ArrayList<>();
}
