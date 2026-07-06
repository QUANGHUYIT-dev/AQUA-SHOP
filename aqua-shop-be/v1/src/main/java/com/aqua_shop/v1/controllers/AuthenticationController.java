package com.aqua_shop.v1.controllers;


import com.aqua_shop.v1.dto.ApiResponse;
import com.aqua_shop.v1.dto.req.CustomerLoginRequest;
import com.aqua_shop.v1.dto.req.CustomerSignUpRequest;
import com.aqua_shop.v1.dto.req.RefreshRequest;
import com.aqua_shop.v1.dto.res.AuthenticationResponse;
import com.aqua_shop.v1.dto.res.CustomerResponse;
import com.aqua_shop.v1.dto.res.LogoutResponse;
import com.aqua_shop.v1.services.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> signUpCustomer(
            @Valid @RequestBody CustomerSignUpRequest request) {
        authenticationService.signUpCustomer(request);
        return ResponseEntity.ok(ApiResponse.<CustomerResponse>builder()
                .message("Signup Customer Successfully")
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> login(
            @Valid @RequestBody CustomerLoginRequest request) {
        AuthenticationResponse authResponse = authenticationService.login(request);
        return ResponseEntity.ok(ApiResponse.<AuthenticationResponse>builder()
                .message("Login Successfully")
                .data(authResponse)
                .build());
    }
    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refresh(@RequestBody RefreshRequest request) {
        AuthenticationResponse response = authenticationService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCurrentUser() {
        CustomerResponse userResponse = authenticationService.getCurrentUserProfile();

        return ResponseEntity.ok(ApiResponse.<CustomerResponse>builder()
                .message("User information retrieved successfully")
                .data(userResponse)
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<LogoutResponse>> logout() {
        LogoutResponse response = authenticationService.logout();
        return ResponseEntity.ok(ApiResponse.<LogoutResponse>builder()
                .message(response.getMessage())
                .data(response)
                .build());
    }
}
