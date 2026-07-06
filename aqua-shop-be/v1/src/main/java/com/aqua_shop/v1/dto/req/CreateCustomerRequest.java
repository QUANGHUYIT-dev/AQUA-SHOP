package com.aqua_shop.v1.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateCustomerRequest {
    @NotBlank(message = "Full name is required")
    String fullName;

    @NotBlank(message = "Phone is required")
    String phoneNumber;

    String email;

    String imageUrl;

    String dateOfBirth;

    @Size(min=6,message= " Password must ber ai least 6 characters")
    String password;

    String address;

}
