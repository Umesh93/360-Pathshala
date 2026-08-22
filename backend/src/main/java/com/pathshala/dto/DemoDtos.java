package com.pathshala.dto;

import com.pathshala.entity.AttendanceStatus;
import com.pathshala.entity.LeaveStatus;
import com.pathshala.entity.ModuleCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;
import lombok.Data;

public class DemoDtos {
    public record PublicDemoRequestRequest(
            @NotBlank String schoolName,
            @NotBlank String contactPerson,
            @NotBlank String designation,
            @NotBlank @Email String email,
            @NotBlank String phone,
            @NotBlank String address,
            @NotEmpty List<ModuleCode> interestedModules
    ) {}

    public record PublicDemoRequestResponse(Long id, String requestCode, String schoolName, String status, String createdAt) {}

    public record AdminDemoRequestResponse(
            Long id,
            String requestCode,
            String schoolName,
            String contactPerson,
            String designation,
            String email,
            String phone,
            String address,
            Integer studentCount,
            String interestedModules,
            String message,
            String status,
            String logoUrl,
            Long provisionedSchoolId,
            Long demoSchoolId,
            String emailStatus,
            String emailError,
            String acceptedAt,
            String createdAt,
            String updatedAt
    ) {}

    public record UpdateDemoRequestRequest(String status, String message) {}

    public record AcceptDemoRequest(String remarks, String username) {}
    public record DemoUsernameResponse(String username, boolean available) {}

    public record AcceptDemoResponse(
            boolean accountCreated,
            Long schoolId,
            Long demoSchoolId,
            String schoolCode,
            String schoolName,
            String email,
            String phone,
            String logoUrl,
            String username,
            String password,
            LocalDate startsOn,
            LocalDate expiresOn,
            long remainingDays,
            List<ModuleCode> modules,
            String status,
            String emailStatus,
            String message
    ) {}

    public record CreateDemoAccountRequest(
            Long demoRequestId,
            @NotBlank String username,
            @NotBlank String password,
            List<ModuleCode> enabledModules,
            @NotNull LocalDate startDate,
            @NotNull LocalDate expiryDate,
            String remarks
    ) {}

    public record CreateDemoAccountResponse(Long id, String demoCode, String username, String password, String expiryDate) {}

    public record AdminDemoSchoolResponse(
            Long id,
            String demoCode,
            Long demoRequestId,
            Long schoolId,
            String schoolName,
            String email,
            String phone,
            String logoUrl,
            String username,
            String enabledModules,
            String startDate,
            String expiryDate,
            long remainingDays,
            String remarks,
            String status,
            String createdAt
    ) {}

    public record UpdateDemoSchoolRequest(List<ModuleCode> enabledModules, LocalDate expiryDate, String remarks) {}

    public record ExtendDemoRequest(@NotNull @Positive Integer days) {}

    public record ConvertToPaidRequest(String schoolCode, String subscriptionPlan) {}

    public record AdminConversionHistoryResponse(
            Long id,
            String conversionCode,
            Long demoRequestId,
            Long demoSchoolId,
            Long paidSchoolId,
            String schoolName,
            Long convertedBy,
            String convertedByName,
            String conversionDate,
            String initialSubscriptionPlan,
            Integer subscriptionDuration,
            String enabledModules,
            String paymentReference,
            String paymentMethod,
            String paymentAmount,
            String currency,
            String remarks,
            String createdAt
    ) {}

    public record ConversionDetailResponse(
            AdminConversionHistoryResponse conversion,
            Object demoRequest,
            Object demoSchool,
            Object paidSchool
    ) {}
}
