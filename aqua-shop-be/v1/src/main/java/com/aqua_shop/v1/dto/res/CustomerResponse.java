package com.aqua_shop.v1.dto.res;

import com.aqua_shop.v1.enums.MembershipTier;
import com.aqua_shop.v1.enums.UserRole;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
public class CustomerResponse {
    String customerId;
    String fullName;
    String phoneNumber;
    String email;
    String address;
    MembershipTier membershipTier;
    BigDecimal points;
    UserRole role;
    String imageUrl;
    String dateOfBirth;
    BigDecimal walletBalance;
}
