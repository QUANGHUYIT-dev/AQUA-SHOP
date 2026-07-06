package com.aqua_shop.v1.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum ProductStatus {
    ACTIVE("ACTIVE", "Đang bán"),
    INACTIVE("INACTIVE", "Ngừng bán"),
    OUT_OF_STOCK("OUT_OF_STOCK", "Hết hàng");

    String code;
    String displayName;

    ProductStatus(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
}
