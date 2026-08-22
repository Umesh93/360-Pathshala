package com.pathshala.service;

import com.pathshala.config.KhaltiProperties;
import com.pathshala.entity.*;
import com.pathshala.payment.KhaltiPaymentClient;
import com.pathshala.repository.Repositories.*;
import com.pathshala.util.SecurityUtils;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.PlatformTransactionManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FeatureModelContractTest {
    private final ModuleRepository modules = mock(ModuleRepository.class);
    private final SubscriptionService service = new SubscriptionService(mock(SubscriptionPlanRepository.class),
            mock(SubscriptionPlanModuleRepository.class), mock(SubscriptionRepository.class),
            mock(PaymentTransactionRepository.class), mock(SchoolRepository.class), mock(SchoolModuleRepository.class),
            modules, mock(KhaltiPaymentClient.class), new KhaltiProperties(), mock(SecurityUtils.class),
            mock(PlatformTransactionManager.class));

    @Test void featureCatalogueReturnsRequiredIncludedAndPaidOnly() {
        when(modules.findAll()).thenReturn(List.of(module(ModuleCode.STUDENT_MANAGEMENT, BillingType.REQUIRED, null, true),
                module(ModuleCode.ATTENDANCE, BillingType.INCLUDED, null, true),
                module(ModuleCode.ASSIGNMENT, BillingType.PAID, new BigDecimal("3000.00"), true),
                module(ModuleCode.HOSTEL, BillingType.COMING_SOON, null, false)));
        List<String> codes = service.listFeatures().stream().map(com.pathshala.dto.SubscriptionDtos.Feature::code).toList();
        assertEquals(Set.of("STUDENT_MANAGEMENT", "ATTENDANCE", "ASSIGNMENT"), Set.copyOf(codes));
    }

    @Test void paidFeatureMetadataIsAnnualNpr3000() {
        when(modules.findAll()).thenReturn(List.of(module(ModuleCode.CERTIFICATES, BillingType.PAID, new BigDecimal("3000.00"), true)));
        var feature = service.listFeatures().getFirst();
        assertEquals("PAID", feature.billingType());
        assertEquals(new BigDecimal("3000.00"), feature.annualPrice());
        assertEquals("ANNUAL", feature.billingPeriod());
    }

    @Test void featureSnapshotHistoryIsImmutableAndSorted() {
        PaymentTransaction payment = new PaymentTransaction();
        payment.setId(1L); payment.setSchoolId(2L); payment.setPlanId(3L); payment.setPurchaseOrderId("ORDER");
        payment.setAmountNpr(new BigDecimal("12000.00")); payment.setAmountPaisa(1200000); payment.setInitiatedAt(java.time.Instant.now());
        payment.setFeatureCodesSnapshot("ASSIGNMENT,CERTIFICATES,FEE_MANAGEMENT,TIMETABLE");
        assertEquals(List.of("ASSIGNMENT", "CERTIFICATES", "FEE_MANAGEMENT", "TIMETABLE"),
                invokePaymentHistory(payment).featureCodes());
    }

    @Test void managedEntitlementDateIsIndependentOfSubscriptionRecord() {
        SchoolModule row = new SchoolModule(); row.setManagedBySubscription(true); row.setActive(true);
        row.setEntitlementStartsOn(LocalDate.now()); row.setEntitlementEndsOn(LocalDate.now().plusYears(1).minusDays(1));
        assertFalse(row.getEntitlementStartsOn().isAfter(LocalDate.now()));
        assertFalse(row.getEntitlementEndsOn().isBefore(LocalDate.now()));
    }

    private com.pathshala.dto.SubscriptionDtos.Payment invokePaymentHistory(PaymentTransaction payment) {
        PaymentTransactionRepository payments = mock(PaymentTransactionRepository.class);
        when(payments.findBySchoolIdOrderByCreatedAtDesc(2L)).thenReturn(List.of(payment));
        SubscriptionService local = new SubscriptionService(mock(SubscriptionPlanRepository.class), mock(SubscriptionPlanModuleRepository.class),
                mock(SubscriptionRepository.class), payments, mock(SchoolRepository.class), mock(SchoolModuleRepository.class),
                modules, mock(KhaltiPaymentClient.class), new KhaltiProperties(), mock(SecurityUtils.class), mock(PlatformTransactionManager.class));
        return local.paymentHistory(2L).getFirst();
    }

    private static PlatformModule module(ModuleCode code, BillingType type, BigDecimal price, boolean active) {
        PlatformModule module = new PlatformModule(); module.setCode(code); module.setName(code.name()); module.setDescription("feature");
        module.setBillingType(type); module.setBillingPeriod(BillingPeriod.ANNUAL); module.setAnnualPrice(price);
        module.setActive(active); module.setSelectable(active); return module;
    }
}
