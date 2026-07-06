package com.aqua_shop.v1.config;

import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.SignedJWT;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.util.Date;

@Component
@Slf4j
public class CustomJwtDecoder implements JwtDecoder {

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
    public Jwt decode(String token) throws JwtException {
        try {
            // 1. Parse chuỗi Token thành Object JWT
            SignedJWT signedJWT = SignedJWT.parse(token);

            // 2. BẮT BUỘC: Kiểm tra chữ ký bảo mật (Verify Signature)
            JWSVerifier verifier = new MACVerifier(signerKey.getBytes());
            if (!signedJWT.verify(verifier)) {
                log.warn("[SECURITY][JWT] Token có chữ ký không hợp lệ! Có dấu hiệu giả mạo.");
                throw new JwtException("Invalid token signature");
            }

            // 3. Kiểm tra xem Access Token này đã hết hạn (quá 1 tiếng) chưa
            Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            if (expirationTime == null || expirationTime.before(new Date())) {
                log.warn("[SECURITY][JWT] Access Token đã hết hạn sử dụng.");
                throw new JwtException("Token expired"); // Ném lỗi này để kích hoạt JwtAuthenticationEntryPoint
            }

            // 4. Nếu mọi thứ OK, tạo Object Jwt trả về cho Spring Security phân quyền
            return new Jwt(token,
                    signedJWT.getJWTClaimsSet().getIssueTime().toInstant(),
                    expirationTime.toInstant(),
                    signedJWT.getHeader().toJSONObject(),
                    signedJWT.getJWTClaimsSet().getClaims());

        } catch (ParseException e) {
            log.warn("[SECURITY][JWT] Không thể parse cấu trúc Token: {}", e.getMessage());
            throw new JwtException("Invalid token format");
        } catch (Exception e) {
            log.error("[SECURITY][JWT] Lỗi xác thực Token: {}", e.getMessage());
            throw new JwtException("Authentication failed");
        }
    }
}