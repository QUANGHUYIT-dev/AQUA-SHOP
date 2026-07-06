package com.aqua_shop.v1.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum ProductType {
    PLANT("PLANT", "Cây thủy sinh"),
    FISH("FISH", "Cá thủy sinh"),
    ACCESSORY("ACCESSORY", "Phụ kiện cá cảnh");

    String code;
    String displayName;

    ProductType(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
}
