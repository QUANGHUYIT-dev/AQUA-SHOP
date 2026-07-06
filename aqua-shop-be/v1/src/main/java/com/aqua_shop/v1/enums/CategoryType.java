package com.aqua_shop.v1.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum CategoryType {
    PLANT("PLANT", "Cây thủy sinh"),
    FISH("FISH", "Sinh vật cảnh"), // Đổi thành Sinh vật cảnh để bao gồm cả cá, tép, ốc
    EQUIPMENT("EQUIPMENT", "Thiết bị thủy sinh"), // Đèn, lọc, bình CO2... nên tách riêng khỏi phụ kiện nhỏ
    CHEMICAL("CHEMICAL", "Thuốc & Hóa chất xử lý"), // 🌟 THÊM: Thuốc cá, vi sinh, diệt rêu, khử clo
    SUBSTRATE("SUBSTRATE", "Đất nền & Dinh dưỡng"), // 🌟 THÊM: Phân nền, cốt nền, phân nước châm cây
    FOOD("FOOD", "Thức ăn sinh vật"), // 🌟 THÊM: Cám cá, thức ăn tép, trùng huyết đông lạnh
    ACCESSORY("ACCESSORY", "Phụ kiện nhỏ");

    String code;
    String displayName;

    CategoryType(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
}
