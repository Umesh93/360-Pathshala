package com.pathshala.dto;

import com.pathshala.entity.PaymentTransaction.Status;
import com.pathshala.entity.ModuleCode;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.List;
import java.util.Set;

public final class SubscriptionDtos {
    private SubscriptionDtos() {}
    public record Plan(Long id, String code, String name, BigDecimal price, int durationDays, String currency, boolean active, List<String> moduleCodes) {}
    public record Feature(String code, String name, String description, String billingType, BigDecimal annualPrice, String billingPeriod, boolean active) {}
    public record FeatureEntitlement(String code, boolean active, boolean managedBySubscription,
                                     LocalDate startsOn, LocalDate endsOn) {}
    public record CurrentSubscription(Long id, Long schoolId, String schoolName, Long planId, String planCode, String planName, String status, String paymentStatus, String currency, LocalDate startsOn, LocalDate endsOn, List<String> featureCodes, List<FeatureEntitlement> entitlements) {}
    public record Payment(Long id, Long schoolId, String schoolName, Long subscriptionId, Long planId, String planName, String purchaseOrderId, String pidx, String transactionId, long amountPaisa, BigDecimal amountNpr, String currency, Status status, String providerStatus, String paymentUrl, Instant initiatedAt, Instant verifiedAt, String failureReason, List<String> featureCodes) {}
    public record InitiateRequest(Long planId, Set<ModuleCode> featureCodes) {}
    public record PaymentStatus(Status status, String purchaseOrderId, String pidx, String paymentUrl, String failureReason) {}
    public record AdminHistory(List<Payment> payments, List<CurrentSubscription> subscriptions) {}
}
