package com.pathshala.mapper;

import com.pathshala.dto.DemoDtos.*;
import com.pathshala.entity.DemoRequest;
import com.pathshala.entity.DemoSchool;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class DemoMapper {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_DATE;

    public static AdminDemoRequestResponse toAdminResponse(DemoRequest request) {
        return new AdminDemoRequestResponse(
                request.getId(),
                request.getRequestCode(),
                request.getSchoolName(),
                request.getContactPerson(),
                request.getDesignation(),
                request.getEmail(),
                request.getPhone(),
                request.getAddress(),
                request.getStudentCount(),
                request.getInterestedModules(),
                request.getMessage(),
                normalizeStatus(request.getStatus()),
                request.getLogoKey() == null ? null : "/api/super-admin/demo-requests/" + request.getId() + "/logo",
                request.getProvisionedSchoolId(),
                request.getDemoSchoolId(),
                request.getEmailStatus(),
                request.getEmailError(),
                request.getAcceptedAt() != null ? request.getAcceptedAt().toString() : null,
                request.getCreatedAt() != null ? request.getCreatedAt().toString() : null,
                request.getUpdatedAt() != null ? request.getUpdatedAt().toString() : null
        );
    }

    public static PublicDemoRequestResponse toPublicResponse(DemoRequest request) {
        return new PublicDemoRequestResponse(
                request.getId(),
                request.getRequestCode(),
                request.getSchoolName(),
                request.getStatus(),
                request.getCreatedAt() != null ? request.getCreatedAt().toString() : null
        );
    }

    public static AdminDemoSchoolResponse toAdminResponse(DemoSchool school, String schoolName, String email, String phone, long remainingDays) {
        return new AdminDemoSchoolResponse(
                school.getId(),
                school.getDemoCode(),
                school.getDemoRequestId(),
                school.getSchoolId(),
                schoolName,
                email,
                phone,
                school.getSchoolId() == null ? null : "/api/saas/schools/" + school.getSchoolId() + "/logo",
                school.getUsername(),
                school.getEnabledModules(),
                school.getStartDate() != null ? school.getStartDate().format(DATE_FORMATTER) : null,
                school.getExpiryDate() != null ? school.getExpiryDate().format(DATE_FORMATTER) : null,
                remainingDays,
                school.getRemarks(),
                school.getStatus(),
                school.getCreatedAt() != null ? school.getCreatedAt().toString() : null
        );
    }

    private static String normalizeStatus(String status) {
        return "APPROVED".equalsIgnoreCase(status) || "DEMO_ACCOUNT_CREATED".equalsIgnoreCase(status) ? "ACCEPTED" : status;
    }

    public static CreateDemoAccountResponse toCreateResponse(DemoSchool school, String password) {
        return new CreateDemoAccountResponse(
                school.getId(),
                school.getDemoCode(),
                school.getUsername(),
                password,
                school.getExpiryDate() != null ? school.getExpiryDate().format(DATE_FORMATTER) : null
        );
    }
}
