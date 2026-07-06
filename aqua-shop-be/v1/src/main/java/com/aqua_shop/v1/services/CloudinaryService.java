package com.aqua_shop.v1.services;

import com.aqua_shop.v1.dto.res.CloudinaryUploadResponse;
import com.aqua_shop.v1.enums.UploadFolder;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CloudinaryService {

    CloudinaryUploadResponse uploadImage(MultipartFile file, UploadFolder folder);

    List<CloudinaryUploadResponse> uploadImages(List<MultipartFile> files, UploadFolder folder);

    void deleteImage(String publicId);
}
