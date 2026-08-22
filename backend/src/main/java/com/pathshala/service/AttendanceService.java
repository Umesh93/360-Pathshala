package com.pathshala.service;

import com.pathshala.dto.AttendanceDtos.*;
import com.pathshala.entity.*;
import com.pathshala.exception.ForbiddenException;
import com.pathshala.exception.ResourceNotFoundException;
import com.pathshala.repository.Repositories.*;
import com.pathshala.security.UserPrincipal;
import com.pathshala.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final TeacherAttendanceRepository teacherAttendanceRepository;
    private final AttendanceCorrectionRepository correctionRepository;
    private final HolidayRepository holidayRepository;
    private final AttendanceSettingsRepository settingsRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SchoolClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final NotificationRepository notificationRepository;
    private final ModuleAccessService moduleAccessService;
    private final SecurityUtils securityUtils;

    public Long school() {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.ATTENDANCE);
        return schoolId;
    }

    @Transactional(readOnly = true)
    public List<RosterRow> roster(Long sessionId, Long classId, Long sectionId, LocalDate date) {
        Long schoolId = school();
        validateContext(schoolId, sessionId, classId, sectionId, date, true);
        requireMarkingAccess(schoolId, sessionId, classId, sectionId);
        Map<Long, Attendance> existing = attendanceRepository.findBySchoolIdAndAttendanceDateAndDeletedFalse(schoolId, date)
                .stream().filter(a -> classId.equals(a.getClassId()) && sectionId.equals(a.getSectionId()))
                .collect(Collectors.toMap(Attendance::getStudentId, Function.identity()));
        return activeStudents(schoolId, classId, sectionId).stream().map(student -> {
            Attendance attendance = existing.get(student.getId());
            return new RosterRow(student.getId(), student.getAdmissionNumber(), student.getRollNumber(), name(student),
                    student.getGender(), student.getPhoto(),
                    attendance != null, attendance == null ? null : attendance.getId(), attendance == null ? null : attendance.getStatus(),
                    attendance == null ? null : attendance.getRemarks());
        }).toList();
    }

    @Transactional
    public List<StudentAttendanceResponse> bulk(BulkStudentRequest request) {
        Long schoolId = school();
        validateContext(schoolId, request.academicSessionId(), request.classId(), request.sectionId(), request.date(), true);
        requireMarkingAccess(schoolId, request.academicSessionId(), request.classId(), request.sectionId());
        List<Student> roster = activeStudents(schoolId, request.classId(), request.sectionId());
        Map<Long, Student> students = roster.stream().collect(Collectors.toMap(Student::getId, Function.identity()));
        if (request.records().stream().map(StudentMarkRequest::studentId).distinct().count() != request.records().size()) {
            throw new IllegalArgumentException("Duplicate student in request");
        }
        List<StudentAttendanceResponse> result = new ArrayList<>();
        for (StudentMarkRequest mark : request.records()) {
            Student student = students.get(mark.studentId());
            if (student == null) throw new IllegalArgumentException("Student is not active in the selected class and section: " + mark.studentId());
            Optional<Attendance> found = attendanceRepository.findBySchoolIdAndStudentIdAndAttendanceDateAndDeletedFalse(schoolId, mark.studentId(), request.date());
            if (found.isPresent() && !request.upsert()) throw new IllegalArgumentException("Attendance already exists for student " + mark.studentId());
            Attendance attendance = found.orElseGet(Attendance::new);
            AttendanceStatus previous = found.map(Attendance::getStatus).orElse(null);
            attendance.setSchoolId(schoolId);
            attendance.setStudentId(student.getId());
            attendance.setClassId(request.classId());
            attendance.setSectionId(request.sectionId());
            attendance.setAcademicSessionId(request.academicSessionId());
            attendance.setAttendanceDate(request.date());
            attendance.setStatus(mark.status());
            attendance.setRemarks(mark.remarks());
            attendance.setMarkedBy(securityUtils.currentUser().getId());
            attendance = attendanceRepository.save(attendance);
            if (mark.status() == AttendanceStatus.ABSENT && previous != AttendanceStatus.ABSENT) notifyAbsent(schoolId, student, request.date());
            result.add(studentResponse(attendance, student));
        }
        return result;
    }

    @Transactional
    public StudentAttendanceResponse updateStudent(Long id, StudentMarkRequest request) {
        Long schoolId = school();
        Attendance attendance = attendanceRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found"));
        requireMarkingAccess(schoolId, attendance.getAcademicSessionId(), attendance.getClassId(), attendance.getSectionId());
        if (!attendance.getStudentId().equals(request.studentId())) throw new IllegalArgumentException("studentId cannot be changed");
        validateDate(schoolId, attendance.getAcademicSessionId(), attendance.getAttendanceDate(), true);
        Student student = requireActiveStudent(schoolId, attendance.getStudentId());
        AttendanceStatus previous = attendance.getStatus();
        attendance.setStatus(request.status());
        attendance.setRemarks(request.remarks());
        attendance.setMarkedBy(securityUtils.currentUser().getId());
        attendance = attendanceRepository.save(attendance);
        audit(schoolId, "STUDENT", attendance.getId(), previous, request.status(), "Direct attendance update", "APPROVED", securityUtils.currentUser().getId());
        if (request.status() == AttendanceStatus.ABSENT && previous != AttendanceStatus.ABSENT) notifyAbsent(schoolId, student, attendance.getAttendanceDate());
        return studentResponse(attendance, student);
    }

    @Transactional(readOnly = true)
    public List<StudentAttendanceResponse> studentHistory(Long studentId, LocalDate start, LocalDate end, Integer month, Integer year) {
        Long schoolId = school();
        authorizeStudentView(schoolId, studentId);
        LocalDate[] range = range(start, end, month, year);
        Student student = requireStudent(schoolId, studentId);
        return attendanceRepository.findBySchoolIdAndStudentIdAndAttendanceDateBetweenAndDeletedFalse(schoolId, studentId, range[0], range[1])
                .stream().sorted(Comparator.comparing(Attendance::getAttendanceDate).reversed()).map(a -> studentResponse(a, student)).toList();
    }

    @Transactional(readOnly = true)
    public List<StudentAttendanceResponse> staffHistory(Long studentId, Long classId, Long sectionId,
            AttendanceStatus requestedStatus, LocalDate start, LocalDate end) {
        Long schoolId = school(); requireStaff();
        LocalDate[] dates = range(start, end, null, null);
        Map<Long, Student> students = studentRepository.findBySchoolIdAndStatusIgnoreCaseAndDeletedFalseOrderByFirstNameAsc(schoolId, "ACTIVE")
                .stream().collect(Collectors.toMap(Student::getId, Function.identity()));
        return attendanceRepository.findBySchoolIdAndAttendanceDateBetweenAndDeletedFalse(schoolId, dates[0], dates[1]).stream()
                .filter(row -> studentId == null || studentId.equals(row.getStudentId()))
                .filter(row -> classId == null || classId.equals(row.getClassId()))
                .filter(row -> sectionId == null || sectionId.equals(row.getSectionId()))
                .filter(row -> requestedStatus == null || requestedStatus == row.getStatus())
                .filter(row -> !securityUtils.hasRole(RoleName.TEACHER) || hasAssignment(schoolId, row.getAcademicSessionId(), row.getClassId(), row.getSectionId()))
                .sorted(Comparator.comparing(Attendance::getAttendanceDate).reversed())
                .map(row -> studentResponse(row, students.get(row.getStudentId()))).toList();
    }

    @Transactional(readOnly = true)
    public List<StudentAttendanceResponse> selfStudentHistory(LocalDate start, LocalDate end, Integer month, Integer year) {
        Long schoolId = school();
        Student student = studentRepository.findBySchoolIdAndUserIdAndDeletedFalse(schoolId, securityUtils.currentUser().getId())
                .orElseThrow(() -> new ForbiddenException("Student profile mapping not found"));
        LocalDate[] dates = range(start, end, month, year);
        return attendanceRepository.findBySchoolIdAndStudentIdAndAttendanceDateBetweenAndDeletedFalse(schoolId, student.getId(), dates[0], dates[1])
                .stream().sorted(Comparator.comparing(Attendance::getAttendanceDate).reversed()).map(a -> studentResponse(a, student)).toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> selfAssignments(Long requestedSessionId) {
        Long schoolId = school();
        Teacher teacher = currentTeacher(schoolId);
        Long sessionId = requestedSessionId == null ? academicYearRepository.findFirstBySchoolIdAndActiveTrueAndDeletedFalseOrderByStartsOnDesc(schoolId)
                .orElseThrow(() -> new IllegalArgumentException("No active academic session")).getId() : requestedSessionId;
        academicYearRepository.findByIdAndSchoolIdAndDeletedFalse(sessionId, schoolId).orElseThrow(() -> new IllegalArgumentException("Academic session not found"));
        return teacherSubjectRepository.findBySchoolIdAndAcademicSessionIdAndTeacherIdAndDeletedFalse(schoolId, sessionId, teacher.getId()).stream()
                .map(item -> new AssignmentResponse(item.getClassId(), item.getSectionId(), item.getAcademicSessionId())).distinct().toList();
    }

    @Transactional(readOnly = true)
    public List<ChildAttendanceResponse> selfParentChildren(LocalDate start, LocalDate end, Integer month, Integer year) {
        Long schoolId = school();
        Parent parent = parentRepository.findBySchoolIdAndUserIdAndDeletedFalse(schoolId, securityUtils.currentUser().getId())
                .orElseThrow(() -> new ForbiddenException("Parent profile mapping not found"));
        List<Student> children = studentRepository.findBySchoolIdAndParentIdAndDeletedFalse(schoolId, parent.getId());
        if (children.isEmpty()) throw new ForbiddenException("No students are linked to this parent account");
        LocalDate[] dates = range(start, end, month, year);
        Map<Long, SchoolClass> classes = classRepository.findBySchoolIdAndDeletedFalse(schoolId, org.springframework.data.domain.Pageable.unpaged()).getContent().stream().collect(Collectors.toMap(SchoolClass::getId, Function.identity()));
        Map<Long, Section> sections = sectionRepository.findBySchoolIdAndDeletedFalse(schoolId, org.springframework.data.domain.Pageable.unpaged()).getContent().stream().collect(Collectors.toMap(Section::getId, Function.identity()));
        return children.stream().map(child -> new ChildAttendanceResponse(child.getId(), child.getAdmissionNumber(), name(child),
                classes.containsKey(child.getClassId()) ? classes.get(child.getClassId()).getName() : null,
                sections.containsKey(child.getSectionId()) ? sections.get(child.getSectionId()).getName() : null,
                attendanceRepository.findBySchoolIdAndStudentIdAndAttendanceDateBetweenAndDeletedFalse(schoolId, child.getId(), dates[0], dates[1]).stream().map(a -> studentResponse(a, child)).toList())).toList();
    }

    @Transactional(readOnly = true)
    public MonthlySummary monthlySummary(Long classId, Long sectionId, int year, int month) {
        Long schoolId = school();
        requireStaff();
        YearMonth ym = YearMonth.of(year, month);
        List<Attendance> rows = attendanceRepository.findBySchoolIdAndAttendanceDateBetweenAndDeletedFalse(schoolId, ym.atDay(1), ym.atEndOfMonth())
                .stream().filter(a -> Objects.equals(classId, a.getClassId()) && (sectionId == null || Objects.equals(sectionId, a.getSectionId()))).toList();
        return summary(classId, sectionId, year, month, rows);
    }

    @Transactional(readOnly = true)
    public List<MonthlyStudentSummary> monthlyStudentSummary(Long requestedSessionId, Long classId, Long sectionId, int year, int month) {
        Long schoolId = school(); requireStaff();
        Long sessionId = requestedSessionId == null ? academicYearRepository.findFirstBySchoolIdAndActiveTrueAndDeletedFalseOrderByStartsOnDesc(schoolId)
                .orElseThrow(() -> new IllegalArgumentException("No active academic session")).getId() : requestedSessionId;
        academicYearRepository.findByIdAndSchoolIdAndDeletedFalse(sessionId, schoolId).orElseThrow(() -> new IllegalArgumentException("Academic session not found"));
        if (securityUtils.hasRole(RoleName.TEACHER) && !hasAssignment(schoolId, sessionId, classId, sectionId))
            throw new ForbiddenException("Teacher is not assigned to this class and section");
        YearMonth value = YearMonth.of(year, month);
        Map<Long, List<Attendance>> byStudent = attendanceRepository.findBySchoolIdAndAttendanceDateBetweenAndDeletedFalse(schoolId, value.atDay(1), value.atEndOfMonth()).stream()
                .filter(row -> sessionId.equals(row.getAcademicSessionId()))
                .filter(row -> classId.equals(row.getClassId()) && (sectionId == null || sectionId.equals(row.getSectionId())))
                .collect(Collectors.groupingBy(Attendance::getStudentId));
        return studentRepository.findBySchoolIdAndStatusIgnoreCaseAndDeletedFalseOrderByFirstNameAsc(schoolId, "ACTIVE").stream()
                .filter(student -> classId.equals(student.getClassId()) && (sectionId == null || sectionId.equals(student.getSectionId())))
                .map(student -> {
                    List<Attendance> rows = byStudent.getOrDefault(student.getId(), List.of());
                    long present = status(rows, AttendanceStatus.PRESENT), absent = status(rows, AttendanceStatus.ABSENT);
                    long late = status(rows, AttendanceStatus.LATE), leave = status(rows, AttendanceStatus.LEAVE);
                    return new MonthlyStudentSummary(student.getId(), student.getAdmissionNumber(), student.getRollNumber(),
                            name(student), student.getPhoto(), present, absent, late, leave, rows.size(), percentage(present + late, rows.size()));
                }).toList();
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard(LocalDate start, LocalDate end) {
        Long schoolId = school();
        requireAdmin();
        LocalDate from = start == null ? LocalDate.now().minusDays(6) : start;
        LocalDate to = end == null ? LocalDate.now() : end;
        if (from.isAfter(to)) throw new IllegalArgumentException("start must not be after end");
        List<Attendance> rows = attendanceRepository.findBySchoolIdAndAttendanceDateBetweenAndDeletedFalse(schoolId, from, to);
        long present = status(rows, AttendanceStatus.PRESENT), absent = status(rows, AttendanceStatus.ABSENT);
        long late = status(rows, AttendanceStatus.LATE), leave = status(rows, AttendanceStatus.LEAVE), total = rows.size();
        List<Map<String, Object>> trend = from.datesUntil(to.plusDays(1)).map(date -> statsMap(date.toString(),
                rows.stream().filter(a -> date.equals(a.getAttendanceDate())).toList())).toList();
        Map<String, List<Attendance>> byClass = rows.stream().collect(Collectors.groupingBy(a -> String.valueOf(a.getClassId())));
        List<Map<String, Object>> classwise = byClass.entrySet().stream().map(e -> statsMap(e.getKey(), e.getValue())).toList();
        List<TeacherAttendance> teachers = teacherAttendanceRepository.findBySchoolIdAndAttendanceDateAndDeletedFalse(schoolId, LocalDate.now());
        long teachersPresent = teachers.stream().filter(row -> row.getStatus() == AttendanceStatus.PRESENT || row.getStatus() == AttendanceStatus.LATE).count();
        long activeTeachers = teacherRepository.countBySchoolIdAndStatusIgnoreCaseAndDeletedFalse(schoolId, "ACTIVE");
        long approvedLeaves = teachers.stream().filter(row -> row.getStatus() == AttendanceStatus.LEAVE).count();
        return new DashboardResponse(total, present, absent, late, leave, teachersPresent,
                Math.max(0, activeTeachers - teachersPresent - approvedLeaves), approvedLeaves,
                percentage(present + late, total), trend, classwise);
    }

    @Transactional
    public TeacherAttendanceResponse saveTeacher(TeacherAttendanceRequest request) {
        Long schoolId = school();
        requireAdmin();
        requireActiveTeacher(schoolId, request.teacherId());
        validateActiveDate(schoolId, request.date(), true);
        TeacherAttendance row = teacherAttendanceRepository.findBySchoolIdAndTeacherIdAndAttendanceDateAndDeletedFalse(schoolId, request.teacherId(), request.date()).orElseGet(TeacherAttendance::new);
        row.setSchoolId(schoolId); row.setTeacherId(request.teacherId()); row.setAttendanceDate(request.date());
        row.setCheckIn(request.checkIn()); row.setCheckOut(request.checkOut()); row.setStatus(request.status());
        row.setRemarks(request.remarks()); row.setMarkedBy(securityUtils.currentUser().getId());
        return teacherResponse(teacherAttendanceRepository.save(row), requireActiveTeacher(schoolId, request.teacherId()));
    }

    @Transactional
    public TeacherAttendanceResponse updateTeacher(Long id, TeacherAttendanceRequest request) {
        Long schoolId = school(); requireAdmin();
        TeacherAttendance row = teacherAttendanceRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher attendance not found"));
        if (!row.getTeacherId().equals(request.teacherId()) || !row.getAttendanceDate().equals(request.date()))
            throw new IllegalArgumentException("teacherId and date cannot be changed");
        AttendanceStatus previous = row.getStatus();
        row.setCheckIn(request.checkIn()); row.setCheckOut(request.checkOut()); row.setStatus(request.status()); row.setRemarks(request.remarks());
        row.setMarkedBy(securityUtils.currentUser().getId());
        row = teacherAttendanceRepository.save(row);
        audit(schoolId, "TEACHER", row.getId(), previous, row.getStatus(), "Direct teacher attendance update", "APPROVED", securityUtils.currentUser().getId());
        return teacherResponse(row, requireActiveTeacher(schoolId, row.getTeacherId()));
    }

    @Transactional(readOnly = true)
    public List<TeacherAttendanceResponse> teacherList(LocalDate start, LocalDate end, AttendanceStatus status) {
        Long schoolId = school(); requireAdmin();
        LocalDate[] range = range(start, end, null, null);
        Map<Long, Teacher> teachers = teacherRepository.findBySchoolIdAndDeletedFalse(schoolId, org.springframework.data.domain.Pageable.unpaged()).getContent().stream()
                .collect(Collectors.toMap(Teacher::getId, Function.identity()));
        List<TeacherAttendance> records = teacherAttendanceRepository.findBySchoolIdAndAttendanceDateBetweenAndDeletedFalse(schoolId, range[0], range[1]);
        if (range[0].equals(range[1])) {
            Map<Long, TeacherAttendance> byTeacher = records.stream().collect(Collectors.toMap(TeacherAttendance::getTeacherId, Function.identity()));
            return teachers.values().stream().filter(t -> "ACTIVE".equalsIgnoreCase(t.getStatus())).map(teacher -> {
                TeacherAttendance row = byTeacher.get(teacher.getId());
                return row == null ? new TeacherAttendanceResponse(null, teacher.getId(), name(teacher), teacher.getEmployeeNumber(),
                        teacher.getDepartment(), range[0], null, null, AttendanceStatus.ABSENT, null, null, false)
                        : teacherResponse(row, teacher);
            }).filter(row -> status == null || status == row.status()).toList();
        }
        return records.stream().filter(a -> status == null || status == a.getStatus()).map(a -> teacherResponse(a, teachers.get(a.getTeacherId()))).toList();
    }

    @Transactional(readOnly = true)
    public TeacherAttendanceResponse teacherToday() {
        Long schoolId = school();
        Teacher teacher = currentTeacher(schoolId);
        TeacherAttendance row = teacherAttendanceRepository.findBySchoolIdAndTeacherIdAndAttendanceDateAndDeletedFalse(schoolId, teacher.getId(), LocalDate.now()).orElse(null);
        return row == null ? new TeacherAttendanceResponse(null, teacher.getId(), name(teacher), teacher.getEmployeeNumber(), teacher.getDepartment(), LocalDate.now(), null, null, null, null, null, false) : teacherResponse(row, teacher);
    }

    @Transactional
    public TeacherAttendanceResponse selfCheck(boolean checkout) {
        Long schoolId = school();
        Teacher teacher = currentTeacher(schoolId);
        AttendanceSettings settings = settings(schoolId);
        if (!settings.isAllowTeacherSelfCheckin()) throw new ForbiddenException("Teacher self check-in is disabled");
        validateActiveDate(schoolId, LocalDate.now(), true);
        TeacherAttendance row = teacherAttendanceRepository.findBySchoolIdAndTeacherIdAndAttendanceDateAndDeletedFalse(schoolId, teacher.getId(), LocalDate.now()).orElseGet(TeacherAttendance::new);
        row.setSchoolId(schoolId); row.setTeacherId(teacher.getId()); row.setAttendanceDate(LocalDate.now()); row.setMarkedBy(securityUtils.currentUser().getId());
        if (checkout) {
            if (row.getCheckIn() == null) throw new IllegalArgumentException("Check-in is required before check-out");
            if (row.getCheckOut() != null) throw new IllegalArgumentException("Already checked out");
            row.setCheckOut(LocalTime.now());
        } else {
            if (row.getCheckIn() != null) throw new IllegalArgumentException("Already checked in");
            row.setCheckIn(LocalTime.now());
            row.setStatus(row.getCheckIn().isAfter(settings.getLateAfter()) ? AttendanceStatus.LATE : AttendanceStatus.PRESENT);
        }
        return teacherResponse(teacherAttendanceRepository.save(row), teacher);
    }

    @Transactional(readOnly = true)
    public List<HolidayResponse> holidays() {
        Long schoolId = school();
        return holidayRepository.findBySchoolIdAndDeletedFalseOrderByStartsOnAsc(schoolId).stream().map(this::holidayResponse).toList();
    }

    @Transactional
    public HolidayResponse createHoliday(HolidayRequest request) {
        Long schoolId = school(); requireAdmin(); validateHoliday(request);
        Holiday holiday = new Holiday(); holiday.setSchoolId(schoolId); apply(holiday, request);
        return holidayResponse(holidayRepository.save(holiday));
    }

    @Transactional
    public HolidayResponse updateHoliday(Long id, HolidayRequest request) {
        Long schoolId = school(); requireAdmin(); validateHoliday(request);
        Holiday holiday = holidayRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new ResourceNotFoundException("Holiday not found"));
        apply(holiday, request); return holidayResponse(holidayRepository.save(holiday));
    }

    @Transactional
    public void deleteHoliday(Long id) {
        Long schoolId = school(); requireAdmin();
        Holiday holiday = holidayRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new ResourceNotFoundException("Holiday not found"));
        holiday.setDeleted(true); holidayRepository.save(holiday);
    }

    @Transactional
    public CorrectionResponse createCorrection(CorrectionRequest request) {
        Long schoolId = school();
        String type = request.attendanceType().toUpperCase(Locale.ROOT);
        AttendanceStatus previous;
        if ("STUDENT".equals(type)) {
            Attendance attendance = attendanceRepository.findByIdAndSchoolIdAndDeletedFalse(request.attendanceId(), schoolId).orElseThrow(() -> new ResourceNotFoundException("Attendance not found"));
            if (securityUtils.hasRole(RoleName.TEACHER)) requireMarkingAccess(schoolId, attendance.getAcademicSessionId(), attendance.getClassId(), attendance.getSectionId());
            else authorizeStudentView(schoolId, attendance.getStudentId());
            previous = attendance.getStatus();
        } else if ("TEACHER".equals(type)) {
            TeacherAttendance attendance = teacherAttendanceRepository.findByIdAndSchoolIdAndDeletedFalse(request.attendanceId(), schoolId).orElseThrow(() -> new ResourceNotFoundException("Teacher attendance not found"));
            if (!securityUtils.hasRole(RoleName.SCHOOL_ADMIN) && !currentTeacher(schoolId).getId().equals(attendance.getTeacherId())) throw new ForbiddenException("Cannot correct another teacher's attendance");
            previous = attendance.getStatus();
        } else throw new IllegalArgumentException("attendanceType must be STUDENT or TEACHER");
        AttendanceCorrection correction = audit(schoolId, type, request.attendanceId(), previous, request.newStatus(), request.reason(), "PENDING", null);
        return correctionResponse(correction);
    }

    @Transactional(readOnly = true)
    public List<CorrectionResponse> corrections() {
        Long schoolId = school(); requireAdmin();
        return correctionRepository.findBySchoolIdAndDeletedFalseOrderByCreatedAtDesc(schoolId).stream().map(this::correctionResponse).toList();
    }

    @Transactional
    public CorrectionResponse reviewCorrection(Long id, boolean approve) {
        Long schoolId = school(); requireAdmin();
        AttendanceCorrection correction = correctionRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new ResourceNotFoundException("Correction not found"));
        if (!"PENDING".equals(correction.getStatus())) throw new IllegalArgumentException("Correction is already reviewed");
        if (approve) {
            if ("STUDENT".equals(correction.getAttendanceType())) {
                Attendance row = attendanceRepository.findByIdAndSchoolIdAndDeletedFalse(correction.getAttendanceId(), schoolId).orElseThrow(() -> new ResourceNotFoundException("Attendance not found"));
                row.setStatus(correction.getNewStatus()); row.setMarkedBy(securityUtils.currentUser().getId()); attendanceRepository.save(row);
                if (row.getStatus() == AttendanceStatus.ABSENT && correction.getPreviousStatus() != AttendanceStatus.ABSENT) notifyAbsent(schoolId, requireStudent(schoolId, row.getStudentId()), row.getAttendanceDate());
            } else {
                TeacherAttendance row = teacherAttendanceRepository.findByIdAndSchoolIdAndDeletedFalse(correction.getAttendanceId(), schoolId).orElseThrow(() -> new ResourceNotFoundException("Teacher attendance not found"));
                row.setStatus(correction.getNewStatus()); row.setMarkedBy(securityUtils.currentUser().getId()); teacherAttendanceRepository.save(row);
            }
        }
        correction.setStatus(approve ? "APPROVED" : "REJECTED"); correction.setReviewedBy(securityUtils.currentUser().getId());
        return correctionResponse(correctionRepository.save(correction));
    }

    @Transactional(readOnly = true)
    public SettingsResponse getSettings() { Long schoolId = school(); requireAdmin(); return settingsResponse(settings(schoolId)); }

    @Transactional
    public SettingsResponse updateSettings(SettingsRequest request) {
        Long schoolId = school(); requireAdmin();
        AttendanceSettings row = settings(schoolId); row.setSchoolStartTime(request.schoolStartTime()); row.setLateAfter(request.lateAfter());
        row.setAllowTeacherSelfCheckin(request.allowTeacherSelfCheckin()); row.setAllowFutureAttendance(request.allowFutureAttendance());
        return settingsResponse(settingsRepository.save(row));
    }

    @Transactional(readOnly = true)
    public byte[] export(String report, String format, LocalDate start, LocalDate end, Long studentId, Long classId, Long sectionId) {
        Long schoolId = school(); requireAdmin();
        LocalDate[] dates = range(start, end, null, null);
        String csv = reportCsv(schoolId, report, dates[0], dates[1], studentId, classId, sectionId);
        return "pdf".equalsIgnoreCase(format) ? pdf(csv) : csv.getBytes(StandardCharsets.UTF_8);
    }

    private String reportCsv(Long schoolId, String report, LocalDate start, LocalDate end, Long studentId, Long classId, Long sectionId) {
        if ("teacher".equalsIgnoreCase(report)) {
            Map<Long, Teacher> teachers = teacherRepository.findBySchoolIdAndDeletedFalse(schoolId, org.springframework.data.domain.Pageable.unpaged()).getContent().stream().collect(Collectors.toMap(Teacher::getId, Function.identity()));
            StringBuilder csv = new StringBuilder("Date,Teacher ID,Teacher,Status,Check In,Check Out,Remarks\n");
            teacherAttendanceRepository.findBySchoolIdAndAttendanceDateBetweenAndDeletedFalse(schoolId, start, end).forEach(a -> csv.append(a.getAttendanceDate()).append(',').append(a.getTeacherId()).append(',').append(escape(name(teachers.get(a.getTeacherId())))).append(',').append(a.getStatus()).append(',').append(value(a.getCheckIn())).append(',').append(value(a.getCheckOut())).append(',').append(escape(a.getRemarks())).append('\n'));
            return csv.toString();
        }
        Map<Long, Student> students = studentRepository.findBySchoolIdAndStatusIgnoreCaseAndDeletedFalseOrderByFirstNameAsc(schoolId, "ACTIVE").stream().collect(Collectors.toMap(Student::getId, Function.identity()));
        StringBuilder csv = new StringBuilder("Date,Student ID,Student,Class ID,Section ID,Status,Remarks\n");
        attendanceRepository.findBySchoolIdAndAttendanceDateBetweenAndDeletedFalse(schoolId, start, end).stream()
                .filter(a -> studentId == null || studentId.equals(a.getStudentId())).filter(a -> classId == null || classId.equals(a.getClassId())).filter(a -> sectionId == null || sectionId.equals(a.getSectionId()))
                .forEach(a -> csv.append(a.getAttendanceDate()).append(',').append(a.getStudentId()).append(',').append(escape(name(students.get(a.getStudentId())))).append(',').append(a.getClassId()).append(',').append(value(a.getSectionId())).append(',').append(a.getStatus()).append(',').append(escape(a.getRemarks())).append('\n'));
        return csv.toString();
    }

    private void validateContext(Long schoolId, Long sessionId, Long classId, Long sectionId, LocalDate date, boolean rejectHoliday) {
        validateDate(schoolId, sessionId, date, rejectHoliday);
        classRepository.findByIdAndSchoolIdAndDeletedFalse(classId, schoolId).orElseThrow(() -> new IllegalArgumentException("Class is not active in this school"));
        Section section = sectionRepository.findByIdAndSchoolIdAndDeletedFalse(sectionId, schoolId).orElseThrow(() -> new IllegalArgumentException("Section is not active in this school"));
        if (!classId.equals(section.getClassId())) throw new IllegalArgumentException("Section does not belong to class");
    }

    private void validateDate(Long schoolId, Long sessionId, LocalDate date, boolean rejectHoliday) {
        AcademicYear session = academicYearRepository.findByIdAndSchoolIdAndDeletedFalse(sessionId, schoolId).orElseThrow(() -> new IllegalArgumentException("Academic session not found"));
        if (!session.isActive()) throw new IllegalArgumentException("Academic session is not active");
        if (date.isBefore(session.getStartsOn()) || date.isAfter(session.getEndsOn())) throw new IllegalArgumentException("Date is outside academic session bounds");
        validateFuture(schoolId, date);
        if (rejectHoliday && isHoliday(schoolId, date)) throw new IllegalArgumentException("Attendance cannot be marked on a holiday");
    }

    private void validateActiveDate(Long schoolId, LocalDate date, boolean rejectHoliday) {
        AcademicYear session = academicYearRepository.findFirstBySchoolIdAndActiveTrueAndDeletedFalseOrderByStartsOnDesc(schoolId).orElseThrow(() -> new IllegalArgumentException("No active academic session"));
        validateDate(schoolId, session.getId(), date, rejectHoliday);
    }

    private void validateFuture(Long schoolId, LocalDate date) {
        if (date.isAfter(LocalDate.now()) && !settings(schoolId).isAllowFutureAttendance()) throw new IllegalArgumentException("Future attendance is disabled");
    }

    private boolean isHoliday(Long schoolId, LocalDate date) { return !holidayRepository.findBySchoolIdAndStartsOnLessThanEqualAndEndsOnGreaterThanEqualAndDeletedFalse(schoolId, date, date).isEmpty(); }
    private List<Student> activeStudents(Long s, Long c, Long sec) { return studentRepository.findBySchoolIdAndClassIdAndSectionIdAndStatusIgnoreCaseAndDeletedFalseOrderByFirstNameAsc(s, c, sec, "ACTIVE"); }
    private Student requireStudent(Long schoolId, Long id) { return studentRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new ResourceNotFoundException("Student not found")); }
    private Student requireActiveStudent(Long schoolId, Long id) { Student s = requireStudent(schoolId, id); if (!"ACTIVE".equalsIgnoreCase(s.getStatus())) throw new IllegalArgumentException("Student is not active"); return s; }
    private Teacher requireActiveTeacher(Long schoolId, Long id) { Teacher t = teacherRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new ResourceNotFoundException("Teacher not found")); if (!"ACTIVE".equalsIgnoreCase(t.getStatus())) throw new IllegalArgumentException("Teacher is not active"); return t; }

    private void requireMarkingAccess(Long schoolId, Long academicSessionId, Long classId, Long sectionId) {
        UserPrincipal user = securityUtils.currentUser();
        if (user.getRoles().contains(RoleName.SCHOOL_ADMIN)) return;
        if (!user.getRoles().contains(RoleName.TEACHER)) throw new ForbiddenException("Only school administrators and assigned teachers can mark attendance");
        boolean assigned = hasAssignment(schoolId, academicSessionId, classId, sectionId);
        if (!assigned) throw new ForbiddenException("Teacher is not assigned to this class and section");
    }

    private boolean hasAssignment(Long schoolId, Long academicSessionId, Long classId, Long sectionId) {
        Teacher teacher = currentTeacher(schoolId);
        return teacherSubjectRepository.findBySchoolIdAndAcademicSessionIdAndTeacherIdAndDeletedFalse(schoolId, academicSessionId, teacher.getId()).stream()
                .anyMatch(a -> Objects.equals(classId, a.getClassId()) && (sectionId == null || Objects.equals(sectionId, a.getSectionId())));
    }

    private void authorizeStudentView(Long schoolId, Long studentId) {
        UserPrincipal user = securityUtils.currentUser();
        if (user.getRoles().contains(RoleName.SCHOOL_ADMIN) || user.getRoles().contains(RoleName.TEACHER)) return;
        Student student = requireStudent(schoolId, studentId);
        if (user.getRoles().contains(RoleName.STUDENT) && user.getId().equals(student.getUserId())) return;
        if (user.getRoles().contains(RoleName.PARENT)) {
            Parent parent = parentRepository.findBySchoolIdAndDeletedFalse(schoolId, org.springframework.data.domain.Pageable.unpaged()).getContent().stream().filter(p -> user.getId().equals(p.getUserId())).findFirst().orElseThrow(() -> new ForbiddenException("Parent profile mapping not found"));
            if (parent.getId().equals(student.getParentId())) return;
        }
        throw new ForbiddenException("Attendance access denied");
    }

    private Teacher currentTeacher(Long schoolId) {
        UserPrincipal user = securityUtils.currentUser();
        if (!user.getRoles().contains(RoleName.TEACHER)) throw new ForbiddenException("Teacher profile required");
        return teacherRepository.findBySchoolIdAndUserIdAndStatusIgnoreCaseAndDeletedFalse(schoolId, user.getId(), "ACTIVE")
                .orElseThrow(() -> new ForbiddenException("Active teacher profile mapping not found"));
    }

    private void requireAdmin() { if (!securityUtils.hasRole(RoleName.SCHOOL_ADMIN)) throw new ForbiddenException("School administrator access required"); }
    private void requireStaff() { if (!securityUtils.hasRole(RoleName.SCHOOL_ADMIN) && !securityUtils.hasRole(RoleName.TEACHER)) throw new ForbiddenException("Staff access required"); }
    private AttendanceSettings settings(Long schoolId) { return settingsRepository.findBySchoolIdAndDeletedFalse(schoolId).orElseGet(() -> { AttendanceSettings s = new AttendanceSettings(); s.setSchoolId(schoolId); return s; }); }

    private void notifyAbsent(Long schoolId, Student student, LocalDate date) {
        Long userId = null;
        if (student.getParentId() != null) userId = parentRepository.findByIdAndSchoolIdAndDeletedFalse(student.getParentId(), schoolId).map(Parent::getUserId).orElse(null);
        Notification n = new Notification(); n.setSchoolId(schoolId); n.setUserId(userId); n.setTitle("Student absent");
        n.setEventType("ATTENDANCE_ABSENT"); n.setMessage("Student " + name(student) + " (id=" + student.getId() + ", admission=" + student.getAdmissionNumber() + ") was marked absent on " + date);
        n.setMetadata("{\"studentId\":" + student.getId() + ",\"admissionNumber\":\"" + json(student.getAdmissionNumber()) + "\",\"date\":\"" + date + "\"}");
        notificationRepository.save(n);
    }

    private AttendanceCorrection audit(Long schoolId, String type, Long id, AttendanceStatus previous, AttendanceStatus next, String reason, String status, Long reviewedBy) {
        AttendanceCorrection c = new AttendanceCorrection(); c.setSchoolId(schoolId); c.setAttendanceType(type); c.setAttendanceId(id); c.setPreviousStatus(previous); c.setNewStatus(next); c.setReason(reason); c.setRequestedBy(securityUtils.currentUser().getId()); c.setReviewedBy(reviewedBy); c.setStatus(status); return correctionRepository.save(c);
    }

    private LocalDate[] range(LocalDate start, LocalDate end, Integer month, Integer year) {
        if (month != null || year != null) { int y = year == null ? LocalDate.now().getYear() : year; int m = month == null ? LocalDate.now().getMonthValue() : month; YearMonth ym = YearMonth.of(y, m); return new LocalDate[]{ym.atDay(1), ym.atEndOfMonth()}; }
        LocalDate from = start == null ? LocalDate.now().withDayOfMonth(1) : start, to = end == null ? LocalDate.now() : end;
        if (from.isAfter(to)) throw new IllegalArgumentException("start must not be after end"); return new LocalDate[]{from, to};
    }

    private MonthlySummary summary(Long c, Long sec, int y, int m, List<Attendance> rows) { long p = status(rows, AttendanceStatus.PRESENT), a = status(rows, AttendanceStatus.ABSENT), l = status(rows, AttendanceStatus.LATE), v = status(rows, AttendanceStatus.LEAVE); return new MonthlySummary(c, sec, y, m, p, a, l, v, rows.size(), percentage(p + l, rows.size())); }
    private long status(List<Attendance> rows, AttendanceStatus s) { return rows.stream().filter(a -> a.getStatus() == s).count(); }
    private double percentage(long attended, long total) { return total == 0 ? 0 : Math.round(attended * 10000.0 / total) / 100.0; }
    private Map<String, Object> statsMap(String label, List<Attendance> rows) { Map<String, Object> m = new LinkedHashMap<>(); m.put("label", label); m.put("present", status(rows, AttendanceStatus.PRESENT)); m.put("absent", status(rows, AttendanceStatus.ABSENT)); m.put("late", status(rows, AttendanceStatus.LATE)); m.put("leave", status(rows, AttendanceStatus.LEAVE)); m.put("total", rows.size()); return m; }
    private StudentAttendanceResponse studentResponse(Attendance a, Student s) { return new StudentAttendanceResponse(a.getId(), a.getStudentId(), name(s), a.getClassId(), a.getSectionId(), a.getAcademicSessionId(), a.getAttendanceDate(), a.getStatus(), a.getRemarks(), a.getMarkedBy()); }
    private TeacherAttendanceResponse teacherResponse(TeacherAttendance a, Teacher t) { return new TeacherAttendanceResponse(a.getId(), a.getTeacherId(), name(t), t == null ? null : t.getEmployeeNumber(), t == null ? null : t.getDepartment(), a.getAttendanceDate(), a.getCheckIn(), a.getCheckOut(), a.getStatus(), a.getRemarks(), a.getMarkedBy(), true); }
    private HolidayResponse holidayResponse(Holiday h) { return new HolidayResponse(h.getId(), h.getName(), h.getType(), h.getStartsOn(), h.getEndsOn(), h.getDescription()); }
    private CorrectionResponse correctionResponse(AttendanceCorrection c) { return new CorrectionResponse(c.getId(), c.getAttendanceType(), c.getAttendanceId(), c.getPreviousStatus(), c.getNewStatus(), c.getReason(), c.getRequestedBy(), c.getReviewedBy(), c.getStatus()); }
    private SettingsResponse settingsResponse(AttendanceSettings s) { return new SettingsResponse(s.getSchoolStartTime(), s.getLateAfter(), s.isAllowTeacherSelfCheckin(), s.isAllowFutureAttendance()); }
    private void validateHoliday(HolidayRequest r) { if (r.startsOn().isAfter(r.endsOn())) throw new IllegalArgumentException("startsOn must not be after endsOn"); }
    private void apply(Holiday h, HolidayRequest r) { h.setName(r.name()); h.setType(r.type()); h.setStartsOn(r.startsOn()); h.setEndsOn(r.endsOn()); h.setDescription(r.description()); }
    private String name(Student s) { return s == null ? "Unknown" : ((s.getFirstName() == null ? "" : s.getFirstName()) + " " + (s.getLastName() == null ? "" : s.getLastName())).trim(); }
    private String name(Teacher t) { return t == null ? "Unknown" : ((t.getFirstName() == null ? "" : t.getFirstName()) + " " + (t.getLastName() == null ? "" : t.getLastName())).trim(); }
    private String value(Object value) { return value == null ? "" : value.toString(); }
    private String escape(String s) { if (s == null) return ""; return '"' + s.replace("\"", "\"\"").replace("\r", " ").replace("\n", " ") + '"'; }
    private String json(String s) { return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\""); }

    private byte[] pdf(String text) {
        String safe = text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)").replace("\r", "");
        StringBuilder stream = new StringBuilder("BT /F1 8 Tf 35 800 Td 10 TL ");
        int lines = 0;
        for (String line : safe.split("\n")) { if (lines++ >= 72) break; stream.append('(').append(line.length() > 110 ? line.substring(0, 110) : line).append(") Tj T* "); }
        stream.append("ET");
        String body = stream.toString();
        List<String> objects = List.of("<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>", "<< /Length " + body.getBytes(StandardCharsets.US_ASCII).length + " >>\nstream\n" + body + "\nendstream", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
        StringBuilder pdf = new StringBuilder("%PDF-1.4\n"); List<Integer> offsets = new ArrayList<>();
        for (int i = 0; i < objects.size(); i++) { offsets.add(pdf.length()); pdf.append(i + 1).append(" 0 obj\n").append(objects.get(i)).append("\nendobj\n"); }
        int xref = pdf.length(); pdf.append("xref\n0 ").append(objects.size() + 1).append("\n0000000000 65535 f \n");
        offsets.forEach(o -> pdf.append(String.format(Locale.ROOT, "%010d 00000 n \n", o)));
        pdf.append("trailer << /Size ").append(objects.size() + 1).append(" /Root 1 0 R >>\nstartxref\n").append(xref).append("\n%%EOF");
        return pdf.toString().getBytes(StandardCharsets.US_ASCII);
    }
}
