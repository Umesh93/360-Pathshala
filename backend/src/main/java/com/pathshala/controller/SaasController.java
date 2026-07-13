package com.pathshala.controller;

import com.pathshala.dto.ApiDtos.*;
import com.pathshala.entity.ModuleCode;
import com.pathshala.entity.PlatformModule;
import com.pathshala.entity.School;
import com.pathshala.entity.SchoolModule;
import com.pathshala.entity.SubscriptionPlan;
import com.pathshala.repository.Repositories.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/saas")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SaasController {
    private final SchoolRepository schoolRepository;
    private final SubscriptionPlanRepository planRepository;
    private final ModuleRepository moduleRepository;
    private final SchoolModuleRepository schoolModuleRepository;

    @PostMapping("/schools")
    @ResponseStatus(HttpStatus.CREATED)
    public School createSchool(@Valid @RequestBody SchoolRequest request) {
        if (schoolRepository.existsByCode(request.code())) {
            throw new IllegalArgumentException("School code already exists");
        }
        School school = new School();
        school.setName(request.name());
        school.setCode(request.code());
        school.setAddress(request.address());
        school.setPhone(request.phone());
        school.setEmail(request.email());
        return schoolRepository.save(school);
    }

    @GetMapping("/schools")
    public List<School> schools() {
        return schoolRepository.findAll();
    }

    @PostMapping("/plans")
    @ResponseStatus(HttpStatus.CREATED)
    public SubscriptionPlan createPlan(@Valid @RequestBody PlanRequest request) {
        if (planRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Subscription plan already exists");
        }
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setName(request.name());
        plan.setMonthlyPrice(request.monthlyPrice());
        plan.setDescription(request.description());
        return planRepository.save(plan);
    }

    @GetMapping("/plans")
    public List<SubscriptionPlan> plans() {
        return planRepository.findAll();
    }

    @PostMapping("/modules")
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
    public SchoolModule assignModule(@Valid @RequestBody ModuleAssignmentRequest request) {
        if (!schoolRepository.existsById(request.schoolId())) {
            throw new IllegalArgumentException("School does not exist");
        }
        if (!moduleRepository.existsByCode(request.moduleCode())) {
            throw new IllegalArgumentException("Module does not exist");
        }
        SchoolModule schoolModule = schoolModuleRepository
                .findBySchoolIdAndModuleCodeAndDeletedFalse(request.schoolId(), request.moduleCode())
                .orElseGet(SchoolModule::new);
        schoolModule.setSchoolId(request.schoolId());
        schoolModule.setModuleCode(request.moduleCode());
        schoolModule.setActive(request.active());
        return schoolModuleRepository.save(schoolModule);
    }

    @PutMapping("/school-modules")
    public SchoolModule toggleModule(@Valid @RequestBody ModuleAssignmentRequest request) {
        return assignModule(request);
    }

    @GetMapping("/schools/{schoolId}/modules")
    public List<SchoolModule> schoolModules(@PathVariable Long schoolId) {
        if (!schoolRepository.existsById(schoolId)) {
            throw new IllegalArgumentException("School does not exist");
        }
        return schoolModuleRepository.findAll().stream()
                .filter(module -> !module.isDeleted() && module.getSchoolId().equals(schoolId))
                .toList();
    }

    @GetMapping("/modules")
    public List<PlatformModule> modules() {
        return moduleRepository.findAll();
    }
}
