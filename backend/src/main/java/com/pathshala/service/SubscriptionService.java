package com.pathshala.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathshala.config.KhaltiProperties;
import com.pathshala.dto.SubscriptionDtos;
import com.pathshala.entity.*;
import com.pathshala.exception.ForbiddenException;
import com.pathshala.exception.ResourceNotFoundException;
import com.pathshala.payment.KhaltiClientException;
import com.pathshala.payment.KhaltiPaymentClient;
import com.pathshala.repository.Repositories.*;
import com.pathshala.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.net.URI;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {
    private final SubscriptionPlanRepository plans;
    private final SubscriptionPlanModuleRepository planModules;
    private final SubscriptionRepository subscriptions;
    private final PaymentTransactionRepository payments;
    private final SchoolRepository schools;
    private final SchoolModuleRepository schoolModules;
    private final ModuleRepository modules;
    private final KhaltiPaymentClient khalti;
    private final KhaltiProperties khaltiProperties;
    private final SecurityUtils security;
    private final PlatformTransactionManager transactionManager;

    @Transactional(readOnly = true)
    public List<SubscriptionDtos.Plan> listPlans(boolean includeInactive) {
        return (includeInactive ? plans.findAll() : plans.findByActiveTrueOrderByIdAsc()).stream().map(this::toPlan).toList();
    }

    @Transactional(readOnly = true)
    public List<SubscriptionDtos.Feature> listFeatures() {
        return modules.findAll().stream().filter(PlatformModule::isActive)
                .filter(module -> Set.of(BillingType.REQUIRED, BillingType.INCLUDED, BillingType.PAID).contains(module.getBillingType()))
                .sorted(Comparator.comparing(PlatformModule::getBillingType).thenComparing(PlatformModule::getName))
                .map(module -> new SubscriptionDtos.Feature(module.getCode().name(), module.getName(), module.getDescription(),
                        module.getBillingType().name(), module.getAnnualPrice(), module.getBillingPeriod().name(), module.isActive()))
                .toList();
    }

    @Transactional(readOnly = true)
    public SubscriptionDtos.CurrentSubscription current(Long schoolId) {
        List<Subscription> history = subscriptions.findBySchoolIdOrderByIdDesc(schoolId);
        return history.stream().filter(s -> "ACTIVE".equalsIgnoreCase(s.getSubscriptionStatus()) || "DEMO".equalsIgnoreCase(s.getSubscriptionStatus()))
                .findFirst().or(() -> history.stream().filter(s -> "SCHEDULED".equalsIgnoreCase(s.getSubscriptionStatus())).findFirst())
                .map(this::toSubscription).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<SubscriptionDtos.CurrentSubscription> subscriptionHistory(Long schoolId) {
        return subscriptions.findBySchoolIdOrderByIdDesc(schoolId).stream().map(this::toSubscription).toList();
    }

    @Transactional(readOnly = true)
    public List<SubscriptionDtos.Payment> paymentHistory(Long schoolId) {
        return payments.findBySchoolIdOrderByCreatedAtDesc(schoolId).stream().map(this::toPayment).toList();
    }

    @Transactional(readOnly = true)
    public List<SubscriptionDtos.Payment> allPayments() { return payments.findAllByOrderByCreatedAtDesc().stream().map(this::toPayment).toList(); }

    @Transactional(readOnly = true)
    public List<SubscriptionDtos.CurrentSubscription> allSubscriptions() { return subscriptions.findAllByOrderByCreatedAtDesc().stream().map(this::toSubscription).toList(); }

    @Transactional(readOnly = true)
    public SubscriptionDtos.Payment payment(Long id, Long schoolId) {
        PaymentTransaction p = payments.findById(id).orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        if (schoolId != null && !schoolId.equals(p.getSchoolId())) throw new ForbiddenException("Cross-school payment access denied");
        return toPayment(p);
    }

    public SubscriptionDtos.Payment initiate(Set<ModuleCode> featureCodes) {
        Long schoolId = security.requiredSchoolId();
        ensureReady();
        TransactionTemplate tx = new TransactionTemplate(transactionManager);
        InitiationContext context = tx.execute(status -> prepareInitiation(schoolId, featureCodes));
        if (context.existing()) {
            if (context.payment().getPaymentUrl() == null) throw new IllegalStateException("Payment initiation is already in progress");
            return toPayment(context.payment());
        }
        try {
            School school = context.school();
            KhaltiPaymentClient.Initiation result = khalti.initiate(new KhaltiPaymentClient.InitiationRequest(
                    context.payment().getAmountPaisa(), context.payment().getPurchaseOrderId(), context.plan().getName(),
                    khaltiProperties.getReturnUrl(), school.getContactPerson(), school.getEmail(), school.getPhone()));
            if (result.pidx() == null || result.pidx().isBlank())
                throw new KhaltiClientException("Khalti returned an incomplete payment response: missing pidx", 200, result.rawResponse());
            if (result.paymentUrl() == null || result.paymentUrl().isBlank())
                throw new KhaltiClientException("Khalti returned an incomplete payment response: missing payment_url", 200, result.rawResponse());
            validatePaymentUrl(result.paymentUrl());
            return tx.execute(status -> {
                PaymentTransaction p = payments.findWithLockById(context.payment().getId()).orElseThrow();
                p.setPidx(result.pidx()); p.setPaymentUrl(result.paymentUrl()); p.setStatus(PaymentTransaction.Status.PENDING);
                p.setProviderStatus(result.status()); p.setRawResponse(normalized(result.pidx(), result.status(), null, null));
                log.info("Khalti payment initiated paymentId={}, orderId={}", p.getId(), p.getPurchaseOrderId());
                return toPayment(payments.save(p));
            });
        } catch (RuntimeException ex) {
            tx.executeWithoutResult(status -> markInitiationFailed(context.payment().getId(), ex));
            if (ex instanceof KhaltiClientException) throw ex;
            throw new KhaltiClientException("Khalti payment initiation failed", ex);
        }
    }

    public SubscriptionDtos.Payment initiate(Long legacyPlanId) {
        if (legacyPlanId != null) ensureReady();
        throw new IllegalArgumentException("Legacy subscription plans are unavailable; select paid features");
    }

    public SubscriptionDtos.Payment refresh(Long paymentId, Long ownerSchoolId) {
        PaymentTransaction local = payments.findById(paymentId).orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        if (ownerSchoolId != null && !ownerSchoolId.equals(local.getSchoolId())) throw new ForbiddenException("Cross-school payment access denied");
        if (local.getPidx() == null) throw new IllegalStateException("Payment has not been initialized");
        KhaltiPaymentClient.Lookup lookup = khalti.lookup(local.getPidx());
        return new TransactionTemplate(transactionManager).execute(status -> processLookup(paymentId, lookup));
    }

    public Optional<Long> paymentIdByPidx(String pidx) {
        return pidx == null ? Optional.empty() : payments.findByPidx(pidx).map(PaymentTransaction::getId);
    }

    @Transactional
    public SubscriptionDtos.Plan savePlan(Long id, String code, String name, BigDecimal price, Integer durationDays,
                                           String description, Boolean active, Collection<ModuleCode> moduleCodes) {
        SubscriptionPlan plan = id == null ? new SubscriptionPlan() : plans.findById(id).orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        String finalCode = code == null || code.isBlank() ? name.toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]+", "_") : code.toUpperCase(Locale.ROOT);
        plans.findByCode(finalCode).filter(p -> !Objects.equals(p.getId(), id)).ifPresent(p -> { throw new IllegalArgumentException("Plan code already exists"); });
        plan.setCode(finalCode); plan.setName(name); plan.setMonthlyPrice(price.setScale(2, RoundingMode.UNNECESSARY));
        plan.setDurationDays(durationDays == null ? 30 : durationDays); plan.setCurrency("NPR"); plan.setDescription(description);
        if (active != null) plan.setActive(active);
        if (plan.getDurationDays() <= 0 || plan.getMonthlyPrice().signum() < 0) throw new IllegalArgumentException("Plan duration and price are invalid");
        plans.saveAndFlush(plan);
        if (moduleCodes != null) {
            planModules.deleteByPlanId(plan.getId());
            for (ModuleCode codeValue : new LinkedHashSet<>(moduleCodes)) {
                PlatformModule module = modules.findByCode(codeValue).orElseThrow(() -> new IllegalArgumentException("Unknown module: " + codeValue));
                boolean dashboard = codeValue == ModuleCode.STUDENT_DASHBOARD || codeValue == ModuleCode.TEACHER_DASHBOARD;
                if (!module.isActive() || module.isComingSoon() || (!module.isSelectable() && !module.isRequired() && !dashboard)) throw new IllegalArgumentException("Module is not currently selectable: " + codeValue);
                SubscriptionPlanModule link = new SubscriptionPlanModule(); link.setPlan(plan); link.setModuleCode(codeValue); planModules.save(link);
            }
        }
        return toPlan(plan);
    }

    @Scheduled(cron = "${app.subscription.scheduler-cron:0 0 * * * *}")
    @Transactional
    public void reconcileSubscriptions() { reconcileSubscriptions(LocalDate.now()); }

    public void reconcileSubscriptions(LocalDate today) {
        for (Subscription expired : subscriptions.findBySubscriptionStatusIgnoreCaseAndEndsOnBefore("ACTIVE", today)) {
            expired.setSubscriptionStatus("EXPIRED"); subscriptions.save(expired);
        }
        for (Subscription due : subscriptions.findBySubscriptionStatusAndStartsOnLessThanEqual("SCHEDULED", today)) {
            due.setSubscriptionStatus("ACTIVE"); subscriptions.save(due); syncModules(due);
        }
        schoolModules.findAll().stream().filter(SchoolModule::isManagedBySubscription).filter(SchoolModule::isActive)
                .filter(row -> row.getEntitlementEndsOn() == null || row.getEntitlementEndsOn().isBefore(today))
                .forEach(row -> { row.setActive(false); schoolModules.save(row); });
    }

    private InitiationContext prepareInitiation(Long schoolId, Set<ModuleCode> requestedFeatures) {
        School school = schools.findByIdAndDeletedFalse(schoolId).filter(School::isActive)
                .orElseThrow(() -> new IllegalArgumentException("Active school not found"));
        if (requestedFeatures == null || requestedFeatures.isEmpty()) {
            throw new IllegalArgumentException("At least one paid feature is required; legacy subscription plans are unavailable");
        }
        LinkedHashSet<ModuleCode> featureCodes = new LinkedHashSet<>(requestedFeatures);
        List<PlatformModule> selected = featureCodes.stream().map(code -> modules.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Unknown feature: " + code))).toList();
        for (PlatformModule module : selected) {
            if (!module.isActive() || !module.isSelectable() || module.isComingSoon() || module.getBillingType() != BillingType.PAID
                    || module.getAnnualPrice() == null || module.getAnnualPrice().compareTo(new BigDecimal("3000.00")) != 0) {
                throw new IllegalArgumentException("Feature is not available for purchase: " + module.getCode());
            }
        }
        Map<ModuleCode, SchoolModule> existingEntitlements = new HashMap<>();
        schoolModules.findBySchoolIdAndDeletedFalse(schoolId).forEach(row -> existingEntitlements.put(row.getModuleCode(), row));
        for (ModuleCode code : featureCodes) {
            SchoolModule row = existingEntitlements.get(code);
            if (row != null && row.isActive() && !row.isManagedBySubscription()) {
                throw new IllegalArgumentException("Feature is already enabled by Super Admin: " + code);
            }
        }
        SubscriptionPlan plan = plans.findByCode("FEATURE_ADDONS")
                .filter(candidate -> candidate.getPricingModel() == PricingModel.FEATURE_BASED)
                .orElseThrow(() -> new IllegalStateException("Feature billing is not configured"));
        String snapshot = snapshotFeatures(featureCodes);
        BigDecimal amount = selected.stream().map(PlatformModule::getAnnualPrice).reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2);
        Instant after = Instant.now().minusSeconds(120);
        schools.lockByIdAndDeletedFalse(schoolId).orElseThrow(() -> new IllegalArgumentException("Active school not found"));
        Optional<PaymentTransaction> recent = payments.findBySchoolIdAndStatusInAndCreatedAtAfterOrderByIdDesc(schoolId,
                        List.of(PaymentTransaction.Status.INITIATED, PaymentTransaction.Status.PENDING), after).stream()
                .filter(payment -> snapshot.equals(payment.getFeatureCodesSnapshot())).findFirst();
        if (recent.isPresent()) return new InitiationContext(recent.get(), plan, school, true);
        long paisa = toPaisa(amount);
        Subscription sub = new Subscription(); sub.setSchoolId(schoolId); sub.setPlanId(plan.getId()); sub.setPlanCode(plan.getCode()); sub.setPlanName(plan.getName());
        sub.setCurrency("NPR"); sub.setDurationDays(365); sub.setBaseAmount(BigDecimal.ZERO); sub.setAdditionalAmount(amount);
        sub.setTotalAmount(amount); sub.setPaymentStatus("PENDING"); sub.setSubscriptionStatus("PENDING");
        sub.setModuleCodesSnapshot(snapshot);
        sub.setReferenceNumber(orderId()); subscriptions.save(sub);
        PaymentTransaction p = new PaymentTransaction(); p.setSchoolId(schoolId); p.setSubscriptionId(sub.getId()); p.setPlanId(plan.getId());
        p.setFeatureCodesSnapshot(snapshot); p.setPurchaseOrderId(sub.getReferenceNumber()); p.setAmountPaisa(paisa); p.setAmountNpr(amount); p.setInitiatedAt(Instant.now());
        return new InitiationContext(payments.save(p), plan, school, false);
    }

    private SubscriptionDtos.Payment processLookup(Long paymentId, KhaltiPaymentClient.Lookup lookup) {
        PaymentTransaction p = payments.findWithLockById(paymentId).orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        validateLookup(p, lookup);
        PaymentTransaction.Status mapped = mapStatus(lookup.status());
        if (p.getStatus() == PaymentTransaction.Status.REFUNDED) return toPayment(p);
        if (p.getStatus() == PaymentTransaction.Status.COMPLETED && mapped != PaymentTransaction.Status.REFUNDED) return toPayment(p);
        p.setProviderStatus(lookup.status()); p.setStatus(mapped); p.setTransactionId(lookup.transactionId()); p.setVerifiedAt(Instant.now());
        p.setRawResponse(normalized(lookup.pidx(), lookup.status(), lookup.totalAmountPaisa(), lookup.purchaseOrderId()));
        Subscription sub = subscriptions.findById(p.getSubscriptionId()).orElseThrow(() -> new IllegalStateException("Linked subscription not found"));
        if (mapped == PaymentTransaction.Status.COMPLETED) activate(p, sub);
        else if (mapped == PaymentTransaction.Status.REFUNDED) { sub.setSubscriptionStatus("CANCELLED"); sub.setPaymentStatus("REFUNDED"); refundFeatures(p, sub); }
        else if (mapped != PaymentTransaction.Status.PENDING) { sub.setSubscriptionStatus(mapped.name()); sub.setPaymentStatus("FAILED"); }
        subscriptions.save(sub); payments.save(p);
        log.info("Khalti payment verified paymentId={}, orderId={}, status={}", p.getId(), p.getPurchaseOrderId(), mapped);
        return toPayment(p);
    }

    private void activate(PaymentTransaction p, Subscription sub) {
        schools.lockByIdAndDeletedFalse(p.getSchoolId()).orElseThrow(() -> new IllegalStateException("School not found"));
        LocalDate today = LocalDate.now();
        Set<ModuleCode> purchased = parseSnapshot(p.getFeatureCodesSnapshot());
        List<LocalDate> purchaseStarts = new ArrayList<>();
        List<LocalDate> purchaseEnds = new ArrayList<>();
        Map<ModuleCode, SchoolModule> rows = new HashMap<>();
        schoolModules.findBySchoolIdAndDeletedFalse(p.getSchoolId()).forEach(row -> rows.put(row.getModuleCode(), row));
        Map<ModuleCode, LocalDate> baselines = new LinkedHashMap<>();
        for (ModuleCode code : purchased) {
            SchoolModule row = rows.computeIfAbsent(code, ignored -> { SchoolModule created = new SchoolModule(); created.setSchoolId(p.getSchoolId()); created.setModuleCode(code); created.setActive(false); return created; });
            if (row.isActive() && !row.isManagedBySubscription()) continue;
            LocalDate existingEnd = row.isManagedBySubscription() && row.isActive() ? row.getEntitlementEndsOn() : null;
            baselines.put(code, existingEnd);
            boolean renewal = existingEnd != null && !existingEnd.isBefore(today);
            LocalDate purchaseStart = renewal ? existingEnd.plusDays(1) : today;
            LocalDate purchaseEnd = renewal ? existingEnd.plusYears(1) : today.plusYears(1).minusDays(1);
            row.setManagedBySubscription(true); row.setActive(true);
            if (!renewal || row.getEntitlementStartsOn() == null) row.setEntitlementStartsOn(today);
            row.setEntitlementEndsOn(purchaseEnd); schoolModules.save(row);
            purchaseStarts.add(purchaseStart); purchaseEnds.add(purchaseEnd);
        }
        p.setEntitlementBaselineSnapshot(serializeBaselines(baselines));
        sub.setStartsOn(purchaseStarts.stream().min(LocalDate::compareTo).orElse(today));
        sub.setEndsOn(purchaseEnds.stream().max(LocalDate::compareTo).orElse(today));
        sub.setPaymentStatus("COMPLETED"); sub.setSubscriptionStatus("ACTIVE");
    }

    private void syncModules(Subscription sub) {
        // Legacy scheduled records retain their historical snapshot behavior.
    }

    private void refundFeatures(PaymentTransaction payment, Subscription sub) {
        Map<ModuleCode, LocalDate> baselines = parseBaselines(payment.getEntitlementBaselineSnapshot());
        for (ModuleCode code : parseSnapshot(payment.getFeatureCodesSnapshot())) {
            schoolModules.findBySchoolIdAndModuleCodeAndDeletedFalse(sub.getSchoolId(), code).ifPresent(row -> {
                if (row.isManagedBySubscription() && row.getEntitlementEndsOn() != null && sub.getEndsOn() != null
                        && !row.getEntitlementEndsOn().isAfter(sub.getEndsOn())) {
                    LocalDate baseline = baselines.get(code);
                    row.setEntitlementEndsOn(baseline);
                    row.setActive(baseline != null && !baseline.isBefore(LocalDate.now()));
                    if (baseline == null) row.setEntitlementStartsOn(null);
                    schoolModules.save(row);
                }
            });
        }
    }

    public static long toPaisa(BigDecimal amount) { return amount.setScale(2, RoundingMode.UNNECESSARY).movePointRight(2).longValueExact(); }
    public static String orderId() { return "360P-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + UUID.randomUUID(); }
    public static PaymentTransaction.Status mapStatus(String status) {
        if (status == null) return PaymentTransaction.Status.FAILED;
        return switch (status.trim().toLowerCase(Locale.ROOT)) {
            case "completed" -> PaymentTransaction.Status.COMPLETED; case "pending", "initiated" -> PaymentTransaction.Status.PENDING;
            case "user canceled", "user cancelled", "cancelled", "canceled" -> PaymentTransaction.Status.CANCELLED;
            case "expired" -> PaymentTransaction.Status.EXPIRED; case "refunded" -> PaymentTransaction.Status.REFUNDED;
            default -> PaymentTransaction.Status.FAILED;
        };
    }
    static void validateLookup(PaymentTransaction p, KhaltiPaymentClient.Lookup l) {
        if (!Objects.equals(p.getPidx(), l.pidx())) throw new IllegalArgumentException("Payment identifier mismatch");
        if (l.totalAmountPaisa() == null || p.getAmountPaisa() != l.totalAmountPaisa()) throw new IllegalArgumentException("Payment amount mismatch");
        if (l.purchaseOrderId() != null && !l.purchaseOrderId().isBlank() && !p.getPurchaseOrderId().equals(l.purchaseOrderId())) throw new IllegalArgumentException("Payment order mismatch");
    }
    private void ensureReady() { if (!khaltiProperties.isEnabled() || khaltiProperties.getSecretKey() == null || khaltiProperties.getSecretKey().isBlank() || khaltiProperties.getReturnUrl() == null || khaltiProperties.getWebsiteUrl() == null) throw new KhaltiClientException("Khalti payments are not available"); }
    private void validatePaymentUrl(String value) {
        try {
            URI payment = URI.create(value); URI provider = URI.create(khaltiProperties.getBaseUrl());
            if (!"https".equalsIgnoreCase(payment.getScheme()) || payment.getHost() == null || provider.getHost() == null
                    || !(payment.getHost().equalsIgnoreCase(provider.getHost()) || payment.getHost().endsWith(".khalti.com")))
                throw new KhaltiClientException("Khalti returned an invalid checkout URL");
        } catch (IllegalArgumentException exception) { throw new KhaltiClientException("Khalti returned an invalid checkout URL", exception); }
    }
    private String snapshotFeatures(Collection<ModuleCode> codes) { return codes.stream().map(Enum::name).sorted().collect(java.util.stream.Collectors.joining(",")); }
    private Set<ModuleCode> parseSnapshot(String value) { if (value == null || value.isBlank()) return new HashSet<>(); Set<ModuleCode> result = new HashSet<>(); for (String code : value.split(",")) try { result.add(ModuleCode.valueOf(code.trim())); } catch (Exception ignored) {} return result; }
    private String serializeBaselines(Map<ModuleCode, LocalDate> values) { return values.entrySet().stream().sorted(Map.Entry.comparingByKey()).map(entry -> entry.getKey().name() + "=" + (entry.getValue() == null ? "" : entry.getValue())).collect(java.util.stream.Collectors.joining(",")); }
    private Map<ModuleCode, LocalDate> parseBaselines(String value) { Map<ModuleCode, LocalDate> result = new HashMap<>(); if (value == null || value.isBlank()) return result; for (String item : value.split(",")) { String[] parts = item.split("=", 2); try { result.put(ModuleCode.valueOf(parts[0]), parts.length < 2 || parts[1].isBlank() ? null : LocalDate.parse(parts[1])); } catch (Exception ignored) {} } return result; }
    private void markInitiationFailed(Long id, RuntimeException failure) { payments.findWithLockById(id).ifPresent(p -> { p.setStatus(PaymentTransaction.Status.FAILED); String reason = failure.getMessage() == null ? "Provider initiation failed" : failure.getMessage(); p.setFailureReason(reason.substring(0, Math.min(reason.length(), 500))); if (failure instanceof KhaltiClientException khaltiFailure) { p.setRawResponse(khaltiFailure.getSafeResponse()); p.setProviderStatus(khaltiFailure.getProviderStatus() == null ? null : "HTTP_" + khaltiFailure.getProviderStatus()); } payments.save(p); subscriptions.findById(p.getSubscriptionId()).ifPresent(s -> { s.setSubscriptionStatus("FAILED"); s.setPaymentStatus("FAILED"); subscriptions.save(s); }); }); }
    private String normalized(String pidx, String status, Long amount, String order) { try { return new ObjectMapper().writeValueAsString(Map.of("pidx", Objects.toString(pidx, ""), "status", Objects.toString(status, ""), "amount", amount == null ? 0 : amount, "order", Objects.toString(order, ""))); } catch (Exception e) { return null; } }
    private SubscriptionDtos.Plan toPlan(SubscriptionPlan p) { return new SubscriptionDtos.Plan(p.getId(), p.getCode(), p.getName(), p.getMonthlyPrice(), p.getDurationDays(), p.getCurrency(), p.isActive(), planModules.findByPlanId(p.getId()).stream().map(m -> m.getModuleCode().name()).toList()); }
    private SubscriptionDtos.CurrentSubscription toSubscription(Subscription s) { String schoolName = schools.findById(s.getSchoolId()).map(School::getName).orElse("Unknown School"); return new SubscriptionDtos.CurrentSubscription(s.getId(), s.getSchoolId(), schoolName, s.getPlanId(), s.getPlanCode(), s.getPlanName(), s.getSubscriptionStatus(), s.getPaymentStatus(), s.getCurrency(), s.getStartsOn(), s.getEndsOn(), snapshotList(s.getModuleCodesSnapshot()), entitlements(s.getSchoolId())); }
    private SubscriptionDtos.Payment toPayment(PaymentTransaction p) { String schoolName = schools.findById(p.getSchoolId()).map(School::getName).orElse("Unknown School"); String planName = plans.findById(p.getPlanId()).map(SubscriptionPlan::getName).orElse("Unknown Plan"); boolean terminal = p.getStatus() == PaymentTransaction.Status.COMPLETED || p.getStatus() == PaymentTransaction.Status.REFUNDED; return new SubscriptionDtos.Payment(p.getId(), p.getSchoolId(), schoolName, p.getSubscriptionId(), p.getPlanId(), planName, p.getPurchaseOrderId(), p.getPidx(), p.getTransactionId(), p.getAmountPaisa(), p.getAmountNpr(), p.getCurrency(), p.getStatus(), p.getProviderStatus(), terminal ? null : p.getPaymentUrl(), p.getInitiatedAt(), p.getVerifiedAt(), p.getFailureReason(), snapshotList(p.getFeatureCodesSnapshot())); }
    private List<String> snapshotList(String value) { return value == null || value.isBlank() ? List.of() : Arrays.stream(value.split(",")).map(String::trim).filter(code -> !code.isBlank()).toList(); }
    private List<SubscriptionDtos.FeatureEntitlement> entitlements(Long schoolId) { LocalDate today = LocalDate.now(); return schoolModules.findBySchoolIdAndDeletedFalse(schoolId).stream().sorted(Comparator.comparing(row -> row.getModuleCode().name())).map(row -> { boolean dateValid = !row.isManagedBySubscription() || ((row.getEntitlementStartsOn() == null || !row.getEntitlementStartsOn().isAfter(today)) && (row.getEntitlementEndsOn() == null || !row.getEntitlementEndsOn().isBefore(today))); return new SubscriptionDtos.FeatureEntitlement(row.getModuleCode().name(), row.isActive() && dateValid, row.isManagedBySubscription(), row.getEntitlementStartsOn(), row.getEntitlementEndsOn()); }).toList(); }
    private record InitiationContext(PaymentTransaction payment, SubscriptionPlan plan, School school, boolean existing) {}
}
