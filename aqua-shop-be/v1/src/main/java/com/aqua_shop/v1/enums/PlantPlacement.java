package com.aqua_shop.v1.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum PlantPlacement {
    FOREGROUND("FOREGROUND", "Tiền cảnh"),
    MIDGROUND("MIDGROUND", "Trung cảnh"),
    BACKGROUND("BACKGROUND", "Hậu cảnh"),
    FLOATING("FLOATING", "Cây nổi"),
    MOSS("MOSS", "Rêu / Moss");

    String code;
    String displayName;

    PlantPlacement(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
}
