package com.aqua_shop.v1.repositories;

import com.aqua_shop.v1.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String>, JpaSpecificationExecutor<Category> {

    boolean existsByName(String name);

    boolean existsByNameAndCategoryIdNot(String name, String categoryId);

    List<Category> findByParentIsNull();

    List<Category> findByParentIsNullOrderBySortOrderAsc();

    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("SELECT c FROM Category c WHERE c.parent.categoryId = :parentId AND c.isActive = true")
    List<Category> findChildrenByParentId(@Param("parentId") String parentId);
}