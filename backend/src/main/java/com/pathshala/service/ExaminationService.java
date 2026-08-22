package com.pathshala.service;

import com.pathshala.dto.ExaminationDtos.*;
import com.pathshala.entity.*;
import com.pathshala.exception.ForbiddenException;
import com.pathshala.exception.ResourceNotFoundException;
import com.pathshala.repository.Repositories.*;
import com.pathshala.util.SecurityUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ExaminationService {
    private static final Set<String> EXAM_STATUSES = Set.of("ACTIVE", "ARCHIVED", "UPCOMING", "COMPLETED");
    private final ExamTypeRepository examTypeRepository;
    private final ExamRepository examRepository;
    private final ExamClassAssignmentRepository examClassAssignmentRepository;
    private final ExamSubjectRepository examSubjectRepository;
    private final MarkRepository markRepository;
    private final GradingSystemRepository gradingSystemRepository;
    private final GradeRuleRepository gradeRuleRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SchoolClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final SubjectAcademicConfigRepository subjectAcademicConfigRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;
    private final SchoolRepository schoolRepository;
    private final ModuleAccessService moduleAccessService;
    private final SecurityUtils security;

    public Long school(Long requestedSchoolId) {
        Long schoolId = security.schoolScope(requestedSchoolId);
        moduleAccessService.require(schoolId, ModuleCode.EXAMINATION);
        return schoolId;
    }

    public Page<Exam> exams(Long requestedSchoolId, Long sessionId, Long classId, String status, String search, Pageable pageable) {
        Long s = school(requestedSchoolId);
        Specification<Exam> spec = tenant(s);
        if (sessionId != null) spec = spec.and((r, q, b) -> b.equal(r.get("academicSessionId"), sessionId));
        if (classId != null) spec = spec.and((r, q, b) -> {
            var assignments = q.subquery(Long.class);
            var assignment = assignments.from(ExamClassAssignment.class);
            assignments.select(assignment.get("examId")).where(b.equal(assignment.get("schoolId"), s),
                    b.equal(assignment.get("classId"), classId), b.isFalse(assignment.get("deleted")));
            return r.get("id").in(assignments);
        });
        if (text(status) != null) spec = spec.and((r, q, b) -> b.equal(r.get("status"), status.trim().toUpperCase()));
        if (text(search) != null) spec = spec.and((r, q, b) -> b.like(b.lower(r.get("name")), "%" + search.trim().toLowerCase() + "%"));
        return examRepository.findAll(spec, pageable);
    }

    public Exam getExam(Long requestedSchoolId, Long id) {
        return exam(school(requestedSchoolId), id);
    }

    public Exam createExam(Long requestedSchoolId, ExamRequest request) {
        Long s = school(requestedSchoolId);
        requireAdmin();
        validateExam(s, null, request);
        Exam exam = new Exam();
        exam.setSchoolId(s);
        copyExam(exam, request);
        return examRepository.save(exam);
    }

    public Exam updateExam(Long requestedSchoolId, Long id, ExamRequest request) {
        Long s = school(requestedSchoolId);
        requireAdmin();
        Exam exam = lockExam(s, id);
        ensureNoPublishedScopes(s, exam.getId());
        validateExam(s, id, request);
        copyExam(exam, request);
        return examRepository.save(exam);
    }

    public List<SchoolClass> examClasses(Long requestedSchoolId, Long examId) {
        Long s = school(requestedSchoolId);
        exam(s, examId);
        return examClassAssignmentRepository.findBySchoolIdAndExamIdAndDeletedFalse(s, examId).stream()
                .map(ExamClassAssignment::getClassId).distinct()
                .map(classId -> classRepository.findByIdAndSchoolIdAndDeletedFalse(classId, s)
                        .orElseThrow(() -> new ResourceNotFoundException("Assigned class not found")))
                .sorted(Comparator.comparing(SchoolClass::getName, String.CASE_INSENSITIVE_ORDER)).toList();
    }

    public List<SchoolClass> replaceExamClasses(Long requestedSchoolId, Long examId, ExamClassAssignmentsRequest request) {
        Long s = school(requestedSchoolId); requireAdmin(); lockExam(s, examId); ensureNoPublishedScopes(s, examId);
        Set<Long> requested = new LinkedHashSet<>(request.classIds());
        if (requested.size() != request.classIds().size()) throw new IllegalArgumentException("Duplicate class assignment");
        Map<Long, SchoolClass> classes = requested.stream().map(classId -> classRepository.findByIdAndSchoolIdAndDeletedFalse(classId, s)
                        .orElseThrow(() -> new IllegalArgumentException("Class not found: " + classId)))
                .collect(Collectors.toMap(SchoolClass::getId, Function.identity()));
        List<ExamClassAssignment> existing = examClassAssignmentRepository.findBySchoolIdAndExamIdAndSectionIdIsNullAndDeletedFalse(s, examId);
        Set<Long> removed = existing.stream().map(ExamClassAssignment::getClassId).filter(classId -> !requested.contains(classId)).collect(Collectors.toSet());
        Set<Long> routineClasses = examSubjectRepository.findBySchoolIdAndExamIdAndDeletedFalseOrderByExamDateAscStartTimeAsc(s, examId).stream().map(ExamSubject::getClassId).collect(Collectors.toSet());
        routineClasses.addAll(examClassAssignmentRepository.findBySchoolIdAndExamIdAndSectionIdIsNotNullAndDeletedFalse(s, examId).stream()
                .map(ExamClassAssignment::getClassId).collect(Collectors.toSet()));
        removed.retainAll(routineClasses);
        if (!removed.isEmpty()) throw new IllegalArgumentException("Cannot remove classes used by existing routines: " + removed);
        for (ExamClassAssignment assignment : existing) {
            if (!requested.contains(assignment.getClassId())) examClassAssignmentRepository.delete(assignment);
        }
        examClassAssignmentRepository.flush();
        for (Long classId : requested) examClassAssignmentRepository.findBySchoolIdAndExamIdAndClassIdAndSectionIdIsNullAndDeletedFalse(s, examId, classId)
                .orElseGet(() -> saveScope(s, examId, classId, null));
        return requested.stream().map(classes::get).toList();
    }

    public Exam status(Long requestedSchoolId, Long id, String status) {
        Long s = school(requestedSchoolId);
        requireAdmin();
        Exam exam = lockExam(s, id);
        String normalized = normalizeStatus(status);
        if (hasAnyPublishedScope(s, id) && !"COMPLETED".equals(normalized) && !"ARCHIVED".equals(normalized))
            throw new IllegalArgumentException("Published exams may only be completed or archived");
        exam.setStatus(normalized);
        return examRepository.save(exam);
    }

    public void deleteExam(Long requestedSchoolId, Long id) {
        Long s = school(requestedSchoolId);
        requireAdmin();
        Exam exam = lockExam(s, id);
        ensureNoPublishedScopes(s, id);
        if (!examSubjectRepository.findBySchoolIdAndExamIdAndDeletedFalseOrderByExamDateAscStartTimeAsc(s, id).isEmpty())
            throw new IllegalArgumentException("Delete the exam routine first");
        exam.setDeleted(true);
        examRepository.save(exam);
    }

    public ExamType createExamType(Long requestedSchoolId, String name, Integer weightage) {
        Long s = school(requestedSchoolId);
        requireAdmin();
        if (text(name) == null) throw new IllegalArgumentException("Exam type name is required");
        if (weightage != null && (weightage < 0 || weightage > 100)) throw new IllegalArgumentException("Weightage must be between 0 and 100");
        ExamType type = new ExamType(); type.setSchoolId(s); type.setName(name.trim()); type.setWeightage(weightage);
        return examTypeRepository.save(type);
    }

    public List<ExamType> examTypes(Long requestedSchoolId, boolean includeInactive) {
        return examTypeRepository.findBySchoolIdAndDeletedFalseOrderByNameAsc(school(requestedSchoolId)).stream()
                .filter(type -> includeInactive || type.isActive()).toList();
    }

    public ExamType saveExamType(Long requestedSchoolId, ExamTypeRequest request) {
        Long s = school(requestedSchoolId); requireAdmin();
        String name = request.name().trim();
        boolean duplicate = request.id() == null
                ? examTypeRepository.existsBySchoolIdAndNameIgnoreCaseAndDeletedFalse(s, name)
                : examTypeRepository.existsBySchoolIdAndNameIgnoreCaseAndIdNotAndDeletedFalse(s, name, request.id());
        if (duplicate) throw new IllegalArgumentException("Exam type name already exists");
        if (request.weightage() != null && (request.weightage() < 0 || request.weightage() > 100)) throw new IllegalArgumentException("Weightage must be between 0 and 100");
        ExamType type = request.id() == null ? new ExamType() : examTypeRepository.findByIdAndSchoolIdAndDeletedFalse(request.id(), s).orElseThrow(() -> new ResourceNotFoundException("Exam type not found"));
        type.setSchoolId(s); type.setName(name); type.setDescription(text(request.description())); type.setWeightage(request.weightage()); if (request.active() != null) type.setActive(request.active());
        return examTypeRepository.save(type);
    }

    public ExamType examTypeStatus(Long requestedSchoolId, Long id, boolean active) {
        Long s = school(requestedSchoolId); requireAdmin();
        ExamType type = examTypeRepository.findByIdAndSchoolIdAndDeletedFalse(id, s).orElseThrow(() -> new ResourceNotFoundException("Exam type not found"));
        type.setActive(active); return examTypeRepository.save(type);
    }

    public List<SubjectAcademicConfigRow> subjectAcademicConfig(Long requestedSchoolId, Long sessionId, Long classId) {
        Long s = school(requestedSchoolId);
        validateAcademicConfigScope(s, sessionId, classId);
        Map<Long, SubjectAcademicConfig> configured = subjectAcademicConfigRepository
                .findBySchoolIdAndAcademicSessionIdAndClassIdAndDeletedFalse(s, sessionId, classId).stream()
                .collect(Collectors.toMap(SubjectAcademicConfig::getSubjectId, Function.identity()));
        return activeClassSubjects(s, classId).stream().map(subject -> academicConfigRow(sessionId, classId, subject, configured.get(subject.getId()))).toList();
    }

    public List<SubjectAcademicConfigRow> replaceSubjectAcademicConfig(Long requestedSchoolId, SubjectAcademicConfigBulkRequest request) {
        Long s = school(requestedSchoolId); requireAdmin();
        validateAcademicConfigScope(s, request.academicSessionId(), request.classId());
        boolean publishedScopeUsesClass = examClassAssignmentRepository.findBySchoolIdAndClassIdAndDeletedFalse(s, request.classId()).stream()
                .filter(assignment -> assignment.getSectionId() != null && assignment.isPublished())
                .map(ExamClassAssignment::getExamId).distinct().map(examId -> exam(s, examId))
                .anyMatch(exam -> exam.getAcademicSessionId().equals(request.academicSessionId()));
        if (publishedScopeUsesClass) throw new IllegalArgumentException("Academic configuration is used by a published result scope and cannot be changed");
        if (request.configs().stream().map(SubjectAcademicConfigInput::subjectId).distinct().count() != request.configs().size())
            throw new IllegalArgumentException("Duplicate subjectId in configs");
        Map<Long, Subject> subjects = activeClassSubjects(s, request.classId()).stream().collect(Collectors.toMap(Subject::getId, Function.identity()));
        for (SubjectAcademicConfigInput input : request.configs()) {
            if (!subjects.containsKey(input.subjectId())) throw new IllegalArgumentException("Subject is not active in the selected class: " + input.subjectId());
            if (input.creditHours() != null && input.creditHours().signum() <= 0) throw new IllegalArgumentException("Credit hours must be positive when provided");
            SubjectAcademicConfig config = subjectAcademicConfigRepository.findBySchoolIdAndAcademicSessionIdAndClassIdAndSubjectId(
                    s, request.academicSessionId(), request.classId(), input.subjectId()).orElseGet(SubjectAcademicConfig::new);
            config.setSchoolId(s); config.setAcademicSessionId(request.academicSessionId()); config.setClassId(request.classId());
            config.setSubjectId(input.subjectId()); config.setCreditHours(input.creditHours());
            config.setIncludeInGpa(input.includeInGpa() == null || input.includeInGpa());
            config.setIncludeInCgpa(Boolean.TRUE.equals(input.includeInCgpa())); config.setDeleted(false); subjectAcademicConfigRepository.save(config);
        }
        return subjectAcademicConfigRows(s, request.academicSessionId(), request.classId());
    }

    public List<ExamSubject> routine(Long requestedSchoolId, Long examId) {
        Long s = school(requestedSchoolId);
        exam(s, examId);
        return examSubjectRepository.findBySchoolIdAndExamIdAndDeletedFalseOrderByExamDateAscStartTimeAsc(s, examId);
    }

    public byte[] exportRoutinePdf(Long requestedSchoolId, Long examId) {
        Long s = school(requestedSchoolId); Exam exam = exam(s, examId);
        List<String> lines = new ArrayList<>(); lines.add("Examination Routine: " + exam.getName());
        for (ExamSubject entry : examSubjectRepository.findBySchoolIdAndExamIdAndDeletedFalseOrderByExamDateAscStartTimeAsc(s, examId)) {
            String subject = subjectRepository.findByIdAndSchoolIdAndDeletedFalse(entry.getSubjectId(), s).map(Subject::getSubjectName).orElse("");
            lines.add(entry.getExamDate() + "  " + entry.getStartTime() + "-" + entry.getEndTime() + "  "
                    + className(s, entry.getClassId()) + "/" + sectionName(s, entry.getSectionId()) + "  " + subject
                    + (text(entry.getRoom()) == null ? "" : "  Room " + entry.getRoom()));
        }
        return simplePdf(lines);
    }

    public ExamSubject createRoutine(Long requestedSchoolId, RoutineRequest request) {
        Long s = school(requestedSchoolId);
        requireAdmin();
        lockExam(s, request.examId());
        ensureConcreteScope(s, request.examId(), request.classId(), request.sectionId());
        ensureScopeUnlocked(s, request.examId(), request.classId(), request.sectionId());
        validateRoutine(s, null, request);
        ExamSubject routine = new ExamSubject(); routine.setSchoolId(s); copyRoutine(routine, request);
        return examSubjectRepository.save(routine);
    }

    public ExamSubject updateRoutine(Long requestedSchoolId, Long id, RoutineRequest request) {
        Long s = school(requestedSchoolId);
        requireAdmin();
        ExamSubject routine = routineById(s, id);
        List<Long> examIds = new ArrayList<>(new TreeSet<>(List.of(routine.getExamId(), request.examId())));
        examIds.forEach(examId -> lockExam(s, examId));
        ensureScopeUnlocked(s, routine.getExamId(), routine.getClassId(), routine.getSectionId());
        ensureConcreteScope(s, request.examId(), request.classId(), request.sectionId());
        ensureScopeUnlocked(s, request.examId(), request.classId(), request.sectionId());
        validateRoutine(s, id, request);
        Long oldExamId = routine.getExamId(), oldClassId = routine.getClassId(), oldSectionId = routine.getSectionId();
        copyRoutine(routine, request);
        ExamSubject saved = examSubjectRepository.save(routine);
        cleanupConcreteScope(s, oldExamId, oldClassId, oldSectionId, id);
        return saved;
    }

    public void deleteRoutine(Long requestedSchoolId, Long id) {
        Long s = school(requestedSchoolId);
        requireAdmin();
        ExamSubject routine = routineById(s, id);
        lockExam(s, routine.getExamId());
        ensureScopeUnlocked(s, routine.getExamId(), routine.getClassId(), routine.getSectionId());
        if (!markRepository.findBySchoolIdAndExamSubjectIdInAndDeletedFalse(s, List.of(id)).isEmpty())
            throw new IllegalArgumentException("Routine with marks cannot be deleted");
        routine.setDeleted(true); examSubjectRepository.save(routine);
        cleanupConcreteScope(s, routine.getExamId(), routine.getClassId(), routine.getSectionId(), id);
    }

    public List<GradingSystem> gradingSystems(Long requestedSchoolId, Long sessionId) {
        Long s = school(requestedSchoolId);
        session(s, sessionId);
        return gradingSystemRepository.findBySchoolIdAndAcademicSessionIdAndDeletedFalseOrderByCreatedAtDesc(s, sessionId);
    }

    public GradingSystem createGradingSystem(Long requestedSchoolId, GradingSystemRequest request) {
        Long s = school(requestedSchoolId); requireAdmin(); session(s, request.academicSessionId());
        GradingSystem system = new GradingSystem(); system.setSchoolId(s); system.setAcademicSessionId(request.academicSessionId());
        system.setName(request.name().trim()); return gradingSystemRepository.save(system);
    }

    public GradingSystem updateGradingSystem(Long requestedSchoolId, Long id, GradingSystemRequest request) {
        Long s = school(requestedSchoolId); requireAdmin(); session(s, request.academicSessionId());
        GradingSystem system = gradingSystem(s, id);
        ensureGradingSystemMutable(s, id);
        if (system.isActive() && !system.getAcademicSessionId().equals(request.academicSessionId())) throw new IllegalArgumentException("Deactivate the grading system before changing its session");
        system.setAcademicSessionId(request.academicSessionId()); system.setName(request.name().trim());
        return gradingSystemRepository.save(system);
    }

    public void deleteGradingSystem(Long requestedSchoolId, Long id) {
        Long s = school(requestedSchoolId); requireAdmin(); GradingSystem system = gradingSystem(s, id);
        ensureGradingSystemMutable(s, id);
        if (system.isActive()) throw new IllegalArgumentException("Active grading system cannot be deleted");
        for (GradeRule rule : gradeRuleRepository.findBySchoolIdAndGradingSystemIdAndDeletedFalseOrderByMinPercentageAsc(s, id)) { rule.setDeleted(true); gradeRuleRepository.save(rule); }
        system.setDeleted(true); gradingSystemRepository.save(system);
    }

    public GradingSystem deactivateGradingSystem(Long requestedSchoolId, Long systemId) {
        Long s = school(requestedSchoolId); requireAdmin(); GradingSystem system = gradingSystem(s, systemId);
        system.setActive(false); return gradingSystemRepository.save(system);
    }

    public List<GradeRule> rules(Long requestedSchoolId, Long systemId) {
        Long s = school(requestedSchoolId); gradingSystem(s, systemId);
        return gradeRuleRepository.findBySchoolIdAndGradingSystemIdAndDeletedFalseOrderByMinPercentageAsc(s, systemId);
    }

    public GradeRule saveRule(Long requestedSchoolId, Long systemId, Long ruleId, GradeRuleRequest request) {
        Long s = school(requestedSchoolId); requireAdmin(); GradingSystem system = gradingSystem(s, systemId);
        ensureGradingSystemMutable(s, systemId);
        if (system.isActive()) throw new IllegalArgumentException("Deactivate the grading system before changing rules");
        if (request.maxPercentage().compareTo(request.minPercentage()) <= 0) throw new IllegalArgumentException("Maximum percentage must be greater than minimum percentage");
        GradeRule rule = ruleId == null ? new GradeRule() : rule(s, systemId, ruleId);
        rule.setSchoolId(s); rule.setGradingSystemId(systemId); rule.setMinPercentage(request.minPercentage());
        rule.setMaxPercentage(request.maxPercentage()); rule.setGrade(request.grade().trim()); rule.setGpa(request.gpa());
        rule.setPassing(request.passing()); rule.setRemarks(text(request.remarks()));
        validateNoOverlap(s, systemId, ruleId, rule);
        return gradeRuleRepository.save(rule);
    }

    public void deleteRule(Long requestedSchoolId, Long systemId, Long ruleId) {
        Long s = school(requestedSchoolId); requireAdmin(); GradingSystem system = gradingSystem(s, systemId);
        ensureGradingSystemMutable(s, systemId);
        if (system.isActive()) throw new IllegalArgumentException("Deactivate the grading system before changing rules");
        GradeRule rule = rule(s, systemId, ruleId); rule.setDeleted(true); gradeRuleRepository.save(rule);
    }

    public GradingSystem activateGradingSystem(Long requestedSchoolId, Long systemId) {
        Long s = school(requestedSchoolId); requireAdmin(); GradingSystem target = gradingSystem(s, systemId);
        List<GradeRule> rules = gradeRuleRepository.findBySchoolIdAndGradingSystemIdAndDeletedFalseOrderByMinPercentageAsc(s, systemId);
        validateCoverage(rules);
        gradingSystemRepository.lockSessionSystems(s, target.getAcademicSessionId())
                .forEach(system -> { system.setActive(system.getId().equals(systemId)); gradingSystemRepository.save(system); });
        return target;
    }

    public List<RosterRow> roster(Long requestedSchoolId, Long examId, Long classId, Long sectionId, Long subjectId, Long teacherId) {
        Long s = school(requestedSchoolId);
        Exam exam = exam(s, examId);
        ExamSubject routine = findRoutine(s, examId, classId, sectionId, subjectId);
        enforceTeacherAssignment(s, routine, teacherId);
        if ((security.hasRole(RoleName.STUDENT) || security.hasRole(RoleName.PARENT)) && !scopeResultsVisible(s, exam, classId, sectionId)) throw new ForbiddenException("Results are not published");
        Map<Long, Mark> marks = markRepository.findBySchoolIdAndExamSubjectIdInAndDeletedFalse(s, List.of(routine.getId())).stream()
                .collect(Collectors.toMap(Mark::getStudentId, Function.identity()));
        return activeStudents(s, classId, sectionId).stream().map(student -> rosterRow(student, marks.get(student.getId()))).toList();
    }

    public List<Mark> bulkMarks(Long requestedSchoolId, BulkMarksRequest request) {
        Long s = school(requestedSchoolId);
        requireStaff();
        ExamSubject routine = routineById(s, request.examSubjectId());
        Exam exam = lockExam(s, routine.getExamId()); ensureScopeUnlocked(s, exam.getId(), routine.getClassId(), routine.getSectionId()); enforceTeacherAssignment(s, routine, null);
        Set<Long> active = activeStudents(s, routine.getClassId(), routine.getSectionId()).stream().map(Student::getId).collect(Collectors.toSet());
        Set<Long> supplied = new HashSet<>();
        for (MarkInput input : request.marks()) {
            if (!supplied.add(input.studentId())) throw new IllegalArgumentException("Duplicate student in marks payload: " + input.studentId());
            if (!active.contains(input.studentId())) throw new IllegalArgumentException("Student is not active in the routine roster: " + input.studentId());
            validateMark(input, routine);
        }
        List<GradeRule> rules = activeRules(s, exam.getAcademicSessionId());
        List<Mark> saved = new ArrayList<>();
        for (MarkInput input : request.marks()) {
            Mark mark = markRepository.findBySchoolIdAndExamSubjectIdAndStudentIdAndDeletedFalse(s, routine.getId(), input.studentId()).orElseGet(Mark::new);
            mark.setSchoolId(s); mark.setExamSubjectId(routine.getId()); mark.setStudentId(input.studentId()); mark.setAbsent(input.absent());
            mark.setObtainedMarks(input.absent() ? BigDecimal.ZERO : input.obtainedMarks()); mark.setMarkedBy(security.currentUser().getId());
            applyGrade(mark, routine, rules); saved.add(markRepository.save(mark));
        }
        return saved;
    }

    public List<TeacherAssignment> selfTeacherAssignments() {
        Long s = school(null);
        requireRole(RoleName.TEACHER, "Teacher role required");
        Teacher teacher = currentActiveTeacher(s);
        Set<String> assignments = teacherSubjectRepository.findBySchoolIdAndTeacherIdAndDeletedFalse(s, teacher.getId()).stream()
                .filter(item -> item.getAcademicSessionId() != null)
                .map(item -> assignmentKey(item.getAcademicSessionId(), item.getClassId(), item.getSubjectId(), item.getSectionId())).collect(Collectors.toSet());
        return examSubjectRepository.findBySchoolIdAndDeletedFalseOrderByExamDateAscStartTimeAsc(s).stream()
                .filter(routine -> assignments.contains(assignmentKey(exam(s, routine.getExamId()).getAcademicSessionId(), routine.getClassId(), routine.getSubjectId(), routine.getSectionId())))
                .map(routine -> teacherAssignment(s, routine)).toList();
    }

    public List<RosterRow> selfTeacherRoster(Long examSubjectId) {
        Long s = school(null);
        requireRole(RoleName.TEACHER, "Teacher role required");
        ExamSubject routine = routineById(s, examSubjectId);
        return roster(null, routine.getExamId(), routine.getClassId(), routine.getSectionId(), routine.getSubjectId(), null);
    }

    public List<Mark> selfTeacherBulkMarks(BulkMarksRequest request) {
        requireRole(RoleName.TEACHER, "Teacher role required");
        return bulkMarks(null, request);
    }

    public Exam publish(Long requestedSchoolId, Long examId) {
        Long s = school(requestedSchoolId); requireAdmin(); Exam exam = lockExam(s, examId);
        List<ExamClassAssignment> scopes = examClassAssignmentRepository.lockConcreteScopes(s, examId);
        if (scopes.isEmpty()) throw new IllegalArgumentException("Exam routine is empty");
        if (scopes.stream().allMatch(ExamClassAssignment::isPublished)) throw new IllegalArgumentException("Exam results are already published");
        for (ExamClassAssignment scope : scopes) if (!scope.isPublished()) publishScopeInternal(s, exam, scope);
        return aggregatePublication(s, exam);
    }

    public Exam unpublish(Long requestedSchoolId, Long examId) {
        Long s = school(requestedSchoolId); requireAdmin(); Exam exam = lockExam(s, examId);
        List<ExamClassAssignment> scopes = examClassAssignmentRepository.lockConcreteScopes(s, examId);
        if (scopes.stream().noneMatch(ExamClassAssignment::isPublished)) throw new IllegalArgumentException("Exam results are already unpublished");
        scopes.forEach(scope -> { scope.setPublished(false); scope.setPublishedAt(null); examClassAssignmentRepository.save(scope); });
        exam.setPublished(false); exam.setStatus("ACTIVE"); return examRepository.save(exam);
    }

    public List<PublicationScope> publicationScopes(Long requestedSchoolId, Long examId) {
        Long s = school(requestedSchoolId); Exam exam = exam(s, examId); requireStaff();
        return examClassAssignmentRepository.findBySchoolIdAndExamIdAndSectionIdIsNotNullAndDeletedFalse(s, examId).stream()
                .filter(scope -> !security.hasRole(RoleName.TEACHER) || teacherCanScope(s, exam, scope.getClassId(), scope.getSectionId()))
                .map(scope -> publicationScope(s, exam, scope)).toList();
    }

    public PublicationScope publishScope(Long requestedSchoolId, Long examId, Long classId, Long sectionId) {
        Long s = school(requestedSchoolId); requireAdmin(); Exam exam = lockExam(s, examId);
        ExamClassAssignment scope = lockExactScope(s, examId, classId, sectionId);
        if (scope.isPublished()) throw new IllegalArgumentException("Publication scope is already published");
        publishScopeInternal(s, exam, scope); return publicationScope(s, exam, scope);
    }

    public PublicationScope unpublishScope(Long requestedSchoolId, Long examId, Long classId, Long sectionId) {
        Long s = school(requestedSchoolId); requireAdmin(); Exam exam = lockExam(s, examId); ExamClassAssignment scope = lockExactScope(s, examId, classId, sectionId);
        if (!scope.isPublished()) throw new IllegalArgumentException("Publication scope is already unpublished");
        scope.setPublished(false); scope.setPublishedAt(null); examClassAssignmentRepository.save(scope); exam.setPublished(false); exam.setStatus("ACTIVE"); examRepository.save(exam);
        return publicationScope(s, exam, scope);
    }

    public List<Result> studentResults(Long requestedSchoolId, Long examId, Long classId, Long sectionId) {
        Long s = school(requestedSchoolId); requireAdmin(); Exam exam = exam(s, examId);
        requireExactOptionalScope(classId, sectionId);
        List<Result> results = rankedResults(s, exam, true, classId, sectionId);
        if (classId != null) results = results.stream().filter(r -> classId.equals(r.classId())).toList();
        if (sectionId != null) results = results.stream().filter(r -> sectionId.equals(r.sectionId())).toList();
        return results;
    }

    public Result result(Long requestedSchoolId, Long examId, Long studentId) {
        Long s = school(requestedSchoolId); Exam exam = exam(s, examId); authorizeResult(s, exam, studentId);
        return rankedResult(s, exam, studentId);
    }

    public List<Result> transcript(Long requestedSchoolId, Long studentId, Long sessionId) {
        Long s = school(requestedSchoolId); session(s, sessionId);
        return examRepository.findBySchoolIdAndAcademicSessionIdAndDeletedFalse(s, sessionId).stream()
                .filter(exam -> studentScopeVisible(s, exam, studentId)).filter(exam -> canAccessStudent(s, exam, studentId)).map(exam -> rankedResult(s, exam, studentId)).toList();
    }

    public List<Result> selfStudentResults() {
        Long s = school(null);
        requireRole(RoleName.STUDENT, "Student role required");
        Student student = studentRepository.findBySchoolIdAndUserIdAndDeletedFalse(s, security.currentUser().getId())
                .orElseThrow(() -> new ForbiddenException("Student profile mapping not found"));
        return publishedResults(s, student);
    }

    public List<ChildResults> selfParentChildrenResults() {
        Long s = school(null);
        requireRole(RoleName.PARENT, "Parent role required");
        Parent parent = parentRepository.findBySchoolIdAndUserIdAndDeletedFalse(s, security.currentUser().getId())
                .orElseThrow(() -> new ForbiddenException("Parent profile mapping not found"));
        List<Student> children = studentRepository.findBySchoolIdAndParentIdAndDeletedFalse(s, parent.getId());
        if (children.isEmpty()) throw new ForbiddenException("No students are linked to this parent profile");
        return children.stream().map(student -> childResults(s, student)).toList();
    }

    public List<ReportRow> report(Long requestedSchoolId, Long examId) {
        Long s = school(requestedSchoolId); requireStaff(); Exam exam = exam(s, examId); enforceExamTeacher(s, exam);
        List<ExamSubject> routines = examSubjectRepository.findBySchoolIdAndExamIdAndDeletedFalseOrderByExamDateAscStartTimeAsc(s, examId);
        if (security.hasRole(RoleName.TEACHER)) routines = routines.stream().filter(routine -> teacherCanRoutine(s, routine)).toList();
        List<GradeRule> rules = routines.stream().anyMatch(routine -> !isScopePublished(s, examId, routine.getClassId(), routine.getSectionId()))
                ? activeRules(s, exam.getAcademicSessionId()) : List.of();
        List<ReportRow> rows = new ArrayList<>();
        for (ExamSubject routine : routines) {
            Subject subject = subjectRepository.findByIdAndSchoolIdAndDeletedFalse(routine.getSubjectId(), s).orElseThrow();
            List<Mark> marks = markRepository.findBySchoolIdAndExamSubjectIdInAndDeletedFalse(s, List.of(routine.getId()));
            Map<String, List<Mark>> grouped = marks.stream().collect(Collectors.groupingBy(mark -> reportGroup(s, exam, routine, mark, rules)));
            for (Map.Entry<String, List<Mark>> entry : grouped.entrySet()) rows.add(reportRow(routine, subject, entry.getKey(), entry.getValue()));
        }
        return rows;
    }

    public Dashboard dashboard(Long requestedSchoolId, Long sessionId) {
        Long s = school(requestedSchoolId); requireStaff(); session(s, sessionId);
        List<Exam> exams = examRepository.findBySchoolIdAndAcademicSessionIdAndDeletedFalse(s, sessionId);
        List<Exam> examsWithPublishedScopes = exams.stream().filter(exam -> hasAnyPublishedScope(s, exam.getId())).toList();
        long published = examsWithPublishedScopes.size();
        List<Result> results = examsWithPublishedScopes.stream().flatMap(exam -> rankedResults(s, exam, false).stream()).toList();
        long passed = results.stream().filter(r -> "PASS".equals(r.status())).count();
        BigDecimal average = average(results.stream().map(Result::percentage).toList());
        long failed = results.size() - passed;
        Map<String, Long> gradeDistribution = results.stream().collect(Collectors.groupingBy(Result::grade, TreeMap::new, Collectors.counting()));
        Map<String, Long> gpaDistribution = results.stream().collect(Collectors.groupingBy(result -> result.gpa() == null
                ? "N/A" : result.gpa().setScale(1, RoundingMode.HALF_UP).toPlainString(), TreeMap::new, Collectors.counting()));
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("totalExams", exams.size()); metrics.put("upcomingExams", exams.stream().filter(exam -> "UPCOMING".equals(exam.getStatus())).count());
        metrics.put("completedExams", exams.stream().filter(exam -> "COMPLETED".equals(exam.getStatus())).count()); metrics.put("publishedResults", published);
        metrics.put("pendingMarksEntry", exams.stream().filter(exam -> examClassAssignmentRepository
                .findBySchoolIdAndExamIdAndSectionIdIsNotNullAndDeletedFalse(s, exam.getId()).stream().anyMatch(scope -> !scope.isPublished())).count());
        metrics.put("studentsAppeared", results.size()); metrics.put("averageResultPercentage", average);
        metrics.put("passPercentage", results.isEmpty() ? BigDecimal.ZERO : BigDecimal.valueOf(passed * 100.0 / results.size()).setScale(2, RoundingMode.HALF_UP));
        metrics.put("failPercentage", results.isEmpty() ? BigDecimal.ZERO : BigDecimal.valueOf(failed * 100.0 / results.size()).setScale(2, RoundingMode.HALF_UP));
        Map<String, Object> charts = new LinkedHashMap<>(); charts.put("gradeDistribution", gradeDistribution); charts.put("gpaDistribution", gpaDistribution);
        charts.put("resultDistribution", Map.of("PASS", passed, "FAIL", failed)); charts.put("passVsFail", Map.of("PASS", passed, "FAIL", failed));
        Map<String, BigDecimal> examAverages = examsWithPublishedScopes.stream().collect(Collectors.toMap(Exam::getName,
                exam -> average(rankedResults(s, exam, false).stream().map(Result::percentage).toList()), (a,b) -> b, LinkedHashMap::new));
        charts.put("examAverages", examAverages); charts.put("examWiseComparison", examAverages);
        charts.put("subjectPerformance", reportPublishedSubjectAverages(s, exams));
        return new Dashboard(metrics, charts);
    }

    public byte[] exportCsv(Long requestedSchoolId, Long examId) {
        Long s = school(requestedSchoolId); requireStaff(); Exam exam = exam(s, examId); enforceExamTeacher(s, exam);
        StringBuilder csv = new StringBuilder("Student ID,Student,Class,Section,Admission Number,Roll Number,Total,Full Marks,Percentage,Grade,GPA,Status,Class Rank,Section Rank,School Rank\r\n");
        for (Result r : rankedResults(s, exam)) appendExportRow(csv, r);
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportExcel(Long requestedSchoolId, Long examId) {
        Long s = school(requestedSchoolId); requireStaff(); Exam exam = exam(s, examId); enforceExamTeacher(s, exam);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Results");
            String[] columns = {"Student ID", "Student", "Class", "Section", "Admission Number", "Roll Number",
                    "Total", "Full Marks", "Percentage", "Grade", "GPA", "Status", "Class Rank", "Section Rank", "School Rank"};
            Font font = workbook.createFont(); font.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle(); headerStyle.setFont(font);
            Row header = sheet.createRow(0);
            for (int index = 0; index < columns.length; index++) { header.createCell(index).setCellValue(columns[index]); header.getCell(index).setCellStyle(headerStyle); }
            int rowIndex = 1;
            for (Result result : rankedResults(s, exam)) {
                Row row = sheet.createRow(rowIndex++);
                Object[] values = {result.studentId(), result.studentName(), result.className(), result.sectionName(), result.admissionNumber(), result.rollNumber(),
                        result.total(), result.fullMarks(), result.percentage(), result.grade(), result.gpa(), result.status(), result.classRank(), result.sectionRank(), result.schoolRank()};
                for (int index = 0; index < values.length; index++) row.createCell(index).setCellValue(Objects.toString(values[index], ""));
            }
            for (int index = 0; index < columns.length; index++) sheet.autoSizeColumn(index);
            workbook.write(output);
            return output.toByteArray();
        } catch (java.io.IOException exception) {
            throw new IllegalStateException("Unable to create Excel report", exception);
        }
    }

    public List<Result> meritList(Long requestedSchoolId, Long examId, Long classId, Long sectionId) {
        Long s = school(requestedSchoolId); requireAdmin(); exam(s, examId);
        requireExactOptionalScope(classId, sectionId);
        return studentResults(requestedSchoolId, examId, classId, sectionId).stream().sorted(Comparator.comparing(Result::schoolRank)).toList();
    }

    public byte[] exportPdf(Long requestedSchoolId, Long examId) {
        Long s = school(requestedSchoolId); requireStaff(); Exam exam = exam(s, examId); enforceExamTeacher(s, exam);
        List<String> lines = new ArrayList<>(); lines.add("Examination Result: " + exam.getName());
        for (Result r : rankedResults(s, exam)) lines.add(r.studentName() + "  " + r.className() + "/" + r.sectionName()
                + "  " + r.admissionNumber() + "  Roll " + r.rollNumber() + "  " + r.percentage() + "%  " + r.grade()
                + "  " + r.status() + "  Rank " + r.classRank());
        return simplePdf(lines);
    }

    private Result rankedResult(Long s, Exam exam, Long studentId) {
        boolean staffPreview = security.hasRole(RoleName.SCHOOL_ADMIN) || security.hasRole(RoleName.SUPER_ADMIN);
        Student student = studentRepository.findByIdAndSchoolIdAndDeletedFalse(studentId, s).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Long classId = staffPreview ? null : student.getClassId(), sectionId = staffPreview ? null : student.getSectionId();
        return rankedResults(s, exam, staffPreview, classId, sectionId).stream().filter(result -> result.studentId().equals(studentId)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Student has no subjects in this exam"));
    }

    private List<Result> rankedResults(Long s, Exam exam) {
        return rankedResults(s, exam, true);
    }

    private List<Result> rankedResults(Long s, Exam exam, boolean includeUnpublishedScopes) {
        return rankedResults(s, exam, includeUnpublishedScopes, null, null);
    }

    private List<Result> rankedResults(Long s, Exam exam, boolean includeUnpublishedScopes, Long classId, Long sectionId) {
        Map<Long, Student> students = examStudents(s, exam).stream()
                .map(id -> studentRepository.findByIdAndSchoolIdAndDeletedFalse(id, s).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(Student::getId, Function.identity()));
        Map<Long, Result> results = students.values().stream()
                .map(student -> resultIfComplete(s, exam, student, includeUnpublishedScopes, classId, sectionId))
                .flatMap(Optional::stream)
                .collect(Collectors.toMap(Result::studentId, Function.identity()));
        List<Result> all = new ArrayList<>(results.values());
        Map<Long, Integer> schoolRanks = denseRanks(all);
        Map<Long, Integer> classRanks = new HashMap<>(), sectionRanks = new HashMap<>();
        all.stream().collect(Collectors.groupingBy(Result::classId)).values().forEach(group -> classRanks.putAll(denseRanks(group)));
        all.stream().collect(Collectors.groupingBy(result -> result.classId() + ":" + result.sectionId())).values()
                .forEach(group -> sectionRanks.putAll(denseRanks(group)));
        return all.stream().map(base -> new Result(base.examId(), base.examName(), base.studentId(), base.studentName(), base.schoolName(),
                base.schoolAddress(), base.schoolPhone(), base.schoolEmail(), base.schoolLogoUrl(), base.studentPhoto(), base.admissionNumber(),
                base.rollNumber(), base.academicSessionId(), base.academicSessionName(), base.examStartsOn(), base.examEndsOn(),
                base.resultPublishDate(), base.classId(), base.className(), base.sectionId(), base.sectionName(), base.published(),
                base.total(), base.fullMarks(), base.percentage(), base.totalCreditHours(), base.gpa(), base.cgpa(), base.cgpaPeriods(),
                base.grade(), base.status(), base.remarks(), classRanks.get(base.studentId()), sectionRanks.get(base.studentId()),
                schoolRanks.get(base.studentId()), base.subjects())).toList();
    }

    private Optional<Result> resultIfComplete(Long s, Exam exam, Student student, boolean includeUnpublishedScopes, Long classId, Long sectionId) {
        boolean portalCurrentOnly = !includeUnpublishedScopes;
        List<ExamSubject> routines = studentRoutines(s, exam, student, classId, sectionId, portalCurrentOnly);
        if (routines.isEmpty()) return Optional.empty();
        Long selectedClassId = routines.getFirst().getClassId(), selectedSectionId = routines.getFirst().getSectionId();
        if (!includeUnpublishedScopes && !scopeResultsVisible(s, exam, selectedClassId, selectedSectionId)) return Optional.empty();
        Set<Long> marked = markRepository.findBySchoolIdAndExamSubjectIdInAndDeletedFalse(s, routines.stream().map(ExamSubject::getId).toList()).stream()
                .filter(mark -> mark.getStudentId().equals(student.getId())).map(Mark::getExamSubjectId).collect(Collectors.toSet());
        if (marked.size() != routines.size()) return Optional.empty();
        return Optional.of(calculateResult(s, exam, student, true, selectedClassId, selectedSectionId, portalCurrentOnly));
    }

    private Result calculateResult(Long s, Exam exam, Long studentId) { return calculateResult(s, exam, studentId, true); }

    private Result calculateResult(Long s, Exam exam, Long studentId, boolean includeCgpa) {
        Student student = studentRepository.findByIdAndSchoolIdAndDeletedFalse(studentId, s).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return calculateResult(s, exam, student, includeCgpa);
    }

    private Result calculateResult(Long s, Exam exam, Student student, boolean includeCgpa) {
        return calculateResult(s, exam, student, includeCgpa, null, null, false);
    }

    private Result calculateResult(Long s, Exam exam, Student student, boolean includeCgpa, Long classId, Long sectionId, boolean portalCurrentOnly) {
        Long studentId = student.getId();
        List<ExamSubject> routines = studentRoutines(s, exam, student, classId, sectionId, portalCurrentOnly);
        if (routines.isEmpty()) throw new ResourceNotFoundException("Student has no subjects in this exam");
        boolean scopePublished = isScopePublished(s, exam.getId(), routines.getFirst().getClassId(), routines.getFirst().getSectionId());
        Map<Long, Mark> marks = markRepository.findBySchoolIdAndExamSubjectIdInAndDeletedFalse(s, routines.stream().map(ExamSubject::getId).toList()).stream().filter(m -> m.getStudentId().equals(studentId)).collect(Collectors.toMap(Mark::getExamSubjectId, Function.identity()));
        List<GradeRule> rules = resultRules(s, exam, routines); List<SubjectResult> subjects = new ArrayList<>();
        List<ResultCalculation.WeightedValue> weighted = new ArrayList<>();
        boolean weightedConfigured = hasExplicitAcademicConfiguration(s, exam, routines);
        BigDecimal total = BigDecimal.ZERO, full = BigDecimal.ZERO;
        List<String> statuses = new ArrayList<>();
        for (ExamSubject routine : routines) {
            Mark mark = marks.get(routine.getId()); if (mark == null) throw new IllegalArgumentException("Result is incomplete");
            BigDecimal obtained = mark.isAbsent() ? BigDecimal.ZERO : mark.getObtainedMarks();
            BigDecimal pct = scopePublished && mark.getSubjectPercentage() != null ? mark.getSubjectPercentage()
                    : obtained.multiply(BigDecimal.valueOf(100)).divide(routine.getFullMarks(), 4, RoundingMode.HALF_UP);
            GradeRule rule = scopePublished ? null : gradeFor(pct, rules);
            String grade = scopePublished ? mark.getGrade() : mark.isAbsent() ? "-" : rule.getGrade();
            BigDecimal gradePoint = scopePublished ? mark.getGpa() : mark.isAbsent() ? BigDecimal.ZERO : rule.getGpa();
            String subjectStatus = scopePublished ? persistedStatus(mark)
                    : ResultCalculation.subjectStatus(mark.isAbsent(), obtained.compareTo(routine.getPassMarks()) >= 0, rule.isPassing(), rule.getGrade());
            statuses.add(subjectStatus);
            Subject subject = subjectRepository.findByIdAndSchoolIdAndDeletedFalse(routine.getSubjectId(), s).orElseThrow();
            BigDecimal credit = scopePublished ? routine.getCreditHoursSnapshot() : previewCredit(s, exam, routine, subject);
            boolean includeGpa = scopePublished ? Boolean.TRUE.equals(routine.getIncludeInGpaSnapshot()) : previewIncludeInGpa(s, exam, routine);
            BigDecimal quality = scopePublished ? mark.getQualityPoints()
                    : includeGpa && credit != null && gradePoint != null ? gradePoint.multiply(credit) : null;
            String remarks = scopePublished ? mark.getResultRemarks() : rule.getRemarks();
            subjects.add(new SubjectResult(routine.getId(), subject.getId(), subject.getSubjectCode(), subject.getSubjectName(), routine.getFullMarks(),
                    routine.getPassMarks(), obtained, pct.setScale(2, RoundingMode.HALF_UP), mark.isAbsent(), grade, gradePoint, gradePoint,
                    credit, quality, subjectStatus, remarks));
            weighted.add(new ResultCalculation.WeightedValue(gradePoint, credit, includeGpa));
            total = total.add(obtained); full = full.add(routine.getFullMarks());
        }
        BigDecimal percentage = total.multiply(BigDecimal.valueOf(100)).divide(full, 2, RoundingMode.HALF_UP); GradeRule overall = gradeFor(percentage, rules);
        ResultCalculation.WeightedResult weightedResult = weightedConfigured ? ResultCalculation.weightedGpa(weighted) : null;
        BigDecimal gpa = weightedConfigured ? weightedResult == null ? null : weightedResult.gpa()
                : overall.getGpa().setScale(2, RoundingMode.HALF_UP);
        CgpaValue cgpa = includeCgpa && scopePublished ? calculateCgpa(s, exam, student) : null;
        School school = schoolRepository.findById(s).orElse(null); AcademicYear academicYear = session(s, exam.getAcademicSessionId());
        return new Result(exam.getId(), exam.getName(), studentId, studentName(student), school == null ? "" : school.getName(),
                school == null ? null : school.getAddress(), school == null ? null : school.getPhone(), school == null ? null : school.getEmail(),
                 school != null && school.getLogo() != null ? "/api/saas/schools/" + school.getId() + "/logo" : null,
                 student.getPhoto(), student.getAdmissionNumber(), student.getRollNumber(), academicYear.getId(), academicYear.getName(),
                 exam.getStartsOn(), exam.getEndsOn(), exam.getResultPublishDate(), routines.getFirst().getClassId(), className(s, routines.getFirst().getClassId()),
                  routines.getFirst().getSectionId(), sectionName(s, routines.getFirst().getSectionId()), scopePublished, total, full, percentage,
                 weightedConfigured && weightedResult != null ? weightedResult.totalCredits() : null, gpa, cgpa == null ? null : cgpa.value(),
                 cgpa == null ? 0 : cgpa.periods(), overall.getGrade(), ResultCalculation.overallStatus(statuses),
                overall.getRemarks(), null, null, null, subjects);
    }

    private List<Result> publishedResults(Long s, Student student) {
        List<Exam> exams = examRepository.findAll(tenant(s)).stream().sorted(Comparator.comparing(Exam::getStartsOn).reversed()).toList();
        return exams.stream()
                .filter(exam -> studentScopeVisible(s, exam, student.getId()))
                .filter(exam -> hasRoutine(s, exam.getId(), student))
                .map(exam -> rankedResult(s, exam, student.getId())).toList();
    }

    private ChildResults childResults(Long s, Student student) {
        return new ChildResults(student.getId(), studentName(student), student.getAdmissionNumber(),
                className(s, student.getClassId()), sectionName(s, student.getSectionId()), publishedResults(s, student));
    }

    private TeacherAssignment teacherAssignment(Long s, ExamSubject routine) {
        Exam exam = exam(s, routine.getExamId());
        Subject subject = subjectRepository.findByIdAndSchoolIdAndDeletedFalse(routine.getSubjectId(), s).orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        return new TeacherAssignment(routine.getId(), exam.getId(), exam.getName(), routine.getExamDate(),
                subject.getSubjectName(), className(s, routine.getClassId()), sectionName(s, routine.getSectionId()),
                routine.getFullMarks(), routine.getPassMarks(), isScopePublished(s, exam.getId(), routine.getClassId(), routine.getSectionId()));
    }

    private boolean hasRoutine(Long s, Long examId, Student student) {
        Exam exam = exam(s, examId);
        return !studentRoutines(s, exam, student).isEmpty();
    }

    private String className(Long s, Long classId) { return classRepository.findByIdAndSchoolIdAndDeletedFalse(classId, s).map(SchoolClass::getName).orElse(""); }
    private String sectionName(Long s, Long sectionId) { return sectionRepository.findByIdAndSchoolIdAndDeletedFalse(sectionId, s).map(Section::getName).orElse(""); }
    private String studentName(Student student) { return (Objects.toString(student.getFirstName(), "") + " " + Objects.toString(student.getLastName(), "")).trim(); }
    private String assignmentKey(Long sessionId, Long classId, Long subjectId, Long sectionId) { return sessionId + ":" + classId + ":" + subjectId + ":" + sectionId; }

    private ExamClassAssignment saveScope(Long s, Long examId, Long classId, Long sectionId) {
        ExamClassAssignment scope = new ExamClassAssignment(); scope.setSchoolId(s); scope.setExamId(examId);
        scope.setClassId(classId); scope.setSectionId(sectionId); scope.setPublished(false); scope.setDeleted(false);
        return examClassAssignmentRepository.save(scope);
    }

    private ExamClassAssignment ensureConcreteScope(Long s, Long examId, Long classId, Long sectionId) {
        return examClassAssignmentRepository.lockConcreteScope(s, examId, classId, sectionId)
                .orElseGet(() -> {
                    saveScope(s, examId, classId, sectionId);
                    examClassAssignmentRepository.flush();
                    return lockExactScope(s, examId, classId, sectionId);
                });
    }

    private ExamClassAssignment exactScope(Long s, Long examId, Long classId, Long sectionId) {
        return examClassAssignmentRepository.findBySchoolIdAndExamIdAndClassIdAndSectionIdAndDeletedFalse(s, examId, classId, sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination publication scope not found"));
    }

    private ExamClassAssignment lockExactScope(Long s, Long examId, Long classId, Long sectionId) {
        return examClassAssignmentRepository.lockConcreteScope(s, examId, classId, sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination publication scope not found"));
    }

    private boolean isScopePublished(Long s, Long examId, Long classId, Long sectionId) {
        return classId != null && sectionId != null && examClassAssignmentRepository
                .existsBySchoolIdAndExamIdAndClassIdAndSectionIdAndPublishedTrueAndDeletedFalse(s, examId, classId, sectionId);
    }

    private boolean hasAnyPublishedScope(Long s, Long examId) {
        return examClassAssignmentRepository.existsBySchoolIdAndExamIdAndSectionIdIsNotNullAndPublishedTrueAndDeletedFalse(s, examId);
    }

    private void ensureNoPublishedScopes(Long s, Long examId) {
        if (hasAnyPublishedScope(s, examId)) throw new IllegalArgumentException("Exam with published result scopes cannot be edited");
    }

    private void ensureScopeUnlocked(Long s, Long examId, Long classId, Long sectionId) {
        if (scopeLocked(lockExactScope(s, examId, classId, sectionId).isPublished())) throw new IllegalArgumentException("Published result scope cannot be edited");
    }

    private void cleanupConcreteScope(Long s, Long examId, Long classId, Long sectionId, Long excludedRoutineId) {
        boolean remains = examSubjectRepository.findBySchoolIdAndExamIdAndClassIdAndSectionIdAndDeletedFalse(s, examId, classId, sectionId).stream()
                .anyMatch(routine -> !Objects.equals(routine.getId(), excludedRoutineId));
        if (!remains) examClassAssignmentRepository.findBySchoolIdAndExamIdAndClassIdAndSectionIdAndDeletedFalse(s, examId, classId, sectionId)
                .filter(scope -> !scope.isPublished()).ifPresent(examClassAssignmentRepository::delete);
    }

    private void publishScopeInternal(Long s, Exam exam, ExamClassAssignment scope) {
        List<ExamSubject> routines = examSubjectRepository.findBySchoolIdAndExamIdAndClassIdAndSectionIdAndDeletedFalse(
                s, exam.getId(), scope.getClassId(), scope.getSectionId());
        if (routines.isEmpty()) throw new IllegalArgumentException("Publication scope has no routine");
        GradingSystem gradingSystem = activeGradingSystem(s, exam.getAcademicSessionId());
        List<GradeRule> rules = rulesForSystem(s, gradingSystem.getId());
        for (ExamSubject routine : routines) snapshotRoutine(s, exam, routine, gradingSystem, rules);
        scope.setPublished(true); scope.setPublishedAt(LocalDateTime.now()); examClassAssignmentRepository.save(scope);
        aggregatePublication(s, exam);
    }

    private void snapshotRoutine(Long s, Exam exam, ExamSubject routine, GradingSystem gradingSystem, List<GradeRule> rules) {
        Subject subject = subjectRepository.findByIdAndSchoolIdAndDeletedFalse(routine.getSubjectId(), s).orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        SubjectAcademicConfig config = subjectAcademicConfigRepository.findBySchoolIdAndAcademicSessionIdAndClassIdAndSubjectId(
                s, exam.getAcademicSessionId(), routine.getClassId(), routine.getSubjectId()).filter(c -> !c.isDeleted()).orElse(null);
        boolean classConfigured = !subjectAcademicConfigRepository.findBySchoolIdAndAcademicSessionIdAndClassIdAndDeletedFalse(
                s, exam.getAcademicSessionId(), routine.getClassId()).isEmpty();
        routine.setCreditHoursSnapshot(config != null ? config.getCreditHours() : positive(subject.getCreditHours()));
        routine.setIncludeInGpaSnapshot(config == null ? classConfigured ? false : null : config.isIncludeInGpa());
        routine.setIncludeInCgpaSnapshot(config == null ? classConfigured ? false : null : config.isIncludeInCgpa());
        routine.setGradingSystemIdSnapshot(gradingSystem.getId()); examSubjectRepository.save(routine);
        List<Mark> routineMarks = markRepository.findBySchoolIdAndExamSubjectIdInAndDeletedFalse(s, List.of(routine.getId()));
        Set<Long> marked = routineMarks.stream().map(Mark::getStudentId).collect(Collectors.toSet());
        long missing = activeStudents(s, routine.getClassId(), routine.getSectionId()).stream().map(Student::getId).filter(id -> !marked.contains(id)).count();
        if (missing > 0) throw new IllegalArgumentException("Incomplete marks for routine " + routine.getId() + "; missing " + missing + " active students");
        for (Mark mark : routineMarks) {
            applyGrade(mark, routine, rules);
            mark.setQualityPoints(Boolean.TRUE.equals(routine.getIncludeInGpaSnapshot()) && routine.getCreditHoursSnapshot() != null
                    ? mark.getGpa().multiply(routine.getCreditHoursSnapshot()) : null);
            markRepository.save(mark);
        }
    }

    private Exam aggregatePublication(Long s, Exam exam) {
        List<Boolean> states = examClassAssignmentRepository.findBySchoolIdAndExamIdAndSectionIdIsNotNullAndDeletedFalse(s, exam.getId()).stream()
                .map(ExamClassAssignment::isPublished).toList();
        boolean all = aggregatePublished(states); exam.setPublished(all); exam.setStatus(all ? "COMPLETED" : "ACTIVE"); return examRepository.save(exam);
    }

    private PublicationScope publicationScope(Long s, Exam exam, ExamClassAssignment scope) {
        List<ExamSubject> routines = examSubjectRepository.findBySchoolIdAndExamIdAndClassIdAndSectionIdAndDeletedFalse(
                s, exam.getId(), scope.getClassId(), scope.getSectionId());
        if (scope.isPublished()) {
            Set<Long> markedStudents = routines.isEmpty() ? Set.of() : markRepository
                    .findBySchoolIdAndExamSubjectIdInAndDeletedFalse(s, routines.stream().map(ExamSubject::getId).toList()).stream()
                    .map(Mark::getStudentId).collect(Collectors.toSet());
            return new PublicationScope(exam.getId(), scope.getClassId(), className(s, scope.getClassId()), scope.getSectionId(), sectionName(s, scope.getSectionId()),
                    routines.size(), markedStudents.size(), 0, publishedScopeComplete(!routines.isEmpty()), true, scope.getPublishedAt());
        }
        long students = activeStudents(s, scope.getClassId(), scope.getSectionId()).size();
        long missing = routines.stream().mapToLong(routine -> {
            Set<Long> marked = markRepository.findBySchoolIdAndExamSubjectIdInAndDeletedFalse(s, List.of(routine.getId())).stream().map(Mark::getStudentId).collect(Collectors.toSet());
            return activeStudents(s, scope.getClassId(), scope.getSectionId()).stream().filter(student -> !marked.contains(student.getId())).count();
        }).sum();
        return new PublicationScope(exam.getId(), scope.getClassId(), className(s, scope.getClassId()), scope.getSectionId(), sectionName(s, scope.getSectionId()),
                routines.size(), students, missing, !routines.isEmpty() && missing == 0, scope.isPublished(), scope.getPublishedAt());
    }

    private boolean teacherCanScope(Long s, Exam exam, Long classId, Long sectionId) {
        if (!security.hasRole(RoleName.TEACHER)) return true;
        return examSubjectRepository.findBySchoolIdAndExamIdAndClassIdAndSectionIdAndDeletedFalse(s, exam.getId(), classId, sectionId).stream()
                .anyMatch(routine -> { try { enforceTeacherAssignment(s, routine, null); return true; } catch (ForbiddenException exception) { return false; } });
    }

    private boolean teacherCanRoutine(Long s, ExamSubject routine) {
        try { enforceTeacherAssignment(s, routine, null); return true; }
        catch (ForbiddenException exception) { return false; }
    }

    private boolean scopeResultsVisible(Long s, Exam exam, Long classId, Long sectionId) {
        return scopeVisible(isScopePublished(s, exam.getId(), classId, sectionId), exam.getResultPublishDate(), LocalDate.now());
    }

    private boolean studentScopeVisible(Long s, Exam exam, Long studentId) {
        Student student = studentRepository.findByIdAndSchoolIdAndDeletedFalse(studentId, s).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        List<ExamSubject> routines = studentRoutines(s, exam, student, student.getClassId(), student.getSectionId(), true);
        return !routines.isEmpty() && scopeResultsVisible(s, exam, routines.getFirst().getClassId(), routines.getFirst().getSectionId());
    }

    private void validateExam(Long s, Long id, ExamRequest r) {
        session(s, r.academicSessionId());
        if (r.examTypeId() == null) throw new IllegalArgumentException("Exam type is required");
        ExamType examType = examTypeRepository.findByIdAndSchoolIdAndDeletedFalse(r.examTypeId(), s).orElseThrow(() -> new IllegalArgumentException("Exam type not found"));
        boolean unchangedType = id != null && examRepository.findByIdAndSchoolIdAndDeletedFalse(id, s).map(exam -> Objects.equals(exam.getExamTypeId(), examType.getId())).orElse(false);
        if (!examType.isActive() && !unchangedType) throw new IllegalArgumentException("Active exam type is required");
        if (!r.endsOn().isAfter(r.startsOn())) throw new IllegalArgumentException("Exam end date must be after start date");
        if (r.resultPublishDate().isBefore(r.endsOn())) throw new IllegalArgumentException("Result publish date cannot precede the examination end date");
        boolean duplicate = id == null ? examRepository.existsBySchoolIdAndAcademicSessionIdAndNameIgnoreCaseAndDeletedFalse(s, r.academicSessionId(), r.name().trim()) : examRepository.existsBySchoolIdAndAcademicSessionIdAndNameIgnoreCaseAndIdNotAndDeletedFalse(s, r.academicSessionId(), r.name().trim(), id);
        if (duplicate) throw new IllegalArgumentException("Exam name already exists in this academic session"); normalizeStatus(r.status());
    }

    private void validateRoutine(Long s, Long id, RoutineRequest r) {
        Exam exam = exam(s, r.examId()); ensureScopeUnlocked(s, r.examId(), r.classId(), r.sectionId());
        if (r.examDate().isBefore(exam.getStartsOn()) || r.examDate().isAfter(exam.getEndsOn())) throw new IllegalArgumentException("Routine date must be within exam dates");
        if (!r.endTime().isAfter(r.startTime())) throw new IllegalArgumentException("Routine end time must be after start time");
        if (r.passMarks().compareTo(r.fullMarks()) > 0) throw new IllegalArgumentException("Pass marks cannot exceed full marks");
        SchoolClass clazz = classRepository.findByIdAndSchoolIdAndDeletedFalse(r.classId(), s).orElseThrow(() -> new IllegalArgumentException("Class not found"));
        Section section = sectionRepository.findByIdAndSchoolIdAndDeletedFalse(r.sectionId(), s).orElseThrow(() -> new IllegalArgumentException("Section not found"));
        Subject subject = subjectRepository.findByIdAndSchoolIdAndDeletedFalse(r.subjectId(), s).orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        if (examClassAssignmentRepository.findBySchoolIdAndExamIdAndClassIdAndSectionIdIsNullAndDeletedFalse(s, exam.getId(), clazz.getId()).isEmpty()) throw new IllegalArgumentException("Class is not assigned to this exam");
        if (!section.getClassId().equals(clazz.getId()) || !subject.getClassId().equals(clazz.getId())) throw new IllegalArgumentException("Class, section and subject do not match");
        if (r.invigilatorId() != null) teacherRepository.findByIdAndSchoolIdAndDeletedFalse(r.invigilatorId(), s).orElseThrow(() -> new IllegalArgumentException("Invigilator not found"));
        boolean duplicate = id == null
                ? examSubjectRepository.existsBySchoolIdAndExamIdAndClassIdAndSectionIdAndSubjectIdAndDeletedFalse(s, r.examId(), r.classId(), r.sectionId(), r.subjectId())
                : examSubjectRepository.existsBySchoolIdAndExamIdAndClassIdAndSectionIdAndSubjectIdAndIdNotAndDeletedFalse(s, r.examId(), r.classId(), r.sectionId(), r.subjectId(), id);
        if (duplicate) throw new IllegalArgumentException("Subject already exists in this section routine");
        for (ExamSubject other : examSubjectRepository.findBySchoolIdAndExamIdAndDeletedFalseOrderByExamDateAscStartTimeAsc(s, r.examId())) {
            if (Objects.equals(other.getId(), id) || !other.getExamDate().equals(r.examDate()) || !overlaps(r.startTime(), r.endTime(), other.getStartTime(), other.getEndTime())) continue;
            if (Objects.equals(other.getSectionId(), r.sectionId())) throw new IllegalArgumentException("Section has an overlapping examination");
            if (text(r.room()) != null && r.room().trim().equalsIgnoreCase(Objects.toString(other.getRoom(), ""))) throw new IllegalArgumentException("Room is already occupied");
            if (r.invigilatorId() != null && r.invigilatorId().equals(other.getInvigilatorId())) throw new IllegalArgumentException("Invigilator has an overlapping examination");
        }
    }

    private void enforceTeacherAssignment(Long s, ExamSubject routine, Long requestedTeacherId) {
        if (!security.hasRole(RoleName.TEACHER)) return;
        Teacher teacher = currentActiveTeacher(s);
        if (requestedTeacherId != null && !requestedTeacherId.equals(teacher.getId())) throw new ForbiddenException("Cannot use another teacher's assignment");
        Exam exam = exam(s, routine.getExamId());
        teacherSubjectRepository.findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndSubjectIdAndTeacherIdAndDeletedFalse(
                s, exam.getAcademicSessionId(), routine.getClassId(), routine.getSectionId(), routine.getSubjectId(), teacher.getId())
                .orElseThrow(() -> new ForbiddenException("Teacher is not assigned to this academic session, class, section, and subject"));
    }

    private void enforceExamTeacher(Long s, Exam exam) {
        if (!security.hasRole(RoleName.TEACHER)) return;
        boolean assigned = examSubjectRepository.findBySchoolIdAndExamIdAndDeletedFalseOrderByExamDateAscStartTimeAsc(s, exam.getId()).stream().anyMatch(routine -> {
            try { enforceTeacherAssignment(s, routine, null); return true; } catch (ForbiddenException ex) { return false; }
        });
        if (!assigned) throw new ForbiddenException("Teacher has no assignment in this exam");
    }

    private void authorizeResult(Long s, Exam exam, Long studentId) {
        if (security.hasRole(RoleName.SCHOOL_ADMIN) || security.hasRole(RoleName.SUPER_ADMIN)) return;
        if (!studentScopeVisible(s, exam, studentId)) throw new ForbiddenException("Results are not published");
        if (!canAccessStudent(s, exam, studentId)) throw new ForbiddenException("Result access denied");
    }

    private boolean canAccessStudent(Long s, Exam exam, Long studentId) {
        Student student = studentRepository.findByIdAndSchoolIdAndDeletedFalse(studentId, s).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        if (security.hasRole(RoleName.SCHOOL_ADMIN) || security.hasRole(RoleName.SUPER_ADMIN)) return true;
        if (security.hasRole(RoleName.STUDENT)) return Objects.equals(student.getUserId(), security.currentUser().getId());
        if (security.hasRole(RoleName.PARENT)) return parentRepository.findBySchoolIdAndUserIdAndDeletedFalse(s, security.currentUser().getId()).map(parent -> Objects.equals(student.getParentId(), parent.getId())).orElse(false);
        if (security.hasRole(RoleName.TEACHER)) return examSubjectRepository.findBySchoolIdAndExamIdAndClassIdAndSectionIdAndDeletedFalse(s, exam.getId(), student.getClassId(), student.getSectionId()).stream().anyMatch(r -> { try { enforceTeacherAssignment(s, r, null); return true; } catch (ForbiddenException ex) { return false; } });
        return false;
    }

    private void applyGrade(Mark mark, ExamSubject routine, List<GradeRule> rules) {
        BigDecimal pct = mark.getObtainedMarks().multiply(BigDecimal.valueOf(100)).divide(routine.getFullMarks(), 4, RoundingMode.HALF_UP); GradeRule rule = gradeFor(pct, rules);
        mark.setSubjectPercentage(pct); mark.setGrade(mark.isAbsent() ? "-" : rule.getGrade()); mark.setGpa(mark.isAbsent() ? BigDecimal.ZERO : rule.getGpa());
        mark.setResultStatus(ResultCalculation.subjectStatus(mark.isAbsent(), mark.getObtainedMarks().compareTo(routine.getPassMarks()) >= 0, rule.isPassing(), rule.getGrade()));
        mark.setResultRemarks(rule.getRemarks());
    }

    private GradingSystem activeGradingSystem(Long s, Long sessionId) { return gradingSystemRepository.findBySchoolIdAndAcademicSessionIdAndActiveTrueAndDeletedFalse(s, sessionId).orElseThrow(() -> new IllegalArgumentException("No active grading system for the academic session")); }
    private List<GradeRule> activeRules(Long s, Long sessionId) { return rulesForSystem(s, activeGradingSystem(s, sessionId).getId()); }
    private List<GradeRule> rulesForSystem(Long s, Long systemId) { List<GradeRule> rules = gradeRuleRepository.findBySchoolIdAndGradingSystemIdAndDeletedFalseOrderByMinPercentageAsc(s, systemId); validateCoverage(rules); return rules; }
    private GradeRule gradeFor(BigDecimal pct, List<GradeRule> rules) { return rules.stream().filter(r -> ResultCalculation.gradeRangeContains(pct, r.getMinPercentage(), r.getMaxPercentage())).findFirst().orElseThrow(() -> new IllegalArgumentException("No grade rule covers percentage " + pct)); }
    private void validateCoverage(List<GradeRule> rules) { if (rules.isEmpty() || rules.getFirst().getMinPercentage().compareTo(BigDecimal.ZERO) != 0 || rules.getLast().getMaxPercentage().compareTo(BigDecimal.valueOf(100)) != 0) throw new IllegalArgumentException("Grade rules must fully cover 0 through 100"); for (int i=0;i<rules.size();i++) { GradeRule r=rules.get(i); if (r.getMaxPercentage().compareTo(r.getMinPercentage())<=0 || (i>0 && rules.get(i-1).getMaxPercentage().compareTo(r.getMinPercentage())!=0)) throw new IllegalArgumentException("Grade rules contain a gap or overlap"); } }
    private void validateNoOverlap(Long s, Long systemId, Long id, GradeRule candidate) { for (GradeRule rule : gradeRuleRepository.findBySchoolIdAndGradingSystemIdAndDeletedFalseOrderByMinPercentageAsc(s, systemId)) if (!Objects.equals(rule.getId(), id) && candidate.getMinPercentage().compareTo(rule.getMaxPercentage()) < 0 && candidate.getMaxPercentage().compareTo(rule.getMinPercentage()) > 0) throw new IllegalArgumentException("Grade rule overlaps an existing range"); }
    private void validateMark(MarkInput input, ExamSubject routine) { if (!input.absent() && input.obtainedMarks() == null) throw new IllegalArgumentException("Obtained marks are required unless absent"); if (input.obtainedMarks() != null && (input.obtainedMarks().compareTo(BigDecimal.ZERO)<0 || input.obtainedMarks().compareTo(routine.getFullMarks())>0)) throw new IllegalArgumentException("Marks must be between 0 and " + routine.getFullMarks()); }
    private void copyExam(Exam e, ExamRequest r) { e.setAcademicSessionId(r.academicSessionId()); e.setExamTypeId(r.examTypeId()); e.setName(r.name().trim()); e.setStartsOn(r.startsOn()); e.setEndsOn(r.endsOn()); e.setResultPublishDate(r.resultPublishDate()); e.setDescription(text(r.description())); e.setStatus(normalizeStatus(r.status())); e.setIncludeInCgpa(Boolean.TRUE.equals(r.includeInCgpa())); }
    private void copyRoutine(ExamSubject e, RoutineRequest r) { e.setExamId(r.examId()); e.setClassId(r.classId()); e.setSectionId(r.sectionId()); e.setSubjectId(r.subjectId()); e.setExamDate(r.examDate()); e.setStartTime(r.startTime()); e.setEndTime(r.endTime()); e.setRoom(text(r.room())); e.setInvigilatorId(r.invigilatorId()); e.setFullMarks(r.fullMarks()); e.setPassMarks(r.passMarks()); }
    private Exam exam(Long s, Long id) { return examRepository.findByIdAndSchoolIdAndDeletedFalse(id, s).orElseThrow(() -> new ResourceNotFoundException("Exam not found")); }
    private ExamSubject routineById(Long s, Long id) { return examSubjectRepository.findByIdAndSchoolIdAndDeletedFalse(id, s).orElseThrow(() -> new ResourceNotFoundException("Exam routine not found")); }
    private AcademicYear session(Long s, Long id) { return academicYearRepository.findByIdAndSchoolIdAndDeletedFalse(id, s).orElseThrow(() -> new ResourceNotFoundException("Academic session not found")); }
    private GradingSystem gradingSystem(Long s, Long id) { return gradingSystemRepository.findByIdAndSchoolIdAndDeletedFalse(id, s).orElseThrow(() -> new ResourceNotFoundException("Grading system not found")); }
    private GradeRule rule(Long s, Long systemId, Long id) { GradeRule r=gradeRuleRepository.findByIdAndSchoolIdAndDeletedFalse(id,s).orElseThrow(() -> new ResourceNotFoundException("Grade rule not found")); if (!r.getGradingSystemId().equals(systemId)) throw new ResourceNotFoundException("Grade rule not found"); return r; }

    private List<SubjectAcademicConfigRow> subjectAcademicConfigRows(Long s, Long sessionId, Long classId) {
        Map<Long, SubjectAcademicConfig> configured = subjectAcademicConfigRepository
                .findBySchoolIdAndAcademicSessionIdAndClassIdAndDeletedFalse(s, sessionId, classId).stream()
                .collect(Collectors.toMap(SubjectAcademicConfig::getSubjectId, Function.identity()));
        return activeClassSubjects(s, classId).stream().map(subject -> academicConfigRow(sessionId, classId, subject, configured.get(subject.getId()))).toList();
    }

    private SubjectAcademicConfigRow academicConfigRow(Long sessionId, Long classId, Subject subject, SubjectAcademicConfig config) {
        BigDecimal legacy = positive(subject.getCreditHours());
        return new SubjectAcademicConfigRow(sessionId, classId, subject.getId(), subject.getSubjectCode(), subject.getSubjectName(),
                config == null ? legacy : config.getCreditHours(), config != null && config.isIncludeInGpa(),
                config != null && config.isIncludeInCgpa(), config != null, config == null && legacy != null);
    }

    private void validateAcademicConfigScope(Long s, Long sessionId, Long classId) {
        session(s, sessionId);
        classRepository.findByIdAndSchoolIdAndDeletedFalse(classId, s).orElseThrow(() -> new ResourceNotFoundException("Class not found"));
    }

    private List<Subject> activeClassSubjects(Long s, Long classId) {
        return subjectRepository.findBySchoolIdAndClassIdAndDeletedFalse(s, classId, Pageable.unpaged()).getContent().stream()
                .filter(subject -> "ACTIVE".equalsIgnoreCase(subject.getStatus())).sorted(Comparator.comparing(Subject::getSubjectName, String.CASE_INSENSITIVE_ORDER)).toList();
    }

    private void ensureGradingSystemMutable(Long s, Long systemId) {
        if (examSubjectRepository.existsSnapshotForGradingSystem(s, systemId))
            throw new IllegalArgumentException("Grading system is used by published results and cannot be changed");
    }

    private List<GradeRule> resultRules(Long s, Exam exam, List<ExamSubject> routines) {
        if (!routines.isEmpty() && isScopePublished(s, exam.getId(), routines.getFirst().getClassId(), routines.getFirst().getSectionId())) {
            Set<Long> snapshotIds = routines.stream().map(ExamSubject::getGradingSystemIdSnapshot).filter(Objects::nonNull).collect(Collectors.toSet());
            if (snapshotIds.size() == 1) return rulesForSystem(s, snapshotIds.iterator().next());
        }
        return activeRules(s, exam.getAcademicSessionId());
    }

    private BigDecimal previewCredit(Long s, Exam exam, ExamSubject routine, Subject subject) {
        Optional<SubjectAcademicConfig> config = subjectAcademicConfigRepository.findBySchoolIdAndAcademicSessionIdAndClassIdAndSubjectId(
                s, exam.getAcademicSessionId(), routine.getClassId(), routine.getSubjectId()).filter(item -> !item.isDeleted());
        return config.isPresent() ? config.get().getCreditHours() : positive(subject.getCreditHours());
    }

    private boolean previewIncludeInGpa(Long s, Exam exam, ExamSubject routine) {
        return subjectAcademicConfigRepository.findBySchoolIdAndAcademicSessionIdAndClassIdAndSubjectId(
                s, exam.getAcademicSessionId(), routine.getClassId(), routine.getSubjectId()).filter(config -> !config.isDeleted())
                .map(SubjectAcademicConfig::isIncludeInGpa).orElse(false);
    }

    private record CgpaValue(BigDecimal value, int periods) {}

    private CgpaValue calculateCgpa(Long s, Exam currentExam, Student student) {
        List<ResultCalculation.WeightedValue> values = new ArrayList<>();
        int periods = 0;
        for (Exam period : examRepository.findBySchoolIdAndAcademicSessionIdAndDeletedFalse(s, currentExam.getAcademicSessionId())) {
            if (!period.isIncludeInCgpa() || resultDate(period).isAfter(resultDate(currentExam))) continue;
            List<ExamSubject> periodRoutines = studentRoutines(s, period, student, student.getClassId(), student.getSectionId(), true);
            if (periodRoutines.isEmpty() || !scopeResultsVisible(s, period, periodRoutines.getFirst().getClassId(), periodRoutines.getFirst().getSectionId())) continue;
            List<ExamSubject> routines = periodRoutines.stream()
                    .filter(routine -> Boolean.TRUE.equals(routine.getIncludeInCgpaSnapshot())).toList();
            if (routines.isEmpty() || routines.stream().anyMatch(routine -> positive(routine.getCreditHoursSnapshot()) == null)) continue;
            Map<Long, Mark> marks = markRepository.findBySchoolIdAndExamSubjectIdInAndDeletedFalse(s, routines.stream().map(ExamSubject::getId).toList()).stream()
                    .filter(mark -> mark.getStudentId().equals(student.getId())).collect(Collectors.toMap(Mark::getExamSubjectId, Function.identity()));
            if (marks.size() != routines.size() || marks.values().stream().anyMatch(mark -> mark.getObtainedMarks() == null
                    || mark.getGpa() == null || mark.getResultStatus() == null)) continue;
            periods++;
            for (ExamSubject routine : routines) values.add(new ResultCalculation.WeightedValue(
                    marks.get(routine.getId()).getGpa(), routine.getCreditHoursSnapshot(), true));
        }
        if (periods < 2) return null;
        ResultCalculation.WeightedResult result = ResultCalculation.weightedGpa(values);
        return result == null ? null : new CgpaValue(result.gpa(), periods);
    }

    private static BigDecimal positive(BigDecimal value) { return value != null && value.signum() > 0 ? value : null; }
    private boolean hasExplicitAcademicConfiguration(Long s, Exam exam, List<ExamSubject> routines) {
        if (!routines.isEmpty() && isScopePublished(s, exam.getId(), routines.getFirst().getClassId(), routines.getFirst().getSectionId())) return routines.stream().anyMatch(routine -> routine.getIncludeInGpaSnapshot() != null);
        return routines.stream().map(ExamSubject::getClassId).distinct().anyMatch(classId -> !subjectAcademicConfigRepository
                .findBySchoolIdAndAcademicSessionIdAndClassIdAndDeletedFalse(s, exam.getAcademicSessionId(), classId).isEmpty());
    }
    private List<ExamSubject> studentRoutines(Long s, Exam exam, Student student) {
        return studentRoutines(s, exam, student, null, null, false);
    }
    private List<ExamSubject> studentRoutines(Long s, Exam exam, Student student, Long requestedClassId, Long requestedSectionId, boolean currentOnly) {
        List<ExamSubject> all = examSubjectRepository.findBySchoolIdAndExamIdAndDeletedFalseOrderByExamDateAscStartTimeAsc(s, exam.getId());
        if (requestedClassId != null || requestedSectionId != null) {
            if (requestedClassId == null || requestedSectionId == null) throw new IllegalArgumentException("Both classId and sectionId are required for an exact result scope");
            return all.stream().filter(routine -> requestedClassId.equals(routine.getClassId()) && requestedSectionId.equals(routine.getSectionId())).toList();
        }
        List<ExamSubject> current = all.stream().filter(routine -> Objects.equals(student.getClassId(), routine.getClassId())
                && Objects.equals(student.getSectionId(), routine.getSectionId())).toList();
        if (currentOnly || !current.isEmpty()) return current;
        Set<Long> markedRoutineIds = all.isEmpty() ? Set.of() : markRepository.findBySchoolIdAndExamSubjectIdInAndDeletedFalse(s,
                        all.stream().map(ExamSubject::getId).toList()).stream()
                .filter(mark -> mark.getStudentId().equals(student.getId())).map(Mark::getExamSubjectId).collect(Collectors.toSet());
        List<ExamSubject> historical = all.stream().filter(routine -> markedRoutineIds.contains(routine.getId())).toList();
        Set<ResultScope> scopes = historical.stream().map(routine -> new ResultScope(routine.getClassId(), routine.getSectionId())).collect(Collectors.toCollection(TreeSet::new));
        ResultScope selected = selectHistoricalScope(scopes);
        return historical.stream().filter(routine -> selected.classId().equals(routine.getClassId()) && selected.sectionId().equals(routine.getSectionId())).toList();
    }
    private LocalDate resultDate(Exam exam) { return exam.getResultPublishDate() == null ? exam.getEndsOn() : exam.getResultPublishDate(); }
    private String persistedStatus(Mark mark) {
        if (mark.isAbsent()) return "ABSENT";
        return text(mark.getResultStatus()) == null ? "FAIL" : mark.getResultStatus().toUpperCase();
    }
    private String reportGroup(Long s, Exam exam, ExamSubject routine, Mark mark, List<GradeRule> rules) {
        if (isScopePublished(s, exam.getId(), routine.getClassId(), routine.getSectionId())) {
            String status = persistedStatus(mark);
            return "ABSENT".equals(status) || "NG".equals(status) ? status : Objects.toString(mark.getGrade(), "UNAVAILABLE");
        }
        if (mark.isAbsent()) return "ABSENT";
        BigDecimal percentage = mark.getObtainedMarks().multiply(BigDecimal.valueOf(100)).divide(routine.getFullMarks(), 4, RoundingMode.HALF_UP);
        GradeRule rule = gradeFor(percentage, rules);
        return "NG".equals(ResultCalculation.subjectStatus(false, mark.getObtainedMarks().compareTo(routine.getPassMarks()) >= 0,
                rule.isPassing(), rule.getGrade())) ? "NG" : rule.getGrade();
    }
    private ExamSubject findRoutine(Long s, Long examId, Long classId, Long sectionId, Long subjectId) { return examSubjectRepository.findBySchoolIdAndExamIdAndClassIdAndSectionIdAndDeletedFalse(s, examId, classId, sectionId).stream().filter(r -> r.getSubjectId().equals(subjectId)).findFirst().orElseThrow(() -> new ResourceNotFoundException("Exam routine not found")); }
    private List<Student> activeStudents(Long s, Long classId, Long sectionId) { return studentRepository.findBySchoolIdAndClassIdAndSectionIdAndStatusIgnoreCaseAndDeletedFalseOrderByFirstNameAsc(s, classId, sectionId, "ACTIVE"); }
    private Set<Long> examStudents(Long s, Exam exam) {
        List<ExamSubject> routines = examSubjectRepository.findBySchoolIdAndExamIdAndDeletedFalseOrderByExamDateAscStartTimeAsc(s, exam.getId());
        Set<Long> ids = new LinkedHashSet<>();
        for (ExamSubject routine : routines) {
            if (isScopePublished(s, exam.getId(), routine.getClassId(), routine.getSectionId()))
                markRepository.findBySchoolIdAndExamSubjectIdInAndDeletedFalse(s, List.of(routine.getId())).forEach(mark -> ids.add(mark.getStudentId()));
            else activeStudents(s, routine.getClassId(), routine.getSectionId()).forEach(student -> ids.add(student.getId()));
        }
        return ids;
    }
    private RosterRow rosterRow(Student s, Mark m) { return new RosterRow(s.getId(), s.getAdmissionNumber(), s.getRollNumber(), (s.getFirstName()+" "+s.getLastName()).trim(), m==null?null:m.getObtainedMarks(), m!=null&&m.isAbsent(), m==null?null:m.getGrade(), m==null?null:m.getGpa(), m==null?"NOT_MARKED":m.getResultStatus()); }
    private ReportRow reportRow(ExamSubject r, Subject s, String grade, List<Mark> marks) { long passed=marks.stream().filter(m->"PASS".equals(m.getResultStatus())).count(); List<BigDecimal> values=marks.stream().map(Mark::getObtainedMarks).toList(); return new ReportRow(s.getId(),s.getSubjectName(),r.getClassId(),r.getSectionId(),grade,marks.size(),passed,marks.size()-passed,BigDecimal.valueOf(passed*100.0/marks.size()).setScale(2,RoundingMode.HALF_UP),average(values),values.stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO),values.stream().min(BigDecimal::compareTo).orElse(BigDecimal.ZERO)); }
    private Map<String, BigDecimal> reportPublishedSubjectAverages(Long schoolId, List<Exam> exams) {
        Map<String, List<BigDecimal>> values = new LinkedHashMap<>();
        for (Exam exam : exams.stream().filter(item -> hasAnyPublishedScope(schoolId, item.getId())).toList()) {
            for (ReportRow row : report(schoolId, exam.getId())) values.computeIfAbsent(row.subjectName(), key -> new ArrayList<>()).add(row.average());
        }
        return values.entrySet().stream().collect(Collectors.toMap(Map.Entry::getKey, entry -> average(entry.getValue()), (left, right) -> right, LinkedHashMap::new));
    }
    private Map<Long, Integer> denseRanks(List<Result> results) {
        List<Result> ordered = results.stream().sorted(Comparator.comparing(Result::percentage).reversed()).toList();
        Map<Long, Integer> ranks = new HashMap<>(); BigDecimal previous = null; int rank = 0;
        for (Result result : ordered) {
            if (previous == null || previous.compareTo(result.percentage()) != 0) { rank++; previous = result.percentage(); }
            ranks.put(result.studentId(), rank);
        }
        return ranks;
    }
    private BigDecimal average(List<BigDecimal> values) { return values.isEmpty()?BigDecimal.ZERO:values.stream().reduce(BigDecimal.ZERO,BigDecimal::add).divide(BigDecimal.valueOf(values.size()),2,RoundingMode.HALF_UP); }
    private Specification<Exam> tenant(Long s) { return (r,q,b)->b.and(b.equal(r.get("schoolId"),s),b.isFalse(r.get("deleted"))); }
    static boolean aggregatePublished(List<Boolean> concreteScopes) { return !concreteScopes.isEmpty() && concreteScopes.stream().allMatch(Boolean.TRUE::equals); }
    static boolean scopeVisible(boolean published, LocalDate publishDate, LocalDate today) { return published && publishDate != null && !publishDate.isAfter(today); }
    static boolean scopeLocked(boolean published) { return published; }
    static boolean publishedScopeComplete(boolean hasRoutines) { return hasRoutines; }
    static record ResultScope(Long classId, Long sectionId) implements Comparable<ResultScope> {
        @Override public int compareTo(ResultScope other) {
            int byClass = Comparator.nullsFirst(Long::compareTo).compare(classId, other.classId);
            return byClass != 0 ? byClass : Comparator.nullsFirst(Long::compareTo).compare(sectionId, other.sectionId);
        }
    }
    static ResultScope selectHistoricalScope(Set<ResultScope> scopes) {
        if (scopes.isEmpty()) throw new ResourceNotFoundException("Student has no subjects in this exam");
        if (scopes.size() > 1) throw new IllegalArgumentException("Ambiguous historical result scope; specify classId and sectionId");
        return scopes.iterator().next();
    }
    private static void requireExactOptionalScope(Long classId, Long sectionId) {
        if ((classId == null) != (sectionId == null)) throw new IllegalArgumentException("Both classId and sectionId are required for an exact result scope");
    }
    static <T> List<T> filterScope(List<T> values, Function<T, Long> classId, Function<T, Long> sectionId, Long requestedClassId, Long requestedSectionId) {
        return values.stream().filter(value -> requestedClassId == null || requestedClassId.equals(classId.apply(value)))
                .filter(value -> requestedSectionId == null || requestedSectionId.equals(sectionId.apply(value))).toList();
    }
    private void requireAdmin() { if(!security.hasRole(RoleName.SCHOOL_ADMIN)&&!security.hasRole(RoleName.SUPER_ADMIN)) throw new ForbiddenException("School administrator role required"); }
    private void requireStaff() { if(!security.hasRole(RoleName.TEACHER)&&!security.hasRole(RoleName.SCHOOL_ADMIN)&&!security.hasRole(RoleName.SUPER_ADMIN)) throw new ForbiddenException("Staff role required"); }
    private void requireRole(RoleName role, String message) { if (!security.hasRole(role)) throw new ForbiddenException(message); }
    private Teacher currentActiveTeacher(Long s) { return teacherRepository.findBySchoolIdAndUserIdAndStatusIgnoreCaseAndDeletedFalse(s, security.currentUser().getId(), "ACTIVE").orElseThrow(() -> new ForbiddenException("Active teacher profile required")); }
    private String normalizeStatus(String value) { String status=text(value)==null?"UPCOMING":value.trim().toUpperCase(); if(!EXAM_STATUSES.contains(status)) throw new IllegalArgumentException("Invalid exam status"); return status; }
    private static String text(String value) { return value==null||value.isBlank()?null:value.trim(); }
    private static boolean overlaps(java.time.LocalTime a, java.time.LocalTime b, java.time.LocalTime c, java.time.LocalTime d) { return c!=null&&d!=null&&a.isBefore(d)&&c.isBefore(b); }
    private Exam lockExam(Long s, Long examId) { return examRepository.lockBySchoolIdAndId(s, examId).orElseThrow(() -> new ResourceNotFoundException("Exam not found")); }
    private static String csv(String value) { return "\"" + Objects.toString(value,"").replace("\"","\"\"") + "\""; }
    private static void appendExportRow(StringBuilder out, Result r) {
        out.append(r.studentId()).append(',').append(csv(r.studentName())).append(',').append(csv(r.className())).append(',')
                .append(csv(r.sectionName())).append(',').append(csv(r.admissionNumber())).append(',').append(csv(r.rollNumber())).append(',')
                .append(r.total()).append(',').append(r.fullMarks()).append(',').append(r.percentage()).append(',').append(csv(r.grade())).append(',')
                .append(r.gpa()).append(',').append(r.status()).append(',').append(r.classRank()).append(',').append(r.sectionRank()).append(',')
                .append(r.schoolRank()).append("\r\n");
    }

    private static byte[] simplePdf(List<String> lines) {
        List<List<String>> pages = new ArrayList<>();
        for (int start = 0; start < lines.size(); start += 52) pages.add(lines.subList(start, Math.min(start + 52, lines.size())));
        if (pages.isEmpty()) pages.add(List.of(""));
        StringBuilder kids = new StringBuilder();
        for (int i = 0; i < pages.size(); i++) kids.append(4 + i * 2).append(" 0 R ");
        List<String> objects = new ArrayList<>();
        objects.add("<< /Type /Catalog /Pages 2 0 R >>");
        objects.add("<< /Type /Pages /Kids [" + kids + "] /Count " + pages.size() + " >>");
        objects.add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
        for (int i = 0; i < pages.size(); i++) {
            StringBuilder stream = new StringBuilder("BT /F1 10 Tf 50 790 Td 14 TL ");
            for (String line : pages.get(i)) stream.append('(').append(line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)").replaceAll("[^\\x20-\\x7E]", "?")).append(") Tj T* ");
            stream.append("ET");
            int contentRef = 5 + i * 2;
            objects.add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents " + contentRef + " 0 R >>");
            objects.add("<< /Length " + stream.length() + " >>\nstream\n" + stream + "\nendstream");
        }
        ByteArrayOutputStream out=new ByteArrayOutputStream(); write(out,"%PDF-1.4\n"); List<Integer> offsets=new ArrayList<>();
        for(int i=0;i<objects.size();i++){ offsets.add(out.size()); write(out,(i+1)+" 0 obj\n"+objects.get(i)+"\nendobj\n"); } int xref=out.size(); write(out,"xref\n0 "+(objects.size()+1)+"\n0000000000 65535 f \n"); for(int offset:offsets) write(out,String.format("%010d 00000 n \n",offset)); write(out,"trailer\n<< /Size "+(objects.size()+1)+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF\n"); return out.toByteArray();
    }
    private static void write(ByteArrayOutputStream out,String value){ out.writeBytes(value.getBytes(StandardCharsets.US_ASCII)); }
}
