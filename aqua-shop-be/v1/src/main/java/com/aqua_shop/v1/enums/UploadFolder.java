package com.aqua_shop.v1.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UploadFolder {
    PRODUCTS("products"),
    BRANDS("brands"),
    BANNERS("banners"),
    CATEGORIES("categories"),
    GENERAL("general");

    private final String path;
}
