package com.pathshala.service;

import com.pathshala.controller.DemoController;
import com.pathshala.controller.PublicController;
import com.pathshala.dto.DemoDtos.*;
import com.pathshala.entity.*;
import com.pathshala.repository.Repositories.*;
import com.pathshala.service.impl.DemoRequestServiceImpl;
import com.pathshala.service.impl.DemoSchoolServiceImpl;
import com.pathshala.util.SecurityUtils;
import jakarta.validation.Validation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.SimpleTransactionStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DemoWorkflowRegressionTest {
    @Mock DemoSchoolRepository demos;
    @Mock DemoRequestRepository requests;
    @Mock SchoolRepository schools;
    @Mock ModuleRepository modules;
    @Mock SchoolModuleRepository schoolModules;
    @Mock UserRepository users;
    @Mock SubscriptionRepository subscriptions;
    @Mock PasswordEncoder encoder;
    @Mock EmailService email;
    @Mock DemoConversionHistoryService conversions;
    @Mock SecurityUtils security;
    @Mock SchoolService schoolService;
    @Mock FileStorageService files;
    @Mock PlatformTransactionManager transactionManager;

    DemoSchoolServiceImpl demoService;
    DemoRequestServiceImpl requestService;

    @BeforeEach
    void setUp() {
        demoService = new DemoSchoolServiceImpl(demos, requests, schools, modules, schoolModules, users,
                subscriptions, encoder, email, conversions, security);
        requestService = new DemoRequestServiceImpl(requests, demos, schools, users, schoolModules, subscriptions,
                schoolService, files, email, encoder, security, transactionManager, modules);
        lenient().when(transactionManager.getTransaction(any())).thenReturn(new SimpleTransactionStatus());
    }

    @Test void manualCreationIsDisabled() {
        DemoController controller = new DemoController(requestService, demoService);
        var input = new CreateDemoAccountRequest(null, "admin", "secret", List.of(), LocalDate.now(), LocalDate.now().plusDays(1), null);
        assertEquals("Manual demo creation is disabled; accept a demo request",
                assertThrows(IllegalArgumentException.class, () -> controller.createDemoAccount(input)).getMessage());
    }

    @Test void extensionDaysMustBePositive() {
        try (var validator = Validation.buildDefaultValidatorFactory()) {
            assertFalse(validator.getValidator().validate(new ExtendDemoRequest(0)).isEmpty());
            assertTrue(validator.getValidator().validate(new ExtendDemoRequest(1)).isEmpty());
        }
    }

    @Test void demoListsOnlyNonDeletedRows() {
        when(demos.findByStatusInAndDeletedFalseOrderByCreatedAtDesc(List.of("ACTIVE", "EXTENDED", "EXPIRED"))).thenReturn(List.of());
        assertTrue(demoService.findAllAdmin().isEmpty());
        verify(demos).findByStatusInAndDeletedFalseOrderByCreatedAtDesc(List.of("ACTIVE", "EXTENDED", "EXPIRED"));
        verify(demos, never()).findAll();
    }

    @Test void extensionReactivatesCanonicalDemoAndSubscription() {
        DemoSchool demo = demo(7L, 11L, "EXPIRED");
        School school = school(11L);
        Subscription subscription = subscription(11L, "EXPIRED");
        User user = new User();
        when(demos.findByIdAndDeletedFalse(7L)).thenReturn(Optional.of(demo));
        when(schools.findById(11L)).thenReturn(Optional.of(school));
        when(subscriptions.findFirstBySchoolIdOrderByIdDesc(11L)).thenReturn(Optional.of(subscription));
        when(users.findBySchoolIdAndDeletedFalse(11L)).thenReturn(List.of(user));
        when(demos.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        demoService.extendDemo(7L, new ExtendDemoRequest(10));

        assertEquals(LocalDate.now().plusDays(10), demo.getExpiryDate());
        assertEquals("EXTENDED", demo.getStatus());
        assertEquals("DEMO", subscription.getSubscriptionStatus());
        assertEquals(demo.getExpiryDate(), subscription.getEndsOn());
        assertEquals("DEMO", school.getStatus());
        assertTrue(school.isActive());
        assertTrue(user.isActive());
    }

    @Test void extensionRejectsCancelledDemo() {
        when(demos.findByIdAndDeletedFalse(7L)).thenReturn(Optional.of(demo(7L, 11L, "CANCELLED")));
        assertThrows(IllegalStateException.class, () -> demoService.extendDemo(7L, new ExtendDemoRequest(1)));
    }

    @Test void linkedDeleteRevokesCanonicalAccessButPreservesRequest() {
        DemoSchool demo = demo(7L, 11L, "ACTIVE");
        School school = school(11L);
        Subscription subscription = subscription(11L, "DEMO");
        User user = new User(); user.setActive(true);
        SchoolModule entitlement = entitlement(11L, ModuleCode.ATTENDANCE, true);
        when(demos.findByIdAndDeletedFalse(7L)).thenReturn(Optional.of(demo));
        when(schools.findById(11L)).thenReturn(Optional.of(school));
        when(subscriptions.findFirstBySchoolIdOrderByIdDesc(11L)).thenReturn(Optional.of(subscription));
        when(users.findBySchoolIdAndDeletedFalse(11L)).thenReturn(List.of(user));
        when(schoolModules.findBySchoolIdAndDeletedFalse(11L)).thenReturn(List.of(entitlement));

        demoService.softDelete(7L);

        assertTrue(demo.isDeleted());
        assertEquals("CANCELLED", school.getStatus());
        assertEquals("CANCELLED", subscription.getSubscriptionStatus());
        assertFalse(user.isActive());
        assertFalse(entitlement.isActive());
        verify(requests, never()).save(any());
    }

    @Test void canonicalModuleUpdateSynchronizesExactSelectableEntitlements() {
        DemoSchool demo = demo(7L, 11L, "ACTIVE");
        SchoolModule old = entitlement(11L, ModuleCode.ATTENDANCE, true);
        when(demos.findByIdAndDeletedFalse(7L)).thenReturn(Optional.of(demo));
        when(modules.findByCode(any())).thenAnswer(invocation -> Optional.of(platform(invocation.getArgument(0), true, true, false)));
        when(modules.findAll()).thenReturn(List.of(
                billedPlatform(ModuleCode.STUDENT_MANAGEMENT, BillingType.REQUIRED), billedPlatform(ModuleCode.SUBJECT_MANAGEMENT, BillingType.REQUIRED),
                billedPlatform(ModuleCode.EXAMINATION, BillingType.REQUIRED), billedPlatform(ModuleCode.TEACHER_MANAGEMENT, BillingType.INCLUDED),
                billedPlatform(ModuleCode.TEACHER_ASSIGNMENT, BillingType.INCLUDED), billedPlatform(ModuleCode.ATTENDANCE, BillingType.INCLUDED),
                billedPlatform(ModuleCode.PARENT_MANAGEMENT, BillingType.INCLUDED)));
        when(schoolModules.findBySchoolIdAndDeletedFalse(11L)).thenReturn(List.of(old));
        when(schoolModules.findBySchoolIdAndModuleCodeAndDeletedFalse(eq(11L), any())).thenReturn(Optional.empty());
        when(demos.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        demoService.update(7L, new UpdateDemoSchoolRequest(List.of(ModuleCode.ASSIGNMENT), null, null));

        assertTrue(old.isActive());
        assertTrue(demo.getEnabledModules().contains("ASSIGNMENT"));
        assertTrue(demo.getEnabledModules().contains("STUDENT_MANAGEMENT"));
        assertTrue(demo.getEnabledModules().contains("EXAMINATION"));
        assertTrue(demo.getEnabledModules().contains("PARENT_MANAGEMENT"));
    }

    @Test void convertedDemoRejectsModuleUpdate() {
        when(demos.findByIdAndDeletedFalse(7L)).thenReturn(Optional.of(demo(7L, 11L, "CONVERTED")));
        assertThrows(IllegalStateException.class, () -> demoService.update(7L,
                new UpdateDemoSchoolRequest(List.of(ModuleCode.ASSIGNMENT), null, null)));
    }

    @Test void schedulerSynchronizesDemoStatusToExpired() {
        DemoSchool demo = demo(7L, 11L, "EXTENDED");
        School school = school(11L);
        Subscription subscription = subscription(11L, "DEMO");
        when(subscriptions.findBySubscriptionStatusIgnoreCaseAndEndsOnBefore("DEMO", LocalDate.now())).thenReturn(List.of(subscription));
        when(schools.findById(11L)).thenReturn(Optional.of(school));
        when(demos.lockBySchoolIdAndDeletedFalse(11L)).thenReturn(Optional.of(demo));
        when(users.findBySchoolIdAndDeletedFalse(11L)).thenReturn(List.of());

        new DemoExpiryScheduler(schools, subscriptions, schoolModules, users, email, demos).expireDemos(LocalDate.now());

        assertEquals("EXPIRED", demo.getStatus());
        assertEquals("EXPIRED", subscription.getSubscriptionStatus());
        assertFalse(school.isActive());
    }

    @Test void publicModulesReturnOnlyApprovedActiveInterestDefinitions() {
        PlatformModule attendance = platform(ModuleCode.ATTENDANCE, true, true, false);
        PlatformModule dashboard = platform(ModuleCode.STUDENT_DASHBOARD, true, false, false);
        PlatformModule inactive = platform(ModuleCode.ASSIGNMENT, false, true, false);
        PlatformModule internal = platform(ModuleCode.SUBJECT_MANAGEMENT, true, true, false);
        when(modules.findAll()).thenReturn(List.of(attendance, dashboard, inactive, internal));
        assertEquals(List.of(attendance, internal), new PublicController(requestService, modules).listModules());
    }

    @Test void duplicatePendingEmailIsRejectedAfterNormalization() {
        when(requests.existsByEmailAndStatusAndDeletedFalse("admin@example.com", "PENDING")).thenReturn(true);
        when(modules.findByCode(ModuleCode.ATTENDANCE)).thenReturn(Optional.of(billedPlatform(ModuleCode.ATTENDANCE, BillingType.INCLUDED)));
        var input = new PublicDemoRequestRequest("School", "Admin", "Principal", " Admin@Example.COM ", "1", "Address",
                List.of(ModuleCode.ATTENDANCE));
        assertThrows(IllegalStateException.class, () -> requestService.createPublicRequest(input));
    }

    @Test void acceptedRequestDeleteIsBlockedForAudit() {
        DemoRequest request = new DemoRequest(); request.setStatus("ACCEPTED"); request.setProvisionedSchoolId(11L);
        when(requests.lockById(3L)).thenReturn(Optional.of(request));
        assertThrows(IllegalStateException.class, () -> requestService.softDelete(3L));
        assertFalse(request.isDeleted());
    }

    @Test void acceptingAlreadyAcceptedRequestReturnsExistingAccountWithoutPassword() {
        DemoRequest request = new DemoRequest(); request.setId(3L); request.setStatus("ACCEPTED");
        request.setProvisionedSchoolId(11L); request.setDemoSchoolId(7L); request.setEmail("a@b.com"); request.setEmailStatus("SENT");
        DemoSchool demo = demo(7L, 11L, "ACTIVE");
        School school = school(11L); school.setName("School"); school.setCode("SCH-1");
        when(requests.lockById(3L)).thenReturn(Optional.of(request));
        when(demos.findById(7L)).thenReturn(Optional.of(demo));
        when(schools.findById(11L)).thenReturn(Optional.of(school));
        when(schoolModules.findBySchoolIdAndActiveTrueAndDeletedFalse(11L)).thenReturn(List.of());

        AcceptDemoResponse response = requestService.accept(3L, null);

        assertFalse(response.accountCreated());
        assertNull(response.password());
        assertEquals("SENT", response.emailStatus());
        verify(schoolService, never()).createDemoFromRequest(any(), any());
    }

    private static DemoSchool demo(Long id, Long schoolId, String status) {
        DemoSchool value = new DemoSchool(); value.setId(id); value.setSchoolId(schoolId); value.setDemoCode("DS-1");
        value.setUsername("admin"); value.setPassword("encoded"); value.setStartDate(LocalDate.now().minusDays(5));
        value.setExpiryDate(LocalDate.now().plusDays(5)); value.setStatus(status); return value;
    }

    private static School school(Long id) {
        School value = new School(); value.setId(id); value.setName("School"); value.setCode("SCH-1"); value.setEmail("a@b.com");
        value.setStatus("DEMO"); value.setActive(true); return value;
    }

    private static Subscription subscription(Long schoolId, String status) {
        Subscription value = new Subscription(); value.setSchoolId(schoolId); value.setSubscriptionStatus(status);
        value.setBaseAmount(BigDecimal.ZERO); value.setAdditionalAmount(BigDecimal.ZERO); value.setTotalAmount(BigDecimal.ZERO);
        value.setReferenceNumber("REF"); return value;
    }

    private static SchoolModule entitlement(Long schoolId, ModuleCode code, boolean active) {
        SchoolModule value = new SchoolModule(); value.setSchoolId(schoolId); value.setModuleCode(code); value.setActive(active); return value;
    }

    private static PlatformModule platform(ModuleCode code, boolean active, boolean selectable, boolean comingSoon) {
        PlatformModule value = new PlatformModule(); value.setCode(code); value.setName(code.name()); value.setActive(active);
        value.setSelectable(selectable); value.setComingSoon(comingSoon); return value;
    }

    private static PlatformModule billedPlatform(ModuleCode code, BillingType billingType) {
        PlatformModule value = platform(code, true, true, false); value.setBillingType(billingType);
        value.setBillingPeriod(BillingPeriod.ANNUAL); return value;
    }
}
