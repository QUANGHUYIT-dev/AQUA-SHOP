package com.aqua_shop.v1.entity;

import com.aqua_shop.v1.annotations.GenericIdCode;
import com.aqua_shop.v1.enums.CategoryType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.GenericGenerator;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "categories")
public class Category extends BaseEntity {

    @Id
    @GenericIdCode(prefix = "CATE", seqName = "category_seq")
    @Column(name = "category_id", length = 10)
    String categoryId;

    @Column(name = "name", nullable = false, length = 150)
    String name;

    @Column(name = "slug", nullable = false, unique = true, length = 180)
    String slug;

    @Column(name = "description", length = 500)
    String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category_type", nullable = false, length = 20)
    CategoryType categoryType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    Category parent;

    @OneToMany(mappedBy = "parent")
    @Builder.Default
    List<Category> children = new ArrayList<>();

    @Column(name = "sort_order")
    @Builder.Default
    Integer sortOrder = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    Boolean isActive = true;
}
