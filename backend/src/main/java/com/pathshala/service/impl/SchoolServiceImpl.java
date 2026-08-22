package com.pathshala.service.impl;

import com.pathshala.dto.ApiDtos.CreateSchoolRequest;
import com.pathshala.dto.ApiDtos.CreateSchoolResponse;
import com.pathshala.dto.ApiDtos.SchoolLogoResponse;
import com.pathshala.entity.*;
import com.pathshala.repository.Repositories.*;
import com.pathshala.service.EmailService;
import com.pathshala.service.FileStorageService;
import com.pathshala.service.SchoolService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Slf4j
public class SchoolServiceImpl implements SchoolService {
    private final SchoolRepository schoolRepository;
    private final ModuleRepository moduleRepository;
    private final SchoolModuleRepository schoolModuleRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public CreateSchoolResponse createSchool(CreateSchoolRequest request) {
        log.info("Creating school: name={}, email={}, status={}, modules={}", request.name(), request.email(), request.status(), request.modules());

        if (schoolRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        String schoolCode = generateSchoolCode();
        String adminUsername = generateUsername(request.email());
        String adminPassword = generatePassword();

        Set<ModuleCode> moduleSet = selectableModules(request.modules());
        List<ModuleCode> finalModules = new ArrayList<>(moduleSet);

        School school = new School();
        school.setName(request.name());
        school.setCode(schoolCode);
        school.setAddress(request.address());
        school.setPhone(request.phone());
        school.setContactPerson(request.contactPerson().trim());
        school.setDesignation(request.designation().trim());
        school.setEmail(request.email());
        school.setStatus(request.status() != null ? request.status() : "DEMO");
        schoolRepository.save(school);
        log.info("School saved with id={}, code={}", school.getId(), school.getCode());

        for (ModuleCode moduleCode : finalModules) {
            SchoolModule schoolModule = new SchoolModule();
            schoolModule.setSchoolId(school.getId());
            schoolModule.setModuleCode(moduleCode);
            schoolModule.setActive(true);
            schoolModuleRepository.save(schoolModule);
        }
        log.info("Saved {} modules for school id={}", finalModules.size(), school.getId());

        BigDecimal baseAmount = BigDecimal.ZERO;
        BigDecimal additionalAmount = BigDecimal.ZERO;
        BigDecimal totalAmount = BigDecimal.ZERO;

        String referenceNumber = generatePaymentReference();

        Subscription subscription = new Subscription();
        subscription.setSchoolId(school.getId());
        subscription.setBaseAmount(baseAmount);
        subscription.setAdditionalAmount(additionalAmount);
        subscription.setTotalAmount(totalAmount);
        subscription.setPaymentStatus("NOT_REQUIRED");
        subscription.setSubscriptionStatus("ADMIN_GRANTED");
        subscription.setPlanCode("ADMIN_GRANTED");
        subscription.setPlanName("Administrative Module Grant");
        subscription.setReferenceNumber(referenceNumber);
        subscriptionRepository.save(subscription);
        log.info("Subscription saved for school id={}, ref={}", school.getId(), referenceNumber);

        User admin = new User();
        admin.setSchoolId(school.getId());
        admin.setUsername(adminUsername);
        admin.setEmail(request.email());
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRawPassword(adminPassword);
        admin.setFullName(request.name());
        Set<RoleName> roles = new HashSet<>();
        roles.add(RoleName.SCHOOL_ADMIN);
        admin.setRoles(roles);
        admin.setActive(true);
        userRepository.save(admin);
        log.info("School admin user created: username={}", adminUsername);

        CreateSchoolResponse response = new CreateSchoolResponse(
                school.getId(),
                school.getCode(),
                adminUsername,
                adminPassword,
                totalAmount,
                referenceNumber,
                finalModules
        );

        try {
            String paymentLink = "";
            if (!"DEMO".equalsIgnoreCase(request.status())) {
                emailService.sendSchoolRegistrationEmail(school, admin, adminPassword, totalAmount, referenceNumber, paymentLink);
            }
        } catch (Exception e) {
            log.warn("Email sending failed for school id={}: {}", school.getId(), e.getMessage());
        }

        log.info("School creation completed successfully: schoolCode={}", schoolCode);
        return response;
    }

    @Override
    @Transactional
    public School updateSchool(Long id, CreateSchoolRequest request) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("School not found"));

        if (!school.getEmail().equals(request.email()) && schoolRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        school.setName(request.name());
        school.setAddress(request.address());
        school.setPhone(request.phone());
        school.setContactPerson(request.contactPerson().trim());
        school.setDesignation(request.designation().trim());
        school.setEmail(request.email());
        if (request.status() != null) {
            school.setStatus(request.status());
        }

        if (request.password() != null && !request.password().isBlank()) {
            List<User> users = userRepository.findBySchoolIdAndDeletedFalse(id);
            User admin = users.stream()
                    .filter(u -> u.getRoles().contains(RoleName.SCHOOL_ADMIN))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("School admin not found"));
            admin.setPassword(passwordEncoder.encode(request.password()));
            admin.setRawPassword(request.password());
            userRepository.save(admin);
        }

        if (request.modules() != null) {
            Set<ModuleCode> requestedModules = selectableModules(request.modules());
            Map<ModuleCode, SchoolModule> existingModules = schoolModuleRepository.findBySchoolIdAndDeletedFalse(id).stream()
                    .collect(java.util.stream.Collectors.toMap(SchoolModule::getModuleCode, module -> module));

            for (ModuleCode moduleCode : ModuleCode.values()) {
                SchoolModule schoolModule = existingModules.get(moduleCode);
                boolean active = requestedModules.contains(moduleCode);
                if (schoolModule != null && schoolModule.isManagedBySubscription()) continue;
                if (schoolModule == null && !active) continue;
                if (schoolModule == null) {
                    schoolModule = new SchoolModule();
                    schoolModule.setSchoolId(id);
                    schoolModule.setModuleCode(moduleCode);
                }
                schoolModule.setActive(active);
                schoolModuleRepository.save(schoolModule);
            }
            schoolModuleRepository.flush();
        }

        School saved = schoolRepository.save(school);
        log.info("School updated: id={}, code={}", saved.getId(), saved.getCode());
        return saved;
    }

    @Override
    @Transactional
    public void deleteSchool(Long id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("School not found"));
        school.setDeleted(true);
        schoolRepository.save(school);
        log.info("School soft deleted: id={}, code={}", id, school.getCode());
    }

    @Override
    @Transactional
    public School toggleStatus(Long id, String status) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("School not found"));
        school.setStatus(status);
        School saved = schoolRepository.save(school);
        log.info("School status updated: id={}, status={}", id, status);
        return saved;
    }

    @Override
    @Transactional
    public SchoolLogoResponse uploadLogo(Long id, MultipartFile file) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("School not found"));
        String newKey = fileStorageService.storeSchoolLogo(id, file);
        String oldKey = school.getLogo();
        try {
            school.setLogo(newKey);
            schoolRepository.saveAndFlush(school);
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { safeDelete(oldKey); }
                @Override public void afterCompletion(int status) {
                    if (status != STATUS_COMMITTED) safeDelete(newKey);
                }
            });
            return new SchoolLogoResponse(true, "/api/saas/schools/" + id + "/logo");
        } catch (RuntimeException exception) {
            safeDelete(newKey);
            throw exception;
        }
    }

    @Override
    public SchoolLogo loadLogo(Long id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("School not found"));
        if (school.getLogo() == null) return null;
        FileStorageService.StoredFile stored = fileStorageService.loadSchoolLogo(school.getLogo());
        return new SchoolLogo(stored.bytes(), stored.contentType());
    }

    @Override
    @Transactional
    public void removeLogo(Long id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("School not found"));
        String oldKey = school.getLogo();
        if (oldKey == null) return;
        school.setLogo(null);
        schoolRepository.saveAndFlush(school);
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() { safeDelete(oldKey); }
        });
    }

    @Override
    @Transactional
    public DemoProvisioning createDemoFromRequest(DemoRequest request, List<ModuleCode> requestedModules) {
        return createDemoFromRequest(request, requestedModules, null);
    }

    @Override
    @Transactional
    public DemoProvisioning createDemoFromRequest(DemoRequest request, List<ModuleCode> requestedModules, String requestedUsername) {
        if (schoolRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("A school already exists for this email");
        }
        Set<ModuleCode> modules = selectableModules(requestedModules);

        School school = new School();
        school.setName(request.getSchoolName());
        school.setCode(generateSchoolCode());
        school.setAddress(request.getAddress());
        school.setPhone(request.getPhone());
        school.setEmail(request.getEmail());
        school.setContactPerson(request.getContactPerson());
        school.setDesignation(request.getDesignation());
        school.setStatus("DEMO");
        school.setActive(true);
        school = schoolRepository.saveAndFlush(school);

        List<ModuleCode> finalModules = new ArrayList<>(modules);
        for (ModuleCode code : finalModules) {
            SchoolModule module = new SchoolModule();
            module.setSchoolId(school.getId());
            module.setModuleCode(code);
            module.setActive(true);
            schoolModuleRepository.save(module);
        }

        LocalDate startsOn = LocalDate.now();
        LocalDate endsOn = startsOn.plusDays(30);
        Subscription subscription = new Subscription();
        subscription.setSchoolId(school.getId());
        subscription.setBaseAmount(BigDecimal.ZERO);
        subscription.setAdditionalAmount(BigDecimal.ZERO);
        subscription.setTotalAmount(BigDecimal.ZERO);
        subscription.setPaymentStatus("NOT_REQUIRED");
        subscription.setSubscriptionStatus("DEMO");
        subscription.setReferenceNumber(generatePaymentReference());
        subscription.setStartsOn(startsOn);
        subscription.setEndsOn(endsOn);
        subscriptionRepository.save(subscription);

        String username = requestedUsername == null || requestedUsername.isBlank() ? generateUsername(request.getEmail()) : normalizeUsername(requestedUsername);
        if (userRepository.existsByUsername(username)) throw new IllegalArgumentException("Username already exists");
        String password = generatePassword();
        User admin = new User();
        admin.setSchoolId(school.getId());
        admin.setUsername(username);
        admin.setEmail(request.getEmail());
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRawPassword(null);
        admin.setFullName(request.getContactPerson());
        admin.setRoles(Set.of(RoleName.SCHOOL_ADMIN));
        admin.setActive(true);
        admin = userRepository.save(admin);
        return new DemoProvisioning(school, admin.getId(), username, password, finalModules, startsOn, endsOn);
    }

    @Override
    @Transactional
    public String resetSchoolAdminPassword(Long schoolId) {
        User admin = userRepository.findBySchoolIdAndDeletedFalse(schoolId).stream()
                .filter(user -> user.getRoles().contains(RoleName.SCHOOL_ADMIN))
                .findFirst().orElseThrow(() -> new IllegalArgumentException("School admin not found"));
        String password = generatePassword();
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRawPassword(null);
        admin.setActive(true);
        userRepository.save(admin);
        return password;
    }

    @Override
    public String suggestUsername(String email) { return generateUsername(email); }

    @Override
    public boolean usernameAvailable(String username) {
        return !userRepository.existsByUsername(normalizeUsername(username));
    }

    private void safeDelete(String key) {
        try { fileStorageService.delete(key); }
        catch (RuntimeException e) { log.warn("Stored file cleanup failed for key={}: {}", key, e.getMessage()); }
    }

    private String generateSchoolCode() {
        long count = schoolRepository.count();
        return String.format("SCH-%06d", count + 1);
    }

    private Set<ModuleCode> selectableModules(List<ModuleCode> requested) {
        Set<ModuleCode> modules = new LinkedHashSet<>(requested == null ? List.of() : requested);
        for (ModuleCode code : modules) {
            PlatformModule module = moduleRepository.findByCode(code)
                    .orElseThrow(() -> new IllegalArgumentException("Unknown module: " + code));
            if (!module.isActive() || !module.isSelectable() || module.isComingSoon()) {
                throw new IllegalArgumentException(module.getName() + " is not currently available");
            }
        }
        moduleRepository.findAll().stream().filter(PlatformModule::isActive)
                .filter(module -> module.getBillingType() == BillingType.REQUIRED || module.getBillingType() == BillingType.INCLUDED)
                .map(PlatformModule::getCode).forEach(modules::add);
        return modules;
    }

    private String generatePaymentReference() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "PAY-" + date + "-" + random;
    }

    private String generateUsername(String email) {
        String prefix = normalizeUsername(email.split("@", 2)[0]);
        String username = prefix;
        int suffix = 1;
        while (userRepository.existsByUsername(username)) {
            username = prefix + suffix;
            suffix++;
        }
        return username;
    }

    @Override
    public String normalizeUsername(String value) {
        String normalized = value.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9._-]", "");
        if (normalized.isBlank()) throw new IllegalArgumentException("Username must contain letters or numbers");
        return normalized;
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
}
