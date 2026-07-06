package com.aqua_shop.v1.utils;

import com.aqua_shop.v1.dto.req.VariantAttributesRequest;
import com.aqua_shop.v1.entity.VariantAttributes;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Sinh SKU tự động theo format: {BRAND}-{MODEL_CODE}-{ATTRIBUTE}
 * Ưu tiên modelCode; nếu không có thì fallback parse từ tên sản phẩm.
 */
public final class SkuGenerator {

    public static final int MAX_SKU_LENGTH = 50;

    private static final Pattern UNIT_SUFFIX_PATTERN = Pattern.compile("(?i)(CM|ML|LIT|L|G|KG|W|WATT|MM)$");
    private static final Set<String> STOP_WORDS = Set.of(
            "DEN", "LED", "CA", "CAY", "THUY", "SINH", "PHU", "KIEN", "THIET", "BI",
            "THUOC", "HOA", "CHAT", "THUC", "AN", "BON", "CHA", "MAU", "HOP", "LOAI"
    );

    private SkuGenerator() {
    }

    public static String generate(
            String productName,
            String brandName,
            String modelCode,
            VariantAttributesRequest attributes) {
        return generate(
                productName,
                brandName,
                modelCode,
                attributes != null ? attributes.getSize() : null,
                attributes != null ? attributes.getVolume() : null,
                attributes != null ? attributes.getColor() : null
        );
    }

    public static String generate(
            String productName,
            String brandName,
            String modelCode,
            VariantAttributes attributes) {
        return generate(
                productName,
                brandName,
                modelCode,
                attributes != null ? attributes.getSize() : null,
                attributes != null ? attributes.getVolume() : null,
                attributes != null ? attributes.getColor() : null
        );
    }

    public static String generate(
            String productName,
            String brandName,
            String modelCode,
            String size,
            String volume,
            String color) {

        List<String> parts = new ArrayList<>();

        String brandPart = toSkuPart(brandName, 12);
        if (!brandPart.isEmpty()) {
            parts.add(brandPart);
        }

        String productPart = resolveProductPart(productName, brandName, modelCode);
        if (!productPart.isEmpty() && (brandPart.isEmpty() || !productPart.equals(brandPart))) {
            parts.add(productPart);
        }

        if (parts.isEmpty() && hasText(productName)) {
            parts.add(toSkuPart(productName, 20));
        }

        String attributePart = resolveAttributePart(size, volume, color);
        if (!attributePart.isEmpty()) {
            parts.add(attributePart);
        }

        if (parts.isEmpty()) {
            return "SKU";
        }

        return truncate(String.join("-", parts), MAX_SKU_LENGTH);
    }

    public static String normalizeModelCode(String modelCode) {
        if (!hasText(modelCode)) {
            return null;
        }
        return toSkuPart(modelCode.trim(), 50);
    }

    static String resolveProductPart(String productName, String brandName, String modelCode) {
        String normalizedModelCode = normalizeModelCode(modelCode);
        if (hasText(normalizedModelCode)) {
            return truncate(normalizedModelCode, 15);
        }
        return extractProductCode(productName, brandName);
    }

    public static String withSuffix(String baseSku, int suffix) {
        if (suffix <= 1) {
            return truncate(baseSku, MAX_SKU_LENGTH);
        }
        String suffixPart = "-" + suffix;
        return truncate(baseSku, MAX_SKU_LENGTH - suffixPart.length()) + suffixPart;
    }

    public static String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }

    static String extractProductCode(String productName, String brandName) {
        if (!hasText(productName)) {
            return "";
        }

        String cleaned = productName.trim();
        if (hasText(brandName)) {
            cleaned = cleaned.replaceAll("(?i)" + Pattern.quote(brandName.trim()), " ");
        }

        String[] tokens = cleaned.split("[\\s/|,]+");
        List<String> significant = new ArrayList<>();

        for (String token : tokens) {
            String part = toSkuPart(token, 15);
            if (part.isEmpty() || STOP_WORDS.contains(part)) {
                continue;
            }
            if (!significant.contains(part)) {
                significant.add(part);
            }
        }

        if (significant.isEmpty()) {
            return toSkuPart(cleaned, 15);
        }

        return truncate(String.join("-", significant), 15);
    }

    static String resolveAttributePart(String size, String volume, String color) {
        if (hasText(size)) {
            return normalizeAttributeValue(size);
        }
        if (hasText(volume)) {
            return normalizeAttributeValue(volume);
        }
        if (hasText(color)) {
            return toSkuPart(color, 10);
        }
        return "";
    }

    static String normalizeAttributeValue(String value) {
        String part = toSkuPart(value, 10);
        if (part.isEmpty()) {
            return "";
        }
        return UNIT_SUFFIX_PATTERN.matcher(part).replaceAll("");
    }

    static String toSkuPart(String input, int maxLength) {
        if (!hasText(input)) {
            return "";
        }

        String slug = StringUtils.toSlug(input.trim());
        if (slug == null || slug.isBlank()) {
            return "";
        }

        String part = slug.toUpperCase(Locale.ENGLISH)
                .replace("-", " ")
                .replaceAll("[^A-Z0-9 ]", "")
                .trim()
                .replaceAll("\\s+", "-");

        return truncate(part, maxLength);
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
