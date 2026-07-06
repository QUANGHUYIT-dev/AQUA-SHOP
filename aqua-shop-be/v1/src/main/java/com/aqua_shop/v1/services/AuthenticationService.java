package com.aqua_shop.v1.services;

import com.aqua_shop.v1.dto.req.CustomerLoginRequest;
import com.aqua_shop.v1.dto.req.CustomerSignUpRequest;
import com.aqua_shop.v1.dto.res.AuthenticationResponse;
import com.aqua_shop.v1.dto.res.CustomerResponse;
import com.aqua_shop.v1.dto.res.LogoutResponse;
import com.aqua_shop.v1.entity.Customer;

public interface AuthenticationService {
    void signUpCustomer(CustomerSignUpRequest request);
    AuthenticationResponse login(CustomerLoginRequest request);
    AuthenticationResponse refreshToken(String refreshTokenRequest);
    Customer getCurrentCustomer();
    CustomerResponse getCurrentUserProfile();
    LogoutResponse logout();
}
