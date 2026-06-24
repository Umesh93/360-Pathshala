package com.pathshala.dto;

import com.pathshala.entity.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public class AuthDtos {
    public record LoginRequest(@NotBlank String usernameOrEmail, @NotBlank String password) {}
    public record RegisterRequest(Long schoolId, @NotBlank String username, @Email String email, @NotBlank String password,
                                  @NotBlank String fullName, @NotNull Set<RoleName> roles) {}
    public record AuthResponse(String token, Long userId, Long schoolId, String username, Set<RoleName> roles) {}
    public record ForgotPasswordRequest(@Email String email) {}
    public record ResetPasswordRequest(@NotBlank String token, @NotBlank String newPassword) {}
}
