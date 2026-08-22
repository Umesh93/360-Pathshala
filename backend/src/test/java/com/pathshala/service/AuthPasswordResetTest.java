package com.pathshala.service;

import com.pathshala.dto.AuthDtos.ForgotPasswordRequest;
import com.pathshala.dto.AuthDtos.ResetPasswordRequest;
import com.pathshala.entity.PasswordResetToken;
import com.pathshala.entity.User;
import com.pathshala.repository.Repositories.PasswordResetTokenRepository;
import com.pathshala.repository.Repositories.UserRepository;
import com.pathshala.security.JwtService;
import com.pathshala.service.impl.AuthServiceImpl;
import com.pathshala.util.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Optional;
import java.util.HexFormat;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthPasswordResetTest {
    private final UserRepository users = mock(UserRepository.class);
    private final PasswordResetTokenRepository tokens = mock(PasswordResetTokenRepository.class);
    private final EmailService email = mock(EmailService.class);
    private final PasswordEncoder encoder = new BCryptPasswordEncoder();
    private AuthServiceImpl service;
    private User user;

    @BeforeEach
    void setUp() {
        service = new AuthServiceImpl(users, tokens, encoder, mock(AuthenticationManager.class),
                mock(JwtService.class), mock(SecurityUtils.class), email);
        user = new User();
        user.setId(1L);
        user.setEmail("admin@example.com");
        user.setUsername("admin");
        user.setPassword(encoder.encode("OldPass1"));
        when(users.findByEmailIgnoreCaseAndDeletedFalse("admin@example.com"))
                .thenReturn(Optional.of(user));
        when(users.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(user));
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(tokens.save(any(PasswordResetToken.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void existingAndMissingEmailsUseSameGenericResponsePath() {
        service.requestPasswordReset(new ForgotPasswordRequest("admin@example.com"));
        service.requestPasswordReset(new ForgotPasswordRequest("missing@example.com"));

        verify(email).sendPasswordResetEmail(eq("admin@example.com"), anyString());
        verify(tokens).deleteByUserId(1L);
    }

    @Test
    void resetStoresHashAndSendsRawTokenOnlyToEmail() {
        service.requestPasswordReset(new ForgotPasswordRequest("admin@example.com"));

        var token = org.mockito.ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokens).save(token.capture());
        var raw = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(email).sendPasswordResetEmail(eq("admin@example.com"), raw.capture());
        assertEquals(64, token.getValue().getTokenHash().length());
        assertNotEquals(raw.getValue(), token.getValue().getTokenHash());
        assertTrue(token.getValue().getExpiresAt().isAfter(Instant.now()));
    }

    @Test
    void successfulResetHashesLookupUpdatesPasswordAndMarksTokenUsed() {
        PasswordResetToken token = new PasswordResetToken();
        token.setUserId(1L);
        token.setTokenHash(hash("raw-token"));
        token.setExpiresAt(Instant.now().plusSeconds(60));
        when(tokens.findByTokenHashForUpdate(token.getTokenHash())).thenReturn(Optional.of(token));

        service.resetPassword(new ResetPasswordRequest("raw-token", "NewPass1", "NewPass1"));

        assertTrue(encoder.matches("NewPass1", user.getPassword()));
        assertNotNull(token.getUsedAt());
        verify(users).save(user);
        verify(tokens).save(token);
    }

    @Test
    void mismatchExpiredAndUsedTokensAreRejected() {
        assertEquals("Password confirmation does not match", assertThrows(IllegalArgumentException.class,
                () -> service.resetPassword(new ResetPasswordRequest("raw-token", "NewPass1", "OtherPass1"))).getMessage());

        PasswordResetToken expired = new PasswordResetToken();
        expired.setExpiresAt(Instant.now().minusSeconds(1));
        when(tokens.findByTokenHashForUpdate(hash("expired"))).thenReturn(Optional.of(expired));
        assertEquals("Invalid or expired password reset link.", assertThrows(IllegalArgumentException.class,
                () -> service.resetPassword(new ResetPasswordRequest("expired", "NewPass1", "NewPass1"))).getMessage());

        PasswordResetToken used = new PasswordResetToken();
        used.setExpiresAt(Instant.now().plusSeconds(60));
        used.setUsedAt(Instant.now());
        when(tokens.findByTokenHashForUpdate(hash("used"))).thenReturn(Optional.of(used));
        assertThrows(IllegalArgumentException.class,
                () -> service.resetPassword(new ResetPasswordRequest("used", "NewPass1", "NewPass1")));
    }

    private static String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new AssertionError(exception);
        }
    }
}
