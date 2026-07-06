package com.aqua_shop.v1.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

@Component
public class PublicEndpointBearerTokenResolver implements BearerTokenResolver {

    private static final String[] PUBLIC_PATTERNS = {
            "/auth",
            "/auth/login",
            "/auth/refresh",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/api-docs/**",
            "/webjars/**",
            "/swagger-resources/**",
            "/actuator/health",
            "/actuator/info"
    };

    private final DefaultBearerTokenResolver delegate = new DefaultBearerTokenResolver();
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    public String resolve(HttpServletRequest request) {
        if (isPublicEndpoint(request.getServletPath())) {
            return null;
        }
        return delegate.resolve(request);
    }

    private boolean isPublicEndpoint(String servletPath) {
        for (String pattern : PUBLIC_PATTERNS) {
            if (pathMatcher.match(pattern, servletPath)) {
                return true;
            }
        }
        return false;
    }
}
