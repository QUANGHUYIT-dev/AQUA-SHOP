package com.aqua_shop.v1.services.Impl;

import com.aqua_shop.v1.dto.req.ProductImageRequest;
import com.aqua_shop.v1.dto.req.UpdateProductImageRequest;
import com.aqua_shop.v1.dto.res.CloudinaryUploadResponse;
import com.aqua_shop.v1.dto.res.ProductImageResponse;
import com.aqua_shop.v1.entity.Product;
import com.aqua_shop.v1.entity.ProductImage;
import com.aqua_shop.v1.enums.UploadFolder;
import com.aqua_shop.v1.exceptions.CustomException;
import com.aqua_shop.v1.exceptions.ErrorCode;
import com.aqua_shop.v1.mappers.ProductDetailMapper;
import com.aqua_shop.v1.repositories.ProductImageRepository;
import com.aqua_shop.v1.repositories.ProductRepository;
import com.aqua_shop.v1.services.CloudinaryService;
import com.aqua_shop.v1.services.ProductImageService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductImageServiceImpl implements ProductImageService {

    ProductRepository productRepository;
    ProductImageRepository productImageRepository;
    ProductDetailMapper productDetailMapper;
    CloudinaryService cloudinaryService;

    @Override
    @Transactional(readOnly = true)
    public List<ProductImageResponse> getImagesByProductId(String productId) {
        findProductOrThrow(productId);
        return productImageRepository.findByProduct_ProductIdOrderBySortOrderAsc(productId).stream()
                .map(productDetailMapper::toProductImageResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProductImageResponse addImage(String productId, ProductImageRequest request) {
        log.info("Đang thêm ảnh cho sản phẩm {}", productId);

        Product product = findProductOrThrow(productId);
        validateImageUrl(request.getImageUrl());

        ProductImage image = buildImage(product, request, product.getImages().size());
        product.getImages().add(image);

        if (Boolean.TRUE.equals(image.getIsPrimary())) {
            unsetOtherPrimaryImages(product.getImages(), image);
        } else if (product.getImages().size() == 1) {
            image.setIsPrimary(true);
        }

        normalizePrimaryImage(product.getImages());
        return productDetailMapper.toProductImageResponse(productImageRepository.save(image));
    }

    @Override
    @Transactional
    public ProductImageResponse uploadAndAttach(String productId, MultipartFile file, String altText, Integer sortOrder, Boolean isPrimary) {
        log.info("Đang upload và gắn ảnh cho sản phẩm {}", productId);

        Product product = findProductOrThrow(productId);
        CloudinaryUploadResponse upload = cloudinaryService.uploadImage(file, UploadFolder.PRODUCTS);
        return saveUploadedImage(product, upload, altText, sortOrder, isPrimary);
    }

    @Override
    @Transactional
    public List<ProductImageResponse> uploadAndAttachBatch(String productId, List<MultipartFile> files, String altText, Boolean isPrimary) {
        log.info("Đang upload batch ảnh cho sản phẩm {}", productId);

        Product product = findProductOrThrow(productId);
        List<CloudinaryUploadResponse> uploads = cloudinaryService.uploadImages(files, UploadFolder.PRODUCTS);

        List<ProductImageResponse> responses = new ArrayList<>();
        int baseSortOrder = product.getImages().size();
        for (int i = 0; i < uploads.size(); i++) {
            CloudinaryUploadResponse upload = uploads.get(i);
            boolean primary = Boolean.TRUE.equals(isPrimary) && i == 0;
            responses.add(saveUploadedImage(product, upload, altText, baseSortOrder + i, primary));
        }

        return responses;
    }

    private ProductImageResponse saveUploadedImage(
            Product product,
            CloudinaryUploadResponse upload,
            String altText,
            Integer sortOrder,
            Boolean isPrimary) {
        ProductImage image = ProductImage.builder()
                .product(product)
                .imageUrl(upload.getUrl())
                .publicId(upload.getPublicId())
                .altText(altText)
                .sortOrder(sortOrder != null ? sortOrder : product.getImages().size())
                .isPrimary(isPrimary != null ? isPrimary : false)
                .build();

        product.getImages().add(image);

        if (Boolean.TRUE.equals(image.getIsPrimary())) {
            unsetOtherPrimaryImages(product.getImages(), image);
        } else if (product.getImages().size() == 1) {
            image.setIsPrimary(true);
        }

        normalizePrimaryImage(product.getImages());
        return productDetailMapper.toProductImageResponse(productImageRepository.save(image));
    }

    @Override
    @Transactional
    public ProductImageResponse updateImage(String productId, Long imageId, UpdateProductImageRequest request) {
        log.info("Đang cập nhật ảnh {} của sản phẩm {}", imageId, productId);

        Product product = findProductOrThrow(productId);
        ProductImage image = findImageOrThrow(productId, imageId);

        if (request.getImageUrl() != null) {
            validateImageUrl(request.getImageUrl());
            image.setImageUrl(request.getImageUrl().trim());
        }
        if (request.getAltText() != null) {
            image.setAltText(request.getAltText());
        }
        if (request.getSortOrder() != null) {
            image.setSortOrder(request.getSortOrder());
        }
        if (request.getIsPrimary() != null) {
            image.setIsPrimary(request.getIsPrimary());
            if (Boolean.TRUE.equals(request.getIsPrimary())) {
                unsetOtherPrimaryImages(product.getImages(), image);
            }
        }

        normalizePrimaryImage(product.getImages());
        productRepository.save(product);
        return productDetailMapper.toProductImageResponse(image);
    }

    @Override
    @Transactional
    public void deleteImage(String productId, Long imageId) {
        log.info("Đang xóa ảnh {} của sản phẩm {}", imageId, productId);

        Product product = findProductOrThrow(productId);
        ProductImage image = findImageOrThrow(productId, imageId);
        boolean wasPrimary = Boolean.TRUE.equals(image.getIsPrimary());

        deleteCloudinaryIfPresent(image);
        product.getImages().remove(image);

        if (wasPrimary && !product.getImages().isEmpty()) {
            product.getImages().stream()
                    .min(Comparator.comparingInt(img -> img.getSortOrder() != null ? img.getSortOrder() : 0))
                    .ifPresent(img -> img.setIsPrimary(true));
        }

        productRepository.save(product);
    }

    @Override
    @Transactional
    public ProductImageResponse setPrimaryImage(String productId, Long imageId) {
        log.info("Đang đặt ảnh {} làm primary cho sản phẩm {}", imageId, productId);

        Product product = findProductOrThrow(productId);
        ProductImage image = findImageOrThrow(productId, imageId);

        unsetOtherPrimaryImages(product.getImages(), image);
        image.setIsPrimary(true);
        productRepository.save(product);

        return productDetailMapper.toProductImageResponse(image);
    }

    @Override
    @Transactional
    public void attachImages(Product product, List<ProductImageRequest> imageRequests) {
        if (imageRequests == null || imageRequests.isEmpty()) {
            return;
        }

        List<ProductImage> images = new ArrayList<>();
        for (int i = 0; i < imageRequests.size(); i++) {
            images.add(buildImage(product, imageRequests.get(i), i));
        }

        normalizePrimaryImage(images);
        product.getImages().addAll(images);
    }

    @Override
    @Transactional
    public void replaceAllImages(Product product, List<ProductImageRequest> imageRequests) {
        deleteCloudinaryImages(product.getImages());
        product.getImages().clear();
        attachImages(product, imageRequests);
    }

    private Product findProductOrThrow(String productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND, productId));
    }

    private ProductImage findImageOrThrow(String productId, Long imageId) {
        return productImageRepository.findByImageIdAndProduct_ProductId(imageId, productId)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_IMAGE_NOT_FOUND, imageId, productId));
    }

    private ProductImage buildImage(Product product, ProductImageRequest request, int defaultSortOrder) {
        validateImageUrl(request.getImageUrl());

        ProductImage image = productDetailMapper.toProductImage(request);
        image.setProduct(product);
        image.setImageUrl(request.getImageUrl().trim());
        image.setPublicId(normalizePublicId(request.getPublicId()));
        image.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : defaultSortOrder);
        image.setIsPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false);
        return image;
    }

    private void validateImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            throw new CustomException(ErrorCode.PRODUCT_IMAGE_URL_REQUIRED);
        }
    }

    private String normalizePublicId(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return null;
        }
        return publicId.trim();
    }

    private void deleteCloudinaryImages(List<ProductImage> images) {
        if (images == null) {
            return;
        }
        for (ProductImage image : images) {
            deleteCloudinaryIfPresent(image);
        }
    }

    private void deleteCloudinaryIfPresent(ProductImage image) {
        if (image.getPublicId() == null || image.getPublicId().isBlank()) {
            return;
        }
        try {
            cloudinaryService.deleteImage(image.getPublicId());
        } catch (CustomException exception) {
            log.warn("Không xóa được ảnh Cloudinary {}: {}", image.getPublicId(), exception.getErrorMessage());
        }
    }

    private void unsetOtherPrimaryImages(List<ProductImage> images, ProductImage primaryImage) {
        for (ProductImage image : images) {
            if (image != primaryImage) {
                image.setIsPrimary(false);
            }
        }
    }

    private void normalizePrimaryImage(List<ProductImage> images) {
        if (images == null || images.isEmpty()) {
            return;
        }

        boolean hasPrimary = images.stream().anyMatch(image -> Boolean.TRUE.equals(image.getIsPrimary()));
        if (!hasPrimary) {
            images.get(0).setIsPrimary(true);
            return;
        }

        boolean primaryAssigned = false;
        for (ProductImage image : images) {
            if (Boolean.TRUE.equals(image.getIsPrimary())) {
                if (primaryAssigned) {
                    image.setIsPrimary(false);
                } else {
                    primaryAssigned = true;
                }
            }
        }
    }
}
