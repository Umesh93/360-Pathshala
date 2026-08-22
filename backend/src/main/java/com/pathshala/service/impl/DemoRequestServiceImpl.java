package com.pathshala.service.impl;

import com.pathshala.dto.DemoDtos.*;
import com.pathshala.entity.*;
import com.pathshala.exception.ResourceNotFoundException;
import com.pathshala.mapper.DemoMapper;
import com.pathshala.repository.Repositories.*;
import com.pathshala.service.*;
import com.pathshala.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DemoRequestServiceImpl implements DemoRequestService {
    private final DemoRequestRepository demoRequestRepository;
    private final DemoSchoolRepository demoSchoolRepository;
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    private final SchoolModuleRepository schoolModuleRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SchoolService schoolService;
    private final FileStorageService fileStorageService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils;
    private final PlatformTransactionManager transactionManager;
    private final ModuleRepository moduleRepository;

    @Override
    public PublicDemoRequestResponse createPublicRequest(PublicDemoRequestRequest request) {
        return createPublicRequest(request, null);
    }

    @Override
    public PublicDemoRequestResponse createPublicRequest(PublicDemoRequestRequest request, MultipartFile logo) {
        validateModules(request.interestedModules());
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
        if (demoRequestRepository.existsByEmailAndStatusAndDeletedFalse(normalizedEmail, "PENDING")) {
            throw new IllegalStateException("A pending demo request already exists for this email");
        }
        TransactionTemplate tx = new TransactionTemplate(transactionManager);
        String[] storedKey = new String[1];
        try {
            return tx.execute(status -> {
                DemoRequest entity = new DemoRequest();
                entity.setRequestCode(generateRequestCode());
                entity.setSchoolName(request.schoolName().trim());
                entity.setContactPerson(request.contactPerson().trim());
                entity.setDesignation(request.designation().trim());
                entity.setEmail(normalizedEmail);
                entity.setPhone(request.phone().trim());
                entity.setAddress(request.address().trim());
                entity.setInterestedModules(joinModules(request.interestedModules()));
                entity.setStatus("PENDING");
                entity.setEmailStatus("PENDING");
                DemoRequest saved = demoRequestRepository.saveAndFlush(entity);
                if (logo != null && !logo.isEmpty()) {
                    storedKey[0] = fileStorageService.storeDemoRequestLogo(saved.getId(), logo);
                    saved.setLogoKey(storedKey[0]);
                    saved = demoRequestRepository.saveAndFlush(saved);
                }
                return DemoMapper.toPublicResponse(saved);
            });
        } catch (RuntimeException exception) {
            if (storedKey[0] != null) safeDelete(storedKey[0]);
            throw exception;
        }
    }

    @Override
    public List<AdminDemoRequestResponse> findAllAdmin() {
        return demoRequestRepository.findByStatusAndDeletedFalseOrderByCreatedAtDesc("PENDING").stream().map(DemoMapper::toAdminResponse).toList();
    }

    @Override
    public AdminDemoRequestResponse findAdminById(Long id) {
        return DemoMapper.toAdminResponse(findActive(id));
    }

    @Override
    public AdminDemoRequestResponse updateStatus(Long id, UpdateDemoRequestRequest request) {
        return new TransactionTemplate(transactionManager).execute(status -> {
            DemoRequest entity = demoRequestRepository.lockById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Demo request not found"));
            if (request.status() != null && !request.status().isBlank()) {
                String target = request.status().trim().toUpperCase(Locale.ROOT);
                if (!Set.of("PENDING", "REJECTED").contains(target)) {
                    throw new IllegalArgumentException("Use the accept endpoint to accept demo requests");
                }
                if (!"PENDING".equalsIgnoreCase(entity.getStatus())) {
                    throw new IllegalStateException("Only pending demo requests can be changed");
                }
                entity.setStatus(target);
            }
            if (request.message() != null) entity.setMessage(trimToNull(request.message()));
            return DemoMapper.toAdminResponse(demoRequestRepository.save(entity));
        });
    }

    @Override
    public AcceptDemoResponse accept(Long id, AcceptDemoRequest input) {
        Provisioned provisioned = new TransactionTemplate(transactionManager).execute(status -> provision(id, input));
        if (provisioned.password() == null) return existingResponse(provisioned);
        return deliverAndRespond(provisioned, false);
    }

    @Override
    public DemoUsernameResponse username(Long id, String candidate) {
        DemoRequest request = findActive(id);
        if (request.getProvisionedSchoolId() != null) {
            DemoSchool demo = demoSchoolRepository.findByDemoRequestIdAndDeletedFalse(id).orElseThrow();
            return new DemoUsernameResponse(demo.getUsername(), true);
        }
        String username = candidate == null || candidate.isBlank()
                ? schoolService.suggestUsername(request.getEmail()) : schoolService.normalizeUsername(candidate);
        return new DemoUsernameResponse(username, schoolService.usernameAvailable(username));
    }

    @Override
    public AcceptDemoResponse resendCredentials(Long id) {
        Provisioned provisioned = new TransactionTemplate(transactionManager).execute(status -> {
            DemoRequest request = demoRequestRepository.lockById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Demo request not found"));
            if (request.getProvisionedSchoolId() == null || request.getDemoSchoolId() == null) {
                throw new IllegalStateException("Demo request has not been provisioned");
            }
            DemoSchool demo = demoSchoolRepository.findById(request.getDemoSchoolId())
                    .orElseThrow(() -> new ResourceNotFoundException("Demo account not found"));
            String password = schoolService.resetSchoolAdminPassword(request.getProvisionedSchoolId());
            demo.setPassword(passwordEncoder.encode(password));
            demoSchoolRepository.save(demo);
            request.setEmailStatus("PENDING");
            request.setEmailError(null);
            demoRequestRepository.save(request);
            School school = schoolRepository.findById(request.getProvisionedSchoolId()).orElseThrow();
            List<ModuleCode> modules = schoolModuleRepository.findBySchoolIdAndActiveTrueAndDeletedFalse(school.getId()).stream().map(SchoolModule::getModuleCode).toList();
            return new Provisioned(request, demo, school, demo.getUsername(), password, modules, demo.getStartDate(), demo.getExpiryDate());
        });
        return deliverAndRespond(provisioned, true);
    }

    private Provisioned provision(Long id, AcceptDemoRequest input) {
        DemoRequest request = demoRequestRepository.lockById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demo request not found"));
        if ("ACCEPTED".equalsIgnoreCase(request.getStatus()) && request.getProvisionedSchoolId() != null && request.getDemoSchoolId() != null) {
            DemoSchool demo = demoSchoolRepository.findById(request.getDemoSchoolId())
                    .orElseThrow(() -> new ResourceNotFoundException("Demo account not found"));
            School school = schoolRepository.findById(request.getProvisionedSchoolId())
                    .orElseThrow(() -> new ResourceNotFoundException("Provisioned school not found"));
            List<ModuleCode> modules = schoolModuleRepository.findBySchoolIdAndActiveTrueAndDeletedFalse(school.getId()).stream()
                    .map(SchoolModule::getModuleCode).toList();
            return new Provisioned(request, demo, school, demo.getUsername(), null, modules, demo.getStartDate(), demo.getExpiryDate());
        }
        boolean acceptableLegacy = "APPROVED".equalsIgnoreCase(request.getStatus()) && request.getProvisionedSchoolId() == null;
        if (!("PENDING".equalsIgnoreCase(request.getStatus()) || acceptableLegacy)) {
            throw new IllegalStateException("Only pending demo requests can be accepted");
        }
        if (request.getProvisionedSchoolId() != null || request.getDemoSchoolId() != null
                || demoSchoolRepository.findByDemoRequestIdAndDeletedFalse(id).isPresent()) {
            throw new IllegalStateException("Demo request is already provisioned");
        }
        List<ModuleCode> interests = parseModules(request.getInterestedModules());
        validateModules(interests);
        SchoolService.DemoProvisioning account = schoolService.createDemoFromRequest(request, interests, input == null ? null : input.username());

        if (request.getLogoKey() != null) {
            String schoolLogo = fileStorageService.copyRequestLogoToSchool(request.getLogoKey(), account.school().getId());
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCompletion(int status) {
                    if (status != STATUS_COMMITTED) safeDelete(schoolLogo);
                }
            });
            account.school().setLogo(schoolLogo);
            schoolRepository.saveAndFlush(account.school());
        }

        DemoSchool demo = new DemoSchool();
        demo.setDemoCode(generateDemoCode());
        demo.setDemoRequestId(request.getId());
        demo.setSchoolId(account.school().getId());
        demo.setUsername(account.username());
        demo.setPassword(passwordEncoder.encode(account.password()));
        demo.setEnabledModules(joinModules(account.modules()));
        demo.setStartDate(account.startsOn());
        demo.setExpiryDate(account.endsOn());
        demo.setRemarks(input == null ? null : trimToNull(input.remarks()));
        demo.setStatus("ACTIVE");
        demo = demoSchoolRepository.saveAndFlush(demo);

        request.setStatus("ACCEPTED");
        request.setProvisionedSchoolId(account.school().getId());
        request.setDemoSchoolId(demo.getId());
        request.setAcceptedAt(Instant.now());
        request.setAcceptedBy(currentUserId());
        request.setEmailStatus("PENDING");
        request.setEmailError(null);
        demoRequestRepository.saveAndFlush(request);
        return new Provisioned(request, demo, account.school(), account.username(), account.password(), account.modules(), account.startsOn(), account.endsOn());
    }

    private AcceptDemoResponse deliverAndRespond(Provisioned account, boolean resend) {
        String emailStatus;
        String error = null;
        if ("DISABLED".equals(emailService.readiness())) {
            emailStatus = "DISABLED";
        } else if (!"READY".equals(emailService.readiness())) {
            emailStatus = "MISCONFIGURED";
            error = "SMTP configuration is incomplete";
        } else {
            try {
                emailService.sendDemoAccountCredentials(account.request().getEmail(), account.request().getContactPerson(), account.school().getName(), account.username(), account.password(), account.startsOn().toString(), account.endsOn().toString(), account.modules());
                emailStatus = "SENT";
            } catch (Exception exception) {
                emailStatus = "FAILED";
                error = safeEmailError(exception);
                log.error("Failed to send demo account email to {} for request id={}", account.request().getEmail(), account.request().getId(), exception);
            }
        }
        String finalEmailStatus = emailStatus;
        String finalError = error;
        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            DemoRequest request = demoRequestRepository.findById(account.request().getId()).orElseThrow();
            request.setEmailStatus(finalEmailStatus);
            request.setEmailError(finalError);
            request.setCredentialsSentAt("SENT".equals(finalEmailStatus) ? Instant.now() : null);
            demoRequestRepository.save(request);
        });
        boolean exposePassword = !"SENT".equals(emailStatus);
        String message = switch (emailStatus) {
            case "SENT" -> resend ? "New credentials sent" : "Demo account created and credentials sent";
            case "DISABLED" -> "Demo account created; email delivery is disabled";
            case "MISCONFIGURED" -> "Demo account created; SMTP configuration is incomplete";
            default -> "Demo account created; credential email failed";
        };
        return new AcceptDemoResponse(true, account.school().getId(), account.demo().getId(), account.school().getCode(),
                account.school().getName(), account.request().getEmail(), account.request().getPhone(),
                account.school().getLogo() == null ? null : "/api/saas/schools/" + account.school().getId() + "/logo",
                account.username(), exposePassword ? account.password() : null, account.startsOn(), account.endsOn(),
                Math.max(0, ChronoUnit.DAYS.between(LocalDate.now(), account.endsOn())), account.modules(), account.demo().getStatus(), emailStatus, message);
    }

    private AcceptDemoResponse existingResponse(Provisioned account) {
        String emailStatus = account.request().getEmailStatus();
        String message = switch (emailStatus == null ? "PENDING" : emailStatus) {
            case "SENT" -> "Demo account already created and credentials sent";
            case "DISABLED" -> "Demo account already created; email delivery is disabled";
            case "FAILED" -> "Demo account already created; credential email failed";
            case "MISCONFIGURED" -> "Demo account already created; SMTP configuration is incomplete";
            default -> "Demo account already created; credential delivery is pending";
        };
        return new AcceptDemoResponse(false, account.school().getId(), account.demo().getId(), account.school().getCode(),
                account.school().getName(), account.request().getEmail(), account.request().getPhone(),
                account.school().getLogo() == null ? null : "/api/saas/schools/" + account.school().getId() + "/logo",
                account.username(), null, account.startsOn(), account.endsOn(),
                Math.max(0, ChronoUnit.DAYS.between(LocalDate.now(), account.endsOn())), account.modules(),
                account.demo().getStatus(), emailStatus, message);
    }

    @Override
    public DemoLogo loadLogo(Long id) {
        DemoRequest request = findActive(id);
        if (request.getLogoKey() == null) return null;
        FileStorageService.StoredFile file = fileStorageService.loadDemoRequestLogo(request.getLogoKey());
        return new DemoLogo(file.bytes(), file.contentType());
    }

    @Override
    public void softDelete(Long id) {
        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            DemoRequest entity = demoRequestRepository.lockById(id).orElseThrow(() -> new ResourceNotFoundException("Demo request not found"));
            if ("ACCEPTED".equalsIgnoreCase(entity.getStatus()) || entity.getProvisionedSchoolId() != null || entity.getDemoSchoolId() != null) {
                throw new IllegalStateException("Accepted demo requests cannot be deleted because they are required for audit traceability");
            }
            String logoKey = entity.getLogoKey();
            entity.setDeleted(true);
            demoRequestRepository.save(entity);
            if (logoKey != null) TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { safeDelete(logoKey); }
            });
        });
    }

    private DemoRequest findActive(Long id) {
        return demoRequestRepository.findByIdAndDeletedFalse(id).orElseThrow(() -> new ResourceNotFoundException("Demo request not found"));
    }

    private void validateModules(List<ModuleCode> modules) {
        if (modules == null || modules.isEmpty()) throw new IllegalArgumentException("At least one module is required");
        for (ModuleCode code : modules) {
            PlatformModule module = moduleRepository.findByCode(code).orElseThrow(() -> new IllegalArgumentException("Unknown module: " + code));
            if (!module.isActive() || !module.isSelectable() || module.isComingSoon()
                    || !Set.of(BillingType.REQUIRED, BillingType.INCLUDED, BillingType.PAID).contains(module.getBillingType())) {
                throw new IllegalArgumentException("Module is not available for public demo requests: " + code);
            }
        }
    }

    private String generateRequestCode() { return "DR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase(Locale.ROOT); }
    private String generateDemoCode() { return "DS-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase(Locale.ROOT); }
    private static String joinModules(Collection<ModuleCode> modules) { return modules == null ? null : String.join(",", modules.stream().map(Enum::name).toList()); }
    private static List<ModuleCode> parseModules(String modules) {
        if (modules == null || modules.isBlank()) return List.of();
        try { return Arrays.stream(modules.split(",")).map(String::trim).map(ModuleCode::valueOf).distinct().toList(); }
        catch (IllegalArgumentException exception) { throw new IllegalArgumentException("Demo request contains an obsolete or invalid module"); }
    }
    private static String trimToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private static String safeError(Exception exception) {
        String message = exception.getMessage() == null ? exception.getClass().getSimpleName() : exception.getMessage();
        return message.substring(0, Math.min(message.length(), 500));
    }

    private static String safeEmailError(Exception exception) {
        String type = exception.getClass().getSimpleName().toLowerCase();
        String message = exception.getMessage() == null ? "" : exception.getMessage().toLowerCase();
        if (type.contains("authentication") || message.contains("authentication") || message.contains("535")) return "SMTP authentication failed";
        if (message.contains("connect") || message.contains("timeout") || message.contains("refused")) return "SMTP connection failed";
        return "Email sending failed";
    }
    private Long currentUserId() { try { return securityUtils.currentUser().getId(); } catch (RuntimeException ignored) { return null; } }
    private void safeDelete(String key) { try { fileStorageService.delete(key); } catch (RuntimeException ignored) { } }

    private record Provisioned(DemoRequest request, DemoSchool demo, School school, String username, String password,
                               List<ModuleCode> modules, LocalDate startsOn, LocalDate endsOn) {}
}
