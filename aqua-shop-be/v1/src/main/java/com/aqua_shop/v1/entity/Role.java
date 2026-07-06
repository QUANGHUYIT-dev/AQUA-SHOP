package com.aqua_shop.v1.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "roles")
public class Role {

    @Id
    @Column(name = "role_id", length = 50)
    Integer roleId; // Ví dụ: "ADMIN", "CUSTOMER", "STAFF"

    @Column(name = "role_name", length = 50, nullable = false)
    String roleName;

    @Column(name = "description", columnDefinition = "TEXT")
    String description; // Mô tả quyền hạn (Ví dụ: "Quyền quản trị tối cao", "Khách mua hàng")
}