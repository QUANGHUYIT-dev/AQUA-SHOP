package com.aqua_shop.v1.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum InventoryChangeType {
    ORDER_HOLD("ORDER_HOLD", "Giữ hàng khi đặt online"),
    ORDER_HOLD_RELEASE("ORDER_HOLD_RELEASE", "Giải phóng hàng giữ (hủy/hoàn đơn)"),
    ORDER_DEDUCT("ORDER_DEDUCT", "Trừ tồn kho thật khi hoàn tất đơn"),
    ORDER_RESTORE("ORDER_RESTORE", "Hoàn kho khi hủy đơn"),
    MANUAL_IN("MANUAL_IN", "Nhập kho thủ công"),
    MANUAL_OUT("MANUAL_OUT", "Xuất kho thủ công"),
    MANUAL_ADJUST("MANUAL_ADJUST", "Điều chỉnh tồn kho"),
    SYNC_INITIAL("SYNC_INITIAL", "Khởi tạo tồn kho từ variant");

    String code;
    String displayName;

    InventoryChangeType(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
}
