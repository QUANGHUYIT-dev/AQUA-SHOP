package com.aqua_shop.v1.services;



import com.aqua_shop.v1.dto.req.AdjustInventoryRequest;

import com.aqua_shop.v1.dto.req.SetInventoryQuantityRequest;

import com.aqua_shop.v1.dto.res.InventoryHistoryResponse;

import com.aqua_shop.v1.dto.res.InventoryResponse;

import com.aqua_shop.v1.dto.res.ProductVariantResponse;

import org.springframework.data.domain.Page;

import org.springframework.data.domain.Pageable;



import java.util.List;



public interface InventoryService {



    Page<InventoryResponse> listInventories(String search, Pageable pageable);



    InventoryResponse getInventoryBySku(String sku);



    InventoryResponse getInventoryById(String inventoryId);



    List<InventoryHistoryResponse> getInventoryHistoryBySku(String sku);



    InventoryResponse adjustStockBySku(String sku, AdjustInventoryRequest request, String changedBy);



    InventoryResponse setStockBySku(String sku, SetInventoryQuantityRequest request, String changedBy);



    /** Giữ hàng khi đặt online — không trừ tồn thật */

    ProductVariantResponse holdStockForOrder(String sku, int quantity, String orderId, String changedBy);



    /** Giải phóng hàng giữ khi hủy đơn online chưa hoàn tất */

    ProductVariantResponse releaseHoldForOrder(String sku, int quantity, String orderId, String changedBy);



    /** Chuyển hold → trừ tồn thật khi đơn online hoàn tất */

    ProductVariantResponse fulfillHoldForOrder(String sku, int quantity, String orderId, String changedBy);



    /** Trừ tồn thật ngay (POS / offline) */

    ProductVariantResponse deductStockForOrder(String sku, int quantity, String orderId, String changedBy);



    /** Hoàn tồn thật (hủy đơn offline hoặc hoàn hàng) */

    ProductVariantResponse restoreStockForOrder(String sku, int quantity, String orderId, String changedBy);



    int getAvailableQuantity(String sku);

}

