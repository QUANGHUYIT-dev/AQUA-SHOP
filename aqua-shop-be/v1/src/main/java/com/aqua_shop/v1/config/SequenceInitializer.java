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
public class SequenceInitializer implements ApplicationRunner {

    JdbcTemplate jdbcTemplate;

    private static final List<SequenceDefinition> SEQUENCE_DEFINITIONS = List.of(
            new SequenceDefinition("product_seq", "products", "product_id", "PRD"),
            new SequenceDefinition("product_variant_seq", "product_variants", "variant_id", "VAR"),
            new SequenceDefinition("brand_seq", "brands", "brand_id", "BRD"),
            new SequenceDefinition("banner_seq", "banners", "banner_id", "BNR"),
            new SequenceDefinition("category_seq", "categories", "category_id", "CATE"),
            new SequenceDefinition("customer_seq", "customers", "customer_id", "CUS"),
            new SequenceDefinition("cart_seq", "carts", "cart_id", "CRT"),
            new SequenceDefinition("cart_item_seq", "cart_items", "cart_item_id", "CIT"),
            new SequenceDefinition("order_seq", "orders", "order_id", "ORD"),
            new SequenceDefinition("order_item_seq", "order_items", "order_item_id", "OIT"),
            new SequenceDefinition("order_history_seq", "order_histories", "order_history_id", "OHT"),
            new SequenceDefinition("inventory_seq", "inventories", "inventory_id", "INV"),
            new SequenceDefinition("inventory_history_seq", "inventory_histories", "inventory_history_id", "IVH")
    );

    @Override
    public void run(ApplicationArguments args) {
        for (SequenceDefinition definition : SEQUENCE_DEFINITIONS) {
            ensureSequence(definition);
        }
    }

    private void ensureSequence(SequenceDefinition definition) {
        jdbcTemplate.update(
                "INSERT IGNORE INTO sys_sequences (sequence_name, next_value) VALUES (?, 0)",
                definition.name()
        );

        Integer maxValue = findMaxSequenceValue(definition);
        if (maxValue != null && maxValue > 0) {
            jdbcTemplate.update(
                    "UPDATE sys_sequences SET next_value = GREATEST(next_value, ?) WHERE sequence_name = ?",
                    maxValue,
                    definition.name()
            );
        }

        log.debug("Sequence ready: {} (max synced: {})", definition.name(), maxValue);
    }

    private Integer findMaxSequenceValue(SequenceDefinition definition) {
        if (!tableExists(definition.table())) {
            return null;
        }

        String sql = String.format(
                "SELECT MAX(CAST(SUBSTRING(%s, %d) AS UNSIGNED)) FROM %s",
                definition.idColumn(),
                definition.prefix().length() + 1,
                definition.table()
        );

        return jdbcTemplate.queryForObject(sql, Integer.class);
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                """
                        SELECT COUNT(*)
                        FROM information_schema.tables
                        WHERE table_schema = DATABASE()
                          AND table_name = ?
                        """,
                Integer.class,
                tableName
        );
        return count != null && count > 0;
    }

    private record SequenceDefinition(String name, String table, String idColumn, String prefix) {
    }
}
