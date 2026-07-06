package com.aqua_shop.v1.config;

import com.aqua_shop.v1.dto.res.CustomerResponse;
import com.aqua_shop.v1.entity.Customer;
import com.aqua_shop.v1.entity.Role;
import com.aqua_shop.v1.enums.MembershipTier;
import com.aqua_shop.v1.enums.UserRole;
import jakarta.annotation.PostConstruct;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Admin đăng nhập từ {@code app.admin} trong application.yaml — không lưu bản ghi trong DB.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConfigAdminSupport {

    public static final String SUBJECT_ID = "ADMIN_CFG";

    AppAdminProperties adminProperties;

    @PostConstruct
    void warnIfMisconfigured() {
        if (adminProperties.isEnabled() && !isConfigured()) {
            log.warn(
                    "app.admin.enabled=true nhưng thiếu email/password — đăng nhập admin qua config bị tắt. "
                            + "Set APP_ADMIN_EMAIL + APP_ADMIN_PASSWORD hoặc dùng application-local.yaml");
        }
    }

    public boolean isEnabled() {
        return adminProperties.isEnabled() && isConfigured();
    }

    public boolean isConfigured() {
        String email = normalize(adminProperties.getEmail());
        String password = adminProperties.getPassword();
        return email != null && password != null && !password.isBlank();
    }

    public boolean isConfigAdminSubject(String subject) {
        return SUBJECT_ID.equals(subject);
    }

    public boolean matchesCredentials(String email, String rawPassword) {
        if (!isEnabled()) {
            return false;
        }

        String configEmail = normalize(adminProperties.getEmail());
        if (configEmail == null || email == null) {
            return false;
        }

        if (!configEmail.equalsIgnoreCase(email.trim())) {
            return false;
        }

        String configPassword = adminProperties.getPassword();
        return configPassword != null && configPassword.equals(rawPassword);
    }

    public Customer buildSyntheticCustomer() {
        Role adminRole = Role.builder()
                .roleId(1)
                .roleName("ADMIN")
                .description("Quản trị viên (config)")
                .build();

        return Customer.builder()
                .customerId(SUBJECT_ID)
                .fullName(defaultFullName())
                .email(normalize(adminProperties.getEmail()))
                .phoneNumber(normalize(adminProperties.getPhoneNumber()))
                .role(adminRole)
                .membershipTier(MembershipTier.BRONZE)
                .points(BigDecimal.ZERO)
                .walletBalance(BigDecimal.ZERO)
                .isLocked(false)
                .build();
    }

    public CustomerResponse buildProfileResponse() {
        CustomerResponse response = new CustomerResponse();
        response.setCustomerId(SUBJECT_ID);
        response.setFullName(defaultFullName());
        response.setEmail(normalize(adminProperties.getEmail()));
        response.setPhoneNumber(normalize(adminProperties.getPhoneNumber()));
        response.setRole(UserRole.ADMIN);
        response.setMembershipTier(MembershipTier.BRONZE);
        response.setPoints(BigDecimal.ZERO);
        response.setWalletBalance(BigDecimal.ZERO);
        return response;
    }

    private String defaultFullName() {
        String fullName = normalize(adminProperties.getFullName());
        return fullName != null ? fullName : "Quản trị viên";
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
