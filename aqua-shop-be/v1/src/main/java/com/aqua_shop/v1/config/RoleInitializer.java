package com.aqua_shop.v1.config;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleInitializer implements ApplicationRunner {

    JdbcTemplate jdbcTemplate;

    private static final List<RoleSeed> DEFAULT_ROLES = List.of(
            new RoleSeed(1, "ADMIN", "Quản trị viên hệ thống"),
            new RoleSeed(2, "STAFF", "Nhân viên bán hàng / xử lý đơn"),
            new RoleSeed(3, "WAREHOUSE", "Nhân viên quản lý kho"),
            new RoleSeed(4, "CUSTOMER", "Khách hàng")
    );

    @Override
    public void run(ApplicationArguments args) {
        for (RoleSeed seed : DEFAULT_ROLES) {
            jdbcTemplate.update(
                    """
                            INSERT INTO roles (role_id, role_name, description)
                            VALUES (?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                                role_name = VALUES(role_name),
                                description = VALUES(description)
                            """,
                    seed.roleId(),
                    seed.roleName(),
                    seed.description()
            );
        }
        log.debug("[ROLES] Default roles ready");
    }

    private record RoleSeed(int roleId, String roleName, String description) {
    }
}
