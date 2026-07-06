package com.aqua_shop.v1.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    @Builder.Default
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime timestamp = OffsetDateTime.now(ZoneOffset.UTC);

    @Builder.Default
    private String message = "success";
    private T data;

    public ApiResponse(String message) {
        this.timestamp = OffsetDateTime.now(ZoneOffset.UTC);
        this.message = message;
    }

    public ApiResponse(T data) {
        this.timestamp = OffsetDateTime.now(ZoneOffset.UTC); // Lấy thời gian hiện tại theo UTC
        this.data = data;
        this.message = "Success";
    }

    public ApiResponse(String message, T data) {
        this.timestamp = OffsetDateTime.now(ZoneOffset.UTC); // Lấy thời gian hiện tại theo UTC
        this.data = data;
        this.message = message;
    }
}
