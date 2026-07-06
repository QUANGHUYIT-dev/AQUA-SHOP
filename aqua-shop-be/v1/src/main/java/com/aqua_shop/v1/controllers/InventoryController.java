package com.aqua_shop.v1.controllers;

import com.aqua_shop.v1.dto.ApiResponse;
import com.aqua_shop.v1.dto.req.AdjustInventoryRequest;
import com.aqua_shop.v1.dto.req.SetInventoryQuantityRequest;
import com.aqua_shop.v1.dto.res.InventoryHistoryResponse;
import com.aqua_shop.v1.dto.res.InventoryResponse;
import com.aqua_shop.v1.entity.Customer;
import com.aqua_shop.v1.services.AuthenticationService;
import com.aqua_shop.v1.services.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Inventory", description = "Quản lý tồn kho theo SKU + lịch sử biến động")
@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final AuthenticationService authenticationService;

    @Operation(summary = "Danh sách tồn kho", description = "Filter theo SKU (contains)")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<InventoryResponse>>> listInventories(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, page = 0, sort = "sku", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.<Page<InventoryResponse>>builder()
                .message("Get inventories successfully")
                .data(inventoryService.listInventories(search, pageable))
                .build());
    }

    @Operation(summary = "Tồn kho theo SKU")
    @GetMapping("/sku/{sku}")
    public ResponseEntity<ApiResponse<InventoryResponse>> getBySku(@PathVariable String sku) {
        return ResponseEntity.ok(ApiResponse.<InventoryResponse>builder()
                .message("Get inventory successfully")
                .data(inventoryService.getInventoryBySku(sku))
                .build());
    }

    @Operation(summary = "Tồn kho theo ID")
    @GetMapping("/{inventoryId}")
    public ResponseEntity<ApiResponse<InventoryResponse>> getById(@PathVariable String inventoryId) {
        return ResponseEntity.ok(ApiResponse.<InventoryResponse>builder()
                .message("Get inventory successfully")
                .data(inventoryService.getInventoryById(inventoryId))
                .build());
    }

    @Operation(summary = "Lịch sử biến động tồn kho theo SKU")
    @GetMapping("/sku/{sku}/history")
    public ResponseEntity<ApiResponse<List<InventoryHistoryResponse>>> getHistoryBySku(@PathVariable String sku) {
        return ResponseEntity.ok(ApiResponse.<List<InventoryHistoryResponse>>builder()
                .message("Get inventory history successfully")
                .data(inventoryService.getInventoryHistoryBySku(sku))
                .build());
    }

    @Operation(summary = "Điều chỉnh tồn kho thủ công", description = "quantityChange dương = nhập, âm = xuất")
    @PutMapping("/sku/{sku}/adjust")
    public ResponseEntity<ApiResponse<InventoryResponse>> adjustStock(
            @PathVariable String sku,
            @Valid @RequestBody AdjustInventoryRequest request) {
        Customer customer = authenticationService.getCurrentCustomer();
        return ResponseEntity.ok(ApiResponse.<InventoryResponse>builder()
                .message("Adjust inventory successfully")
                .data(inventoryService.adjustStockBySku(sku, request, customer.getCustomerId()))
                .build());
    }

    @Operation(summary = "Đặt tồn kho tuyệt đối", description = "Ghi đè số lượng tồn hiện tại theo SKU variant")
    @PutMapping("/sku/{sku}")
    public ResponseEntity<ApiResponse<InventoryResponse>> setStock(
            @PathVariable String sku,
            @Valid @RequestBody SetInventoryQuantityRequest request) {
        Customer customer = authenticationService.getCurrentCustomer();
        return ResponseEntity.ok(ApiResponse.<InventoryResponse>builder()
                .message("Set inventory quantity successfully")
                .data(inventoryService.setStockBySku(sku, request, customer.getCustomerId()))
                .build());
    }
}
