package com.aqua_shop.v1.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum OrderType {
    ONLINE("ONLINE", "Đặt hàng online"),
    OFFLINE("OFFLINE", "Bán tại quầy (POS)");

    String code;
    String displayName;

    OrderType(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
}
