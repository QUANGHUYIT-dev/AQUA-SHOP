package com.aqua_shop.v1.config;

import jakarta.servlet.Filter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@EnableAsync
@EnableScheduling
@Slf4j
@RequiredArgsConstructor
public class SecurityConfig {
    private static final String[] PUBLIC_ENDPOINTS = {
            // === Auth Endpoints ===
            "/auth",
            "/auth/login",
            "/auth/refresh",
            "/auth/login/customer",
            "/auth/refresh/customer",

            // === Public Storefront Endpoints (Cho phép khách xem tự do) ===
            "/categories/**",
            "/products/**",
            "/banners/active",
            "/brands",
            "/brands/slug/**",


            // === Swagger & OpenAPI Endpoints (Bao quát mọi trường hợp) ===
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/api-docs/**",            // Khắc phục trường hợp bóc tách context-path
            "/api/v1/api-docs/**",
            "/api/v1/swagger-ui/**",
            "/webjars/**",
            "/swagger-resources/**",

            // === Actuator ===
            "/actuator/health",
            "/actuator/info"
    };

    private final CustomJwtDecoder customJwtDecoder;
    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtTokenCookieFilter jwtTokenCookieFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final PublicEndpointBearerTokenResolver publicEndpointBearerTokenResolver;

    @Value("${app.security.enable-verbose-logging:false}")
    private boolean enableVerboseLogging;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .authorizeHttpRequests(request -> request
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .bearerTokenResolver(publicEndpointBearerTokenResolver)
                        .jwt(jwtConfigurer -> jwtConfigurer
                                .decoder(customJwtDecoder)
                                .jwtAuthenticationConverter(jwtAuthenticationConverter()))
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers
                        .xssProtection(
                                xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
                        .frameOptions(frame -> frame.deny()));

        httpSecurity.addFilterBefore(jwtTokenCookieFilter, UsernamePasswordAuthenticationFilter.class);

        if (enableVerboseLogging) {
            log.warn("Verbose security logging is enabled. This should be disabled in production.");
        }

        return httpSecurity.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
        grantedAuthoritiesConverter.setAuthoritiesClaimName("role");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        // Mã hóa mật khẩu với độ mạnh 10
        return new BCryptPasswordEncoder(10);
    }
}
