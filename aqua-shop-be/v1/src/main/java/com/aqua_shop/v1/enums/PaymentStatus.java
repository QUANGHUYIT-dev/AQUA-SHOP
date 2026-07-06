package com.aqua_shop.v1.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum PaymentStatus {
    PENDING("PENDING", "Chờ thanh toán"),
    PAID("PAID", "Đã thanh toán"),
    FAILED("FAILED", "Thanh toán thất bại"),
    REFUNDED("REFUNDED", "Đã hoàn tiền");

    String code;
    String displayName;

    PaymentStatus(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
}
