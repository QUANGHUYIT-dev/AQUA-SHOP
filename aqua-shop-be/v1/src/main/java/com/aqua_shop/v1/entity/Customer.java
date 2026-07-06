package com.aqua_shop.v1.entity;

import com.aqua_shop.v1.annotations.GenericIdCode;
import com.aqua_shop.v1.enums.MembershipTier;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "customers")
public class Customer extends BaseEntity{
    @Id
    @GenericIdCode(prefix = "CUS", seqName = "customer_seq")
    @Column(name = "customer_id", length = 10)
    private String customerId;

    @Column(name = "full_name", nullable = false, length = 200)
    String fullName;

    @Column(name = "phone", length = 20)
    String phoneNumber;

    @Column(name = "email", length = 100)
    String email;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", referencedColumnName = "role_id")
    Role role;

    @Column(name = "password_hash")
    String passwordHash;

    @Column(name = "address", length = 500)
    String address;

    @Column(name = "date_of_birth")
    LocalDate dateOfBirth;

    @Column(name = "wallet_balance", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    BigDecimal walletBalance = BigDecimal.ZERO;

    @Column(name = "membership_tier", length = 20)
    @Enumerated(EnumType.STRING)
    MembershipTier membershipTier;

    @Column(name = "points", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    BigDecimal points = BigDecimal.ZERO;

    @Column(name = "image_url", length = 500)
    String imageUrl;

    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    Boolean isLocked = false;
}
