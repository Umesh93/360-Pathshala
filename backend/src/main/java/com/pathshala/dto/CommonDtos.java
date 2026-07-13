package com.pathshala.dto;

import java.time.Instant;

public class CommonDtos {
    public record ApiResponse<T>(boolean success, String message, T data, Instant timestamp) {
        public static <T> ApiResponse<T> ok(String message, T data) {
            return new ApiResponse<>(true, message, data, Instant.now());
        }
    }
}
