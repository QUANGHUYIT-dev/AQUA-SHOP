package com.aqua_shop.v1.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum FishTemperament {
    PEACEFUL("PEACEFUL", "Hiền lành"),
    SEMI_AGGRESSIVE("SEMI_AGGRESSIVE", "Hơi hung"),
    AGGRESSIVE("AGGRESSIVE", "Hung dữ");

    String code;
    String displayName;

    FishTemperament(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
}
