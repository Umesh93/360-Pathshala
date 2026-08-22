package com.pathshala.controller;

import com.pathshala.entity.DemoSchool;
import com.pathshala.entity.RoleName;
import com.pathshala.entity.School;
import com.pathshala.entity.User;
import com.pathshala.exception.ForbiddenException;
import com.pathshala.repository.Repositories.*;
import com.pathshala.security.UserPrincipal;
import com.pathshala.service.SchoolService;
import com.pathshala.util.SecurityUtils;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class SaasControllerLogoAccessTest {
    private final SchoolRepository schools = mock(SchoolRepository.class);
    private final DemoSchoolRepository demos = mock(DemoSchoolRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final SchoolService schoolService = mock(SchoolService.class);
    private final com.pathshala.service.ModuleAccessService moduleAccess = mock(com.pathshala.service.ModuleAccessService.class);
    private final SecurityUtils security = mock(SecurityUtils.class);
    private final SaasController controller = new SaasController(schools, mock(SubscriptionPlanRepository.class),
            mock(ModuleRepository.class), mock(SchoolModuleRepository.class), demos, moduleAccess, users, schoolService, security);

    @Test
    void deniesLegacyDemoWhenItsIdCollidesWithRealSchool() {
        User user = user(7L, 11L, "legacy-demo", "demo@example.test");
        School school = school(11L, "paid@example.test");
        when(security.currentUser()).thenReturn(new UserPrincipal(user));
        when(schools.findById(11L)).thenReturn(Optional.of(school));
        when(demos.findByIdAndUsernameAndDeletedFalse(11L, "legacy-demo")).thenReturn(Optional.of(new DemoSchool()));

        ForbiddenException error = assertThrows(ForbiddenException.class, () -> controller.logo(11L));

        assertEquals("Legacy demo branding unavailable", error.getMessage());
        verifyNoInteractions(schoolService);
    }

    @Test
    void allowsLinkedPaidSchoolAdministrator() {
        User user = user(7L, 11L, "paid-admin", "paid@example.test");
        School school = school(11L, "paid@example.test");
        when(security.currentUser()).thenReturn(new UserPrincipal(user));
        when(schools.findById(11L)).thenReturn(Optional.of(school));
        when(demos.findByIdAndUsernameAndDeletedFalse(11L, "paid-admin")).thenReturn(Optional.empty());
        when(users.findById(7L)).thenReturn(Optional.of(user));
        when(schoolService.loadLogo(11L)).thenReturn(null);

        assertEquals(404, controller.logo(11L).getStatusCode().value());
        verify(schoolService).loadLogo(11L);
    }

    private User user(Long id, Long schoolId, String username, String email) {
        User user = new User();
        user.setId(id);
        user.setSchoolId(schoolId);
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword("unused");
        user.setRoles(Set.of(RoleName.SCHOOL_ADMIN));
        user.setActive(true);
        return user;
    }

    private School school(Long id, String email) {
        School school = new School();
        school.setId(id);
        school.setName("Paid school");
        school.setCode("SCH-000011");
        school.setEmail(email);
        return school;
    }
}
