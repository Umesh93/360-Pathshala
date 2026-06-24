package com.pathshala.service.impl;

import com.pathshala.entity.ModuleCode;
import com.pathshala.entity.RoleName;
import com.pathshala.exception.ForbiddenException;
import com.pathshala.repository.Repositories.SchoolModuleRepository;
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

    @Override
    public void require(Long schoolId, ModuleCode moduleCode) {
        UserPrincipal principal = securityUtils.currentUser();
        if (principal.getRoles().contains(RoleName.SUPER_ADMIN)) {
            return;
        }
        if (!schoolId.equals(principal.getSchoolId())) {
            throw new ForbiddenException("Cross-school access denied");
        }
        if (!schoolModuleRepository.existsBySchoolIdAndModuleCodeAndActiveTrueAndDeletedFalse(schoolId, moduleCode)) {
            throw new ForbiddenException("Module not subscribed: " + moduleCode);
        }
    }
}
