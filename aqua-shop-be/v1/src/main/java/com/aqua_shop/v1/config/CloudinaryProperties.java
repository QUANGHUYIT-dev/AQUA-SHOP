package com.aqua_shop.v1.config;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "cloudinary")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CloudinaryProperties {

    String cloudName;
    String apiKey;
    String apiSecret;
    String baseFolder = "aqua-shop";
    int maxFileSizeMb = 10;

    public boolean isConfigured() {
        return cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank();
    }
}
