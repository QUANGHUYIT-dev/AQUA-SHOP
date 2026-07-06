package com.aqua_shop.v1.services.Impl;

import com.aqua_shop.v1.dto.req.CancelOrderRequest;
import com.aqua_shop.v1.dto.req.CheckoutRequest;
import com.aqua_shop.v1.dto.req.CreateOrderItemRequest;
import com.aqua_shop.v1.dto.req.CreateOrderRequest;
import com.aqua_shop.v1.dto.req.UpdateOrderStatusRequest;
import com.aqua_shop.v1.dto.res.AdminOrderSummaryResponse;
import com.aqua_shop.v1.dto.res.OrderHistoryResponse;
import com.aqua_shop.v1.dto.res.OrderItemResponse;
import com.aqua_shop.v1.dto.res.OrderResponse;
import com.aqua_shop.v1.dto.res.OrderSummaryResponse;
import com.aqua_shop.v1.entity.Cart;
import com.aqua_shop.v1.entity.CartItem;
import com.aqua_shop.v1.entity.Customer;
import com.aqua_shop.v1.entity.Order;
import com.aqua_shop.v1.entity.OrderHistory;
import com.aqua_shop.v1.entity.OrderItem;
import com.aqua_shop.v1.entity.Product;
import com.aqua_shop.v1.entity.ProductVariant;
import com.aqua_shop.v1.entity.Role;
import com.aqua_shop.v1.entity.VariantAttributes;
import com.aqua_shop.v1.enums.OrderHistoryActorType;
import com.aqua_shop.v1.enums.OrderStatus;
import com.aqua_shop.v1.enums.OrderType;
import com.aqua_shop.v1.enums.PaymentMethod;
import com.aqua_shop.v1.enums.PaymentStatus;
import com.aqua_shop.v1.enums.ProductStatus;
import com.aqua_shop.v1.exceptions.CustomException;
import com.aqua_shop.v1.exceptions.ErrorCode;
import com.aqua_shop.v1.repositories.CartRepository;
import com.aqua_shop.v1.repositories.CustomerRepository;
import com.aqua_shop.v1.repositories.OrderHistoryRepository;
import com.aqua_shop.v1.repositories.OrderRepository;
import com.aqua_shop.v1.repositories.ProductVariantRepository;
import com.aqua_shop.v1.services.AuthenticationService;
import com.aqua_shop.v1.services.InventoryService;
import com.aqua_shop.v1.services.OrderHistoryService;
import com.aqua_shop.v1.services.OrderService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderServiceImpl implements OrderService {

    private static final Set<OrderStatus> CANCELLABLE_STATUSES = EnumSet.of(
            OrderStatus.PENDING,
            OrderStatus.CONFIRMED
    );

    private static final Set<String> STAFF_ROLES = Set.of("ADMIN", "STAFF", "WAREHOUSE");

    private static final String WALK_IN_EMAIL = "pos-walkin@aqua-shop.internal";
    private static final String POS_SHIPPING_ADDRESS = "Tại quầy";

    private static final Map<OrderStatus, Set<OrderStatus>> ADMIN_STATUS_TRANSITIONS = Map.of(
            OrderStatus.PENDING, EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED, EnumSet.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED),
            OrderStatus.PROCESSING, EnumSet.of(OrderStatus.SHIPPING, OrderStatus.CANCELLED),
            OrderStatus.SHIPPING, EnumSet.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, EnumSet.of(OrderStatus.COMPLETED)
    );

    OrderRepository orderRepository;
    CartRepository cartRepository;
    CustomerRepository customerRepository;
    ProductVariantRepository productVariantRepository;
    OrderHistoryRepository orderHistoryRepository;
    AuthenticationService authenticationService;
    InventoryService inventoryService;
    OrderHistoryService orderHistoryService;

    @Override
    @Transactional
    public OrderResponse checkout(CheckoutRequest request) {
        Customer customer = authenticationService.getCurrentCustomer();
        Cart cart = cartRepository.findWithItemsByCustomer_CustomerId(customer.getCustomerId())
                .orElseThrow(() -> new CustomException(ErrorCode.CART_NOT_FOUND));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new CustomException(ErrorCode.CART_EMPTY);
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            ProductVariant variant = cartItem.getVariant();
            validatePurchasable(variant);
            validateStock(variant, cartItem.getQuantity());

            BigDecimal unitPrice = cartItem.getUnitPrice() != null
                    ? cartItem.getUnitPrice()
                    : resolveEffectivePrice(variant);
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            orderItems.add(buildOrderItem(variant, cartItem.getQuantity(), unitPrice, lineTotal));
        }

        BigDecimal shippingFee = request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.add(shippingFee);
        int totalItemsCount = orderItems.stream().mapToInt(OrderItem::getQuantity).sum();

        PaymentMethod paymentMethod = request.getPaymentMethod() != null
                ? request.getPaymentMethod()
                : PaymentMethod.COD;

        OrderStatus orderStatus = OrderStatus.PENDING;
        PaymentStatus paymentStatus = PaymentStatus.PENDING;

        if (paymentMethod == PaymentMethod.WALLET) {
            processWalletPayment(customer.getCustomerId(), totalAmount);
            orderStatus = OrderStatus.CONFIRMED;
            paymentStatus = PaymentStatus.PAID;
        }

        Order order = Order.builder()
                .customer(customer)
                .orderType(OrderType.ONLINE)
                .inventorySettled(false)
                .status(orderStatus)
                .paymentMethod(paymentMethod)
                .paymentStatus(paymentStatus)
                .shippingAddress(request.getShippingAddress().trim())
                .receiverName(request.getReceiverName().trim())
                .receiverPhone(request.getReceiverPhone().trim())
                .note(request.getNote())
                .subtotal(subtotal)
                .shippingFee(shippingFee)
                .totalAmount(totalAmount)
                .totalItems(totalItemsCount)
                .build();

        for (OrderItem orderItem : orderItems) {
            orderItem.setOrder(order);
            order.getItems().add(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        for (OrderItem orderItem : savedOrder.getItems()) {
            inventoryService.holdStockForOrder(
                    orderItem.getSku(),
                    orderItem.getQuantity(),
                    savedOrder.getOrderId(),
                    customer.getCustomerId()
            );
        }

        cart.getItems().clear();
        cartRepository.save(cart);

        orderHistoryService.recordOrderCreated(savedOrder, customer.getCustomerId());

        log.info("Khách {} đặt đơn {} — tổng {}", customer.getCustomerId(), savedOrder.getOrderId(), totalAmount);
        return buildOrderResponse(savedOrder);
    }

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        if (request.getOrderType() != OrderType.OFFLINE) {
            throw new CustomException(ErrorCode.INVALID_REQUEST_PARAMETER, "orderType");
        }

        Customer staff = requireStaffRole();
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new CustomException(ErrorCode.CART_EMPTY);
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CreateOrderItemRequest itemRequest : request.getItems()) {
            ProductVariant variant = findVariantForOrder(itemRequest.getSku());
            validatePurchasable(variant);
            validateStock(variant, itemRequest.getQuantity());

            BigDecimal unitPrice = resolveEffectivePrice(variant);
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            orderItems.add(buildOrderItem(variant, itemRequest.getQuantity(), unitPrice, lineTotal));
        }

        PaymentMethod paymentMethod = request.getPaymentMethod() != null
                ? request.getPaymentMethod()
                : PaymentMethod.CASH;

        String receiverName = request.getReceiverName() != null && !request.getReceiverName().isBlank()
                ? request.getReceiverName().trim()
                : "Khách lẻ";
        String receiverPhone = request.getReceiverPhone() != null && !request.getReceiverPhone().isBlank()
                ? request.getReceiverPhone().trim()
                : "0000000000";

        Customer walkInCustomer = getOrCreateWalkInCustomer();
        int totalItemsCount = orderItems.stream().mapToInt(OrderItem::getQuantity).sum();

        Order order = Order.builder()
                .customer(walkInCustomer)
                .orderType(OrderType.OFFLINE)
                .inventorySettled(false)
                .status(OrderStatus.COMPLETED)
                .paymentMethod(paymentMethod)
                .paymentStatus(PaymentStatus.PAID)
                .shippingAddress(POS_SHIPPING_ADDRESS)
                .receiverName(receiverName)
                .receiverPhone(receiverPhone)
                .note(request.getNote())
                .subtotal(subtotal)
                .shippingFee(BigDecimal.ZERO)
                .totalAmount(subtotal)
                .totalItems(totalItemsCount)
                .build();

        for (OrderItem orderItem : orderItems) {
            orderItem.setOrder(order);
            order.getItems().add(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        for (OrderItem orderItem : savedOrder.getItems()) {
            inventoryService.deductStockForOrder(
                    orderItem.getSku(),
                    orderItem.getQuantity(),
                    savedOrder.getOrderId(),
                    staff.getCustomerId()
            );
        }
        savedOrder.setInventorySettled(true);
        orderRepository.save(savedOrder);

        orderHistoryService.recordOrderCreated(savedOrder, staff.getCustomerId());

        log.info("POS: nhân viên {} bán đơn {} — tổng {}", staff.getCustomerId(), savedOrder.getOrderId(), subtotal);
        return buildOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(String orderId) {
        Customer customer = authenticationService.getCurrentCustomer();
        Order order = orderRepository.findWithItemsByOrderIdAndCustomer_CustomerId(orderId, customer.getCustomerId())
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND, orderId));
        return buildOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderSummaryResponse> getMyOrders(OrderStatus status, Pageable pageable) {
        Customer customer = authenticationService.getCurrentCustomer();
        Page<Order> orders = status != null
                ? orderRepository.findByCustomer_CustomerIdAndStatusOrderByCreatedAtDesc(
                        customer.getCustomerId(), status, pageable)
                : orderRepository.findByCustomer_CustomerIdOrderByCreatedAtDesc(
                        customer.getCustomerId(), pageable);
        return orders.map(this::buildOrderSummaryResponse);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(String orderId, CancelOrderRequest request) {
        Customer customer = authenticationService.getCurrentCustomer();
        String reason = request.getReason().trim();
        Order order = orderRepository.findWithItemsByOrderIdAndCustomer_CustomerId(orderId, customer.getCustomerId())
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND, orderId));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new CustomException(ErrorCode.ORDER_ALREADY_CANCELLED, orderId);
        }

        if (!CANCELLABLE_STATUSES.contains(order.getStatus())) {
            throw new CustomException(ErrorCode.ORDER_CANNOT_CANCEL, order.getStatus());
        }

        OrderStatus previousStatus = order.getStatus();
        PaymentStatus previousPaymentStatus = order.getPaymentStatus();

        restoreOrderInventory(order, orderId, customer.getCustomerId());

        if (order.getPaymentMethod() == PaymentMethod.WALLET
                && order.getPaymentStatus() == PaymentStatus.PAID) {
            refundWallet(customer.getCustomerId(), order.getTotalAmount());
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        orderHistoryService.recordOrderCancelled(
                savedOrder, previousStatus, previousPaymentStatus, customer.getCustomerId(), reason);

        log.info("Khách {} hủy đơn {} — lý do: {}", customer.getCustomerId(), orderId, reason);
        return buildOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderHistoryResponse> getOrderHistory(String orderId) {
        Customer customer = authenticationService.getCurrentCustomer();
        return orderHistoryService.getOrderHistory(orderId, customer.getCustomerId());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminOrderSummaryResponse> getAdminOrders(OrderStatus status, Pageable pageable) {
        requireStaffRole();
        Page<Order> orders = status != null
                ? orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                : orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        return orders.map(this::buildAdminOrderSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getAdminOrderById(String orderId) {
        requireStaffRole();
        Order order = orderRepository.findWithItemsByOrderId(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND, orderId));
        return buildOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(String orderId, UpdateOrderStatusRequest request) {
        Customer staff = requireStaffRole();
        Order order = orderRepository.findWithItemsByOrderId(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND, orderId));

        OrderStatus currentStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        if (currentStatus == newStatus) {
            return buildOrderResponse(order);
        }

        if (currentStatus == OrderStatus.CANCELLED) {
            throw new CustomException(ErrorCode.ORDER_ALREADY_CANCELLED, orderId);
        }

        Set<OrderStatus> allowed = ADMIN_STATUS_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowed.contains(newStatus)) {
            throw new CustomException(ErrorCode.ORDER_INVALID_STATUS_TRANSITION, currentStatus, newStatus);
        }

        OrderStatus previousStatus = order.getStatus();
        PaymentStatus previousPaymentStatus = order.getPaymentStatus();

        if (newStatus == OrderStatus.COMPLETED
                && order.getOrderType() == OrderType.ONLINE
                && !Boolean.TRUE.equals(order.getInventorySettled())) {
            settleOnlineOrderInventory(order, orderId, staff.getCustomerId());
            order.setInventorySettled(true);
        }

        if (newStatus == OrderStatus.CANCELLED) {
            restoreOrderInventory(order, orderId, staff.getCustomerId());
            if (order.getPaymentMethod() == PaymentMethod.WALLET
                    && order.getPaymentStatus() == PaymentStatus.PAID) {
                refundWallet(order.getCustomer().getCustomerId(), order.getTotalAmount());
                order.setPaymentStatus(PaymentStatus.REFUNDED);
            }
        }

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        String note = request.getNote() != null && !request.getNote().isBlank()
                ? request.getNote().trim()
                : "Admin cập nhật trạng thái đơn hàng";

        orderHistoryService.recordStatusChange(
                savedOrder,
                previousStatus,
                newStatus,
                previousPaymentStatus,
                savedOrder.getPaymentStatus(),
                note,
                staff.getCustomerId(),
                OrderHistoryActorType.ADMIN
        );

        log.info("Admin {} cập nhật đơn {}: {} -> {}", staff.getCustomerId(), orderId, previousStatus, newStatus);
        return buildOrderResponse(savedOrder);
    }

    private Customer requireStaffRole() {
        Customer customer = authenticationService.getCurrentCustomer();
        if (customer.getRole() == null || customer.getRole().getRoleName() == null) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        String roleName = customer.getRole().getRoleName().trim().toUpperCase();
        if (!STAFF_ROLES.contains(roleName)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        return customer;
    }

    private void restoreOrderInventory(Order order, String orderId, String changedBy) {
        if (Boolean.TRUE.equals(order.getInventorySettled())) {
            for (OrderItem item : order.getItems()) {
                inventoryService.restoreStockForOrder(
                        item.getSku(),
                        item.getQuantity(),
                        orderId,
                        changedBy
                );
            }
            order.setInventorySettled(false);
            return;
        }

        for (OrderItem item : order.getItems()) {
            inventoryService.releaseHoldForOrder(
                    item.getSku(),
                    item.getQuantity(),
                    orderId,
                    changedBy
            );
        }
    }

    private void settleOnlineOrderInventory(Order order, String orderId, String changedBy) {
        for (OrderItem item : order.getItems()) {
            inventoryService.fulfillHoldForOrder(
                    item.getSku(),
                    item.getQuantity(),
                    orderId,
                    changedBy
            );
        }
    }

    private ProductVariant findVariantForOrder(String sku) {
        String normalizedSku = sku != null ? sku.trim().toUpperCase() : "";
        return productVariantRepository.findBySku(normalizedSku)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_VARIANT_SKU_NOT_FOUND, sku));
    }

    private Customer getOrCreateWalkInCustomer() {
        return customerRepository.findByEmail(WALK_IN_EMAIL)
                .orElseGet(this::createWalkInCustomer);
    }

    private Customer createWalkInCustomer() {
        if (customerRepository.existsByEmailIgnoreCase(WALK_IN_EMAIL)) {
            return customerRepository.findByEmail(WALK_IN_EMAIL)
                    .orElseThrow(() -> new CustomException(ErrorCode.INTERNAL_SERVER_ERROR));
        }
        Customer walkIn = Customer.builder()
                .fullName("Khách lẻ tại quầy")
                .email(WALK_IN_EMAIL)
                .phoneNumber("0000000000")
                .role(Role.builder().roleId(4).build())
                .build();
        return customerRepository.save(walkIn);
    }

    private AdminOrderSummaryResponse buildAdminOrderSummaryResponse(Order order) {
        Customer customer = order.getCustomer();
        return AdminOrderSummaryResponse.builder()
                .orderId(order.getOrderId())
                .customerId(customer != null ? customer.getCustomerId() : null)
                .customerName(customer != null ? customer.getFullName() : null)
                .orderType(order.getOrderType())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .totalAmount(order.getTotalAmount())
                .totalItems(order.getTotalItems())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private void processWalletPayment(String customerId, BigDecimal totalAmount) {
        Customer customer = customerRepository.lockByIdForWalletUpdate(customerId)
                .orElseThrow(() -> new CustomException(ErrorCode.CUSTOMER_NOT_FOUND, customerId));

        BigDecimal balance = customer.getWalletBalance() != null ? customer.getWalletBalance() : BigDecimal.ZERO;
        if (balance.compareTo(totalAmount) < 0) {
            throw new CustomException(ErrorCode.ORDER_INSUFFICIENT_WALLET, balance, totalAmount);
        }

        customer.setWalletBalance(balance.subtract(totalAmount));
        customerRepository.save(customer);
    }

    private void refundWallet(String customerId, BigDecimal amount) {
        Customer customer = customerRepository.lockByIdForWalletUpdate(customerId)
                .orElseThrow(() -> new CustomException(ErrorCode.CUSTOMER_NOT_FOUND, customerId));

        BigDecimal balance = customer.getWalletBalance() != null ? customer.getWalletBalance() : BigDecimal.ZERO;
        customer.setWalletBalance(balance.add(amount));
        customerRepository.save(customer);
    }

    private OrderItem buildOrderItem(ProductVariant variant, int quantity, BigDecimal unitPrice, BigDecimal lineTotal) {
        Product product = variant.getProduct();
        VariantAttributes attributes = variant.getAttributes();

        return OrderItem.builder()
                .variant(variant)
                .sku(variant.getSku())
                .productId(product != null ? product.getProductId() : null)
                .productName(product != null ? product.getName() : null)
                .thumbnailUrl(product != null ? product.getThumbnailUrl() : null)
                .variantSize(attributes != null ? attributes.getSize() : null)
                .variantVolume(attributes != null ? attributes.getVolume() : null)
                .variantColor(attributes != null ? attributes.getColor() : null)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .lineTotal(lineTotal)
                .build();
    }

    private void validatePurchasable(ProductVariant variant) {
        Product product = variant.getProduct();
        if (product == null) {
            throw new CustomException(ErrorCode.PRODUCT_NOT_FOUND, "unknown");
        }
        if (product.getStatus() == ProductStatus.INACTIVE) {
            throw new CustomException(ErrorCode.CART_PRODUCT_UNAVAILABLE, product.getName());
        }
    }

    private void validateStock(ProductVariant variant, int requestedQuantity) {
        if (requestedQuantity <= 0) {
            throw new CustomException(ErrorCode.PRODUCT_INVALID_DEDUCT_QUANTITY);
        }
        int available = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        if (available < requestedQuantity) {
            throw new CustomException(
                    ErrorCode.PRODUCT_INSUFFICIENT_STOCK,
                    variant.getSku(),
                    available,
                    requestedQuantity
            );
        }
    }

    private BigDecimal resolveEffectivePrice(ProductVariant variant) {
        if (variant.getSalePrice() != null) {
            return variant.getSalePrice();
        }
        return variant.getPrice();
    }

    private OrderResponse buildOrderResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::buildOrderItemResponse)
                .toList();

        List<OrderHistoryResponse> histories = orderHistoryRepository
                .findByOrder_OrderIdOrderByCreatedAtAsc(order.getOrderId())
                .stream()
                .map(this::buildOrderHistoryResponse)
                .toList();

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .customerId(order.getCustomer() != null ? order.getCustomer().getCustomerId() : null)
                .orderType(order.getOrderType())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .shippingAddress(order.getShippingAddress())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .note(order.getNote())
                .subtotal(order.getSubtotal())
                .shippingFee(order.getShippingFee())
                .totalAmount(order.getTotalAmount())
                .totalItems(order.getTotalItems())
                .items(items)
                .histories(histories)
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderHistoryResponse buildOrderHistoryResponse(OrderHistory history) {
        return OrderHistoryResponse.builder()
                .orderHistoryId(history.getOrderHistoryId())
                .fromStatus(history.getFromStatus())
                .toStatus(history.getToStatus())
                .fromPaymentStatus(history.getFromPaymentStatus())
                .toPaymentStatus(history.getToPaymentStatus())
                .note(history.getNote())
                .changedBy(history.getChangedBy())
                .actorType(history.getActorType())
                .createdAt(history.getCreatedAt())
                .build();
    }

    private OrderItemResponse buildOrderItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .orderItemId(item.getOrderItemId())
                .sku(item.getSku())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .thumbnailUrl(item.getThumbnailUrl())
                .variantSize(item.getVariantSize())
                .variantVolume(item.getVariantVolume())
                .variantColor(item.getVariantColor())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.getLineTotal())
                .build();
    }

    private OrderSummaryResponse buildOrderSummaryResponse(Order order) {
        return OrderSummaryResponse.builder()
                .orderId(order.getOrderId())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .totalAmount(order.getTotalAmount())
                .totalItems(order.getTotalItems())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
