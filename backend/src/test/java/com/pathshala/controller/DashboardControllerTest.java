package com.pathshala.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathshala.dto.ApiDtos.SchoolAdminDashboardResponse;
import com.pathshala.dto.ApiDtos.SchoolDashboardAttendance;
import com.pathshala.entity.AcademicYear;
import com.pathshala.entity.AttendanceStatus;
import com.pathshala.entity.Exam;
import com.pathshala.entity.ModuleCode;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class DashboardControllerTest {
    private static AcademicYear session(LocalDate startsOn, LocalDate endsOn, boolean active) {
        AcademicYear session = new AcademicYear();
        session.setStartsOn(startsOn);
        session.setEndsOn(endsOn);
        session.setActive(active);
        return session;
    }

    @Test
    void activeSessionDefaultClampsTodayToStart() {
        AcademicYear session = session(LocalDate.of(2026, 9, 1), LocalDate.of(2027, 6, 30), true);
        assertEquals(LocalDate.of(2026, 9, 1), DashboardController.dashboardDate(session, null, LocalDate.of(2026, 8, 8)));
    }

    @Test
    void historicalSessionDefaultsToEnd() {
        AcademicYear session = session(LocalDate.of(2024, 9, 1), LocalDate.of(2025, 6, 30), false);
        assertEquals(LocalDate.of(2025, 6, 30), DashboardController.dashboardDate(session, null, LocalDate.of(2026, 8, 8)));
    }

    @Test
    void suppliedDateOutsideSessionIsRejected() {
        AcademicYear session = session(LocalDate.of(2025, 9, 1), LocalDate.of(2026, 6, 30), false);
        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> DashboardController.dashboardDate(session, LocalDate.of(2026, 7, 1), LocalDate.of(2026, 8, 8)));
        assertTrue(error.getMessage().contains("selected academic session"));
    }

    @Test
    void classOverviewGateRequiresOneOwningModule() {
        assertFalse(DashboardController.dashboardClassesEnabled(EnumSet.of(ModuleCode.ATTENDANCE)));
        assertTrue(DashboardController.dashboardClassesEnabled(EnumSet.of(ModuleCode.EXAMINATION)));
        assertTrue(DashboardController.dashboardClassesEnabled(EnumSet.of(ModuleCode.STUDENT_MANAGEMENT)));
    }

    @Test
    void attendanceUsesActivePopulationAndCountsLateAsAttended() {
        SchoolDashboardAttendance summary = DashboardController.attendanceSummary(LocalDate.of(2026, 8, 8), 20,
                Map.of(AttendanceStatus.PRESENT, 12L, AttendanceStatus.LATE, 2L, AttendanceStatus.ABSENT, 1L), List.of());
        assertEquals(20, summary.total());
        assertEquals(5, summary.unmarked());
        assertEquals(70.0, summary.percentage());
        assertTrue(summary.requiresAttention());
    }

    @Test
    void upcomingExamCountIsNotCappedByPreviewSize() {
        List<Exam> exams = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            Exam exam = new Exam();
            exam.setStartsOn(LocalDate.of(2026, 8, 8).plusDays(i));
            exams.add(exam);
        }
        assertEquals(7, DashboardController.upcomingExamCount(exams, LocalDate.of(2026, 8, 8)));
    }

    @Test
    void dashboardContractContainsNoTimetableField() {
        List<String> fields = new ObjectMapper().getSerializationConfig().introspect(
                new ObjectMapper().constructType(SchoolAdminDashboardResponse.class)).findProperties().stream()
                .map(property -> property.getName().toLowerCase()).toList();
        assertTrue(fields.stream().noneMatch(field -> field.contains("timetable")));
    }
}
