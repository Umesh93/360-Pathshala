package com.pathshala.service;

import com.pathshala.config.KhaltiProperties;
import com.pathshala.entity.School;
import com.pathshala.entity.SubscriptionPlan;
import com.pathshala.entity.Subscription;
import com.pathshala.entity.SchoolModule;
import com.pathshala.payment.KhaltiClientException;
import com.pathshala.payment.KhaltiPaymentClient;
import com.pathshala.repository.Repositories.*;
import com.pathshala.util.SecurityUtils;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.PlatformTransactionManager;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import com.pathshala.entity.ModuleCode;
import com.pathshala.entity.PaymentTransaction;
import org.springframework.transaction.TransactionStatus;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SubscriptionServiceMockedClientTest {
    private final SubscriptionPlanRepository plans = mock(SubscriptionPlanRepository.class);
    private final SubscriptionPlanModuleRepository planModules = mock(SubscriptionPlanModuleRepository.class);
    private final SubscriptionRepository subscriptions = mock(SubscriptionRepository.class);
    private final SchoolRepository schools = mock(SchoolRepository.class);
    private final SchoolModuleRepository schoolModules = mock(SchoolModuleRepository.class);
    private final KhaltiPaymentClient client = mock(KhaltiPaymentClient.class);
    private final KhaltiProperties properties = new KhaltiProperties();
    private final SecurityUtils security = mock(SecurityUtils.class);
    private final SubscriptionService service = new SubscriptionService(plans, planModules, subscriptions,
            mock(PaymentTransactionRepository.class), schools, schoolModules,
            mock(ModuleRepository.class), client, properties, security, mock(PlatformTransactionManager.class));

    @Test void disabledProviderReturnsSafeErrorWithoutExternalCall() {
        when(security.requiredSchoolId()).thenReturn(1L);
        KhaltiClientException error = assertThrows(KhaltiClientException.class, () -> service.initiate(Set.of(ModuleCode.ASSIGNMENT)));
        assertEquals("Khalti payments are not available", error.getMessage());
        verifyNoInteractions(client);
    }

    @Test void missingSecretReturnsSafeErrorWithoutExternalCall() {
        properties.setEnabled(true); when(security.requiredSchoolId()).thenReturn(1L);
        assertThrows(KhaltiClientException.class, () -> service.initiate(Set.of(ModuleCode.ASSIGNMENT)));
        verifyNoInteractions(client);
    }

    @Test void activePlanRetrievalIsDatabaseBacked() {
        SubscriptionPlan plan = plan(true); when(plans.findByActiveTrueOrderByIdAsc()).thenReturn(List.of(plan));
        when(planModules.findByPlanId(1L)).thenReturn(List.of());
        assertEquals("BASIC", service.listPlans(false).getFirst().code());
        verifyNoInteractions(client);
    }

    @Test void adminPlanRetrievalIncludesInactivePlans() {
        SubscriptionPlan plan = plan(false); when(plans.findAll()).thenReturn(List.of(plan)); when(planModules.findByPlanId(1L)).thenReturn(List.of());
        assertFalse(service.listPlans(true).getFirst().active());
        verifyNoInteractions(client);
    }

    @Test void currentMapsExactTenantEntitlementsSortedByCode() {
        Subscription subscription = new Subscription(); subscription.setId(3L); subscription.setSchoolId(8L);
        subscription.setSubscriptionStatus("ACTIVE"); subscription.setPaymentStatus("COMPLETED");
        SchoolModule timetable = entitlement(8L, ModuleCode.TIMETABLE, false, true, null, null);
        SchoolModule assignment = entitlement(8L, ModuleCode.ASSIGNMENT, true, true,
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31));
        when(subscriptions.findBySchoolIdOrderByIdDesc(8L)).thenReturn(List.of(subscription));
        when(schools.findById(8L)).thenReturn(Optional.empty());
        when(schoolModules.findBySchoolIdAndDeletedFalse(8L)).thenReturn(List.of(timetable, assignment));

        var current = service.current(8L);

        assertEquals(List.of("ASSIGNMENT", "TIMETABLE"), current.entitlements().stream().map(e -> e.code()).toList());
        assertTrue(current.entitlements().getFirst().active());
        assertEquals(LocalDate.of(2026, 12, 31), current.entitlements().getFirst().endsOn());
        verify(schoolModules).findBySchoolIdAndDeletedFalse(8L);
        verify(schoolModules, never()).findBySchoolIdAndDeletedFalse(argThat(id -> id != null && id != 8L));
    }

    @Test void completedLookupActivatesSubscriptionAndSelectedPaidEntitlementsOnly() {
        PaymentTransactionRepository paymentRepository = mock(PaymentTransactionRepository.class);
        SubscriptionRepository subscriptionRepository = mock(SubscriptionRepository.class);
        SchoolRepository schoolRepository = mock(SchoolRepository.class);
        SchoolModuleRepository schoolModuleRepository = mock(SchoolModuleRepository.class);
        SubscriptionPlanRepository planRepository = mock(SubscriptionPlanRepository.class);
        ModuleRepository moduleRepository = mock(ModuleRepository.class);
        SubscriptionService local = new SubscriptionService(planRepository, planModules, subscriptionRepository,
                paymentRepository, schoolRepository, schoolModuleRepository, moduleRepository, client,
                properties, security, mock(PlatformTransactionManager.class));
        PaymentTransaction payment = payment(7L, 8L, 9L, 10L, "ORDER-7", "PX-7",
                "ASSIGNMENT,TIMETABLE", new BigDecimal("6000.00"), 600000);
        Subscription subscription = subscription(9L, 8L, 10L, "ASSIGNMENT,TIMETABLE", new BigDecimal("6000.00"));
        School school = new School(); school.setId(8L);
        SchoolModule required = entitlement(8L, ModuleCode.STUDENT_MANAGEMENT, true, false, null, null);
        SchoolModule included = entitlement(8L, ModuleCode.ATTENDANCE, true, false, null, null);
        SchoolModule selectedExisting = entitlement(8L, ModuleCode.ASSIGNMENT, false, true, null, null);
        SchoolModule unselectedPaid = entitlement(8L, ModuleCode.FEE_MANAGEMENT, false, true, null, null);
        SchoolModule comingSoon = entitlement(8L, ModuleCode.HOSTEL, false, false, null, null);
        when(paymentRepository.findWithLockById(7L)).thenReturn(Optional.of(payment));
        when(subscriptionRepository.findById(9L)).thenReturn(Optional.of(subscription));
        when(schoolRepository.lockByIdAndDeletedFalse(8L)).thenReturn(Optional.of(school));
        when(schoolModuleRepository.findBySchoolIdAndDeletedFalse(8L)).thenReturn(List.of(required, included, selectedExisting, unselectedPaid, comingSoon));
        when(paymentRepository.save(payment)).thenReturn(payment);
        when(planRepository.findById(10L)).thenReturn(Optional.empty());
        when(schoolRepository.findById(8L)).thenReturn(Optional.empty());

        org.springframework.test.util.ReflectionTestUtils.invokeMethod(local, "processLookup", 7L,
                new KhaltiPaymentClient.Lookup("PX-7", "Completed", 600000L, null, "TX-7", "{}"));

        assertEquals(PaymentTransaction.Status.COMPLETED, payment.getStatus());
        assertNotNull(payment.getVerifiedAt());
        assertEquals("TX-7", payment.getTransactionId());
        assertEquals("Completed", payment.getProviderStatus());
        assertEquals("COMPLETED", subscription.getPaymentStatus());
        assertEquals("ACTIVE", subscription.getSubscriptionStatus());
        assertEquals(LocalDate.now(), subscription.getStartsOn());
        assertEquals(LocalDate.now().plusYears(1).minusDays(1), subscription.getEndsOn());
        assertEquals("ASSIGNMENT,TIMETABLE", subscription.getModuleCodesSnapshot());
        assertEquals(new BigDecimal("6000.00"), subscription.getTotalAmount());
        assertTrue(required.isActive());
        assertTrue(included.isActive());
        assertTrue(selectedExisting.isActive());
        assertEquals(LocalDate.now().plusYears(1).minusDays(1), selectedExisting.getEntitlementEndsOn());
        assertFalse(unselectedPaid.isActive());
        assertFalse(comingSoon.isActive());
        org.mockito.ArgumentCaptor<SchoolModule> savedModules = org.mockito.ArgumentCaptor.forClass(SchoolModule.class);
        verify(schoolModuleRepository, times(2)).save(savedModules.capture());
        assertTrue(savedModules.getAllValues().contains(selectedExisting));
        SchoolModule newTimetable = savedModules.getAllValues().stream()
                .filter(row -> row.getModuleCode() == ModuleCode.TIMETABLE).findFirst().orElseThrow();
        assertTrue(newTimetable.isActive());
        assertEquals(LocalDate.now().plusYears(1).minusDays(1), newTimetable.getEntitlementEndsOn());
        verify(schoolModuleRepository, never()).save(required);
        verify(schoolModuleRepository, never()).save(included);
        verify(schoolModuleRepository, never()).save(unselectedPaid);
        verify(schoolModuleRepository, never()).save(comingSoon);
        verify(moduleRepository, never()).save(any());
    }

    @Test void incompleteProviderResultMarksPaymentFailedWithDiagnostic() {
        PaymentTransactionRepository paymentRepository = mock(PaymentTransactionRepository.class);
        PlatformTransactionManager transactionManager = mock(PlatformTransactionManager.class);
        TransactionStatus txStatus = mock(TransactionStatus.class);
        when(transactionManager.getTransaction(any())).thenReturn(txStatus);
        when(security.requiredSchoolId()).thenReturn(8L);
        properties.setEnabled(true); properties.setSecretKey("secret");
        properties.setReturnUrl("http://localhost/callback"); properties.setWebsiteUrl("http://localhost");
        var local = new SubscriptionService(plans, planModules, subscriptions, paymentRepository, schools,
                schoolModules, mock(ModuleRepository.class), client, properties, security, transactionManager);
        PaymentTransaction payment = new PaymentTransaction(); payment.setId(7L); payment.setSubscriptionId(9L);
        var contextSchool = new com.pathshala.entity.School(); contextSchool.setId(8L);
        // Preparation is covered by feature-model tests; this focused assertion verifies persisted failure behavior via reflection.
        KhaltiClientException failure = new KhaltiClientException("Khalti returned an incomplete payment response: missing pidx", 200, "{\"detail\":\"missing\"}");
        when(paymentRepository.findWithLockById(7L)).thenReturn(Optional.of(payment));
        org.springframework.test.util.ReflectionTestUtils.invokeMethod(local, "markInitiationFailed", 7L, failure);
        assertEquals(PaymentTransaction.Status.FAILED, payment.getStatus());
        assertEquals("HTTP_200", payment.getProviderStatus());
        assertEquals("{\"detail\":\"missing\"}", payment.getRawResponse());
        assertTrue(payment.getFailureReason().contains("missing pidx"));
        verify(paymentRepository).save(payment);
    }

    private static SubscriptionPlan plan(boolean active) {
        SubscriptionPlan p = new SubscriptionPlan(); p.setId(1L); p.setCode("BASIC"); p.setName("Basic");
        p.setMonthlyPrice(new BigDecimal("1500.00")); p.setDurationDays(30); p.setCurrency("NPR"); p.setActive(active); return p;
    }

    private static PaymentTransaction payment(Long id, Long schoolId, Long subscriptionId, Long planId, String orderId,
                                              String pidx, String snapshot, BigDecimal amountNpr, long amountPaisa) {
        PaymentTransaction payment = new PaymentTransaction(); payment.setId(id); payment.setSchoolId(schoolId);
        payment.setSubscriptionId(subscriptionId); payment.setPlanId(planId); payment.setPurchaseOrderId(orderId);
        payment.setPidx(pidx); payment.setFeatureCodesSnapshot(snapshot); payment.setAmountNpr(amountNpr);
        payment.setAmountPaisa(amountPaisa); payment.setInitiatedAt(Instant.now()); return payment;
    }

    private static Subscription subscription(Long id, Long schoolId, Long planId, String snapshot, BigDecimal amount) {
        Subscription subscription = new Subscription(); subscription.setId(id); subscription.setSchoolId(schoolId);
        subscription.setPlanId(planId); subscription.setPlanCode("FEATURE_ADDONS"); subscription.setPlanName("Subscription & Features");
        subscription.setCurrency("NPR"); subscription.setDurationDays(365); subscription.setBaseAmount(BigDecimal.ZERO);
        subscription.setAdditionalAmount(amount); subscription.setTotalAmount(amount); subscription.setPaymentStatus("PENDING");
        subscription.setSubscriptionStatus("PENDING"); subscription.setReferenceNumber("ORDER-7");
        subscription.setModuleCodesSnapshot(snapshot); return subscription;
    }

    private static SchoolModule entitlement(Long schoolId, ModuleCode code, boolean active, boolean managed,
                                             LocalDate startsOn, LocalDate endsOn) {
        SchoolModule row = new SchoolModule(); row.setSchoolId(schoolId); row.setModuleCode(code); row.setActive(active);
        row.setManagedBySubscription(managed); row.setEntitlementStartsOn(startsOn); row.setEntitlementEndsOn(endsOn);
        return row;
    }
}
