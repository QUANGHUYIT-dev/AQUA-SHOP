package com.aqua_shop.v1.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    @Column(name ="create_at", nullable = false , updatable = false)
    LocalDateTime createdAt;

    //Tự động cập nhật thời gian mới nhất mỗi khi bạn có hành động Chỉnh sửa (Update) dữ liệu.
    @LastModifiedDate
    @Column(name = " update_at")
    LocalDateTime updatedAt;
}
