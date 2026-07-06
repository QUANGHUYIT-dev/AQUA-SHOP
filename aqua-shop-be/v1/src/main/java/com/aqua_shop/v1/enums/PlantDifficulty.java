package com.aqua_shop.v1.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum PlantDifficulty {
    EASY("EASY", "Dễ"),
    MEDIUM("MEDIUM", "Trung bình"),
    HARD("HARD", "Khó");

    String code;
    String displayName;

    PlantDifficulty(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
}
