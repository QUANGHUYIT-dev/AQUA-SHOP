package com.aqua_shop.v1.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerSignUpRequest {
    @NotBlank(message = "Full name is required")
    String fullName;

    @NotBlank(message = "Phone number is required")
    String phoneNumber;

    @NotBlank(message = "Email is required")
    String email;

    @NotBlank(message = "Password is required")
    String password;

    @NotBlank(message = "Password is required")
    String confirmPassword;

    String address;

    String dateOfBirth;
}