package com.aqua_shop.v1.dto.res;

import com.aqua_shop.v1.enums.InventoryChangeType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@Schema(description = "Lịch sử biến động tồn kho")
public class InventoryHistoryResponse {

    @Schema(description = "ID bản ghi", example = "IVH0001")
    String inventoryHistoryId;

    @Schema(description = "SKU")
    String sku;

    @Schema(description = "Loại thay đổi")
    InventoryChangeType changeType;

    @Schema(description = "Số lượng thay đổi (+/-)")
    Integer quantityChange;

    @Schema(description = "Tồn trước")
    Integer quantityBefore;

    @Schema(description = "Tồn sau")
    Integer quantityAfter;

    @Schema(description = "Loại tham chiếu: ORDER, MANUAL, SYSTEM")
    String referenceType;

    @Schema(description = "ID tham chiếu (vd: ORD0001)")
    String referenceId;

    @Schema(description = "Ghi chú")
    String note;

    @Schema(description = "Người thực hiện")
    String changedBy;

    @Schema(description = "Thời điểm")
    LocalDateTime createdAt;
}
