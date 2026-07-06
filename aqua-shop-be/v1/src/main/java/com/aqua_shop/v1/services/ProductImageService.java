package com.aqua_shop.v1.services;

import com.aqua_shop.v1.dto.req.ProductImageRequest;
import com.aqua_shop.v1.dto.req.UpdateProductImageRequest;
import com.aqua_shop.v1.dto.res.ProductImageResponse;
import com.aqua_shop.v1.entity.Product;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface ProductImageService {

    List<ProductImageResponse> getImagesByProductId(String productId);

    ProductImageResponse addImage(String productId, ProductImageRequest request);

    ProductImageResponse uploadAndAttach(String productId, MultipartFile file, String altText, Integer sortOrder, Boolean isPrimary);

    List<ProductImageResponse> uploadAndAttachBatch(String productId, List<MultipartFile> files, String altText, Boolean isPrimary);

    ProductImageResponse updateImage(String productId, Long imageId, UpdateProductImageRequest request);

    void deleteImage(String productId, Long imageId);

    ProductImageResponse setPrimaryImage(String productId, Long imageId);

    void attachImages(Product product, List<ProductImageRequest> imageRequests);

    void replaceAllImages(Product product, List<ProductImageRequest> imageRequests);
}
