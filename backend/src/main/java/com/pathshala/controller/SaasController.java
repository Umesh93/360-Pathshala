package com.pathshala.controller;

import com.pathshala.dto.ApiDtos.*;
import com.pathshala.entity.*;
import com.pathshala.repository.Repositories.*;
import com.pathshala.service.SchoolService;
import com.pathshala.service.SubscriptionService;
import com.pathshala.dto.SubscriptionDtos;
import com.pathshala.exception.ForbiddenException;
import com.pathshala.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/saas")
@RequiredArgsConstructor
@Slf4j
// @PreAuthorize("hasRole('SUPER_ADMIN')")
public class SaasController {
    private final SchoolRepository schoolRepository;
    private final SubscriptionPlanRepository planRepository;
    private final ModuleRepository moduleRepository;
    private final SchoolModuleRepository schoolModuleRepository;
    private final DemoSchoolRepository demoSchoolRepository;
    private final com.pathshala.service.ModuleAccessService moduleAccessService;
    private final UserRepository userRepository;
    private final SchoolService schoolService;
    private final SecurityUtils securityUtils;
    @Autowired
    private SubscriptionService subscriptionService;

    @PostMapping("/schools")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public CreateSchoolResponse createSchool(@Valid @RequestBody CreateSchoolRequest request) {
        log.info("Received create school request: name={}, email={}, status={}, modules={}", request.name(), request.email(), request.status(), request.modules());
        try {
            CreateSchoolResponse response = schoolService.createSchool(request);
            log.info("School created successfully: schoolCode={}", response.schoolCode());
            return response;
        } catch (Exception e) {
            log.error("Failed to create school: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/schools/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public School updateSchool(@PathVariable Long id, @Valid @RequestBody CreateSchoolRequest request) {
        log.info("Received update school request: id={}, name={}, email={}, status={}", id, request.name(), request.email(), request.status());
        return schoolService.updateSchool(id, request);
    }

    @DeleteMapping("/schools/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public Map<String, String> deleteSchool(@PathVariable Long id) {
        schoolService.deleteSchool(id);
        return Map.of("message", "School deleted successfully");
    }

    @PatchMapping("/schools/{id}/status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public School toggleStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            status = "INACTIVE";
        }
        return schoolService.toggleStatus(id, status);
    }

    @GetMapping("/schools/next-id")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public String nextSchoolId() {
        long count = schoolRepository.count();
        return String.format("SCH-%06d", count + 1);
    }

    @GetMapping("/schools")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<SchoolSummary> schools() {
        return schoolRepository.findAll().stream()
                .map(school -> {
                    List<String> moduleCodes = schoolModuleRepository.findBySchoolIdAndActiveTrueAndDeletedFalse(school.getId()).stream()
                            .map(SchoolModule::getModuleCode)
                            .map(Enum::name)
                            .toList();

                    String adminUsername = userRepository.findBySchoolIdAndDeletedFalse(school.getId()).stream()
                            .filter(user -> user.getRoles().contains(RoleName.SCHOOL_ADMIN))
                            .findFirst()
                            .map(User::getUsername)
                            .orElse("");

                    return new SchoolSummary(
                            school.getId(),
                            school.getCode(),
                            school.getName(),
                            school.getAddress(),
                            school.getPhone(),
                            school.getEmail(),
                            school.getContactPerson(),
                            school.getDesignation(),
                            school.getStatus(),
                            moduleCodes,
                            adminUsername,
                            null,
                            school.getLogo() == null ? null : "/api/saas/schools/" + school.getId() + "/logo"
                    );
                })
                .toList();
    }

    @PostMapping("/plans")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public SubscriptionDtos.Plan createPlan(@Valid @RequestBody PlanRequest request) {
        if (planRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Subscription plan already exists");
        }
        return subscriptionService.savePlan(null, request.code(), request.name(), request.monthlyPrice(), request.durationDays(),
                request.description(), request.active(), request.moduleCodes());
    }

    @GetMapping("/plans")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<SubscriptionDtos.Plan> plans() {
        return subscriptionService.listPlans(true);
    }

    @PutMapping("/plans/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public SubscriptionDtos.Plan updatePlan(@PathVariable Long id, @Valid @RequestBody PlanRequest request) {
        return subscriptionService.savePlan(id, request.code(), request.name(), request.monthlyPrice(), request.durationDays(),
                request.description(), request.active(), request.moduleCodes());
    }

    @PatchMapping("/plans/{id}/active")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public SubscriptionDtos.Plan activatePlan(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        SubscriptionPlan plan = planRepository.findById(id).orElseThrow(() -> new com.pathshala.exception.ResourceNotFoundException("Plan not found"));
        return subscriptionService.savePlan(id, plan.getCode(), plan.getName(), plan.getMonthlyPrice(), plan.getDurationDays(),
                plan.getDescription(), body.getOrDefault("active", true), null);
    }

    @GetMapping("/payments")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<SubscriptionDtos.Payment> paymentHistory(@RequestParam(required = false) Long schoolId) {
        return schoolId == null ? subscriptionService.allPayments() : subscriptionService.paymentHistory(schoolId);
    }

    @GetMapping("/subscriptions")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<SubscriptionDtos.CurrentSubscription> subscriptionHistory(@RequestParam(required = false) Long schoolId) {
        return schoolId == null ? subscriptionService.allSubscriptions() : subscriptionService.subscriptionHistory(schoolId);
    }

    @PostMapping("/modules")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public PlatformModule createModule(@Valid @RequestBody ModuleRequest request) {
        if (moduleRepository.existsByCode(request.code())) {
            throw new IllegalArgumentException("Module code already exists");
        }
        PlatformModule module = new PlatformModule();
        module.setCode(request.code());
        module.setName(request.name());
        module.setDescription(request.description());
        module.setActive(request.active());
        return moduleRepository.save(module);
    }

    @PostMapping("/school-modules")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @org.springframework.transaction.annotation.Transactional
    public SchoolModule assignModule(@Valid @RequestBody ModuleAssignmentRequest request) {
        if (!schoolRepository.existsById(request.schoolId())) {
            throw new IllegalArgumentException("School does not exist");
        }
        PlatformModule catalogueModule = moduleRepository.findByCode(request.moduleCode())
                .orElseThrow(() -> new IllegalArgumentException("Module does not exist"));
        if (!catalogueModule.isActive() || catalogueModule.isComingSoon()) {
            throw new IllegalArgumentException("Module is not currently available");
        }
        if (!request.active() && catalogueModule.getBillingType() == BillingType.REQUIRED) {
            throw new IllegalArgumentException("Required modules cannot be disabled");
        }
        SchoolModule schoolModule = schoolModuleRepository
                .findBySchoolIdAndModuleCodeAndDeletedFalse(request.schoolId(), request.moduleCode())
                .orElseGet(SchoolModule::new);
        if (!request.active() && schoolModule.isManagedBySubscription()) {
            throw new IllegalArgumentException("Subscription-managed modules cannot be disabled manually");
        }
        schoolModule.setSchoolId(request.schoolId());
        schoolModule.setModuleCode(request.moduleCode());
        schoolModule.setActive(request.active());
        return schoolModuleRepository.saveAndFlush(schoolModule);
    }

    @PutMapping("/school-modules")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public SchoolModule toggleModule(@Valid @RequestBody ModuleAssignmentRequest request) {
        return assignModule(request);
    }

    @GetMapping("/schools/{schoolId}/modules")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<SchoolModule> schoolModules(@PathVariable Long schoolId) {
        if (!schoolRepository.existsById(schoolId)) {
            throw new IllegalArgumentException("School does not exist");
        }
        return schoolModuleRepository.findBySchoolIdAndDeletedFalse(schoolId);
    }

    @GetMapping("/school-modules/current")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT')")
    public List<SchoolModule> currentSchoolModules(org.springframework.security.core.Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof com.pathshala.security.UserPrincipal user) || user.getSchoolId() == null) {
            throw new com.pathshala.exception.ForbiddenException("School context required");
        }
        return schoolModuleRepository.findBySchoolIdAndActiveTrueAndDeletedFalse(user.getSchoolId()).stream()
                .filter(module -> moduleAccessService.allowed(user.getSchoolId(), module.getModuleCode())).toList();
    }

    @GetMapping("/modules")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<PlatformModule> modules() {
        return moduleRepository.findAll().stream()
                .filter(PlatformModule::isActive)
                .filter(module -> module.getCategory() != null)
                .sorted(java.util.Comparator.comparing((PlatformModule module) -> module.getBillingType().ordinal())
                        .thenComparing(PlatformModule::getName))
                .toList();
    }

    @PutMapping(value = "/schools/{id}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','SCHOOL_ADMIN')")
    public SchoolLogoResponse uploadLogo(@PathVariable Long id, @RequestPart("file") MultipartFile file) {
        requireLogoAccess(id, true);
        return schoolService.uploadLogo(id, file);
    }

    @DeleteMapping("/schools/{id}/logo")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','SCHOOL_ADMIN')")
    public SchoolLogoResponse removeLogo(@PathVariable Long id) {
        requireLogoAccess(id, true);
        schoolService.removeLogo(id);
        return new SchoolLogoResponse(false, null);
    }

    @GetMapping("/schools/{id}/logo")
    public ResponseEntity<byte[]> logo(@PathVariable Long id) {
        requireLogoAccess(id, false);
        SchoolService.SchoolLogo logo = schoolService.loadLogo(id);
        if (logo == null) return ResponseEntity.notFound().build();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(logo.contentType()));
        headers.setContentDisposition(ContentDisposition.inline().filename("school-logo").build());
        headers.setCacheControl(CacheControl.noCache());
        headers.set("X-Content-Type-Options", "nosniff");
        return ResponseEntity.ok().headers(headers).body(logo.bytes());
    }

    @GetMapping("/schools/current/logo")
    public ResponseEntity<byte[]> currentLogo() {
        return logo(securityUtils.requiredSchoolId());
    }

    private void requireLogoAccess(Long schoolId, boolean mutation) {
        var user = securityUtils.currentUser();
        if (user.getRoles().contains(RoleName.SUPER_ADMIN)) return;
        if (!schoolId.equals(user.getSchoolId())) throw new ForbiddenException("Cross-school access denied");
        School school = schoolRepository.findById(schoolId).filter(candidate -> !candidate.isDeleted()).orElseThrow(() -> new ForbiddenException("School access denied"));
        if (demoSchoolRepository.findByIdAndUsernameAndDeletedFalse(schoolId, user.getUsername()).isPresent()) throw new ForbiddenException("Legacy demo branding unavailable");
        User persisted = userRepository.findById(user.getId()).filter(candidate -> !candidate.isDeleted() && candidate.isActive()).orElseThrow(() -> new ForbiddenException("School access denied"));
        if (!schoolId.equals(persisted.getSchoolId())) throw new ForbiddenException("School access denied");
        if (user.getRoles().contains(RoleName.SCHOOL_ADMIN) && !school.getEmail().equalsIgnoreCase(persisted.getEmail())) throw new ForbiddenException("School administrator is not linked to this school");
        if (mutation && !user.getRoles().contains(RoleName.SCHOOL_ADMIN)) {
            throw new ForbiddenException("School administrator role required");
        }
    }

    @GetMapping("/ping")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public Map<String, String> ping() {
        return Map.of("status", "ok", "timestamp", java.time.Instant.now().toString());
    }
}
