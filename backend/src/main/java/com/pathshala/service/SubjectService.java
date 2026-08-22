package com.pathshala.service;

import com.pathshala.dto.ApiDtos.*;
import com.pathshala.entity.*;
import com.pathshala.repository.Repositories.*;
import com.pathshala.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectService {
    private final SubjectRepository subjectRepository;
    private final SchoolClassRepository classRepository;
    private final TeacherRepository teacherRepository;
    private final SectionRepository sectionRepository;
    private final AcademicYearRepository academicYearRepository;
    private final TeacherSubjectRepository assignmentRepository;
    private final SecurityUtils securityUtils;
    private final ModuleAccessService moduleAccessService;

    public Page<SubjectResponse> list(String search, Long classId, Long teacherId, String subjectType,
                                      Boolean optional, String status, boolean deleted, Pageable pageable) {
        Long schoolId = schoolId();
        Specification<Subject> spec = (root, query, cb) -> cb.equal(root.get("schoolId"), schoolId);
        spec = spec.and((root, query, cb) -> cb.equal(root.get("deleted"), deleted));
        if (search != null && !search.isBlank()) {
            String value = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(cb.like(cb.lower(root.get("subjectName")), value), cb.like(cb.lower(root.get("subjectCode")), value)));
        }
        if (classId != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("classId"), classId));
        if (subjectType != null && !subjectType.isBlank()) spec = spec.and((root, query, cb) -> cb.equal(root.get("subjectType"), subjectType));
        if (optional != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("optional"), optional));
        if (status != null && !status.isBlank()) spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status.toUpperCase()));
        if (teacherId != null) {
            List<Long> subjectIds = assignmentRepository.findBySchoolIdAndTeacherIdAndDeletedFalse(schoolId, teacherId).stream().map(TeacherSubject::getSubjectId).distinct().toList();
            spec = spec.and((root, query, cb) -> subjectIds.isEmpty() ? cb.disjunction() : root.get("id").in(subjectIds));
        }
        return subjectRepository.findAll(spec, pageable).map(this::response);
    }

    public SubjectResponse get(Long id) {
        return response(subjectRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId()).orElseThrow(() -> new IllegalArgumentException("Subject not found")));
    }

    @Transactional
    public SubjectResponse create(SubjectRequest request) {
        Long schoolId = schoolId(); validate(request, schoolId, null);
        Subject subject = apply(new Subject(), request, schoolId);
        return response(subjectRepository.save(subject));
    }

    @Transactional
    public SubjectResponse update(Long id, SubjectRequest request) {
        Long schoolId = schoolId();
        Subject subject = subjectRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        validate(request, schoolId, id);
        return response(subjectRepository.save(apply(subject, request, schoolId)));
    }

    @Transactional
    public void delete(Long id) {
        Long schoolId = schoolId();
        Subject subject = subjectRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        subject.setDeleted(true); subjectRepository.save(subject);
        assignmentRepository.findBySchoolIdAndSubjectIdAndDeletedFalse(schoolId, id).forEach(item -> { item.setDeleted(true); assignmentRepository.save(item); });
    }

    @Transactional
    public SubjectResponse restore(Long id) {
        Subject subject = subjectRepository.findByIdAndSchoolId(id, schoolId()).orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        if (!subject.isDeleted()) throw new IllegalArgumentException("Subject is already active");
        String code = hasText(subject.getSubjectCode()) ? subject.getSubjectCode() : subject.getLegacyCode();
        String name = hasText(subject.getSubjectName()) ? subject.getSubjectName() : subject.getLegacyName();
        if (subjectRepository.existsBySchoolIdAndSubjectCodeIgnoreCaseAndDeletedFalse(subject.getSchoolId(), code)) throw new IllegalArgumentException("An active subject already uses this subject code");
        if (subjectRepository.existsBySchoolIdAndClassIdAndSubjectNameIgnoreCaseAndDeletedFalse(subject.getSchoolId(), subject.getClassId(), name)) throw new IllegalArgumentException("An active subject already uses this name for the class");
        subject.setDeleted(false); return response(subjectRepository.save(subject));
    }

    public List<TeacherSubject> teachers(Long id) {
        get(id); return assignmentRepository.findBySchoolIdAndSubjectIdAndDeletedFalse(schoolId(), id);
    }

    @Transactional
    public TeacherSubject assign(Long id, SubjectTeacherRequest request) {
        Long schoolId = schoolId();
        Subject subject = subjectRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        Long sessionId = resolveSession(schoolId, request.academicSessionId()).getId();
        validateScope(schoolId, sessionId, subject.getClassId(), request.sectionId());
        requireActiveSubject(subject, subject.getClassId());
        requireActiveTeacher(schoolId, request.teacherId());
        return upsert(schoolId, sessionId, subject.getClassId(), request.sectionId(), id, request.teacherId());
    }

    @Transactional
    public void unassign(Long id, Long teacherId) {
        Long schoolId = schoolId();
        Long sessionId = resolveSession(schoolId, null).getId();
        List<TeacherSubject> items = assignmentRepository.findBySchoolIdAndSubjectIdAndDeletedFalse(schoolId, id).stream()
                .filter(item -> sessionId.equals(item.getAcademicSessionId()) && teacherId.equals(item.getTeacherId())).toList();
        if (items.isEmpty()) throw new IllegalArgumentException("Teacher assignment not found");
        items.forEach(item -> { item.setDeleted(true); assignmentRepository.save(item); });
    }

    @Transactional(readOnly = true)
    public List<TeacherAssignmentRow> assignmentRows(Long academicSessionId, Long classId, Long sectionId) {
        Long schoolId = schoolId();
        validateScope(schoolId, academicSessionId, classId, sectionId);
        return assignmentRows(schoolId, academicSessionId, classId, sectionId);
    }

    @Transactional
    public List<TeacherAssignmentRow> replaceAssignments(TeacherAssignmentBulkRequest request) {
        Long schoolId = schoolId();
        validateScope(schoolId, request.academicSessionId(), request.classId(), request.sectionId());
        if (request.mappings().stream().map(SubjectTeacherMapping::subjectId).distinct().count() != request.mappings().size()) {
            throw new IllegalArgumentException("Duplicate subjectId in mappings");
        }
        Map<Long, Subject> activeSubjects = activeSubjects(schoolId, request.classId()).stream()
                .collect(Collectors.toMap(Subject::getId, subject -> subject));
        for (SubjectTeacherMapping mapping : request.mappings()) {
            if (!activeSubjects.containsKey(mapping.subjectId())) throw new IllegalArgumentException("Subject is not active in the selected class: " + mapping.subjectId());
            if (mapping.teacherId() != null) requireActiveTeacher(schoolId, mapping.teacherId());
        }
        Map<Long, SubjectTeacherMapping> supplied = request.mappings().stream()
                .collect(Collectors.toMap(SubjectTeacherMapping::subjectId, mapping -> mapping));
        Map<Long, TeacherSubject> existing = assignmentRepository.findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionId(
                        schoolId, request.academicSessionId(), request.classId(), request.sectionId()).stream()
                .collect(Collectors.toMap(TeacherSubject::getSubjectId, row -> row));
        for (TeacherSubject row : existing.values()) {
            SubjectTeacherMapping mapping = supplied.get(row.getSubjectId());
            if (mapping == null || mapping.teacherId() == null) row.setDeleted(true);
        }
        assignmentRepository.saveAll(existing.values());
        for (SubjectTeacherMapping mapping : request.mappings()) {
            if (mapping.teacherId() != null) upsert(schoolId, request.academicSessionId(), request.classId(), request.sectionId(), mapping.subjectId(), mapping.teacherId());
        }
        return assignmentRows(schoolId, request.academicSessionId(), request.classId(), request.sectionId());
    }

    @Transactional(readOnly = true)
    public List<TeacherAssignmentScopeResponse> selfAssignments(Long requestedSessionId) {
        Long schoolId = schoolId();
        return selfAssignmentsForDashboard(schoolId, requestedSessionId);
    }

    @Transactional(readOnly = true)
    public List<TeacherAssignmentScopeResponse> selfAssignmentsForDashboard(Long schoolId, Long requestedSessionId) {
        if (!securityUtils.requiredSchoolId().equals(schoolId)) throw new IllegalArgumentException("School context mismatch");
        AcademicYear session = resolveSession(schoolId, requestedSessionId);
        Teacher teacher = teacherRepository.findBySchoolIdAndUserIdAndStatusIgnoreCaseAndDeletedFalse(
                        schoolId, securityUtils.currentUser().getId(), "ACTIVE")
                .orElseThrow(() -> new IllegalArgumentException("Active teacher profile not found"));
        return assignmentRepository.findBySchoolIdAndAcademicSessionIdAndTeacherIdAndDeletedFalse(schoolId, session.getId(), teacher.getId()).stream()
                .map(row -> {
                    SchoolClass schoolClass = classRepository.findByIdAndSchoolIdAndDeletedFalse(row.getClassId(), schoolId).orElse(null);
                    Section section = sectionRepository.findByIdAndSchoolIdAndDeletedFalse(row.getSectionId(), schoolId).orElse(null);
                    Subject subject = subjectRepository.findByIdAndSchoolIdAndDeletedFalse(row.getSubjectId(), schoolId).orElse(null);
                    if (schoolClass == null || section == null || subject == null) return null;
                    return new TeacherAssignmentScopeResponse(session.getId(), session.getName(), schoolClass.getId(), schoolClass.getName(),
                            section.getId(), section.getName(), subject.getId(), code(subject), name(subject));
                }).filter(Objects::nonNull).toList();
    }

    @Transactional
    public TeacherSubject assignLegacy(TeacherSubjectRequest request) {
        if (request.teacherId() == null || request.subjectId() == null || request.classId() == null || request.sectionId() == null) {
            throw new IllegalArgumentException("teacherId, subjectId, classId, and sectionId are required");
        }
        Subject subject = subjectRepository.findByIdAndSchoolIdAndDeletedFalse(request.subjectId(), schoolId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        if (!request.classId().equals(subject.getClassId())) throw new IllegalArgumentException("Subject does not belong to class");
        return assign(request.subjectId(), new SubjectTeacherRequest(request.teacherId(), request.sectionId(), request.academicSessionId()));
    }

    public boolean hasActiveAssignment(Long schoolId, Long academicSessionId, Long classId, Long sectionId, Long subjectId, Long teacherId) {
        return assignmentRepository.findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndSubjectIdAndTeacherIdAndDeletedFalse(
                schoolId, academicSessionId, classId, sectionId, subjectId, teacherId).isPresent();
    }

    private void validate(SubjectRequest request, Long schoolId, Long id) {
        classRepository.findByIdAndSchoolIdAndDeletedFalse(request.classId(), schoolId).orElseThrow(() -> new IllegalArgumentException("Class not found"));
        if (request.passMarks().compareTo(request.fullMarks()) > 0) throw new IllegalArgumentException("Pass marks cannot exceed full marks");
        boolean duplicateCode = id == null ? subjectRepository.existsBySchoolIdAndSubjectCodeIgnoreCaseAndDeletedFalse(schoolId, request.subjectCode()) : subjectRepository.existsBySchoolIdAndSubjectCodeIgnoreCaseAndIdNotAndDeletedFalse(schoolId, request.subjectCode(), id);
        if (duplicateCode) throw new IllegalArgumentException("Subject code already exists");
        boolean duplicateName = id == null ? subjectRepository.existsBySchoolIdAndClassIdAndSubjectNameIgnoreCaseAndDeletedFalse(schoolId, request.classId(), request.subjectName()) : subjectRepository.existsBySchoolIdAndClassIdAndSubjectNameIgnoreCaseAndIdNotAndDeletedFalse(schoolId, request.classId(), request.subjectName(), id);
        if (duplicateName) throw new IllegalArgumentException("Subject name already exists for this class");
    }

    private Subject apply(Subject subject, SubjectRequest request, Long schoolId) {
        subject.setSchoolId(schoolId); subject.setClassId(request.classId()); subject.setSubjectCode(request.subjectCode()); subject.setSubjectName(request.subjectName());
        subject.setLegacyCode(request.subjectCode()); subject.setLegacyName(request.subjectName());
        subject.setSubjectType(request.subjectType()); subject.setCreditHours(request.creditHours() != null && request.creditHours().signum() == 0 ? null : request.creditHours()); subject.setFullMarks(request.fullMarks()); subject.setPassMarks(request.passMarks());
        subject.setOptional(request.optional()); subject.setStatus(request.status().toUpperCase()); subject.setDescription(request.description()); return subject;
    }

    private SubjectResponse response(Subject subject) {
        String className = classRepository.findByIdAndSchoolIdAndDeletedFalse(subject.getClassId(), subject.getSchoolId()).map(SchoolClass::getName).orElse("");
        String code = hasText(subject.getSubjectCode()) ? subject.getSubjectCode() : subject.getLegacyCode();
        String name = hasText(subject.getSubjectName()) ? subject.getSubjectName() : subject.getLegacyName();
        long teacherCount = assignmentRepository.findBySchoolIdAndSubjectIdAndDeletedFalse(subject.getSchoolId(), subject.getId()).stream().map(TeacherSubject::getTeacherId).distinct().count();
        return new SubjectResponse(subject.getId(), subject.getSchoolId(), subject.getClassId(), className, code, name,
                subject.getSubjectType() != null ? subject.getSubjectType() : "THEORY", subject.getCreditHours() != null ? subject.getCreditHours() : java.math.BigDecimal.ZERO,
                subject.getFullMarks() != null ? subject.getFullMarks() : java.math.BigDecimal.valueOf(100), subject.getPassMarks() != null ? subject.getPassMarks() : java.math.BigDecimal.valueOf(40),
                subject.isOptional(), subject.getStatus() != null ? subject.getStatus() : "ACTIVE", subject.getDescription(), teacherCount,
                subject.isDeleted(), subject.getCreatedAt(), subject.getUpdatedAt(), subject.getCreatedBy(), subject.getUpdatedBy());
    }

    private Long schoolId() {
        Long schoolId = securityUtils.requiredSchoolId(); moduleAccessService.require(schoolId, ModuleCode.SUBJECT_MANAGEMENT); return schoolId;
    }

    private boolean hasText(String value) { return value != null && !value.isBlank(); }

    private AcademicYear resolveSession(Long schoolId, Long sessionId) {
        if (sessionId != null) return academicYearRepository.findByIdAndSchoolIdAndDeletedFalse(sessionId, schoolId)
                .orElseThrow(() -> new IllegalArgumentException("Academic session not found"));
        return academicYearRepository.findFirstBySchoolIdAndActiveTrueAndDeletedFalseOrderByStartsOnDesc(schoolId)
                .orElseThrow(() -> new IllegalArgumentException("No active academic session"));
    }

    private void validateScope(Long schoolId, Long sessionId, Long classId, Long sectionId) {
        if (sessionId == null || classId == null || sectionId == null) throw new IllegalArgumentException("academicSessionId, classId, and sectionId are required");
        resolveSession(schoolId, sessionId);
        classRepository.findByIdAndSchoolIdAndDeletedFalse(classId, schoolId).orElseThrow(() -> new IllegalArgumentException("Class not found"));
        Section section = sectionRepository.findByIdAndSchoolIdAndDeletedFalse(sectionId, schoolId).orElseThrow(() -> new IllegalArgumentException("Section not found"));
        if (!classId.equals(section.getClassId())) throw new IllegalArgumentException("Section does not belong to class");
    }

    private Teacher requireActiveTeacher(Long schoolId, Long teacherId) {
        Teacher teacher = teacherRepository.findByIdAndSchoolIdAndDeletedFalse(teacherId, schoolId).orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
        if (!"ACTIVE".equalsIgnoreCase(teacher.getStatus())) throw new IllegalArgumentException("Teacher is not active");
        return teacher;
    }

    private void requireActiveSubject(Subject subject, Long classId) {
        if (!classId.equals(subject.getClassId()) || !"ACTIVE".equalsIgnoreCase(subject.getStatus())) {
            throw new IllegalArgumentException("Subject is not active in the selected class");
        }
    }

    private TeacherSubject upsert(Long schoolId, Long sessionId, Long classId, Long sectionId, Long subjectId, Long teacherId) {
        TeacherSubject row = assignmentRepository.findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndSubjectId(
                schoolId, sessionId, classId, sectionId, subjectId).orElseGet(TeacherSubject::new);
        row.setSchoolId(schoolId); row.setAcademicSessionId(sessionId); row.setClassId(classId); row.setSectionId(sectionId);
        row.setSubjectId(subjectId); row.setTeacherId(teacherId); row.setDeleted(false);
        return assignmentRepository.save(row);
    }

    private List<Subject> activeSubjects(Long schoolId, Long classId) {
        return subjectRepository.findBySchoolIdAndClassIdAndDeletedFalse(schoolId, classId, Pageable.unpaged()).getContent().stream()
                .filter(subject -> "ACTIVE".equalsIgnoreCase(subject.getStatus())).toList();
    }

    private List<TeacherAssignmentRow> assignmentRows(Long schoolId, Long sessionId, Long classId, Long sectionId) {
        Map<Long, TeacherSubject> mappings = assignmentRepository.findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndDeletedFalse(
                        schoolId, sessionId, classId, sectionId).stream()
                .collect(Collectors.toMap(TeacherSubject::getSubjectId, row -> row));
        return activeSubjects(schoolId, classId).stream().map(subject -> {
            TeacherSubject mapping = mappings.get(subject.getId());
            Teacher teacher = mapping == null ? null : teacherRepository.findByIdAndSchoolIdAndDeletedFalse(mapping.getTeacherId(), schoolId).orElse(null);
            boolean activeTeacher = teacher != null && "ACTIVE".equalsIgnoreCase(teacher.getStatus());
            return new TeacherAssignmentRow(subject.getId(), code(subject), name(subject), activeTeacher ? mapping.getTeacherId() : null, activeTeacher ? teacherName(teacher) : null);
        }).toList();
    }

    private String code(Subject subject) { return hasText(subject.getSubjectCode()) ? subject.getSubjectCode() : subject.getLegacyCode(); }
    private String name(Subject subject) { return hasText(subject.getSubjectName()) ? subject.getSubjectName() : subject.getLegacyName(); }
    private String teacherName(Teacher teacher) { return (Objects.toString(teacher.getFirstName(), "") + " " + Objects.toString(teacher.getLastName(), "")).trim(); }
}
