package com.aqua_shop.v1.services;

import com.aqua_shop.v1.dto.req.CreateProductRequest;
import com.aqua_shop.v1.dto.req.UpdateProductRequest;
import com.aqua_shop.v1.dto.res.ProductResponse;
import com.aqua_shop.v1.dto.res.ProductSummaryResponse;
import com.aqua_shop.v1.enums.ProductStatus;
import com.aqua_shop.v1.enums.ProductType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {

    ProductResponse createProduct(CreateProductRequest request);

    ProductResponse updateProduct(String productId, UpdateProductRequest request);

    ProductResponse getProductById(String productId);

    ProductResponse getProductBySlug(String slug);

    Page<ProductSummaryResponse> filterProducts(
            String search,
            ProductType productType,
            String categoryId,
            String brandId,
            ProductStatus status,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable);

    List<ProductSummaryResponse> getTopSellingProducts(int size);

    ProductResponse deleteProduct(String productId);
}
