package com.aqua_shop.v1.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.util.Arrays;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum MembershipTier {

    BRONZE("BRONZE", "Đồng", 0),
    SILVER("SILVER", "Bạc", 1000),
    GOLD("GOLD", "Vàng", 5000),
    PLATINUM("PLATINUM", "Bạch kim", 20000),
    DIAMOND("DIAMOND", "Kim cương", 50000);

    String code;
    String displayName;
    int minPoints;

    MembershipTier(String code, String displayName, int minPoints) {
        this.code = code;
        this.displayName = displayName;
        this.minPoints = minPoints;
    }

    /**
     * Rule: chọn tier cao nhất có minPoints <= points.
     */
    public static MembershipTier fromPoints(int points) {
        if (points < 0)
            points = 0;

        int finalPoints = points;
        return Arrays.stream(values())
                .sorted((a, b) -> Integer.compare(b.minPoints, a.minPoints))
                .filter(t -> finalPoints >= t.minPoints)
                .findFirst()
                .orElse(BRONZE);
    }

    public static MembershipTier fromCode(String code) {
        if (code == null || code.isBlank())
            return BRONZE;

        return Arrays.stream(values())
                .filter(t -> t.code.equalsIgnoreCase(code))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown MembershipTier code: " + code));
    }
}