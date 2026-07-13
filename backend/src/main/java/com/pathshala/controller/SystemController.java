package com.pathshala.controller;

import com.pathshala.dto.CommonDtos.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/system")
public class SystemController {
    @Value("${spring.application.name}")
    private String applicationName;

    @Value("${server.servlet.context-path}")
    private String contextPath;

    @GetMapping("/info")
    public ApiResponse<Map<String, Object>> info() {
        return ApiResponse.ok("360 Pathshala API is running", Map.of(
                "application", applicationName,
                "contextPath", contextPath,
                "status", "UP",
                "version", "0.0.1-SNAPSHOT"
        ));
    }
}
