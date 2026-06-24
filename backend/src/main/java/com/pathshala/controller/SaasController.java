package com.pathshala.controller;

import com.pathshala.dto.ApiDtos.*;
import com.pathshala.entity.PlatformModule;
import com.pathshala.entity.School;
import com.pathshala.entity.SchoolModule;
import com.pathshala.entity.SubscriptionPlan;
import com.pathshala.repository.Repositories.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
    public School createSchool(@Valid @RequestBody SchoolRequest request) {
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
    public SubscriptionPlan createPlan(@Valid @RequestBody PlanRequest request) {
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setName(request.name());
        plan.setMonthlyPrice(request.monthlyPrice());
        plan.setDescription(request.description());
        return planRepository.save(plan);
    }

    @PostMapping("/school-modules")
    public SchoolModule assignModule(@Valid @RequestBody ModuleAssignmentRequest request) {
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

    @GetMapping("/modules")
    public List<PlatformModule> modules() {
        return moduleRepository.findAll();
    }
}
