package com.aqua_shop.v1.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Embeddable
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantAttributes {

    @Column(name = "attr_size", length = 50)
    String size;

    // The tich ben trong cua be
    @Column(name = "attr_volume", length = 50)
    String volume;

    @Column(name = "attr_color", length = 50)
    String color;
}
