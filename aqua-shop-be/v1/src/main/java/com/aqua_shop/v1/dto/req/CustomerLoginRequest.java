package com.aqua_shop.v1.dto.req;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CustomerLoginRequest {
    @NotBlank(message = "Phone number or email is required")
    String username;

    // Password is optional for customers created at counter
    String password;
}
