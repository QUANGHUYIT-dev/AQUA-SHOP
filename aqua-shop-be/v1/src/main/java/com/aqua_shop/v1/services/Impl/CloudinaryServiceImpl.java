package com.aqua_shop.v1.services.Impl;

import com.aqua_shop.v1.config.CloudinaryProperties;
import com.aqua_shop.v1.dto.res.CloudinaryUploadResponse;
import com.aqua_shop.v1.enums.UploadFolder;
import com.aqua_shop.v1.exceptions.CustomException;
import com.aqua_shop.v1.exceptions.ErrorCode;
import com.aqua_shop.v1.services.CloudinaryService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CloudinaryServiceImpl implements CloudinaryService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    Cloudinary cloudinary;
    CloudinaryProperties cloudinaryProperties;

    @Override
    public CloudinaryUploadResponse uploadImage(MultipartFile file, UploadFolder folder) {
        validateConfigured();
        validateFile(file);

        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", resolveFolder(folder),
                            "resource_type", "image",
                            "use_filename", true,
                            "unique_filename", true
                    )
            );
            log.info("Upload ảnh thành công: {}", result.get("public_id"));
            return mapToResponse(result);
        } catch (IOException exception) {
            log.error("Upload ảnh thất bại", exception);
            throw new CustomException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    @Override
    public List<CloudinaryUploadResponse> uploadImages(List<MultipartFile> files, UploadFolder folder) {
        if (files == null || files.isEmpty()) {
            throw new CustomException(ErrorCode.FILE_UPLOAD_EMPTY);
        }

        List<CloudinaryUploadResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                responses.add(uploadImage(file, folder));
            }
        }

        if (responses.isEmpty()) {
            throw new CustomException(ErrorCode.FILE_UPLOAD_EMPTY);
        }

        return responses;
    }

    @Override
    public void deleteImage(String publicId) {
        validateConfigured();

        if (publicId == null || publicId.isBlank()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST_PARAMETER, "publicId");
        }

        try {
            Map<?, ?> result = cloudinary.uploader().destroy(
                    publicId.trim(),
                    ObjectUtils.asMap("resource_type", "image")
            );
            log.info("Xóa ảnh Cloudinary {}: {}", publicId, result.get("result"));
        } catch (IOException exception) {
            log.error("Xóa ảnh Cloudinary thất bại: {}", publicId, exception);
            throw new CustomException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    private void validateConfigured() {
        if (!cloudinaryProperties.isConfigured()) {
            throw new CustomException(ErrorCode.CLOUDINARY_NOT_CONFIGURED);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new CustomException(ErrorCode.FILE_UPLOAD_EMPTY);
        }

        long maxBytes = (long) cloudinaryProperties.getMaxFileSizeMb() * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new CustomException(ErrorCode.FILE_UPLOAD_TOO_LARGE, cloudinaryProperties.getMaxFileSizeMb());
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new CustomException(ErrorCode.FILE_UPLOAD_INVALID_TYPE, contentType != null ? contentType : "unknown");
        }
    }

    private String resolveFolder(UploadFolder folder) {
        UploadFolder targetFolder = folder != null ? folder : UploadFolder.GENERAL;
        return cloudinaryProperties.getBaseFolder() + "/" + targetFolder.getPath();
    }

    private CloudinaryUploadResponse mapToResponse(Map<?, ?> result) {
        return CloudinaryUploadResponse.builder()
                .url(asString(result.get("secure_url")))
                .publicId(asString(result.get("public_id")))
                .format(asString(result.get("format")))
                .width(asInteger(result.get("width")))
                .height(asInteger(result.get("height")))
                .bytes(asLong(result.get("bytes")))
                .build();
    }

    private String asString(Object value) {
        return value != null ? value.toString() : null;
    }

    private Integer asInteger(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        return null;
    }

    private Long asLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return null;
    }
}
