package com.pathshala.controller;

import com.pathshala.dto.AuthDtos.*;
import com.pathshala.dto.ApiDtos.AccountProfile;
import com.pathshala.dto.ApiDtos.ChangePasswordRequest;
import com.pathshala.dto.ApiDtos.UpdateAccountProfile;
import com.pathshala.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated() and hasRole('SCHOOL_ADMIN')")
    public AccountProfile me() {
        return authService.me();
    }

    @PatchMapping("/me")
    @PreAuthorize("isAuthenticated() and hasRole('SCHOOL_ADMIN')")
    public AccountProfile updateMe(@Valid @RequestBody UpdateAccountProfile request) {
        return authService.updateMe(request);
    }

    @PostMapping("/me/change-password")
    @PreAuthorize("isAuthenticated() and hasRole('SCHOOL_ADMIN')")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Client should discard JWT token"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request);
        return ResponseEntity.ok(Map.of("message", "Password reset instructions queued if account exists"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
    }
}
