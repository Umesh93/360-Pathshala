package com.pathshala.service.impl;

import com.pathshala.dto.DemoDtos.*;
import com.pathshala.entity.*;
import com.pathshala.exception.ResourceNotFoundException;
import com.pathshala.mapper.DemoMapper;
import com.pathshala.repository.Repositories.*;
import com.pathshala.util.SecurityUtils;
import com.pathshala.service.DemoSchoolService;
import com.pathshala.service.EmailService;
import com.pathshala.service.DemoConversionHistoryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DemoSchoolServiceImpl implements DemoSchoolService {
    private final DemoSchoolRepository demoSchoolRepository;
    private final DemoRequestRepository demoRequestRepository;
    private final SchoolRepository schoolRepository;
    private final ModuleRepository moduleRepository;
    private final SchoolModuleRepository schoolModuleRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final DemoConversionHistoryService conversionHistoryService;
    private final SecurityUtils securityUtils;

    private Long getCurrentUserId() {
        try {
            return securityUtils.currentUser().getId();
        } catch (Exception e) {
            return null;
        }
    }

    private String getCurrentUserName() {
        try {
            return securityUtils.currentUser().getUsername();
        } catch (Exception e) {
            return "Unknown";
        }
    }

    @Override
    @Transactional
    public CreateDemoAccountResponse createDemoAccount(CreateDemoAccountRequest request) {
        throw new IllegalArgumentException("Manual demo creation is disabled; accept a demo request");
    }

    @Override
    public List<AdminDemoSchoolResponse> findAllAdmin() {
        return demoSchoolRepository.findByStatusInAndDeletedFalseOrderByCreatedAtDesc(List.of("ACTIVE", "EXTENDED", "EXPIRED")).stream()
                .map(school -> {
                    String schoolName = school.getDemoRequestId() == null ? "Unknown" : demoRequestRepository.findById(school.getDemoRequestId())
                            .map(DemoRequest::getSchoolName)
                            .orElse("Unknown");
                    long remainingDays = calculateRemainingDays(school.getExpiryDate());
                    DemoRequest request = school.getDemoRequestId() == null ? null : demoRequestRepository.findById(school.getDemoRequestId()).orElse(null);
                    return DemoMapper.toAdminResponse(school, schoolName, request == null ? null : request.getEmail(), request == null ? null : request.getPhone(), remainingDays);
                })
                .toList();
    }

    @Override
    public AdminDemoSchoolResponse findAdminById(Long id) {
        DemoSchool school = demoSchoolRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demo school not found"));
        String schoolName = school.getDemoRequestId() == null ? "Unknown" : demoRequestRepository.findById(school.getDemoRequestId())
                .map(DemoRequest::getSchoolName)
                .orElse("Unknown");
        long remainingDays = calculateRemainingDays(school.getExpiryDate());
        DemoRequest request = school.getDemoRequestId() == null ? null : demoRequestRepository.findById(school.getDemoRequestId()).orElse(null);
        return DemoMapper.toAdminResponse(school, schoolName, request == null ? null : request.getEmail(), request == null ? null : request.getPhone(), remainingDays);
    }

    @Override
    @Transactional
    public AdminDemoSchoolResponse update(Long id, UpdateDemoSchoolRequest request) {
        DemoSchool school = demoSchoolRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demo school not found"));
        rejectClosed(school);

        if (request.enabledModules() != null) {
            List<ModuleCode> modules = canonicalModules(request.enabledModules());
            school.setEnabledModules(joinModules(modules));
            syncModules(school.getSchoolId(), modules);
        }
        if (request.expiryDate() != null) {
            school.setExpiryDate(request.expiryDate());
            if (school.getSchoolId() != null) updateDemoSubscription(school, request.expiryDate());
        }
        if (request.remarks() != null) {
            school.setRemarks(request.remarks().trim());
        }

        DemoSchool saved = demoSchoolRepository.save(school);
        String schoolName = demoRequestRepository.findById(saved.getDemoRequestId())
                .map(DemoRequest::getSchoolName)
                .orElse("Unknown");
        long remainingDays = calculateRemainingDays(saved.getExpiryDate());
        log.info("Demo school updated: id={}", id);
        DemoRequest demoRequest = saved.getDemoRequestId() == null ? null : demoRequestRepository.findById(saved.getDemoRequestId()).orElse(null);
        return DemoMapper.toAdminResponse(saved, schoolName, demoRequest == null ? null : demoRequest.getEmail(), demoRequest == null ? null : demoRequest.getPhone(), remainingDays);
    }

    @Override
    @Transactional
    public AdminDemoSchoolResponse extendDemo(Long id, ExtendDemoRequest request) {
        DemoSchool school = demoSchoolRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demo school not found"));
        rejectClosed(school);

        LocalDate newExpiry = LocalDate.now().plusDays(request.days());
        school.setExpiryDate(newExpiry);
        school.setStatus("EXTENDED");
        if (school.getSchoolId() != null) {
            updateDemoSubscription(school, newExpiry);
            School linked = schoolRepository.findById(school.getSchoolId()).orElseThrow();
            linked.setStatus("DEMO");
            linked.setActive(true);
            schoolRepository.save(linked);
            userRepository.findBySchoolIdAndDeletedFalse(linked.getId()).forEach(user -> { user.setActive(true); userRepository.save(user); });
        }

        DemoSchool saved = demoSchoolRepository.save(school);
        String schoolName = demoRequestRepository.findById(saved.getDemoRequestId())
                .map(DemoRequest::getSchoolName)
                .orElse("Unknown");
        long remainingDays = calculateRemainingDays(saved.getExpiryDate());
        log.info("Demo extended: id={}, new expiry={}", id, newExpiry);
        DemoRequest demoRequest = saved.getDemoRequestId() == null ? null : demoRequestRepository.findById(saved.getDemoRequestId()).orElse(null);
        return DemoMapper.toAdminResponse(saved, schoolName, demoRequest == null ? null : demoRequest.getEmail(), demoRequest == null ? null : demoRequest.getPhone(), remainingDays);
    }

    @Override
    @Transactional
    public String resetPassword(Long id) {
        DemoSchool school = demoSchoolRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demo school not found"));
        rejectClosed(school);

        String newPassword = generatePassword();
        school.setPassword(passwordEncoder.encode(newPassword));
        demoSchoolRepository.save(school);
        User admin = school.getSchoolId() != null
                ? userRepository.findBySchoolIdAndDeletedFalse(school.getSchoolId()).stream()
                    .filter(user -> user.getRoles().contains(RoleName.SCHOOL_ADMIN)).findFirst().orElse(null)
                : userRepository.findByUsernameAndDeletedFalse(school.getUsername()).orElse(null);
        if (admin != null) {
            admin.setPassword(passwordEncoder.encode(newPassword));
            admin.setRawPassword(null);
            userRepository.save(admin);
        }
        log.info("Password reset for demo school: id={}", id);
        return newPassword;
    }

    @Override
    @Transactional
    public Map<String, Object> convertToPaid(Long id, ConvertToPaidRequest request) {
        DemoSchool school = demoSchoolRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demo school not found"));

        if ("CONVERTED".equalsIgnoreCase(school.getStatus()) && school.getSchoolId() != null) {
            School existing = schoolRepository.findById(school.getSchoolId())
                    .orElseThrow(() -> new ResourceNotFoundException("Converted school not found"));
            return Map.of("schoolId", existing.getId(), "schoolCode", existing.getCode(), "schoolName", existing.getName(), "preserved", true, "alreadyConverted", true);
        }

        DemoRequest demoRequest = demoRequestRepository.findById(school.getDemoRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Demo request not found"));

        rejectClosed(school);
        if (school.getSchoolId() != null) {
            School linked = schoolRepository.findById(school.getSchoolId())
                    .orElseThrow(() -> new ResourceNotFoundException("Linked school not found"));
            linked.setStatus("ACTIVE");
            linked.setActive(true);
            schoolRepository.save(linked);
            Subscription subscription = subscriptionRepository.findFirstBySchoolIdOrderByIdDesc(linked.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
            subscription.setSubscriptionStatus("ACTIVE");
            subscriptionRepository.save(subscription);
            userRepository.findBySchoolIdAndDeletedFalse(linked.getId()).forEach(user -> {
                user.setActive(true);
                userRepository.save(user);
            });
            school.setStatus("CONVERTED");
            demoSchoolRepository.save(school);
            conversionHistoryService.createConversionHistory(demoRequest.getId(), school.getId(), linked.getId(), linked.getName(),
                    getCurrentUserId(), getCurrentUserName(), request.subscriptionPlan() == null ? "Standard" : request.subscriptionPlan(),
                    school.getExpiryDate() != null && school.getStartDate() != null ? (int) ChronoUnit.DAYS.between(school.getStartDate(), school.getExpiryDate()) : 30,
                    school.getEnabledModules(), subscription.getReferenceNumber(), "Online", subscription.getTotalAmount().toPlainString(), "NPR", school.getRemarks());
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("schoolId", linked.getId());
            result.put("schoolCode", linked.getCode());
            result.put("schoolName", linked.getName());
            result.put("preserved", true);
            return result;
        }

        String schoolCode = generateSchoolCode();

        School newSchool = new School();
        newSchool.setName(demoRequest.getSchoolName());
        newSchool.setCode(schoolCode);
        newSchool.setAddress(demoRequest.getAddress());
        newSchool.setPhone(demoRequest.getPhone());
        newSchool.setEmail(demoRequest.getEmail());
        newSchool.setContactPerson(demoRequest.getContactPerson());
        newSchool.setDesignation(demoRequest.getDesignation());
        newSchool.setStatus("ACTIVE");
        newSchool.setActive(true);
        School savedSchool = schoolRepository.save(newSchool);
        log.info("Paid school created from demo: id={}, code={}", savedSchool.getId(), savedSchool.getCode());

        List<ModuleCode> modules = parseModules(school.getEnabledModules());
        for (ModuleCode moduleCode : modules) {
            SchoolModule schoolModule = new SchoolModule();
            schoolModule.setSchoolId(savedSchool.getId());
            schoolModule.setModuleCode(moduleCode);
            schoolModule.setActive(true);
            schoolModuleRepository.save(schoolModule);
        }

        User existingAdmin = userRepository.findByUsernameAndDeletedFalse(school.getUsername()).orElse(null);
        String adminPassword;
        User adminUser;
        if (existingAdmin != null) {
            adminPassword = generatePassword();
            existingAdmin.setSchoolId(savedSchool.getId());
            existingAdmin.setEmail(demoRequest.getEmail());
            existingAdmin.setFullName(demoRequest.getContactPerson());
            existingAdmin.setPassword(passwordEncoder.encode(adminPassword));
            existingAdmin.setActive(true);
            adminUser = userRepository.save(existingAdmin);
            log.info("Existing demo admin user updated to paid school: username={}", school.getUsername());
        } else {
            adminPassword = generatePassword();
            adminUser = new User();
            adminUser.setSchoolId(savedSchool.getId());
            adminUser.setUsername(school.getUsername());
            adminUser.setEmail(demoRequest.getEmail());
            adminUser.setPassword(passwordEncoder.encode(adminPassword));
            adminUser.setFullName(demoRequest.getContactPerson());
            Set<RoleName> roles = new HashSet<>();
            roles.add(RoleName.SCHOOL_ADMIN);
            adminUser.setRoles(roles);
            adminUser.setActive(true);
            adminUser = userRepository.save(adminUser);
            log.info("New school admin created for converted school: username={}", school.getUsername());
        }

        BigDecimal baseAmount = BigDecimal.ZERO;
        BigDecimal additionalAmount = BigDecimal.ZERO;
        BigDecimal totalAmount = BigDecimal.ZERO;

        String referenceNumber = generatePaymentReference();

        Subscription subscription = new Subscription();
        subscription.setSchoolId(savedSchool.getId());
        subscription.setBaseAmount(baseAmount);
        subscription.setAdditionalAmount(additionalAmount);
        subscription.setTotalAmount(totalAmount);
        subscription.setPaymentStatus("NOT_REQUIRED");
        subscription.setSubscriptionStatus("ADMIN_GRANTED");
        subscription.setPlanCode("ADMIN_GRANTED");
        subscription.setPlanName("Converted Demo Module Grant");
        subscription.setReferenceNumber(referenceNumber);
        subscriptionRepository.save(subscription);

        school.setStatus("CONVERTED");
        demoSchoolRepository.save(school);
        log.info("Demo school converted to paid: demoId={}, schoolId={}", id, savedSchool.getId());

        String convertedByName = getCurrentUserName();
        conversionHistoryService.createConversionHistory(
                demoRequest.getId(),
                school.getId(),
                savedSchool.getId(),
                savedSchool.getName(),
                getCurrentUserId(),
                convertedByName,
                "Feature-based subscription",
                school.getExpiryDate() != null && school.getStartDate() != null ? (int) ChronoUnit.DAYS.between(school.getStartDate(), school.getExpiryDate()) : 30,
                school.getEnabledModules(),
                referenceNumber,
                "Online",
                totalAmount.toPlainString(),
                "NPR",
                school.getRemarks()
        );

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("schoolId", savedSchool.getId());
        result.put("schoolCode", schoolCode);
        result.put("schoolName", savedSchool.getName());
        result.put("adminUsername", school.getUsername());
        result.put("adminPassword", adminPassword);
        result.put("totalAmount", totalAmount);
        result.put("referenceNumber", referenceNumber);
        result.put("modules", modules.stream().map(Enum::name).toList());

        try {
            String paymentLink = "https://360pathshala.com/pay?ref=" + referenceNumber;
            emailService.sendSchoolRegistrationEmail(savedSchool, adminUser, adminPassword, totalAmount, referenceNumber, paymentLink);
        } catch (Exception e) {
            log.warn("Email sending failed for converted school id={}: {}", savedSchool.getId(), e.getMessage());
        }

        return result;
    }

    @Override
    @Transactional
    public void softDelete(Long id) {
        DemoSchool school = demoSchoolRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demo school not found"));
        school.setDeleted(true);
        demoSchoolRepository.save(school);
        if (school.getSchoolId() != null) {
            School linked = schoolRepository.findById(school.getSchoolId()).orElse(null);
            if (linked != null) { linked.setStatus("CANCELLED"); linked.setActive(false); schoolRepository.save(linked); }
            subscriptionRepository.findFirstBySchoolIdOrderByIdDesc(school.getSchoolId()).ifPresent(subscription -> {
                if ("DEMO".equalsIgnoreCase(subscription.getSubscriptionStatus())) subscription.setSubscriptionStatus("CANCELLED");
                subscriptionRepository.save(subscription);
            });
            userRepository.findBySchoolIdAndDeletedFalse(school.getSchoolId()).forEach(user -> { user.setActive(false); userRepository.save(user); });
            schoolModuleRepository.findBySchoolIdAndDeletedFalse(school.getSchoolId()).forEach(module -> { module.setActive(false); schoolModuleRepository.save(module); });
        } else {
            userRepository.findByUsername(school.getUsername()).ifPresent(user -> { user.setDeleted(true); user.setActive(false); userRepository.save(user); });
        }
        log.info("Demo school soft deleted: id={}", id);
    }

    private String generateDemoCode() {
        long count = demoSchoolRepository.count();
        return String.format("DS-%06d", count + 1);
    }

    private String generateSchoolCode() {
        long count = schoolRepository.count();
        return String.format("SCH-%06d", count + 1);
    }

    private String generatePaymentReference() {
        String date = LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "PAY-" + date + "-" + random;
    }

    private String generatePassword() {
        String upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lower = "abcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String special = "!@#$%^&*";
        String all = upper + lower + digits + special;
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();
        password.append(upper.charAt(random.nextInt(upper.length())));
        password.append(lower.charAt(random.nextInt(lower.length())));
        password.append(digits.charAt(random.nextInt(digits.length())));
        password.append(special.charAt(random.nextInt(special.length())));
        for (int i = 4; i < 12; i++) {
            password.append(all.charAt(random.nextInt(all.length())));
        }
        return password.toString();
    }

    private String joinModules(List<ModuleCode> modules) {
        if (modules == null || modules.isEmpty()) {
            return null;
        }
        StringJoiner joiner = new StringJoiner(",");
        for (ModuleCode module : modules) {
            joiner.add(module.name());
        }
        return joiner.toString();
    }

    private List<ModuleCode> parseModules(String modulesString) {
        if (modulesString == null || modulesString.isBlank()) {
            return List.of(ModuleCode.STUDENT_MANAGEMENT, ModuleCode.EXAMINATION);
        }
        List<ModuleCode> result = new ArrayList<>();
        for (String part : modulesString.split(",")) {
            try {
                result.add(ModuleCode.valueOf(part.trim()));
            } catch (IllegalArgumentException e) {
                log.warn("Unknown module code: {}", part);
            }
        }
        if (result.isEmpty()) {
            result.add(ModuleCode.STUDENT_MANAGEMENT);
            result.add(ModuleCode.EXAMINATION);
        }
        return result;
    }

    private List<ModuleCode> canonicalModules(Collection<ModuleCode> requested) {
        LinkedHashSet<ModuleCode> modules = new LinkedHashSet<>(requested == null ? List.of() : requested);
        for (ModuleCode code : modules) {
            PlatformModule module = moduleRepository.findByCode(code).orElseThrow(() -> new IllegalArgumentException("Unknown module: " + code));
            if (!module.isActive() || !module.isSelectable() || module.isComingSoon()) throw new IllegalArgumentException(module.getName() + " is not currently available");
        }
        moduleRepository.findAll().stream().filter(PlatformModule::isActive)
                .filter(module -> module.getBillingType() == BillingType.REQUIRED || module.getBillingType() == BillingType.INCLUDED)
                .map(PlatformModule::getCode).forEach(modules::add);
        return new ArrayList<>(modules);
    }

    private void syncModules(Long schoolId, Collection<ModuleCode> requested) {
        if (schoolId == null) return;
        Set<ModuleCode> desired = new HashSet<>(requested);
        schoolModuleRepository.findBySchoolIdAndDeletedFalse(schoolId).forEach(row -> {
            if (row.isManagedBySubscription()) return;
            row.setActive(desired.contains(row.getModuleCode()));
            schoolModuleRepository.save(row);
        });
        for (ModuleCode code : desired) {
            SchoolModule row = schoolModuleRepository.findBySchoolIdAndModuleCodeAndDeletedFalse(schoolId, code).orElseGet(() -> {
                SchoolModule created = new SchoolModule(); created.setSchoolId(schoolId); created.setModuleCode(code); return created;
            });
            row.setActive(true); schoolModuleRepository.save(row);
        }
    }

    private void updateDemoSubscription(DemoSchool school, LocalDate expiry) {
        subscriptionRepository.findFirstBySchoolIdOrderByIdDesc(school.getSchoolId()).ifPresent(subscription -> {
            subscription.setEndsOn(expiry); subscription.setSubscriptionStatus("DEMO"); subscriptionRepository.save(subscription);
        });
    }

    private void rejectClosed(DemoSchool school) {
        if (Set.of("CONVERTED", "CANCELLED").contains(school.getStatus().toUpperCase(Locale.ROOT))) {
            throw new IllegalStateException("Converted or cancelled demo accounts cannot be changed");
        }
    }

    private long calculateRemainingDays(LocalDate expiryDate) {
        if (expiryDate == null) {
            return 0;
        }
        return ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
    }
}
