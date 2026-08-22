package com.pathshala.service.impl;

import com.pathshala.entity.ModuleCode;
import com.pathshala.entity.RoleName;
import com.pathshala.exception.ForbiddenException;
import com.pathshala.repository.Repositories.SchoolModuleRepository;
import com.pathshala.repository.Repositories.SchoolRepository;
import com.pathshala.security.UserPrincipal;
import com.pathshala.service.ModuleAccessService;
import com.pathshala.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ModuleAccessServiceImpl implements ModuleAccessService {
    private final SchoolModuleRepository schoolModuleRepository;
    private final SecurityUtils securityUtils;
    private final SchoolRepository schools;

    @Override
    public void require(Long schoolId, ModuleCode moduleCode) {
        UserPrincipal principal = securityUtils.currentUser();
        if (principal.getRoles().contains(RoleName.SUPER_ADMIN)) {
            return;
        }
        if (!schoolId.equals(principal.getSchoolId())) {
            throw new ForbiddenException("Cross-school access denied");
        }
        if (schools.findByIdAndDeletedFalse(schoolId).filter(s -> s.isActive()).isEmpty()) {
            throw new ForbiddenException("School is inactive");
        }
        var entitlement = schoolModuleRepository.findBySchoolIdAndModuleCodeAndDeletedFalse(schoolId, moduleCode);
        if (entitlement.isEmpty() || !entitlement.get().isActive()) {
            throw new ForbiddenException("Module not subscribed: " + moduleCode);
        }
        if (entitlement.get().isManagedBySubscription()) {
            java.time.LocalDate today = java.time.LocalDate.now();
            boolean valid = entitlement.get().getEntitlementStartsOn() != null && entitlement.get().getEntitlementEndsOn() != null
                    && !entitlement.get().getEntitlementStartsOn().isAfter(today) && !entitlement.get().getEntitlementEndsOn().isBefore(today);
            if (!valid) throw new ForbiddenException("Active subscription required for module: " + moduleCode);
        }
    }

    @Override
    public boolean allowed(Long schoolId, ModuleCode moduleCode) {
        try { require(schoolId, moduleCode); return true; } catch (ForbiddenException exception) { return false; }
    }
}
