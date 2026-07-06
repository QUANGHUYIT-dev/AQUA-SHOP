package com.aqua_shop.v1.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum OrderHistoryActorType {
    CUSTOMER("CUSTOMER", "Khách hàng"),
    ADMIN("ADMIN", "Quản trị viên"),
    SYSTEM("SYSTEM", "Hệ thống");

    String code;
    String displayName;

    OrderHistoryActorType(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
}
