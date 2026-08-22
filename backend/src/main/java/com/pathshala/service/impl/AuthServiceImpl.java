package com.pathshala.service.impl;

import com.pathshala.dto.AuthDtos.*;
import com.pathshala.dto.ApiDtos.AccountProfile;
import com.pathshala.dto.ApiDtos.ChangePasswordRequest;
import com.pathshala.dto.ApiDtos.UpdateAccountProfile;
import com.pathshala.entity.RoleName;
import com.pathshala.entity.User;
import com.pathshala.entity.PasswordResetToken;
import com.pathshala.repository.Repositories.PasswordResetTokenRepository;
import com.pathshala.repository.Repositories.UserRepository;
import com.pathshala.security.JwtService;
import com.pathshala.security.UserPrincipal;
import com.pathshala.service.AuthService;
import com.pathshala.service.EmailService;
import com.pathshala.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokens;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final SecurityUtils securityUtils;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameOrEmailAndDeletedFalse(request.usernameOrEmail(), request.usernameOrEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), request.password()));
        UserPrincipal principal = new UserPrincipal(user);
        return new AuthResponse(jwtService.generateToken(principal), user.getId(), user.getSchoolId(), user.getUsername(), user.getRoles());
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsernameOrEmail(request.username(), request.email())) {
            throw new IllegalArgumentException("Username or email already exists");
        }
        if (!request.roles().contains(RoleName.SUPER_ADMIN) && request.schoolId() == null) {
            throw new IllegalArgumentException("schoolId is required for school users");
        }
        User user = new User();
        user.setSchoolId(request.schoolId());
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRoles(request.roles());
        User saved = userRepository.save(user);
        UserPrincipal principal = new UserPrincipal(saved);
        return new AuthResponse(jwtService.generateToken(principal), saved.getId(), saved.getSchoolId(), saved.getUsername(), saved.getRoles());
    }

    @Override
    @Transactional(readOnly = true)
    public AccountProfile me() {
        return profile(currentUser());
    }

    @Override
    @Transactional
    public AccountProfile updateMe(UpdateAccountProfile request) {
        User user = currentUser();
        user.setFullName(request.fullName().trim());
        return profile(userRepository.save(user));
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = currentUser();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new IllegalArgumentException("Password confirmation does not match");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setRawPassword(null);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        String email = request.email().trim().toLowerCase(java.util.Locale.ROOT);
        userRepository.findByEmailIgnoreCaseAndDeletedFalse(email).filter(user -> user.getEmail() != null)
                .ifPresent(user -> {
                    passwordResetTokens.deleteByUserId(user.getId());
                    byte[] randomBytes = new byte[32];
                    secureRandom.nextBytes(randomBytes);
                    String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
                    PasswordResetToken resetToken = new PasswordResetToken();
                    resetToken.setUserId(user.getId());
                    resetToken.setTokenHash(hashToken(token));
                    resetToken.setExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES));
                    passwordResetTokens.save(resetToken);
                    try {
                        emailService.sendPasswordResetEmail(user.getEmail(), token);
                    } catch (RuntimeException exception) {
                        log.warn("Password reset email delivery failed");
                    }
                });
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new IllegalArgumentException("Password confirmation does not match");
        }
        PasswordResetToken resetToken = passwordResetTokens.findByTokenHashForUpdate(hashToken(request.token()))
                .filter(token -> token.getUsedAt() == null && token.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset link."));
        User user = userRepository.findByIdAndDeletedFalse(resetToken.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset link."));
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setRawPassword(null);
        userRepository.save(user);
        resetToken.setUsedAt(Instant.now());
        passwordResetTokens.save(resetToken);
    }

    static String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Password reset is unavailable", exception);
        }
    }

    private User currentUser() {
        return userRepository.findByIdAndDeletedFalse(securityUtils.currentUser().getId())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    private AccountProfile profile(User user) {
        return new AccountProfile(user.getId(), user.getSchoolId(), user.getUsername(), user.getFullName(),
                user.getEmail(), null, user.getRoles());
    }
}
