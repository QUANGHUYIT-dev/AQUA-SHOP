package com.aqua_shop.v1.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sys_sequences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SysSequence {
    @Id
    private String sequenceName;
    private Long nextValue;
}