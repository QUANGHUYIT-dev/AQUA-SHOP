package com.aqua_shop.v1.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum AccessoryType {
    FILTER("FILTER", "Lọc nước"),
    LIGHT("LIGHT", "Đèn chiếu sáng"),
    SUBSTRATE("SUBSTRATE", "Nền / Phân nền"),
    CO2("CO2", "Hệ thống CO2"),
    DECORATION("DECORATION", "Trang trí"),
    TOOL("TOOL", "Dụng cụ"),
    FOOD("FOOD", "Thức ăn"),
    MEDICATION("MEDICATION", "Thuốc / Xử lý nước"),
    TANK("TANK", "Bể / Hồ"),
    OTHER("OTHER", "Khác");

    String code;
    String displayName;

    AccessoryType(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
}
