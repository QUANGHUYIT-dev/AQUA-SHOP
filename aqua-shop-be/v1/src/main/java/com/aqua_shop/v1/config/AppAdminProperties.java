package com.aqua_shop.v1.config;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.admin")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppAdminProperties {

    /** Bật đăng nhập admin qua email/mật khẩu trong config (không lưu DB). */
    boolean enabled = false;

    String email;

    String password;

    String fullName = "Quản trị viên";

    String phoneNumber;
}
