package com.aqua_shop.v1.config;

import com.aqua_shop.v1.dto.ErrorResponse;
import com.aqua_shop.v1.exceptions.CustomException;
import com.aqua_shop.v1.exceptions.ErrorCode;
import io.swagger.v3.oas.annotations.Hidden;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
@Hidden
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponse> handleCustomException(CustomException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        log.warn("[{}] {}", errorCode.name(), exception.getErrorMessage());

        return ResponseEntity.status(errorCode.getStatus()).body(
                ErrorResponse.of(
                        String.valueOf(errorCode.getCode()),
                        errorCode.getStatus(),
                        exception.getErrorMessage(),
                        null
                )
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException exception) {
        List<ErrorResponse.FieldError> fieldErrors = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::toFieldError)
                .collect(Collectors.toList());

        log.warn("[VALIDATION] {}", fieldErrors);

        return ResponseEntity.badRequest().body(
                ErrorResponse.of(
                        String.valueOf(ErrorCode.VALIDATION_FAILED.getCode()),
                        ErrorCode.VALIDATION_FAILED.getStatus(),
                        ErrorCode.VALIDATION_FAILED.getMessageTemplate(),
                        fieldErrors
                )
        );
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorResponse> handleBindException(BindException exception) {
        List<ErrorResponse.FieldError> fieldErrors = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::toFieldError)
                .collect(Collectors.toList());

        return ResponseEntity.badRequest().body(
                ErrorResponse.of(
                        String.valueOf(ErrorCode.VALIDATION_FAILED.getCode()),
                        ErrorCode.VALIDATION_FAILED.getStatus(),
                        ErrorCode.VALIDATION_FAILED.getMessageTemplate(),
                        fieldErrors
                )
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException exception) {
        List<ErrorResponse.FieldError> fieldErrors = exception.getConstraintViolations()
                .stream()
                .map(this::toFieldError)
                .collect(Collectors.toList());

        return ResponseEntity.badRequest().body(
                ErrorResponse.of(
                        String.valueOf(ErrorCode.VALIDATION_FAILED.getCode()),
                        ErrorCode.VALIDATION_FAILED.getStatus(),
                        ErrorCode.VALIDATION_FAILED.getMessageTemplate(),
                        fieldErrors
                )
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException exception) {
        log.warn("[INVALID_JSON] {}", exception.getMessage());

        return ResponseEntity.badRequest().body(
                ErrorResponse.of(
                        String.valueOf(ErrorCode.INVALID_JSON.getCode()),
                        ErrorCode.INVALID_JSON.getStatus(),
                        ErrorCode.INVALID_JSON.getMessageTemplate(),
                        null
                )
        );
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParameter(MissingServletRequestParameterException exception) {
        return ResponseEntity.badRequest().body(
                ErrorResponse.of(
                        String.valueOf(ErrorCode.INVALID_REQUEST_PARAMETER.getCode()),
                        ErrorCode.INVALID_REQUEST_PARAMETER.getStatus(),
                        ErrorCode.INVALID_REQUEST_PARAMETER.formatMessage(exception.getParameterName()),
                        null
                )
        );
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException exception) {
        String param = exception.getName();
        String value = exception.getValue() != null ? exception.getValue().toString() : "null";

        return ResponseEntity.badRequest().body(
                ErrorResponse.of(
                        String.valueOf(ErrorCode.INVALID_REQUEST_PARAMETER.getCode()),
                        ErrorCode.INVALID_REQUEST_PARAMETER.getStatus(),
                        ErrorCode.INVALID_REQUEST_PARAMETER.formatMessage(param + "=" + value),
                        null
                )
        );
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException exception) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(
                ErrorResponse.of(
                        String.valueOf(ErrorCode.METHOD_NOT_ALLOWED.getCode()),
                        ErrorCode.METHOD_NOT_ALLOWED.getStatus(),
                        ErrorCode.METHOD_NOT_ALLOWED.getMessageTemplate(),
                        null
                )
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException exception) {
        String cause = exception.getMostSpecificCause().getMessage();
        log.warn("[DATA_INTEGRITY] {}", cause);

        if (cause != null) {
            String lowerCause = cause.toLowerCase();
            if (lowerCause.contains("sku")) {
                return ResponseEntity.badRequest().body(
                        ErrorResponse.of(
                                String.valueOf(ErrorCode.PRODUCT_SKU_ALREADY_EXISTS.getCode()),
                                ErrorCode.PRODUCT_SKU_ALREADY_EXISTS.getStatus(),
                                ErrorCode.PRODUCT_SKU_ALREADY_EXISTS.formatMessage("unknown"),
                                null
                        )
                );
            }
            if (lowerCause.contains("slug")) {
                return ResponseEntity.status(ErrorCode.PRODUCT_SLUG_ALREADY_EXISTS.getStatus()).body(
                        ErrorResponse.of(
                                String.valueOf(ErrorCode.PRODUCT_SLUG_ALREADY_EXISTS.getCode()),
                                ErrorCode.PRODUCT_SLUG_ALREADY_EXISTS.getStatus(),
                                ErrorCode.PRODUCT_SLUG_ALREADY_EXISTS.formatMessage("unknown"),
                                null
                        )
                );
            }
        }

        return ResponseEntity.badRequest().body(
                ErrorResponse.of(
                        String.valueOf(ErrorCode.DATA_INTEGRITY_VIOLATION.getCode()),
                        ErrorCode.DATA_INTEGRITY_VIOLATION.getStatus(),
                        ErrorCode.DATA_INTEGRITY_VIOLATION.getMessageTemplate(),
                        null
                )
        );
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException exception) {
        log.warn("[FILE_TOO_LARGE] {}", exception.getMessage());

        return ResponseEntity.badRequest().body(
                ErrorResponse.of(
                        String.valueOf(ErrorCode.FILE_UPLOAD_TOO_LARGE.getCode()),
                        ErrorCode.FILE_UPLOAD_TOO_LARGE.getStatus(),
                        ErrorCode.FILE_UPLOAD_TOO_LARGE.formatMessage("configured limit"),
                        null
                )
        );
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ErrorResponse> handleMultipartException(MultipartException exception) {
        log.warn("[MULTIPART_ERROR] {}", exception.getMessage());

        return ResponseEntity.badRequest().body(
                ErrorResponse.of(
                        String.valueOf(ErrorCode.FILE_UPLOAD_FAILED.getCode()),
                        ErrorCode.FILE_UPLOAD_FAILED.getStatus(),
                        ErrorCode.FILE_UPLOAD_FAILED.getMessageTemplate(),
                        null
                )
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException exception) {
        log.warn("[ACCESS_DENIED] {}", exception.getMessage());

        return ResponseEntity.status(ErrorCode.UNAUTHORIZED.getStatus()).body(
                ErrorResponse.of(
                        String.valueOf(ErrorCode.UNAUTHORIZED.getCode()),
                        ErrorCode.UNAUTHORIZED.getStatus(),
                        ErrorCode.UNAUTHORIZED.getMessageTemplate(),
                        null
                )
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpectedException(Exception exception) {
        log.error("[INTERNAL_ERROR]", exception);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ErrorResponse.of(
                        String.valueOf(ErrorCode.INTERNAL_SERVER_ERROR.getCode()),
                        ErrorCode.INTERNAL_SERVER_ERROR.getStatus(),
                        ErrorCode.INTERNAL_SERVER_ERROR.getMessageTemplate(),
                        null
                )
        );
    }

    private ErrorResponse.FieldError toFieldError(FieldError fieldError) {
        return ErrorResponse.FieldError.builder()
                .field(fieldError.getField())
                .message(fieldError.getDefaultMessage())
                .build();
    }

    private ErrorResponse.FieldError toFieldError(ConstraintViolation<?> violation) {
        return ErrorResponse.FieldError.builder()
                .field(violation.getPropertyPath().toString())
                .message(violation.getMessage())
                .build();
    }
}
