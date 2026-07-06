package com.aqua_shop.v1.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum OrderStatus {
    PENDING("PENDING", "Chờ xác nhận"),
    CONFIRMED("CONFIRMED", "Đã xác nhận"),
    PROCESSING("PROCESSING", "Đang xử lý"),
    SHIPPING("SHIPPING", "Đang giao"),
    DELIVERED("DELIVERED", "Đã giao"),
    COMPLETED("COMPLETED", "Hoàn tất"),
    CANCELLED("CANCELLED", "Đã hủy");

    String code;
    String displayName;

    OrderStatus(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
}
