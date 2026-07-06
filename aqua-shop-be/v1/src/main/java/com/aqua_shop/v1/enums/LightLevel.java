package com.aqua_shop.v1.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum LightLevel {
    LOW("LOW", "Ánh sáng thấp"),
    MEDIUM("MEDIUM", "Ánh sáng trung bình"),
    HIGH("HIGH", "Ánh sáng cao");

    String code;
    String displayName;

    LightLevel(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
}
