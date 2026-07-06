package com.aqua_shop.v1.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    String errorCode;
    HttpStatus status;
    String message;
    List<FieldError> fieldErrors;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    OffsetDateTime timestamp;

    public static ErrorResponse of(String errorCode, HttpStatus status, String message, List<FieldError> fieldErrors) {
        return ErrorResponse.builder()
                .errorCode(errorCode)
                .status(status)
                .message(message)
                .fieldErrors(fieldErrors)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Getter
    @Builder
    public static class FieldError {
        private String field;
        private String message;
    }
}
