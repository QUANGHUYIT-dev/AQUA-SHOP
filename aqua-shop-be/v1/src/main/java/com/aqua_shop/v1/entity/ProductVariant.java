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
@Table(name = "product_variants")
public class ProductVariant extends BaseEntity {

    @Id
    @GenericIdCode(prefix = "VAR", seqName = "product_variant_seq")
    @Column(name = "variant_id", length = 10)
    String variantId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    Product product;

    @Column(name = "sku", nullable = false, unique = true, length = 50)
    String sku;

    @Embedded
    @Builder.Default
    VariantAttributes attributes = new VariantAttributes();

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    BigDecimal price;

    @Column(name = "sale_price", precision = 12, scale = 2)
    BigDecimal salePrice;

    @Column(name = "stock_quantity", nullable = false)
    @Builder.Default
    Integer stockQuantity = 0;

    @Column(name = "weight_grams", precision = 8, scale = 2)
    BigDecimal weightGrams;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    Boolean isDefault = false;
}
