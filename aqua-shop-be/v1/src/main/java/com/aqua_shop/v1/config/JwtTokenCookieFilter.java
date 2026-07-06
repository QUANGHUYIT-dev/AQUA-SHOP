package com.aqua_shop.v1.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenCookieFilter extends OncePerRequestFilter {

    private final CustomJwtDecoder customJwtDecoder;
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())
                        || "aqua_access_token".equals(cookie.getName())) {
                    token = cookie.getValue();

                    request =
                            new HttpServletRequestWrapperWithAuth(request, "Bearer " + token);
                    break;
                }
            }
        }
        if (StringUtils.hasText(token)) {
            try {
                Jwt jwt = customJwtDecoder.decode(token);

                Object roleClaim = jwt.getClaim("role");
                String role = roleClaim != null ? String.valueOf(roleClaim) : "CUSTOMER";
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())
                );
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(jwt, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("[SECURITY] Xác thực JWT thành công cho user: {}", jwt.getSubject());
            } catch (Exception e) {
                SecurityContextHolder.clearContext();
                log.warn("[SECURITY] Giải mã JWT thất bại: {}", e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }
}
