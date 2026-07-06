package com.aqua_shop.v1.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;
@Getter
public enum ErrorCode {
    // ==== Customer ====
    CUSTOMER_NOT_FOUND(10032, HttpStatus.NOT_FOUND, "Customer with ID '{}' not found"),
    CUSTOMER_EMAIL_ALREADY_EXISTS(10033, HttpStatus.CONFLICT, "Customer email '{}' already exists"),
    CUSTOMER_PHONE_ALREADY_EXISTS(10034, HttpStatus.CONFLICT, "Customer phone number '{}' already exists"),

    // ==== Authentication & Authorization ====
    PASSWORD_INCORRECT(10400, HttpStatus.UNAUTHORIZED, "Password incorrect"),
    CONFIRM_PASSWORD_NOT_MATCH(10401, HttpStatus.BAD_REQUEST, "Confirm password does not match"),
    CURRENT_PASSWORD_INCORRECT(10402, HttpStatus.BAD_REQUEST, "Current password incorrect"),
    UNAUTHORIZED(10403, HttpStatus.FORBIDDEN, "You do not have permission"),
    UNAUTHENTICATED(10404, HttpStatus.UNAUTHORIZED, "Unauthenticated"),
    ACCOUNT_LOCKED(10405, HttpStatus.FORBIDDEN, "Account '{}' is locked"),
    EMAIL_NOT_FOUND(10406, HttpStatus.NOT_FOUND, "Email not found"),

    // ==== Category ====
    CATEGORY_NOT_FOUND(10050, HttpStatus.NOT_FOUND, "Category with ID '{}' not found"),
    CATEGORY_SLUG_ALREADY_EXISTS(10051, HttpStatus.CONFLICT, "Category slug '{}' already exists"),
    CATEGORY_NAME_ALREADY_EXISTS(10052, HttpStatus.CONFLICT, "Category name '{}' already exists"),
    CATEGORY_CANNOT_BELONG_TO_ITSELF(10053, HttpStatus.BAD_REQUEST, "A category cannot choose itself as its parent"),
    CATEGORY_CANNOT_BELONG_TO_ITS_CHILD(10054, HttpStatus.BAD_REQUEST, "Cannot choose a child/grandchild category as its parent"),

    // ==== Brand ====
    BRAND_NOT_FOUND(10060, HttpStatus.NOT_FOUND, "Brand '{}' not found"),
    BRAND_NAME_ALREADY_EXISTS(10061, HttpStatus.CONFLICT, "Brand name '{}' already exists"),
    BRAND_SLUG_ALREADY_EXISTS(10062, HttpStatus.CONFLICT, "Brand slug '{}' already exists"),
    BRAND_INACTIVE(10063, HttpStatus.GONE, "Brand '{}' is inactive"),

    // ==== Banner ====
    BANNER_NOT_FOUND(10064, HttpStatus.NOT_FOUND, "Banner '{}' not found"),

    // ==== Product ====
    PRODUCT_NOT_FOUND(10070, HttpStatus.NOT_FOUND, "Product '{}' not found"),
    PRODUCT_SLUG_ALREADY_EXISTS(10071, HttpStatus.CONFLICT, "Product slug '{}' already exists"),
    PRODUCT_SKU_ALREADY_EXISTS(10072, HttpStatus.BAD_REQUEST, "Product SKU '{}' already exists"),
    PRODUCT_CATEGORY_INACTIVE(10073, HttpStatus.BAD_REQUEST, "Category '{}' is inactive"),
    PRODUCT_CATEGORY_TYPE_MISMATCH(10074, HttpStatus.BAD_REQUEST, "Category type '{}' is not compatible with product type '{}'"),
    PRODUCT_BRAND_INACTIVE(10075, HttpStatus.BAD_REQUEST, "Brand '{}' is inactive"),
    PRODUCT_TYPE_CANNOT_CHANGE(10076, HttpStatus.BAD_REQUEST, "Product type cannot be changed"),
    PRODUCT_DETAIL_REQUIRED(10077, HttpStatus.BAD_REQUEST, "Detail for product type '{}' is required"),
    PRODUCT_INVALID_PRICE(10078, HttpStatus.BAD_REQUEST, "Price must be greater than 0"),
    PRODUCT_INVALID_SALE_PRICE(10079, HttpStatus.BAD_REQUEST, "Sale price must be between 0 and the regular price"),
    PRODUCT_INVALID_STOCK(10080, HttpStatus.BAD_REQUEST, "Stock quantity cannot be negative"),
    PRODUCT_INVALID_DETAIL_RANGE(10081, HttpStatus.BAD_REQUEST, "'{}' must be less than or equal to '{}'"),
    PRODUCT_VARIANT_REQUIRED(10082, HttpStatus.BAD_REQUEST, "Product must have at least one variant"),
    PRODUCT_VARIANT_NOT_FOUND(10083, HttpStatus.NOT_FOUND, "Product variant '{}' not found"),
    PRODUCT_VARIANT_SKU_DUPLICATED(10084, HttpStatus.BAD_REQUEST, "Duplicate SKU '{}' in variant list"),
    PRODUCT_VARIANT_SKU_NOT_FOUND(10085, HttpStatus.NOT_FOUND, "Product variant with SKU '{}' not found"),
    PRODUCT_INSUFFICIENT_STOCK(10086, HttpStatus.BAD_REQUEST, "Insufficient stock for SKU '{}'. Available: {}, requested: {}"),
    PRODUCT_INVALID_DEDUCT_QUANTITY(10087, HttpStatus.BAD_REQUEST, "Deduct quantity must be greater than 0"),
    PRODUCT_IMAGE_NOT_FOUND(10088, HttpStatus.NOT_FOUND, "Product image '{}' not found for product '{}'"),
    PRODUCT_IMAGE_URL_REQUIRED(10089, HttpStatus.BAD_REQUEST, "Image URL is required"),

    // ==== Cart ====
    CART_NOT_FOUND(10090, HttpStatus.NOT_FOUND, "Cart not found"),
    CART_ITEM_NOT_FOUND(10091, HttpStatus.NOT_FOUND, "Cart item '{}' not found"),
    CART_EMPTY(10092, HttpStatus.BAD_REQUEST, "Cart is empty"),
    CART_PRODUCT_UNAVAILABLE(10093, HttpStatus.BAD_REQUEST, "Product '{}' is not available for purchase"),

    // ==== Order ====
    ORDER_NOT_FOUND(10094, HttpStatus.NOT_FOUND, "Order '{}' not found"),
    ORDER_CANNOT_CANCEL(10095, HttpStatus.BAD_REQUEST, "Order cannot be cancelled in status '{}'"),
    ORDER_ALREADY_CANCELLED(10096, HttpStatus.BAD_REQUEST, "Order '{}' is already cancelled"),
    ORDER_INSUFFICIENT_WALLET(10097, HttpStatus.BAD_REQUEST, "Insufficient wallet balance. Available: {}, required: {}"),
    ORDER_INVALID_STATUS_TRANSITION(10098, HttpStatus.BAD_REQUEST, "Cannot change order status from '{}' to '{}'"),

    // ==== Inventory ====
    INVENTORY_NOT_FOUND(10100, HttpStatus.NOT_FOUND, "Inventory '{}' not found"),
    INVENTORY_INVALID_ADJUSTMENT(10101, HttpStatus.BAD_REQUEST, "Inventory adjustment quantity cannot be zero"),
    INVENTORY_BELOW_HOLD(10102, HttpStatus.BAD_REQUEST, "Physical stock cannot be below held quantity for SKU '{}'. On hand: {}, on hold: {}, requested change: {}"),
    INVENTORY_INSUFFICIENT_HOLD(10103, HttpStatus.BAD_REQUEST, "Insufficient held stock for SKU '{}'. On hold: {}, requested release: {}"),

    // ==== Upload / Cloudinary ====
    FILE_UPLOAD_EMPTY(10420, HttpStatus.BAD_REQUEST, "Upload file is required"),
    FILE_UPLOAD_TOO_LARGE(10421, HttpStatus.BAD_REQUEST, "File size exceeds the maximum allowed size of {} MB"),
    FILE_UPLOAD_INVALID_TYPE(10422, HttpStatus.BAD_REQUEST, "File type '{}' is not supported. Allowed: JPEG, PNG, WebP, GIF"),
    FILE_UPLOAD_FAILED(10423, HttpStatus.BAD_REQUEST, "File upload failed"),
    CLOUDINARY_NOT_CONFIGURED(10424, HttpStatus.INTERNAL_SERVER_ERROR, "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_SECRET"),

    // ==== Common / Validation ====
    VALIDATION_FAILED(10410, HttpStatus.BAD_REQUEST, "Validation failed"),
    INVALID_REQUEST_PARAMETER(10411, HttpStatus.BAD_REQUEST, "Invalid request parameter '{}'"),
    INVALID_JSON(10412, HttpStatus.BAD_REQUEST, "Invalid JSON request body"),
    DATA_INTEGRITY_VIOLATION(10413, HttpStatus.BAD_REQUEST, "Duplicate data violates database constraint"),
    METHOD_NOT_ALLOWED(10414, HttpStatus.METHOD_NOT_ALLOWED, "HTTP method not allowed"),
    INTERNAL_SERVER_ERROR(10500, HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"),
    ;
    private final int code;
    private final HttpStatus status;
    private final String messageTemplate;

    ErrorCode(int code, HttpStatus status, String messageTemplate) {
        this.code = code;
        this.status = status;
        this.messageTemplate = messageTemplate;
    }
    public String formatMessage(Object... args) {
        return String.format(messageTemplate.replace("{}", "%s"), args);
    }
}
