package com.pathshala.controller;

import com.pathshala.dto.AttendanceDtos.*;
import com.pathshala.entity.AttendanceStatus;
import com.pathshala.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService service;

    @GetMapping("/students/roster")
    @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN')")
    public List<RosterRow> roster(@RequestParam Long academicSessionId, @RequestParam Long classId,
                                  @RequestParam Long sectionId, @RequestParam LocalDate date) {
        return service.roster(academicSessionId, classId, sectionId, date);
    }

    @PostMapping("/students/bulk")
    @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN')")
    public List<StudentAttendanceResponse> bulk(@Valid @RequestBody BulkStudentRequest request) { return service.bulk(request); }

    @PutMapping("/students/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN')")
    public StudentAttendanceResponse updateStudent(@PathVariable Long id, @Valid @RequestBody StudentMarkRequest request) {
        return service.updateStudent(id, request);
    }

    @GetMapping("/students/{studentId}/history")
    @PreAuthorize("hasAnyRole('STUDENT','PARENT','TEACHER','SCHOOL_ADMIN')")
    public List<StudentAttendanceResponse> history(@PathVariable Long studentId,
            @RequestParam(required = false) LocalDate start, @RequestParam(required = false) LocalDate end,
            @RequestParam(required = false) Integer month, @RequestParam(required = false) Integer year) {
        return service.studentHistory(studentId, start, end, month, year);
    }

    @GetMapping("/students/history")
    @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN')")
    public List<StudentAttendanceResponse> history(@RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long classId, @RequestParam(required = false) Long sectionId,
            @RequestParam(required = false) AttendanceStatus status,
            @RequestParam(required = false) LocalDate start, @RequestParam(required = false) LocalDate end) {
        return service.staffHistory(studentId, classId, sectionId, status, start, end);
    }

    @GetMapping("/students/self/history")
    @PreAuthorize("hasRole('STUDENT')")
    public List<StudentAttendanceResponse> selfHistory(@RequestParam(required = false) LocalDate start,
            @RequestParam(required = false) LocalDate end, @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        return service.selfStudentHistory(start, end, month, year);
    }

    @GetMapping("/parents/self/children")
    @PreAuthorize("hasRole('PARENT')")
    public List<ChildAttendanceResponse> children(@RequestParam(required = false) LocalDate start,
            @RequestParam(required = false) LocalDate end, @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        return service.selfParentChildren(start, end, month, year);
    }

    @GetMapping("/students/monthly-summary")
    @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN')")
    public List<MonthlyStudentSummary> monthly(@RequestParam(required = false) Long academicSessionId,
                                   @RequestParam Long classId, @RequestParam(required = false) Long sectionId,
                                   @RequestParam int year, @RequestParam int month) {
        return service.monthlyStudentSummary(academicSessionId, classId, sectionId, year, month);
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public DashboardResponse dashboard(@RequestParam(required = false) LocalDate start,
                                       @RequestParam(required = false) LocalDate end) { return service.dashboard(start, end); }

    @GetMapping("/teachers")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public List<TeacherAttendanceResponse> teachers(@RequestParam(required = false) LocalDate start,
            @RequestParam(required = false) LocalDate end, @RequestParam(required = false) AttendanceStatus status) {
        return service.teacherList(start, end, status);
    }

    @PostMapping("/teachers")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public TeacherAttendanceResponse markTeacher(@Valid @RequestBody TeacherAttendanceRequest request) { return service.saveTeacher(request); }

    @PutMapping("/teachers/{id}")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public TeacherAttendanceResponse editTeacher(@PathVariable Long id, @Valid @RequestBody TeacherAttendanceRequest request) { return service.updateTeacher(id, request); }

    @GetMapping("/teachers/absent")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public List<TeacherAttendanceResponse> absentTeachers(@RequestParam(required = false) LocalDate start, @RequestParam(required = false) LocalDate end) {
        return service.teacherList(start, end, AttendanceStatus.ABSENT);
    }

    @GetMapping("/teachers/leave")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public List<TeacherAttendanceResponse> teachersOnLeave(@RequestParam(required = false) LocalDate start, @RequestParam(required = false) LocalDate end) {
        return service.teacherList(start, end, AttendanceStatus.LEAVE);
    }

    @GetMapping("/teachers/self/today")
    @PreAuthorize("hasRole('TEACHER')")
    public TeacherAttendanceResponse today() { return service.teacherToday(); }

    @GetMapping("/teachers/self/assignments")
    @PreAuthorize("hasRole('TEACHER')")
    public List<AssignmentResponse> assignments(@RequestParam(required = false) Long academicSessionId) { return service.selfAssignments(academicSessionId); }

    @PostMapping("/teachers/self/check-in")
    @PreAuthorize("hasRole('TEACHER')")
    public TeacherAttendanceResponse checkIn() { return service.selfCheck(false); }

    @PostMapping("/teachers/self/check-out")
    @PreAuthorize("hasRole('TEACHER')")
    public TeacherAttendanceResponse checkOut() { return service.selfCheck(true); }

    @GetMapping("/holidays")
    @PreAuthorize("hasAnyRole('STUDENT','PARENT','TEACHER','SCHOOL_ADMIN')")
    public List<HolidayResponse> holidays() { return service.holidays(); }

    @GetMapping("/academic-calendar")
    @PreAuthorize("hasRole('STUDENT')")
    public List<HolidayResponse> academicCalendar() { return service.academicCalendar(); }

    @PostMapping("/holidays")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public HolidayResponse createHoliday(@Valid @RequestBody HolidayRequest request) { return service.createHoliday(request); }

    @PutMapping("/holidays/{id}")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public HolidayResponse updateHoliday(@PathVariable Long id, @Valid @RequestBody HolidayRequest request) { return service.updateHoliday(id, request); }

    @DeleteMapping("/holidays/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public void deleteHoliday(@PathVariable Long id) { service.deleteHoliday(id); }

    @GetMapping("/corrections")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public List<CorrectionResponse> corrections() { return service.corrections(); }

    @PostMapping("/corrections")
    @PreAuthorize("hasAnyRole('STUDENT','PARENT','TEACHER','SCHOOL_ADMIN')")
    public CorrectionResponse correction(@Valid @RequestBody CorrectionRequest request) { return service.createCorrection(request); }

    @PutMapping("/corrections/{id}/review")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public CorrectionResponse review(@PathVariable Long id, @RequestParam boolean approve) { return service.reviewCorrection(id, approve); }

    @GetMapping("/settings")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public SettingsResponse settings() { return service.getSettings(); }

    @PutMapping("/settings")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public SettingsResponse settings(@Valid @RequestBody SettingsRequest request) { return service.updateSettings(request); }

    @GetMapping("/reports/{report}")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public ResponseEntity<byte[]> report(@PathVariable String report, @RequestParam(defaultValue = "csv") String format,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false) Long studentId, @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long sectionId) {
        if (!List.of("daily", "monthly", "student", "teacher", "class", "section").contains(report.toLowerCase()))
            throw new IllegalArgumentException("report must be daily, monthly, student, teacher, class, or section");
        if (!format.equalsIgnoreCase("csv") && !format.equalsIgnoreCase("pdf")) throw new IllegalArgumentException("format must be csv or pdf");
        MediaType type = format.equalsIgnoreCase("pdf") ? MediaType.APPLICATION_PDF : MediaType.parseMediaType("text/csv");
        return ResponseEntity.ok().contentType(type)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance-" + report + "." + format.toLowerCase())
                .body(service.export(report, format, start, end, studentId, classId, sectionId));
    }
}
