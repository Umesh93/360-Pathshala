package com.pathshala.controller;

import com.pathshala.dto.TimetableDtos.*;
import com.pathshala.entity.TimetablePeriod;
import com.pathshala.service.TimetableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

@RestController
@RequestMapping("/timetables")
@RequiredArgsConstructor
public class TimetableController {
    private final TimetableService service;

    @GetMapping("/dashboard") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public Dashboard dashboard(@RequestParam Long academicSessionId, @RequestParam(required = false) Long schoolId) { return service.dashboard(schoolId, academicSessionId); }

    @GetMapping("/periods") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<TimetablePeriod> periods(@RequestParam Long academicSessionId, @RequestParam(defaultValue = "false") boolean includeInactive, @RequestParam(required = false) Long schoolId) { return service.periods(schoolId, academicSessionId, includeInactive); }
    @PostMapping("/periods") @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public TimetablePeriod createPeriod(@RequestParam(required = false) Long schoolId, @Valid @RequestBody PeriodRequest request) { return service.createPeriod(schoolId, request); }
    @PutMapping("/periods/{id}") @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public TimetablePeriod updatePeriod(@PathVariable Long id, @RequestParam(required = false) Long schoolId, @Valid @RequestBody PeriodRequest request) { return service.updatePeriod(schoolId, id, request); }
    @PatchMapping("/periods/{id}/status") @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public TimetablePeriod periodStatus(@PathVariable Long id, @RequestParam boolean active, @RequestParam(required = false) Long schoolId) { return service.periodStatus(schoolId, id, active); }
    @DeleteMapping("/periods/{id}") @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public void deletePeriod(@PathVariable Long id, @RequestParam(required = false) Long schoolId) { service.deletePeriod(schoolId, id); }

    @GetMapping("/working-days") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<DayOfWeek> workingDays(@RequestParam Long academicSessionId, @RequestParam(required = false) Long schoolId) { return service.workingDays(schoolId, academicSessionId); }
    @PutMapping("/working-days") @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public List<DayOfWeek> workingDays(@RequestParam(required = false) Long schoolId, @Valid @RequestBody WorkingDaysRequest request) { return service.replaceWorkingDays(schoolId, request); }

    @GetMapping("/teacher-scopes") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<TeacherScope> teacherScopes(@RequestParam Long academicSessionId, @RequestParam Long classId, @RequestParam Long sectionId, @RequestParam(required = false) Long schoolId) { return service.teacherScopes(schoolId, academicSessionId, classId, sectionId); }
    @GetMapping("/grid") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public TimetableResponse grid(@RequestParam Long academicSessionId, @RequestParam Long classId, @RequestParam Long sectionId, @RequestParam(required = false) Long schoolId) { return service.grid(schoolId, academicSessionId, classId, sectionId); }
    @PutMapping("/grid") @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public TimetableResponse grid(@RequestParam(required = false) Long schoolId, @Valid @RequestBody GridRequest request) { return service.replaceGrid(schoolId, request); }
    @DeleteMapping("/grid") @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public void deleteGrid(@RequestParam Long academicSessionId, @RequestParam Long classId, @RequestParam Long sectionId, @RequestParam(required = false) Long schoolId) { service.deleteGrid(schoolId, academicSessionId, classId, sectionId); }
    @DeleteMapping("/{timetableId}") @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public void delete(@PathVariable Long timetableId, @RequestParam(required = false) Long schoolId) { service.deleteTimetable(schoolId, timetableId); }
    @PatchMapping("/{timetableId}/status") @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public TimetableResponse status(@PathVariable Long timetableId, @RequestParam(required = false) Long schoolId, @Valid @RequestBody StatusRequest request) { return service.status(schoolId, timetableId, request.status()); }
    @PostMapping("/copy") @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public TimetableResponse copy(@RequestParam(required = false) Long schoolId, @Valid @RequestBody CopyRequest request) { return service.copy(schoolId, request); }

    @GetMapping("/reports") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<ReportRow> reports(@RequestParam(defaultValue = "weekly") String type, @RequestParam Long academicSessionId, @RequestParam(required = false) Long classId, @RequestParam(required = false) Long sectionId, @RequestParam(required = false) Long teacherId, @RequestParam(required = false) String room, @RequestParam(required = false) Long schoolId) { return service.report(schoolId, type, academicSessionId, classId, sectionId, teacherId, room); }
    @GetMapping("/reports/export.csv") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<byte[]> csv(@RequestParam(defaultValue = "weekly") String type, @RequestParam Long academicSessionId, @RequestParam(required = false) Long classId, @RequestParam(required = false) Long sectionId, @RequestParam(required = false) Long teacherId, @RequestParam(required = false) String room, @RequestParam(required = false) Long schoolId) { return download(service.exportCsv(schoolId, type, academicSessionId, classId, sectionId, teacherId, room), "timetable.csv", "text/csv"); }
    @GetMapping("/reports/export.xlsx") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<byte[]> xlsx(@RequestParam(defaultValue = "weekly") String type, @RequestParam Long academicSessionId, @RequestParam(required = false) Long classId, @RequestParam(required = false) Long sectionId, @RequestParam(required = false) Long teacherId, @RequestParam(required = false) String room, @RequestParam(required = false) Long schoolId) { return download(service.exportExcel(schoolId, type, academicSessionId, classId, sectionId, teacherId, room), "timetable.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"); }
    @GetMapping("/reports/export.pdf") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<byte[]> pdf(@RequestParam(defaultValue = "weekly") String type, @RequestParam Long academicSessionId, @RequestParam(required = false) Long classId, @RequestParam(required = false) Long sectionId, @RequestParam(required = false) Long teacherId, @RequestParam(required = false) String room, @RequestParam(required = false) Long schoolId) { return download(service.exportPdf(schoolId, type, academicSessionId, classId, sectionId, teacherId, room), "timetable.pdf", MediaType.APPLICATION_PDF_VALUE); }

    @GetMapping("/teachers/self") @PreAuthorize("hasRole('TEACHER')")
    public ScheduleResponse teacherSelf(@RequestParam(required = false) Long academicSessionId) { return service.teacherSelf(academicSessionId); }
    @GetMapping("/students/self") @PreAuthorize("hasRole('STUDENT')")
    public ScheduleResponse studentSelf() { return service.studentSelf(); }
    @GetMapping("/parents/self/children") @PreAuthorize("hasRole('PARENT')")
    public List<ChildSchedule> parentSelf() { return service.parentSelf(); }

    private ResponseEntity<byte[]> download(byte[] bytes, String filename, String type) { HttpHeaders headers = new HttpHeaders(); headers.setContentType(MediaType.parseMediaType(type)); headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build()); return ResponseEntity.ok().headers(headers).body(bytes); }
}
