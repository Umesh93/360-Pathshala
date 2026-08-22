package com.pathshala.controller;

import com.pathshala.dto.ApiDtos.*;
import com.pathshala.entity.*;
import com.pathshala.repository.Repositories.*;
import com.pathshala.service.ModuleAccessService;
import com.pathshala.service.AssignmentService;
import com.pathshala.service.AttendanceService;
import com.pathshala.service.ExaminationService;
import com.pathshala.service.SubjectService;
import com.pathshala.exception.ForbiddenException;
import com.pathshala.exception.ResourceNotFoundException;
import com.pathshala.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/dashboards")
@RequiredArgsConstructor
public class DashboardController {
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AttendanceRepository attendanceRepository;
    private final TeacherAttendanceRepository teacherAttendanceRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SchoolClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final ExamRepository examRepository;
    private final ExamClassAssignmentRepository examClassAssignmentRepository;
    private final AssignmentRepository assignmentRepository;
    private final SchoolModuleRepository schoolModuleRepository;
    private final FeeCollectionRepository feeCollectionRepository;
    private final FeeStructureRepository feeStructureRepository;
    private final SchoolRepository schoolRepository;
    private final ModuleAccessService moduleAccessService;
    private final AssignmentService assignmentService;
    private final SecurityUtils securityUtils;
    private final AttendanceService attendanceService;
    private final ExaminationService examinationService;
    private final SubjectService subjectService;

    @GetMapping("/school-admin")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Transactional(readOnly = true)
    public SchoolAdminDashboardResponse schoolAdmin(@RequestParam(required = false) Long academicSessionId,
                                                     @RequestParam(required = false) LocalDate asOfDate) {
        Long schoolId = securityUtils.requiredSchoolId();
        School school = schoolRepository.findByIdAndDeletedFalse(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
        if (!school.isActive() || !Set.of("ACTIVE", "DEMO").contains(Objects.toString(school.getStatus(), "").toUpperCase(Locale.ROOT)))
            throw new ForbiddenException("School is not active");
        Set<ModuleCode> enabled = schoolModuleRepository.findBySchoolIdAndActiveTrueAndDeletedFalse(schoolId).stream()
                .map(SchoolModule::getModuleCode).collect(Collectors.toCollection(() -> EnumSet.noneOf(ModuleCode.class)));
        List<AcademicYear> years = academicYearRepository.findBySchoolIdAndDeletedFalseOrderByStartsOnDesc(schoolId);
        AcademicYear selected = academicSessionId == null ? years.stream().filter(AcademicYear::isActive).findFirst().orElse(years.isEmpty() ? null : years.get(0))
                : academicYearRepository.findBySchoolIdAndIdAndDeletedFalse(schoolId, academicSessionId)
                        .orElseThrow(() -> new ResourceNotFoundException("Academic session not found"));
        LocalDate date = dashboardDate(selected, asOfDate, LocalDate.now());
        Long sessionId = selected == null ? null : selected.getId();
        Map<Long, SchoolDashboardSession> sessions = years.stream().collect(Collectors.toMap(AcademicYear::getId,
                y -> new SchoolDashboardSession(y.getId(), y.getName(), y.getStartsOn(), y.getEndsOn(), y.isActive()), (a, b) -> a, LinkedHashMap::new));

        boolean studentsEnabled = enabled.contains(ModuleCode.STUDENT_MANAGEMENT);
        boolean teachersEnabled = enabled.contains(ModuleCode.TEACHER_MANAGEMENT);
        boolean classesEnabled = dashboardClassesEnabled(enabled);
        long totalStudents = studentsEnabled ? studentRepository.countBySchoolIdAndDeletedFalse(schoolId) : 0;
        long activeStudents = studentsEnabled ? studentRepository.countBySchoolIdAndStatusIgnoreCaseAndDeletedFalse(schoolId, "ACTIVE") : 0;
        long totalTeachers = teachersEnabled ? teacherRepository.countBySchoolIdAndDeletedFalse(schoolId) : 0;
        long activeTeachers = teachersEnabled ? teacherRepository.countBySchoolIdAndStatusIgnoreCaseAndDeletedFalse(schoolId, "ACTIVE") : 0;
        long attendancePopulation = enabled.contains(ModuleCode.ATTENDANCE)
                ? (studentsEnabled ? activeStudents : studentRepository.countBySchoolIdAndStatusIgnoreCaseAndDeletedFalse(schoolId, "ACTIVE")) : 0;
        SchoolDashboardAttendance attendance = enabled.contains(ModuleCode.ATTENDANCE) && sessionId != null ? attendance(schoolId, sessionId, date, attendancePopulation) : null;
        SchoolDashboardTeacherOverview teacher = teacherOverview(schoolId, date, enabled);
        SchoolDashboardExaminations exams = enabled.contains(ModuleCode.EXAMINATION) && sessionId != null ? examinations(schoolId, sessionId, date) : null;
        SchoolDashboardAssignments assignments = enabled.contains(ModuleCode.ASSIGNMENT) && sessionId != null ? assignments(schoolId, sessionId, date) : null;
        long pendingLeaves = enabled.contains(ModuleCode.LEAVE_MANAGEMENT) ? leaveRequestRepository.countBySchoolIdAndTeacherIdIsNotNullAndStatusAndEndsOnGreaterThanEqualAndDeletedFalse(schoolId, LeaveStatus.PENDING, date) : 0;
        String logoUrl = blankToNull(school.getLogo()) == null ? null : "/api/saas/schools/" + school.getId() + "/logo";
        return new SchoolAdminDashboardResponse(new SchoolDashboardSchool(school.getId(), school.getCode(), school.getName(), school.getAddress(), school.getPhone(), school.getEmail(), logoUrl),
                selected == null ? null : sessions.get(selected.getId()), new ArrayList<>(sessions.values()), enabled,
                new SchoolDashboardOverview(totalStudents, activeStudents, totalTeachers, activeTeachers, classesEnabled ? classRepository.countBySchoolIdAndDeletedFalse(schoolId) : 0, classesEnabled ? sectionRepository.countBySchoolIdAndDeletedFalse(schoolId) : 0),
                attendance, teacher, exams, assignments,
                new SchoolDashboardAttention(attendance == null ? 0 : attendance.absent(), pendingLeaves, exams == null ? 0 : exams.awaitingPublicationCount(), assignments == null ? 0 : assignments.dueThisWeek()),
                false, List.of());
    }

    private SchoolDashboardAttendance attendance(Long schoolId, Long sessionId, LocalDate date, long activeStudents) {
        Map<AttendanceStatus, Long> counts = attendanceRepository.dashboardStatusSummary(schoolId, sessionId, date).stream().collect(Collectors.toMap(x -> (AttendanceStatus) x[0], x -> ((Number) x[1]).longValue()));
        long marked = counts.values().stream().mapToLong(Long::longValue).sum();
        List<Attendance> rows = attendanceRepository.dashboardAbsences(schoolId, sessionId, date, PageRequest.of(0, 8));
        Map<Long, Student> students = studentRepository.findBySchoolIdAndIdInAndDeletedFalse(schoolId, rows.stream().map(Attendance::getStudentId).collect(Collectors.toSet())).stream().collect(Collectors.toMap(Student::getId, Function.identity()));
        Set<Long> classIds = rows.stream().map(Attendance::getClassId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> sectionIds = rows.stream().map(Attendance::getSectionId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<Long, String> classes = classRepository.findBySchoolIdAndIdInAndDeletedFalse(schoolId, classIds).stream().collect(Collectors.toMap(SchoolClass::getId, SchoolClass::getName));
        Map<Long, String> sections = sectionRepository.findBySchoolIdAndIdInAndDeletedFalse(schoolId, sectionIds).stream().collect(Collectors.toMap(Section::getId, Section::getName));
        List<SchoolDashboardAbsence> absences = rows.stream().map(a -> { Student s = students.get(a.getStudentId()); return new SchoolDashboardAbsence(a.getId(), a.getStudentId(), s == null ? "Unknown" : name(s), classes.get(a.getClassId()), sections.get(a.getSectionId()), a.getStatus()); }).toList();
        return attendanceSummary(date, activeStudents, counts, absences);
    }

    private SchoolDashboardTeacherOverview teacherOverview(Long schoolId, LocalDate date, Set<ModuleCode> enabled) {
        if (!enabled.contains(ModuleCode.TEACHER_MANAGEMENT)) return null;
        Map<AttendanceStatus, Long> counts = enabled.contains(ModuleCode.ATTENDANCE) ? teacherAttendanceRepository.dashboardStatusSummary(schoolId, date).stream().collect(Collectors.toMap(x -> (AttendanceStatus) x[0], x -> ((Number) x[1]).longValue())) : Map.of();
        long pending = enabled.contains(ModuleCode.LEAVE_MANAGEMENT) ? leaveRequestRepository.countBySchoolIdAndTeacherIdIsNotNullAndStatusAndEndsOnGreaterThanEqualAndDeletedFalse(schoolId, LeaveStatus.PENDING, date) : 0;
        List<LeaveRequest> leaves = enabled.contains(ModuleCode.LEAVE_MANAGEMENT) ? leaveRequestRepository.findBySchoolIdAndTeacherIdIsNotNullAndStatusAndEndsOnGreaterThanEqualAndDeletedFalseOrderByStartsOnAsc(schoolId, LeaveStatus.PENDING, date, PageRequest.of(0, 5)) : List.of();
        Map<Long, Teacher> teachers = teacherRepository.findBySchoolIdAndIdInAndDeletedFalse(schoolId, leaves.stream().map(LeaveRequest::getTeacherId).collect(Collectors.toSet())).stream().collect(Collectors.toMap(Teacher::getId, Function.identity()));
        List<SchoolDashboardPendingLeave> recent = leaves.stream().map(l -> new SchoolDashboardPendingLeave(l.getId(), l.getTeacherId(), teachers.containsKey(l.getTeacherId()) ? name(teachers.get(l.getTeacherId())) : "Unknown", l.getStartsOn(), l.getEndsOn(), l.getReason(), l.getStatus())).toList();
        long marked = counts.values().stream().mapToLong(Long::longValue).sum();
        return new SchoolDashboardTeacherOverview(counts.getOrDefault(AttendanceStatus.PRESENT, 0L), counts.getOrDefault(AttendanceStatus.ABSENT, 0L), counts.getOrDefault(AttendanceStatus.LEAVE, 0L), enabled.contains(ModuleCode.ATTENDANCE) ? Math.max(0, teacherRepository.countBySchoolIdAndStatusIgnoreCaseAndDeletedFalse(schoolId, "ACTIVE") - marked) : 0, pending, recent);
    }

    private SchoolDashboardExaminations examinations(Long schoolId, Long sessionId, LocalDate date) {
        List<Exam> all = examRepository.findBySchoolIdAndAcademicSessionIdAndDeletedFalse(schoolId, sessionId);
        List<Long> ids = all.stream().map(Exam::getId).toList();
        Map<Long, List<ExamClassAssignment>> scopes = ids.isEmpty() ? Map.of() : examClassAssignmentRepository.findBySchoolIdAndExamIdInAndDeletedFalse(schoolId, ids).stream().collect(Collectors.groupingBy(ExamClassAssignment::getExamId));
        Map<Long, String> classes = classRepository.findBySchoolIdAndIdInAndDeletedFalse(schoolId, scopes.values().stream().flatMap(Collection::stream).map(ExamClassAssignment::getClassId).collect(Collectors.toSet())).stream().collect(Collectors.toMap(SchoolClass::getId, SchoolClass::getName));
        List<Exam> allUpcoming = all.stream().filter(e -> e.getStartsOn() != null && !e.getStartsOn().isBefore(date)).sorted(Comparator.comparing(Exam::getStartsOn)).toList();
        LocalDate recentFrom = date.minusDays(29);
        List<Exam> recentAll = all.stream().filter(e -> e.getResultPublishDate() != null && !e.getResultPublishDate().isAfter(date))
                .filter(e -> concreteScopes(scopes, e).stream().anyMatch(s -> s.isPublished() && s.getPublishedAt() != null && !s.getPublishedAt().toLocalDate().isBefore(recentFrom) && !s.getPublishedAt().toLocalDate().isAfter(date)))
                .sorted(Comparator.comparing(Exam::getResultPublishDate).reversed()).toList();
        long awaiting = all.stream().filter(e -> { List<ExamClassAssignment> concrete = concreteScopes(scopes, e); return !concrete.isEmpty() && concrete.stream().anyMatch(s -> !s.isPublished()); }).count();
        List<Exam> upcoming = allUpcoming.stream().limit(5).toList();
        List<Exam> recent = recentAll.stream().limit(5).toList();
        long recentlyPublishedScopes = all.stream().filter(e -> e.getResultPublishDate() != null && !e.getResultPublishDate().isAfter(date))
                .flatMap(e -> concreteScopes(scopes, e).stream()).filter(s -> s.isPublished() && s.getPublishedAt() != null && !s.getPublishedAt().toLocalDate().isBefore(recentFrom) && !s.getPublishedAt().toLocalDate().isAfter(date)).count();
        return new SchoolDashboardExaminations(allUpcoming.size(), awaiting, recentlyPublishedScopes, upcoming.stream().map(e -> new SchoolDashboardUpcomingExam(e.getId(), e.getName(), e.getStartsOn(), e.getEndsOn(), e.getStatus(), scopes.getOrDefault(e.getId(), List.of()).stream().map(ExamClassAssignment::getClassId).map(classes::get).filter(Objects::nonNull).distinct().toList())).toList(), recent.stream().map(e -> {
            List<ExamClassAssignment> concrete = scopes.getOrDefault(e.getId(), List.of()).stream().filter(s -> s.getSectionId() != null).toList();
            long publishedScopes = concrete.stream().filter(ExamClassAssignment::isPublished).count();
            String publicationStatus = publishedScopes == concrete.size() ? "PUBLISHED" : publishedScopes > 0 ? "PARTIALLY_PUBLISHED" : "UNPUBLISHED";
            return new SchoolDashboardRecentExam(e.getId(), e.getName(), e.getEndsOn(), publicationStatus);
        }).toList());
    }

    private SchoolDashboardAssignments assignments(Long schoolId, Long sessionId, LocalDate date) {
        List<Assignment> all = assignmentRepository.findBySchoolIdAndAcademicSessionIdAndDeletedFalseOrderByDueAtAsc(schoolId, sessionId);
        LocalDateTime from = date.atStartOfDay(), dayEnd = date.plusDays(1).atStartOfDay(), weekEnd = date.plusDays(7).atStartOfDay();
        List<Assignment> active = all.stream().filter(a -> assignmentActive(a, from, dayEnd)).toList();
        List<Assignment> recent = active.stream().filter(a -> a.getDueAt() != null && !a.getDueAt().isBefore(from)).sorted(Comparator.comparing(Assignment::getDueAt)).limit(5).toList();
        Set<Long> classIds = recent.stream().map(Assignment::getClassId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> subjectIds = recent.stream().map(Assignment::getSubjectId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<Long, String> classes = classRepository.findBySchoolIdAndIdInAndDeletedFalse(schoolId, classIds).stream().collect(Collectors.toMap(SchoolClass::getId, SchoolClass::getName));
        Map<Long, String> subjects = subjectRepository.findBySchoolIdAndIdInAndDeletedFalse(schoolId, subjectIds).stream().collect(Collectors.toMap(Subject::getId, Subject::getSubjectName));
        long due = active.stream().filter(a -> a.getDueAt() != null && !a.getDueAt().isBefore(from) && a.getDueAt().isBefore(weekEnd)).count();
        return new SchoolDashboardAssignments(active.size(), due, assignmentService.dashboardPendingSubmissions(schoolId, sessionId, date), recent.stream().map(a -> new SchoolDashboardAssignment(a.getId(), a.getTitle(), a.getDueAt(), a.getStatus().name(), classes.get(a.getClassId()), subjects.get(a.getSubjectId()))).toList());
    }

    static LocalDate dashboardDate(AcademicYear session, LocalDate supplied, LocalDate today) {
        if (session == null) {
            if (supplied != null) throw new IllegalArgumentException("Cannot select a dashboard date without an academic session");
            return today;
        }
        if (supplied != null) {
            if (supplied.isBefore(session.getStartsOn()) || supplied.isAfter(session.getEndsOn()))
                throw new IllegalArgumentException("asOfDate must be within the selected academic session");
            return supplied;
        }
        LocalDate defaultDate = session.isActive() ? today : session.getEndsOn();
        if (defaultDate.isBefore(session.getStartsOn())) return session.getStartsOn();
        return defaultDate.isAfter(session.getEndsOn()) ? session.getEndsOn() : defaultDate;
    }

    static boolean dashboardClassesEnabled(Set<ModuleCode> enabled) {
        return enabled.contains(ModuleCode.SUBJECT_MANAGEMENT) || enabled.contains(ModuleCode.STUDENT_MANAGEMENT)
                || enabled.contains(ModuleCode.TEACHER_MANAGEMENT) || enabled.contains(ModuleCode.EXAMINATION);
    }

    static SchoolDashboardAttendance attendanceSummary(LocalDate date, long activeStudents, Map<AttendanceStatus, Long> counts, List<SchoolDashboardAbsence> absences) {
        long marked = counts.values().stream().mapToLong(Long::longValue).sum();
        long present = counts.getOrDefault(AttendanceStatus.PRESENT, 0L);
        long late = counts.getOrDefault(AttendanceStatus.LATE, 0L);
        long absent = counts.getOrDefault(AttendanceStatus.ABSENT, 0L);
        return new SchoolDashboardAttendance(date, activeStudents, present, absent, late, counts.getOrDefault(AttendanceStatus.LEAVE, 0L), Math.max(0, activeStudents - marked), activeStudents == 0 ? 0 : (present + late) * 100.0 / activeStudents, absent > 0 || marked < activeStudents, absences);
    }

    static long upcomingExamCount(List<Exam> exams, LocalDate date) {
        return exams.stream().filter(e -> e.getStartsOn() != null && !e.getStartsOn().isBefore(date)).count();
    }

    private static List<ExamClassAssignment> concreteScopes(Map<Long, List<ExamClassAssignment>> scopes, Exam exam) {
        return scopes.getOrDefault(exam.getId(), List.of()).stream().filter(s -> s.getSectionId() != null).toList();
    }

    private static boolean assignmentActive(Assignment assignment, LocalDateTime from, LocalDateTime dayEnd) {
        LocalDateTime deadline = assignment.isAllowLateSubmission() && assignment.getLateSubmissionDeadline() != null ? assignment.getLateSubmissionDeadline() : assignment.getDueAt();
        return (assignment.getStatus() == Assignment.Status.ACTIVE || assignment.getStatus() == Assignment.Status.PUBLISHED)
                && (assignment.getPublishAt() == null || assignment.getPublishAt().isBefore(dayEnd)) && deadline != null && !deadline.isBefore(from);
    }

    private static String name(Student s) { return String.join(" ", Arrays.asList(s.getFirstName(), s.getLastName())).trim(); }
    private static String name(Teacher t) { return String.join(" ", Arrays.asList(t.getFirstName(), t.getLastName())).trim(); }
    private static String blankToNull(String value) { return value == null || value.isBlank() ? null : value; }

    @GetMapping("/teacher/summary")
    @PreAuthorize("hasRole('TEACHER')")
    @Transactional(readOnly = true)
    public TeacherDashboardResponse teacherSummary() {
        Long schoolId = securityUtils.requiredSchoolId();
        Set<ModuleCode> modules = enabledModules(schoolId);
        AcademicYear session = currentSession(schoolId);
        SelfProfile profile = selfProfile(schoolId, RoleName.TEACHER);
        Long sessionId = session == null ? null : session.getId();
        List<TeacherAssignmentScopeResponse> teaching = (modules.contains(ModuleCode.TEACHER_ASSIGNMENT)
                || modules.contains(ModuleCode.SUBJECT_MANAGEMENT)) && sessionId != null
                ? subjectService.selfAssignmentsForDashboard(schoolId, sessionId) : List.of();
        DashboardAssignmentSection assignments = modules.contains(ModuleCode.ASSIGNMENT)
                ? teacherAssignments() : null;
        DashboardTeacherAttendance attendance = modules.contains(ModuleCode.ATTENDANCE)
                ? teacherAttendance() : null;
        DashboardExamSection exams = modules.contains(ModuleCode.EXAMINATION)
                ? teacherExams() : null;
        return new TeacherDashboardResponse(context(schoolId, session), profile, modules, teaching,
                assignments, attendance, exams, false, List.of());
    }

    @GetMapping("/student/summary")
    @PreAuthorize("hasRole('STUDENT')")
    @Transactional(readOnly = true)
    public StudentDashboardResponse studentSummary() {
        Long schoolId = securityUtils.requiredSchoolId();
        Set<ModuleCode> modules = enabledModules(schoolId);
        AcademicYear session = currentSession(schoolId);
        SelfProfile profile = selfProfile(schoolId, RoleName.STUDENT);
        DashboardAssignmentSection assignments = modules.contains(ModuleCode.ASSIGNMENT)
                ? studentAssignments() : null;
        DashboardStudentAttendance attendance = modules.contains(ModuleCode.ATTENDANCE)
                ? studentAttendance() : null;
        DashboardResultSection results = modules.contains(ModuleCode.EXAMINATION)
                ? studentResults() : null;
        return new StudentDashboardResponse(context(schoolId, session), profile, modules,
                profile.classId(), profile.className(), profile.sectionId(), profile.sectionName(),
                session == null ? null : session.getId(), session == null ? null : session.getName(),
                assignments, attendance, results, false, List.of());
    }

    @GetMapping("/parent/summary")
    @PreAuthorize("hasRole('PARENT')")
    public ParentDashboardResponse parentSummary() { return new ParentDashboardResponse("COMING_SOON", false); }

    private Set<ModuleCode> enabledModules(Long schoolId) {
        return schoolModuleRepository.findBySchoolIdAndActiveTrueAndDeletedFalse(schoolId).stream()
                .map(SchoolModule::getModuleCode).collect(Collectors.toCollection(() -> EnumSet.noneOf(ModuleCode.class)));
    }

    private AcademicYear currentSession(Long schoolId) {
        return academicYearRepository.findFirstBySchoolIdAndActiveTrueAndDeletedFalseOrderByStartsOnDesc(schoolId).orElse(null);
    }

    private RoleDashboardContext context(Long schoolId, AcademicYear session) {
        School school = schoolRepository.findByIdAndDeletedFalse(schoolId).orElse(null);
        return new RoleDashboardContext(schoolId, school == null ? null : school.getName(),
                session == null ? null : session.getId(), session == null ? null : session.getName());
    }

    private SelfProfile selfProfile(Long schoolId, RoleName role) {
        if (role == RoleName.TEACHER) {
            Teacher teacher = teacherRepository.findBySchoolIdAndUserIdAndStatusIgnoreCaseAndDeletedFalse(
                    schoolId, securityUtils.currentUser().getId(), "ACTIVE").orElseThrow(() -> new ForbiddenException("Teacher profile required"));
            return new SelfProfile(role.name(), name(teacher), teacher.getPhoto(), schoolId, teacher.getId(), null, null, null, null, teacher.getEmployeeNumber(), teacher.getDepartment());
        }
        Student student = studentRepository.findBySchoolIdAndUserIdAndDeletedFalse(schoolId, securityUtils.currentUser().getId())
                .orElseThrow(() -> new ForbiddenException("Student profile required"));
        String className = classRepository.findByIdAndSchoolIdAndDeletedFalse(student.getClassId(), schoolId).map(SchoolClass::getName).orElse(null);
        String sectionName = sectionRepository.findByIdAndSchoolIdAndDeletedFalse(student.getSectionId(), schoolId).map(Section::getName).orElse(null);
        return new SelfProfile(role.name(), name(student), student.getPhoto(), schoolId, student.getId(), student.getClassId(), className, student.getSectionId(), sectionName, null, null);
    }

    private DashboardAssignmentSection teacherAssignments() {
        List<com.pathshala.dto.AssignmentDtos.AssignmentResponse> rows = assignmentService.teacherSelf();
        return assignmentSection(rows, false);
    }

    private DashboardAssignmentSection studentAssignments() {
        List<com.pathshala.dto.AssignmentDtos.StudentAssignment> rows = assignmentService.studentSelf();
        List<DashboardAssignment> recent = rows.stream().limit(5).map(row -> new DashboardAssignment(row.assignment().id(), row.assignment().title(), row.assignment().dueAt(), row.assignment().status().name(), row.submission().status().name())).toList();
        long pending = rows.stream().filter(row -> row.submission().status() == AssignmentSubmission.Status.PENDING || row.submission().status() == AssignmentSubmission.Status.RETURNED).count();
        return new DashboardAssignmentSection(rows.size(), pending, recent);
    }

    private DashboardAssignmentSection assignmentSection(List<com.pathshala.dto.AssignmentDtos.AssignmentResponse> rows, boolean student) {
        List<DashboardAssignment> recent = rows.stream().limit(5).map(row -> new DashboardAssignment(row.id(), row.title(), row.dueAt(), row.status().name(), null)).toList();
        return new DashboardAssignmentSection(rows.size(), student ? 0 : assignmentService.teacherPendingAssignments(), recent);
    }

    private DashboardTeacherAttendance teacherAttendance() {
        var row = attendanceService.teacherToday();
        return new DashboardTeacherAttendance(row.date(), row.status(), row.checkIn(), row.checkOut());
    }

    private DashboardExamSection teacherExams() {
        var rows = examinationService.selfTeacherAssignments();
        return new DashboardExamSection(rows.size(), rows.stream().limit(5).map(row -> new DashboardExamAssignment(row.examSubjectId(), row.examId(), row.examName(), row.examDate(), row.subjectName(), row.className(), row.sectionName(), row.published())).toList());
    }

    private DashboardStudentAttendance studentAttendance() {
        LocalDate today = LocalDate.now();
        var rows = attendanceService.selfStudentHistory(today.withDayOfMonth(1), today, null, null);
        long present = rows.stream().filter(r -> r.status() == AttendanceStatus.PRESENT).count();
        long absent = rows.stream().filter(r -> r.status() == AttendanceStatus.ABSENT).count();
        long late = rows.stream().filter(r -> r.status() == AttendanceStatus.LATE).count();
        long leave = rows.stream().filter(r -> r.status() == AttendanceStatus.LEAVE).count();
        return new DashboardStudentAttendance(present, absent, late, leave, rows.isEmpty() ? 0 : (present + late) * 100.0 / rows.size(), rows.stream().limit(10).map(r -> new DashboardAttendanceRow(r.date(), r.status())).toList());
    }

    private DashboardResultSection studentResults() {
        var rows = examinationService.selfStudentResults();
        return new DashboardResultSection(rows.size(), rows.isEmpty() ? null : rows.getFirst());
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasRole('TEACHER')")
    public DashboardResponse teacher() {
        TeacherDashboardResponse summary = teacherSummary();
        Map<String, Object> charts = new LinkedHashMap<>(); charts.put("attendance", summary.teacherAttendance());
        return new DashboardResponse(Map.of("pendingAssignments", summary.assignments() == null ? 0 : summary.assignments().pending()), charts);
    }

    @GetMapping("/parent")
    @PreAuthorize("hasRole('PARENT')")
    public ParentDashboardResponse parent() {
        return parentSummary();
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public DashboardResponse student() {
        StudentDashboardResponse summary = studentSummary();
        Map<String, Object> charts = new LinkedHashMap<>(); charts.put("attendance", summary.attendance());
        return new DashboardResponse(Map.of("assignments", summary.assignments() == null ? 0 : summary.assignments().pending()), charts);
    }
}
