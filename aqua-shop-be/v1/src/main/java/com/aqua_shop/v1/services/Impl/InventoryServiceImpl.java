package com.aqua_shop.v1.services.Impl;



import com.aqua_shop.v1.dto.req.AdjustInventoryRequest;

import com.aqua_shop.v1.dto.req.SetInventoryQuantityRequest;

import com.aqua_shop.v1.dto.res.InventoryHistoryResponse;

import com.aqua_shop.v1.dto.res.InventoryResponse;

import com.aqua_shop.v1.dto.res.ProductVariantResponse;

import com.aqua_shop.v1.entity.Inventory;

import com.aqua_shop.v1.entity.InventoryHistory;

import com.aqua_shop.v1.entity.Product;

import com.aqua_shop.v1.entity.ProductVariant;

import com.aqua_shop.v1.enums.InventoryChangeType;

import com.aqua_shop.v1.enums.ProductStatus;

import com.aqua_shop.v1.exceptions.CustomException;

import com.aqua_shop.v1.exceptions.ErrorCode;

import com.aqua_shop.v1.mappers.ProductVariantMapper;

import com.aqua_shop.v1.repositories.InventoryHistoryRepository;

import com.aqua_shop.v1.repositories.InventoryRepository;

import com.aqua_shop.v1.repositories.ProductRepository;

import com.aqua_shop.v1.repositories.ProductVariantRepository;

import com.aqua_shop.v1.services.InventoryService;

import lombok.AccessLevel;

import lombok.RequiredArgsConstructor;

import lombok.experimental.FieldDefaults;

import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;

import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.util.StringUtils;



import java.util.List;



@Slf4j

@Service

@RequiredArgsConstructor

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class InventoryServiceImpl implements InventoryService {



    private static final String REF_ORDER = "ORDER";

    private static final String REF_MANUAL = "MANUAL";

    private static final String REF_SYSTEM = "SYSTEM";



    InventoryRepository inventoryRepository;

    InventoryHistoryRepository inventoryHistoryRepository;

    ProductVariantRepository productVariantRepository;

    ProductRepository productRepository;

    ProductVariantMapper productVariantMapper;



    @Override

    @Transactional(readOnly = true)

    public Page<InventoryResponse> listInventories(String search, Pageable pageable) {

        String normalizedSearch = StringUtils.hasText(search) ? search.trim() : null;

        Page<ProductVariant> page = productVariantRepository.searchForInventory(

                normalizedSearch,

                pageable);

        return page.map(this::toInventoryResponseFromVariant);

    }



    @Override

    @Transactional

    public InventoryResponse getInventoryBySku(String sku) {

        String normalizedSku = normalizeSku(sku);

        ProductVariant variant = productVariantRepository.findBySku(normalizedSku)

                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_VARIANT_SKU_NOT_FOUND, normalizedSku));

        return toInventoryResponse(getOrCreateInventory(variant));

    }



    @Override

    @Transactional(readOnly = true)

    public InventoryResponse getInventoryById(String inventoryId) {

        Inventory inventory = inventoryRepository.findWithDetailsByInventoryId(inventoryId)

                .orElseThrow(() -> new CustomException(ErrorCode.INVENTORY_NOT_FOUND, inventoryId));

        return toInventoryResponse(inventory);

    }



    @Override

    @Transactional

    public List<InventoryHistoryResponse> getInventoryHistoryBySku(String sku) {

        String normalizedSku = normalizeSku(sku);

        ProductVariant variant = productVariantRepository.findBySku(normalizedSku)

                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_VARIANT_SKU_NOT_FOUND, normalizedSku));

        Inventory inventory = getOrCreateInventory(variant);



        return inventoryHistoryRepository.findByInventory_SkuOrderByCreatedAtDesc(inventory.getSku()).stream()

                .map(this::toHistoryResponse)

                .toList();

    }



    @Override

    @Transactional

    public InventoryResponse adjustStockBySku(String sku, AdjustInventoryRequest request, String changedBy) {

        if (request.getQuantityChange() == null || request.getQuantityChange() == 0) {

            throw new CustomException(ErrorCode.INVENTORY_INVALID_ADJUSTMENT);

        }



        ProductVariant variant = findVariantForUpdateOrThrow(sku);

        Inventory inventory = getOrCreateInventory(variant);



        int quantityChange = request.getQuantityChange();

        InventoryChangeType changeType = quantityChange > 0

                ? InventoryChangeType.MANUAL_IN

                : InventoryChangeType.MANUAL_OUT;



        applyOnHandChange(

                variant,

                inventory,

                quantityChange,

                changeType,

                REF_MANUAL,

                null,

                request.getNote(),

                changedBy != null ? changedBy : REF_SYSTEM

        );



        return toInventoryResponse(inventory);

    }



    @Override

    @Transactional

    public InventoryResponse setStockBySku(

            String sku,

            SetInventoryQuantityRequest request,

            String changedBy) {

        ProductVariant variant = findVariantForUpdateOrThrow(sku);

        Inventory inventory = getOrCreateInventory(variant);



        int currentQty = getOnHand(inventory);

        int targetQty = request.getQuantityOnHand();

        int quantityChange = targetQty - currentQty;



        if (quantityChange == 0) {

            return toInventoryResponse(inventory);

        }



        applyOnHandChange(

                variant,

                inventory,

                quantityChange,

                InventoryChangeType.MANUAL_ADJUST,

                REF_MANUAL,

                null,

                request.getNote(),

                changedBy != null ? changedBy : REF_SYSTEM

        );



        return toInventoryResponse(inventory);

    }



    @Override

    @Transactional

    public ProductVariantResponse holdStockForOrder(String sku, int quantity, String orderId, String changedBy) {

        validateQuantity(quantity);

        ProductVariant variant = findVariantForUpdateOrThrow(sku);

        Inventory inventory = getOrCreateInventory(variant);



        int available = getAvailable(inventory);

        if (available < quantity) {

            throw new CustomException(

                    ErrorCode.PRODUCT_INSUFFICIENT_STOCK,

                    variant.getSku(),

                    available,

                    quantity

            );

        }



        int holdBefore = getOnHold(inventory);

        int holdAfter = holdBefore + quantity;

        inventory.setQuantityOnHold(holdAfter);

        inventoryRepository.save(inventory);

        syncVariantAvailableStock(variant, inventory);



        recordHistory(

                inventory,

                InventoryChangeType.ORDER_HOLD,

                quantity,

                holdBefore,

                holdAfter,

                REF_ORDER,

                orderId,

                "Giữ hàng khi đặt online",

                changedBy != null ? changedBy : REF_SYSTEM

        );



        log.info("Giữ hàng SKU {}: hold {} -> {} (đơn {})", variant.getSku(), holdBefore, holdAfter, orderId);

        return productVariantMapper.toProductVariantResponse(variant);

    }



    @Override

    @Transactional

    public ProductVariantResponse releaseHoldForOrder(String sku, int quantity, String orderId, String changedBy) {

        validateQuantity(quantity);

        ProductVariant variant = findVariantForUpdateOrThrow(sku);

        Inventory inventory = getOrCreateInventory(variant);



        int holdBefore = getOnHold(inventory);

        if (holdBefore < quantity) {

            throw new CustomException(

                    ErrorCode.INVENTORY_INSUFFICIENT_HOLD,

                    variant.getSku(),

                    holdBefore,

                    quantity

            );

        }



        int holdAfter = holdBefore - quantity;

        inventory.setQuantityOnHold(holdAfter);

        inventoryRepository.save(inventory);

        syncVariantAvailableStock(variant, inventory);



        recordHistory(

                inventory,

                InventoryChangeType.ORDER_HOLD_RELEASE,

                -quantity,

                holdBefore,

                holdAfter,

                REF_ORDER,

                orderId,

                "Giải phóng hàng giữ (hủy/hoàn đơn)",

                changedBy != null ? changedBy : REF_SYSTEM

        );



        log.info("Giải phóng hold SKU {}: hold {} -> {} (đơn {})", variant.getSku(), holdBefore, holdAfter, orderId);

        return productVariantMapper.toProductVariantResponse(variant);

    }



    @Override

    @Transactional

    public ProductVariantResponse fulfillHoldForOrder(String sku, int quantity, String orderId, String changedBy) {

        validateQuantity(quantity);

        ProductVariant variant = findVariantForUpdateOrThrow(sku);

        Inventory inventory = getOrCreateInventory(variant);



        int holdBefore = getOnHold(inventory);

        if (holdBefore < quantity) {

            throw new CustomException(

                    ErrorCode.INVENTORY_INSUFFICIENT_HOLD,

                    variant.getSku(),

                    holdBefore,

                    quantity

            );

        }



        int onHandBefore = getOnHand(inventory);

        int onHandAfter = onHandBefore - quantity;

        int holdAfter = holdBefore - quantity;



        inventory.setQuantityOnHold(holdAfter);

        inventory.setQuantityOnHand(onHandAfter);

        inventoryRepository.save(inventory);

        syncVariantAvailableStock(variant, inventory);



        recordHistory(

                inventory,

                InventoryChangeType.ORDER_DEDUCT,

                -quantity,

                onHandBefore,

                onHandAfter,

                REF_ORDER,

                orderId,

                "Trừ tồn thật khi hoàn tất đơn online",

                changedBy != null ? changedBy : REF_SYSTEM

        );



        log.info("Hoàn tất đơn SKU {}: onHand {} -> {}, hold {} -> {} (đơn {})",

                variant.getSku(), onHandBefore, onHandAfter, holdBefore, holdAfter, orderId);

        return productVariantMapper.toProductVariantResponse(variant);

    }



    @Override

    @Transactional

    public ProductVariantResponse deductStockForOrder(String sku, int quantity, String orderId, String changedBy) {

        validateQuantity(quantity);

        ProductVariant variant = findVariantForUpdateOrThrow(sku);

        Inventory inventory = getOrCreateInventory(variant);



        int available = getAvailable(inventory);

        if (available < quantity) {

            throw new CustomException(

                    ErrorCode.PRODUCT_INSUFFICIENT_STOCK,

                    variant.getSku(),

                    available,

                    quantity

            );

        }



        ProductVariant savedVariant = applyOnHandChange(

                variant,

                inventory,

                -quantity,

                InventoryChangeType.ORDER_DEDUCT,

                REF_ORDER,

                orderId,

                "Trừ kho bán tại quầy",

                changedBy != null ? changedBy : REF_SYSTEM

        );

        return productVariantMapper.toProductVariantResponse(savedVariant);

    }



    @Override

    @Transactional

    public ProductVariantResponse restoreStockForOrder(String sku, int quantity, String orderId, String changedBy) {

        validateQuantity(quantity);

        ProductVariant variant = findVariantForUpdateOrThrow(sku);

        Inventory inventory = getOrCreateInventory(variant);



        ProductVariant savedVariant = applyOnHandChange(

                variant,

                inventory,

                quantity,

                InventoryChangeType.ORDER_RESTORE,

                REF_ORDER,

                orderId,

                "Hoàn kho khi hủy đơn",

                changedBy != null ? changedBy : REF_SYSTEM

        );

        return productVariantMapper.toProductVariantResponse(savedVariant);

    }



    @Override

    @Transactional(readOnly = true)

    public int getAvailableQuantity(String sku) {

        String normalizedSku = normalizeSku(sku);

        ProductVariant variant = productVariantRepository.findBySku(normalizedSku)

                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_VARIANT_SKU_NOT_FOUND, normalizedSku));

        Inventory inventory = inventoryRepository.findByVariant_VariantId(variant.getVariantId()).orElse(null);

        if (inventory == null) {

            return variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;

        }

        return getAvailable(inventory);

    }



    private ProductVariant applyOnHandChange(

            ProductVariant variant,

            Inventory inventory,

            int quantityChange,

            InventoryChangeType changeType,

            String referenceType,

            String referenceId,

            String note,

            String changedBy) {

        int quantityBefore = getOnHand(inventory);

        int quantityAfter = quantityBefore + quantityChange;



        if (quantityAfter < getOnHold(inventory)) {

            throw new CustomException(

                    ErrorCode.INVENTORY_BELOW_HOLD,

                    variant.getSku(),

                    quantityBefore,

                    getOnHold(inventory),

                    quantityChange

            );

        }



        if (quantityAfter < 0) {

            throw new CustomException(

                    ErrorCode.PRODUCT_INSUFFICIENT_STOCK,

                    variant.getSku(),

                    getAvailable(inventory),

                    Math.abs(quantityChange)

            );

        }



        inventory.setQuantityOnHand(quantityAfter);

        inventoryRepository.save(inventory);

        syncVariantAvailableStock(variant, inventory);



        recordHistory(inventory, changeType, quantityChange, quantityBefore, quantityAfter,

                referenceType, referenceId, note, changedBy);



        log.info("Tồn kho SKU {}: onHand {} -> {} ({})", variant.getSku(), quantityBefore, quantityAfter, changeType);

        return variant;

    }



    private void syncVariantAvailableStock(ProductVariant variant, Inventory inventory) {

        int available = getAvailable(inventory);

        variant.setStockQuantity(available);

        ProductVariant savedVariant = productVariantRepository.save(variant);

        syncProductStockStatus(savedVariant.getProduct());

    }



    private Inventory getOrCreateInventory(ProductVariant variant) {

        return inventoryRepository.findByVariant_VariantId(variant.getVariantId())

                .orElseGet(() -> {

                    int initialQty = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;

                    Inventory inventory = Inventory.builder()

                            .variant(variant)

                            .sku(variant.getSku())

                            .quantityOnHand(initialQty)

                            .quantityOnHold(0)

                            .build();

                    Inventory saved = inventoryRepository.save(inventory);

                    syncVariantAvailableStock(variant, saved);



                    if (initialQty > 0) {

                        recordHistory(

                                saved,

                                InventoryChangeType.SYNC_INITIAL,

                                initialQty,

                                0,

                                initialQty,

                                REF_SYSTEM,

                                variant.getVariantId(),

                                "Khởi tạo tồn kho từ variant",

                                REF_SYSTEM

                        );

                    }

                    return saved;

                });

    }



    private void recordHistory(

            Inventory inventory,

            InventoryChangeType changeType,

            int quantityChange,

            int quantityBefore,

            int quantityAfter,

            String referenceType,

            String referenceId,

            String note,

            String changedBy) {

        InventoryHistory history = InventoryHistory.builder()

                .inventory(inventory)

                .changeType(changeType)

                .quantityChange(quantityChange)

                .quantityBefore(quantityBefore)

                .quantityAfter(quantityAfter)

                .referenceType(referenceType)

                .referenceId(referenceId)

                .note(note)

                .changedBy(changedBy)

                .build();

        inventoryHistoryRepository.save(history);

    }



    private ProductVariant findVariantForUpdateOrThrow(String sku) {

        String normalizedSku = normalizeSku(sku);

        return productVariantRepository.findBySkuForUpdate(normalizedSku)

                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_VARIANT_SKU_NOT_FOUND, normalizedSku));

    }



    private void validateQuantity(int quantity) {

        if (quantity <= 0) {

            throw new CustomException(ErrorCode.PRODUCT_INVALID_DEDUCT_QUANTITY);

        }

    }



    private String normalizeSku(String sku) {

        if (sku == null || sku.isBlank()) {

            throw new CustomException(ErrorCode.PRODUCT_VARIANT_SKU_NOT_FOUND, sku);

        }

        return sku.trim().toUpperCase();

    }



    private int getOnHand(Inventory inventory) {

        return inventory.getQuantityOnHand() != null ? inventory.getQuantityOnHand() : 0;

    }



    private int getOnHold(Inventory inventory) {

        return inventory.getQuantityOnHold() != null ? inventory.getQuantityOnHold() : 0;

    }



    private int getAvailable(Inventory inventory) {

        return getOnHand(inventory) - getOnHold(inventory);

    }



    private void syncProductStockStatus(Product product) {

        if (product == null || product.getProductId() == null) {

            return;

        }



        Product managedProduct = productRepository.findWithDetailsByProductId(product.getProductId())

                .orElse(product);



        int totalAvailable = managedProduct.getVariants().stream()

                .mapToInt(variant -> variant.getStockQuantity() != null ? variant.getStockQuantity() : 0)

                .sum();



        if (totalAvailable <= 0 && managedProduct.getStatus() == ProductStatus.ACTIVE) {

            managedProduct.setStatus(ProductStatus.OUT_OF_STOCK);

        } else if (totalAvailable > 0 && managedProduct.getStatus() == ProductStatus.OUT_OF_STOCK) {

            managedProduct.setStatus(ProductStatus.ACTIVE);

        }



        productRepository.save(managedProduct);

    }



    private InventoryResponse toInventoryResponseFromVariant(ProductVariant variant) {

        Inventory inventory = inventoryRepository.findByVariant_VariantId(variant.getVariantId()).orElse(null);

        Product product = variant.getProduct();



        int onHand = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;

        int onHold = 0;

        if (inventory != null) {

            onHand = getOnHand(inventory);

            onHold = getOnHold(inventory);

        }



        return buildInventoryResponse(inventory, variant, product, onHand, onHold);

    }



    private InventoryResponse toInventoryResponse(Inventory inventory) {

        ProductVariant variant = inventory.getVariant();

        Product product = variant != null ? variant.getProduct() : null;

        int onHand = getOnHand(inventory);

        int onHold = getOnHold(inventory);

        return buildInventoryResponse(inventory, variant, product, onHand, onHold);

    }



    private InventoryResponse buildInventoryResponse(

            Inventory inventory,

            ProductVariant variant,

            Product product,

            int onHand,

            int onHold) {

        return InventoryResponse.builder()

                .inventoryId(inventory != null ? inventory.getInventoryId() : null)

                .variantId(variant != null ? variant.getVariantId() : null)

                .sku(variant != null ? variant.getSku() : null)

                .productId(product != null ? product.getProductId() : null)

                .productName(product != null ? product.getName() : null)

                .quantityOnHand(onHand)

                .quantityOnHold(onHold)

                .quantityAvailable(onHand - onHold)

                .price(variant != null ? variant.getPrice() : null)

                .salePrice(variant != null ? variant.getSalePrice() : null)

                .build();

    }



    private InventoryHistoryResponse toHistoryResponse(InventoryHistory history) {

        return InventoryHistoryResponse.builder()

                .inventoryHistoryId(history.getInventoryHistoryId())

                .sku(history.getInventory() != null ? history.getInventory().getSku() : null)

                .changeType(history.getChangeType())

                .quantityChange(history.getQuantityChange())

                .quantityBefore(history.getQuantityBefore())

                .quantityAfter(history.getQuantityAfter())

                .referenceType(history.getReferenceType())

                .referenceId(history.getReferenceId())

                .note(history.getNote())

                .changedBy(history.getChangedBy())

                .createdAt(history.getCreatedAt())

                .build();

    }

}

