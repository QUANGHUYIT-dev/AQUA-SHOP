package com.aqua_shop.v1.dto.req;

import com.aqua_shop.v1.enums.MembershipTier;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateCustomerRequest {
    String fullName;
    String phoneNumber;
    String email;

    @Size(min=6,message= " Password must ber ai least 6 characters")
    String password;

    String address;
    String dateOfBirth;
    BigDecimal walletBalance;

    MembershipTier membershipTier;
}
