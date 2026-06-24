package com.pathshala.controller;

import com.pathshala.dto.ApiDtos.DashboardResponse;
import com.pathshala.entity.AttendanceStatus;
import com.pathshala.entity.ModuleCode;
import com.pathshala.repository.Repositories.*;
import com.pathshala.service.ModuleAccessService;
import com.pathshala.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/dashboards")
@RequiredArgsConstructor
public class DashboardController {
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AttendanceRepository attendanceRepository;
    private final AssignmentRepository assignmentRepository;
    private final FeeCollectionRepository feeCollectionRepository;
    private final FeeStructureRepository feeStructureRepository;
    private final ModuleAccessService moduleAccessService;
    private final SecurityUtils securityUtils;

    @GetMapping("/school-admin")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public DashboardResponse schoolAdmin() {
        Long schoolId = securityUtils.requiredSchoolId(); moduleAccessService.require(schoolId, ModuleCode.ANALYTICS_DASHBOARD);
        long students = studentRepository.countBySchoolIdAndDeletedFalse(schoolId);
        long teachers = teacherRepository.countBySchoolIdAndDeletedFalse(schoolId);
        long present = attendanceRepository.countBySchoolIdAndStatusAndDeletedFalse(schoolId, AttendanceStatus.PRESENT);
        BigDecimal collected = feeCollectionRepository.totalCollected(schoolId);
        BigDecimal expected = feeStructureRepository.totalExpected(schoolId);
        return new DashboardResponse(Map.of("totalStudents", students, "totalTeachers", teachers, "feeCollection", collected), Map.of("attendance", Map.of("present", present), "fees", Map.of("expected", expected, "collected", collected)));
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasRole('TEACHER')")
    public DashboardResponse teacher() {
        Long schoolId = securityUtils.requiredSchoolId();
        return new DashboardResponse(Map.of("pendingAssignments", assignmentRepository.countBySchoolIdAndDeletedFalse(schoolId)), Map.of("attendanceSummary", Map.of("present", attendanceRepository.countBySchoolIdAndStatusAndDeletedFalse(schoolId, AttendanceStatus.PRESENT))));
    }

    @GetMapping("/parent")
    @PreAuthorize("hasRole('PARENT')")
    public DashboardResponse parent() {
        Long schoolId = securityUtils.requiredSchoolId();
        return new DashboardResponse(Map.of("feeCollected", feeCollectionRepository.totalCollected(schoolId)), Map.of("childAttendance", Map.of("present", attendanceRepository.countBySchoolIdAndStatusAndDeletedFalse(schoolId, AttendanceStatus.PRESENT))));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public DashboardResponse student() {
        Long schoolId = securityUtils.requiredSchoolId();
        return new DashboardResponse(Map.of("assignments", assignmentRepository.countBySchoolIdAndDeletedFalse(schoolId)), Map.of("attendance", Map.of("present", attendanceRepository.countBySchoolIdAndStatusAndDeletedFalse(schoolId, AttendanceStatus.PRESENT))));
    }
}
