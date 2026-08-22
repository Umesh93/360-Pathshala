package com.pathshala.dto;

import com.pathshala.entity.AttendanceStatus;
import com.pathshala.entity.HolidayType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

public final class AttendanceDtos {
    private AttendanceDtos() {}

    public record StudentMarkRequest(@NotNull Long studentId, @NotNull AttendanceStatus status, @Size(max = 1000) String remarks) {}
    public record BulkStudentRequest(@NotNull Long academicSessionId, @NotNull Long classId, @NotNull Long sectionId,
                                     @NotNull LocalDate date, boolean upsert, @NotEmpty List<@Valid StudentMarkRequest> records) {}
    public record StudentAttendanceResponse(Long id, Long studentId, String studentName, Long classId, Long sectionId,
                                            Long academicSessionId, LocalDate date, AttendanceStatus status,
                                            String remarks, Long markedBy) {}
    public record RosterRow(Long studentId, String admissionNumber, String rollNumber, String studentName,
                            String gender, String photo,
                            boolean existing, Long attendanceId, AttendanceStatus status, String remarks) {}
    public record AssignmentResponse(Long classId, Long sectionId, Long academicSessionId) {}
    public record ChildAttendanceResponse(Long studentId, String admissionNumber, String studentName,
                                          String className, String sectionName, List<StudentAttendanceResponse> attendance) {}
    public record TeacherAttendanceRequest(@NotNull Long teacherId, @NotNull LocalDate date, LocalTime checkIn,
                                           LocalTime checkOut, @NotNull AttendanceStatus status, @Size(max = 1000) String remarks) {}
    public record TeacherAttendanceResponse(Long id, Long teacherId, String teacherName, String employeeNumber,
                                             String department, LocalDate date, LocalTime checkIn, LocalTime checkOut,
                                             AttendanceStatus status, String remarks, Long markedBy, boolean existing) {}
    public record HolidayRequest(@NotBlank String name, @NotNull HolidayType type, @NotNull LocalDate startsOn,
                                 @NotNull LocalDate endsOn, @Size(max = 1000) String description) {}
    public record HolidayResponse(Long id, String name, HolidayType type, LocalDate startsOn, LocalDate endsOn, String description) {}
    public record CorrectionRequest(@NotBlank String attendanceType, @NotNull Long attendanceId,
                                    @NotNull AttendanceStatus newStatus, @NotBlank @Size(max = 1000) String reason) {}
    public record CorrectionResponse(Long id, String attendanceType, Long attendanceId, AttendanceStatus previousStatus,
                                     AttendanceStatus newStatus, String reason, Long requestedBy, Long reviewedBy, String status) {}
    public record SettingsRequest(@NotNull LocalTime schoolStartTime, @NotNull LocalTime lateAfter,
                                  boolean allowTeacherSelfCheckin, boolean allowFutureAttendance) {}
    public record SettingsResponse(LocalTime schoolStartTime, LocalTime lateAfter,
                                   boolean allowTeacherSelfCheckin, boolean allowFutureAttendance) {}
    public record DashboardResponse(long total, long present, long absent, long late, long leave,
                                     long teachersPresent, long teachersAbsent, long approvedLeaves,
                                     double attendancePercentage, List<Map<String, Object>> trend,
                                     List<Map<String, Object>> classwise) {}
    public record MonthlySummary(Long classId, Long sectionId, int year, int month, long present, long absent,
                                  long late, long leave, long marked, double attendancePercentage) {}
    public record MonthlyStudentSummary(Long studentId, String admissionNumber, String rollNumber, String studentName,
                                        String photo, long present, long absent, long late, long leave,
                                        long marked, double attendancePercentage) {}
}
