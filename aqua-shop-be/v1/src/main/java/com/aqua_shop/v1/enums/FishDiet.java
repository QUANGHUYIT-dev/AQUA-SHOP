package com.aqua_shop.v1.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum FishDiet {
    HERBIVORE("HERBIVORE", "Ăn rau"),
    OMNIVORE("OMNIVORE", "Ăn tạp"),
    CARNIVORE("CARNIVORE", "Ăn thịt");

    String code;
    String displayName;

    FishDiet(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
}
