package com.pathshala.service;

import com.pathshala.controller.AuthController;
import com.pathshala.dto.ApiDtos.ChangePasswordRequest;
import com.pathshala.dto.ApiDtos.UpdateAccountProfile;
import com.pathshala.entity.RoleName;
import com.pathshala.entity.User;
import com.pathshala.repository.Repositories.UserRepository;
import com.pathshala.repository.Repositories.PasswordResetTokenRepository;
import com.pathshala.security.JwtService;
import com.pathshala.security.UserPrincipal;
import com.pathshala.service.impl.AuthServiceImpl;
import com.pathshala.util.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Method;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceProfileTest {
    private final UserRepository users = mock(UserRepository.class);
    private final SecurityUtils security = mock(SecurityUtils.class);
    private final PasswordEncoder encoder = new BCryptPasswordEncoder();
    private AuthServiceImpl service;
    private User user;

    @BeforeEach
    void setUp() {
        service = new AuthServiceImpl(users, mock(PasswordResetTokenRepository.class), encoder,
                mock(AuthenticationManager.class), mock(JwtService.class), security, mock(EmailService.class));
        user = user(41L, 9L, "admin", "admin@school.test", "School Admin", "CurrentPass1");
        when(security.currentUser()).thenReturn(new UserPrincipal(user));
        when(users.findByIdAndDeletedFalse(41L)).thenReturn(Optional.of(user));
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void meUsesAuthenticatedUserIdAndReturnsItsTenant() {
        var profile = service.me();

        assertEquals(41L, profile.userId());
        assertEquals(9L, profile.schoolId());
        verify(users).findByIdAndDeletedFalse(41L);
        verify(users, never()).findByIdAndDeletedFalse(9L);
    }

    @Test
    void updateChangesFullName() {
        var profile = service.updateMe(new UpdateAccountProfile("  Updated Admin  ", "other@test.invalid", "9800000000"));

        assertEquals("Updated Admin", profile.fullName());
        assertEquals("Updated Admin", user.getFullName());
    }

    @Test
    void updateKeepsEmailAndUsernameImmutable() {
        service.updateMe(new UpdateAccountProfile("Updated", "other@test.invalid", "9800000000"));

        assertEquals("admin@school.test", user.getEmail());
        assertEquals("admin", user.getUsername());
    }

    @Test
    void changePasswordRejectsIncorrectCurrentPassword() {
        var request = new ChangePasswordRequest("WrongPass1", "Replacement1", "Replacement1");

        assertEquals("Current password is incorrect",
                assertThrows(IllegalArgumentException.class, () -> service.changePassword(request)).getMessage());
        verify(users, never()).save(any());
    }

    @Test
    void changePasswordRejectsConfirmationMismatch() {
        var request = new ChangePasswordRequest("CurrentPass1", "Replacement1", "Replacement2");

        assertEquals("Password confirmation does not match",
                assertThrows(IllegalArgumentException.class, () -> service.changePassword(request)).getMessage());
        verify(users, never()).save(any());
    }

    @Test
    void changePasswordRejectsSamePassword() {
        var request = new ChangePasswordRequest("CurrentPass1", "CurrentPass1", "CurrentPass1");

        assertEquals("New password must be different from current password",
                assertThrows(IllegalArgumentException.class, () -> service.changePassword(request)).getMessage());
        verify(users, never()).save(any());
    }

    @Test
    void changePasswordStoresOnlyBcryptAndClearsRawPassword() {
        user.setRawPassword("historical");
        service.changePassword(new ChangePasswordRequest("CurrentPass1", "Replacement1", "Replacement1"));

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        assertTrue(encoder.matches("Replacement1", saved.getValue().getPassword()));
        assertNotEquals("Replacement1", saved.getValue().getPassword());
        assertNull(saved.getValue().getRawPassword());
    }

    @Test
    void profileRoutesUseExplicitAuthorization() throws Exception {
        for (Method method : new Method[]{
                AuthController.class.getMethod("me"),
                AuthController.class.getMethod("updateMe", UpdateAccountProfile.class)}) {
            PreAuthorize authorization = method.getAnnotation(PreAuthorize.class);
            assertNotNull(authorization, method.getName());
            assertTrue(authorization.value().contains("isAuthenticated()"), method.getName());
            assertTrue(authorization.value().contains("hasRole('SCHOOL_ADMIN')"), method.getName());
        }
        PreAuthorize passwordAuthorization = AuthController.class.getMethod("changePassword", ChangePasswordRequest.class)
                .getAnnotation(PreAuthorize.class);
        assertTrue(passwordAuthorization.value().contains("SCHOOL_ADMIN"));
        assertTrue(passwordAuthorization.value().contains("STUDENT"));
    }

    private User user(Long id, Long schoolId, String username, String email, String fullName, String password) {
        User value = new User();
        value.setId(id);
        value.setSchoolId(schoolId);
        value.setUsername(username);
        value.setEmail(email);
        value.setFullName(fullName);
        value.setPassword(encoder.encode(password));
        value.setRoles(Set.of(RoleName.SCHOOL_ADMIN));
        return value;
    }
}
