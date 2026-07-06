package com.aqua_shop.v1.config;

import com.aqua_shop.v1.annotations.GenericIdCode;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

import java.io.Serializable;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class GenericIdGenerator implements IdentifierGenerator {
    private final String prefix;
    private final String seqName;

    public GenericIdGenerator(GenericIdCode config) {
        this.prefix = config.prefix();
        this.seqName = config.seqName();
    }

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {
        try {
            return session.doReturningWork(connection -> {
                ensureSequenceRow(connection);
                long nextId = incrementAndGet(connection);
                return prefix + String.format("%04d", nextId);
            });
        } catch (Exception exception) {
            throw new RuntimeException("Không thể khởi tạo mã tự động cho " + seqName, exception);
        }
    }

    private void ensureSequenceRow(Connection connection) throws SQLException {
        String insertSql = "INSERT IGNORE INTO sys_sequences (sequence_name, next_value) VALUES (?, 0)";
        try (PreparedStatement insertStmt = connection.prepareStatement(insertSql)) {
            insertStmt.setString(1, seqName);
            insertStmt.executeUpdate();
        }
    }

    private long incrementAndGet(Connection connection) throws SQLException {
        String updateSql = "UPDATE sys_sequences SET next_value = next_value + 1 WHERE sequence_name = ?";
        int rowsUpdated;
        try (PreparedStatement updateStmt = connection.prepareStatement(updateSql)) {
            updateStmt.setString(1, seqName);
            rowsUpdated = updateStmt.executeUpdate();
        }

        if (rowsUpdated == 0) {
            ensureSequenceRow(connection);
            try (PreparedStatement updateStmt = connection.prepareStatement(updateSql)) {
                updateStmt.setString(1, seqName);
                rowsUpdated = updateStmt.executeUpdate();
            }
            if (rowsUpdated == 0) {
                throw new SQLException("Sequence not found after init: " + seqName);
            }
        }

        String selectSql = "SELECT next_value FROM sys_sequences WHERE sequence_name = ?";
        try (PreparedStatement selectStmt = connection.prepareStatement(selectSql)) {
            selectStmt.setString(1, seqName);
            try (ResultSet resultSet = selectStmt.executeQuery()) {
                if (resultSet.next()) {
                    return resultSet.getLong("next_value");
                }
            }
        }

        throw new SQLException("Cannot read next_value for sequence: " + seqName);
    }
}
