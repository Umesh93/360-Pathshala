package com.pathshala.util;

import com.pathshala.entity.RoleName;
import com.pathshala.exception.ForbiddenException;
import com.pathshala.security.UserPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {
    public UserPrincipal currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return userPrincipal;
        }
        throw new ForbiddenException("Authentication required");
    }

    public Long requiredSchoolId() {
        UserPrincipal principal = currentUser();
        if (principal.getRoles().contains(RoleName.SUPER_ADMIN)) {
            throw new ForbiddenException("School context required for this operation");
        }
        return principal.getSchoolId();
    }

    public Long schoolScope(Long requestedSchoolId) {
        UserPrincipal principal = currentUser();
        if (principal.getRoles().contains(RoleName.SUPER_ADMIN)) {
            if (requestedSchoolId == null) {
                throw new ForbiddenException("schoolId is required for super admin tenant operations");
            }
            return requestedSchoolId;
        }
        if (requestedSchoolId != null && !requestedSchoolId.equals(principal.getSchoolId())) {
            throw new ForbiddenException("Cross-school access denied");
        }
        return principal.getSchoolId();
    }

    public boolean hasRole(RoleName role) {
        return currentUser().getRoles().contains(role);
    }
}
