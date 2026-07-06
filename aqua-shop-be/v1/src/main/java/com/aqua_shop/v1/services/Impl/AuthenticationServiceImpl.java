package com.aqua_shop.v1.services.Impl;

import com.aqua_shop.v1.config.ConfigAdminSupport;
import com.aqua_shop.v1.dto.req.CustomerLoginRequest;
import com.aqua_shop.v1.dto.req.CustomerSignUpRequest;
import com.aqua_shop.v1.dto.res.AuthenticationResponse;
import com.aqua_shop.v1.dto.res.CustomerResponse;
import com.aqua_shop.v1.dto.res.LogoutResponse;
import com.aqua_shop.v1.entity.Customer;
import com.aqua_shop.v1.entity.Role;
import com.aqua_shop.v1.enums.MembershipTier;
import com.aqua_shop.v1.exceptions.CustomException;
import com.aqua_shop.v1.exceptions.ErrorCode;
import com.aqua_shop.v1.mappers.CustomerMapper;
import com.aqua_shop.v1.repositories.CustomerRepository;
import com.aqua_shop.v1.services.AuthenticationService;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationServiceImpl implements AuthenticationService {

    CustomerRepository customerRepository;
    CustomerMapper customerMapper;
    ConfigAdminSupport configAdminSupport;
    PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${jwt.signerKey}")
    @NonFinal
    String signerKey;

    @Value("${jwt.access-token-expiry}")
    @NonFinal
    long accessTokenExpiry;

    @Value("${jwt.refresh-token-expiry}")
    @NonFinal
    long refreshTokenExpiry;

    @Value("${jwt.issuer}")
    @NonFinal
    String issuer;

    @Override
    public void signUpCustomer(CustomerSignUpRequest request) {
        String email = normalizeString(request.getEmail());
        if (email != null && customerRepository.existsByEmailIgnoreCase(email)) {
            throw new CustomException(ErrorCode.CUSTOMER_EMAIL_ALREADY_EXISTS, email);
        }
        String phoneNumber = request.getPhoneNumber();
        if (phoneNumber != null && customerRepository.existsByPhoneNumber(phoneNumber)) {
            throw new CustomException(ErrorCode.CUSTOMER_PHONE_ALREADY_EXISTS, phoneNumber);
        }

        String passwordCheck = request.getPassword() != null ? request.getPassword().trim() : "";
        String confirmPassword = request.getConfirmPassword() != null ? request.getConfirmPassword().trim() : "";
        if (!passwordCheck.equals(confirmPassword)) {
            log.error("[AUTHENTICATION SERVICE] Password and Confirm Password do not match for email: {}", request.getEmail());
            throw new CustomException(ErrorCode.PASSWORD_INCORRECT);
        }

        Customer customer = customerMapper.toCustomer(request);
        customer.setEmail(email);
        customer.setPhoneNumber(phoneNumber);
        customer.setPasswordHash(passwordCheck.isEmpty() ? null : passwordEncoder.encode(passwordCheck));
        customer.setPoints(BigDecimal.ZERO);
        customer.setMembershipTier(MembershipTier.BRONZE);
        Role defaultRole = Role.builder().roleId(4).build();
        customer.setRole(defaultRole);

        customerRepository.save(customer);
        log.info("[AUTHENTICATION SERVICE] Customer {} signed up successfully", customer.getCustomerId());
    }

    @Override
    public AuthenticationResponse login(CustomerLoginRequest request) {
        String emailInput = normalizeString(request.getUsername());

        if (configAdminSupport.matchesCredentials(emailInput, request.getPassword())) {
            Customer admin = configAdminSupport.buildSyntheticCustomer();
            log.info("[AUTHENTICATION SERVICE] Config admin logged in: {}", admin.getEmail());
            return buildAuthResponse(admin);
        }

        Customer customer = customerRepository.findByEmail(emailInput)
                .orElseThrow(() -> new CustomException(ErrorCode.EMAIL_NOT_FOUND, emailInput));

        validateAccountStatus(customer.getIsLocked(), emailInput);
        validatePassword(request.getPassword(), customer.getPasswordHash(), "CUSTOMER", emailInput);

        return buildAuthResponse(customer);
    }

    private AuthenticationResponse buildAuthResponse(Customer customer) {
        String accessToken = generateAccessToken(customer);
        String refreshToken = generateRefreshToken(customer);

        return AuthenticationResponse.builder()
                .authenticated(true)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(accessTokenExpiry)
                .user(AuthenticationResponse.UserInfo.builder()
                        .id(customer.getCustomerId())
                        .email(customer.getEmail())
                        .fullName(customer.getFullName())
                        .role(resolveRoleName(customer))
                        .build())
                .build();
    }

    private void validateAccountStatus(Boolean isLocked, String identifier) {
        if (Boolean.TRUE.equals(isLocked)) {
            log.warn("[AUTHENTICATION SERVICE] Account is locked: {}", identifier);
            throw new CustomException(ErrorCode.ACCOUNT_LOCKED, identifier);
        }
    }

    private void validatePassword(String providePassword,
                                  String storedPasswordHash,
                                  String entityType,
                                  String identifier) {
        if (!passwordEncoder.matches(providePassword, storedPasswordHash)) {
            log.warn("[AUTHENTICATION SERVICE] Invalid password for {}: {}", entityType, identifier);
            throw new CustomException(ErrorCode.PASSWORD_INCORRECT);
        }
    }

    private String generateAccessToken(Customer customer) {
        return buildToken(customer, accessTokenExpiry, true);
    }

    private String generateRefreshToken(Customer customer) {
        return buildToken(customer, refreshTokenExpiry, false);
    }

    private String buildToken(Customer customer, long expirySeconds, boolean isAccessToken) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);

        JWTClaimsSet.Builder claimsBuilder = new JWTClaimsSet.Builder()
                .subject(customer.getCustomerId())
                .issuer(issuer != null ? issuer : "aqua_shop.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(expirySeconds, ChronoUnit.SECONDS).toEpochMilli()
                ));

        if (isAccessToken) {
            claimsBuilder.claim("email", customer.getEmail());
            claimsBuilder.claim("role", resolveRoleName(customer));
        }

        Payload payload = new Payload(claimsBuilder.build().toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(signerKey.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public Customer getCurrentCustomer() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new CustomException(ErrorCode.UNAUTHENTICATED);
        }

        String customerId = jwt.getSubject();

        if (customerId == null || customerId.isBlank()) {
            throw new CustomException(ErrorCode.UNAUTHENTICATED);
        }

        if (configAdminSupport.isConfigAdminSubject(customerId)) {
            return configAdminSupport.buildSyntheticCustomer();
        }

        return customerRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new CustomException(ErrorCode.CUSTOMER_NOT_FOUND, customerId));
    }

    @Override
    public CustomerResponse getCurrentUserProfile() {
        Customer customer = getCurrentCustomer();
        if (configAdminSupport.isConfigAdminSubject(customer.getCustomerId())) {
            return configAdminSupport.buildProfileResponse();
        }
        return customerMapper.toCustomerResponse(customer);
    }

    @Override
    public AuthenticationResponse refreshToken(String refreshTokenRequest) {
        try {
            JWSObject jwsObject = JWSObject.parse(refreshTokenRequest);
            JWSVerifier verifier = new MACVerifier(signerKey.getBytes());

            if (!jwsObject.verify(verifier)) {
                throw new CustomException(ErrorCode.UNAUTHENTICATED);
            }

            JWTClaimsSet claimsSet = JWTClaimsSet.parse(jwsObject.getPayload().toJSONObject());
            Date expiryTime = claimsSet.getExpirationTime();

            if (expiryTime == null || expiryTime.before(new Date())) {
                throw new CustomException(ErrorCode.UNAUTHENTICATED);
            }

            String customerId = claimsSet.getSubject();
            Customer customer;

            if (configAdminSupport.isConfigAdminSubject(customerId)) {
                customer = configAdminSupport.buildSyntheticCustomer();
            } else {
                customer = customerRepository.findByCustomerId(customerId)
                        .orElseThrow(() -> new CustomException(ErrorCode.CUSTOMER_NOT_FOUND, customerId));
                validateAccountStatus(customer.getIsLocked(), customer.getEmail());
            }

            return buildAuthResponse(customer);

        } catch (CustomException ex) {
            throw ex;
        } catch (Exception e) {
            log.error("[AUTHENTICATION SERVICE] Refresh token failed: {}", e.getMessage());
            throw new CustomException(ErrorCode.UNAUTHENTICATED);
        }
    }

    @Override
    public LogoutResponse logout() {
        SecurityContextHolder.clearContext();
        log.info("[AUTHENTICATION SERVICE] Logout successful");
        return LogoutResponse.builder()
                .message("Logout successful")
                .build();
    }

    private String normalizeString(String value) {
        return (value != null && !value.trim().isEmpty()) ? value.trim() : null;
    }

    private String resolveRoleName(Customer customer) {
        if (customer.getRole() == null || customer.getRole().getRoleName() == null) {
            return "CUSTOMER";
        }
        return customer.getRole().getRoleName().trim().toUpperCase();
    }
}
