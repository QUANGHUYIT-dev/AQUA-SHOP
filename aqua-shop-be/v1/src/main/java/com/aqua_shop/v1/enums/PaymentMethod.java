package com.aqua_shop.v1.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum PaymentMethod {
    COD("COD", "Thanh toán khi nhận hàng"),
    WALLET("WALLET", "Ví nội bộ"),
    BANK_TRANSFER("BANK_TRANSFER", "Chuyển khoản ngân hàng"),
    CASH("CASH", "Tiền mặt tại quầy");

    String code;
    String displayName;

    PaymentMethod(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
}
