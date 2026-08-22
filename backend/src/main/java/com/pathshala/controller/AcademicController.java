package com.pathshala.controller;

import com.pathshala.dto.ApiDtos.*;
import com.pathshala.entity.*;
import com.pathshala.repository.Repositories.*;
import com.pathshala.service.ModuleAccessService;
import com.pathshala.service.SubjectService;
import com.pathshala.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/academic")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER','SUPER_ADMIN')")
public class AcademicController {
    private final AcademicYearRepository academicYearRepository;
    private final SchoolClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final SecurityUtils securityUtils;
    private final ModuleAccessService moduleAccessService;
    private final SubjectService subjectService;

    @GetMapping("/years")
    public Page<AcademicYear> years(Pageable pageable) { return academicYearRepository.findBySchoolIdAndDeletedFalse(securityUtils.requiredSchoolId(), pageable); }

    @PostMapping("/years")
    public AcademicYear createYear(@RequestBody AcademicYearRequest request) {
        AcademicYear year = new AcademicYear();
        year.setSchoolId(securityUtils.requiredSchoolId());
        year.setName(request.name()); year.setStartsOn(request.startsOn()); year.setEndsOn(request.endsOn()); year.setActive(request.active());
        return academicYearRepository.save(year);
    }

    @GetMapping("/classes")
    public Page<SchoolClass> classes(@RequestParam(required = false) String search, Pageable pageable) {
        Long schoolId = securityUtils.requiredSchoolId();
        return search == null || search.isBlank()
                ? classRepository.findBySchoolIdAndDeletedFalse(schoolId, pageable)
                : classRepository.findBySchoolIdAndNameContainingIgnoreCaseOrSchoolIdAndCodeContainingIgnoreCaseAndDeletedFalse(schoolId, search, schoolId, search, pageable);
    }

    @PostMapping("/classes")
    public SchoolClass createClass(@Valid @RequestBody ClassRequest request) {
        Long schoolId = securityUtils.requiredSchoolId();
        if (classRepository.existsBySchoolIdAndNameIgnoreCaseAndDeletedFalse(schoolId, request.name())) throw new IllegalArgumentException("Class name already exists");
        if (classRepository.existsBySchoolIdAndCodeIgnoreCaseAndDeletedFalse(schoolId, request.code())) throw new IllegalArgumentException("Class code already exists");
        SchoolClass schoolClass = new SchoolClass();
        schoolClass.setSchoolId(schoolId); schoolClass.setName(request.name()); schoolClass.setCode(request.code());
        return classRepository.save(schoolClass);
    }

    @GetMapping("/classes/{id}")
    public SchoolClass classById(@PathVariable Long id) {
        Long schoolId = securityUtils.requiredSchoolId();
        return classRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new IllegalArgumentException("Class not found"));
    }

    @PutMapping("/classes/{id}")
    public SchoolClass updateClass(@PathVariable Long id, @Valid @RequestBody ClassRequest request) {
        Long schoolId = securityUtils.requiredSchoolId();
        SchoolClass schoolClass = classRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new IllegalArgumentException("Class not found"));
        if (classRepository.existsBySchoolIdAndNameIgnoreCaseAndIdNotAndDeletedFalse(schoolId, request.name(), id)) throw new IllegalArgumentException("Class name already exists");
        if (classRepository.existsBySchoolIdAndCodeIgnoreCaseAndIdNotAndDeletedFalse(schoolId, request.code(), id)) throw new IllegalArgumentException("Class code already exists");
        schoolClass.setName(request.name()); schoolClass.setCode(request.code());
        return classRepository.save(schoolClass);
    }

    @DeleteMapping("/classes/{id}")
    public void deleteClass(@PathVariable Long id) {
        Long schoolId = securityUtils.requiredSchoolId();
        SchoolClass schoolClass = classRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new IllegalArgumentException("Class not found"));
        if (sectionRepository.existsBySchoolIdAndClassIdAndDeletedFalse(schoolId, id)) throw new IllegalArgumentException("Cannot delete class while sections still exist");
        if (studentRepository.existsBySchoolIdAndClassIdAndDeletedFalse(schoolId, id)) throw new IllegalArgumentException("Cannot delete class while students are assigned");
        schoolClass.setDeleted(true); classRepository.save(schoolClass);
    }

    @GetMapping("/sections")
    public Page<Section> sections(@RequestParam(required = false) Long classId, Pageable pageable) {
        Long schoolId = securityUtils.requiredSchoolId();
        return classId == null
                ? sectionRepository.findBySchoolIdAndDeletedFalse(schoolId, pageable)
                : sectionRepository.findBySchoolIdAndClassIdAndDeletedFalse(schoolId, classId, pageable);
    }

    @PostMapping("/sections")
    public Section createSection(@Valid @RequestBody SectionRequest request) {
        Long schoolId = securityUtils.requiredSchoolId();
        classRepository.findByIdAndSchoolIdAndDeletedFalse(request.classId(), schoolId).orElseThrow(() -> new IllegalArgumentException("Class not found"));
        if (sectionRepository.existsBySchoolIdAndClassIdAndNameIgnoreCaseAndDeletedFalse(schoolId, request.classId(), request.name())) throw new IllegalArgumentException("Section name already exists for this class");
        Section section = new Section();
        section.setSchoolId(schoolId); section.setClassId(request.classId()); section.setName(request.name()); section.setCapacity(request.capacity());
        return sectionRepository.save(section);
    }

    @GetMapping("/sections/{id}")
    public Section sectionById(@PathVariable Long id) {
        Long schoolId = securityUtils.requiredSchoolId();
        return sectionRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new IllegalArgumentException("Section not found"));
    }

    @PutMapping("/sections/{id}")
    public Section updateSection(@PathVariable Long id, @Valid @RequestBody SectionRequest request) {
        Long schoolId = securityUtils.requiredSchoolId();
        Section section = sectionRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new IllegalArgumentException("Section not found"));
        classRepository.findByIdAndSchoolIdAndDeletedFalse(request.classId(), schoolId).orElseThrow(() -> new IllegalArgumentException("Class not found"));
        if (sectionRepository.existsBySchoolIdAndClassIdAndNameIgnoreCaseAndIdNotAndDeletedFalse(schoolId, request.classId(), request.name(), id)) throw new IllegalArgumentException("Section name already exists for this class");
        section.setClassId(request.classId()); section.setName(request.name()); section.setCapacity(request.capacity());
        return sectionRepository.save(section);
    }

    @DeleteMapping("/sections/{id}")
    public void deleteSection(@PathVariable Long id) {
        Long schoolId = securityUtils.requiredSchoolId();
        Section section = sectionRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new IllegalArgumentException("Section not found"));
        if (studentRepository.existsBySchoolIdAndSectionIdAndDeletedFalse(schoolId, id)) throw new IllegalArgumentException("Cannot delete section while students are assigned");
        section.setDeleted(true); sectionRepository.save(section);
    }

    @GetMapping("/subjects")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Page<SubjectResponse> subjects(@RequestParam(required = false) String search, @RequestParam(required = false) Long classId,
                                          @RequestParam(required = false) Long teacherId, @RequestParam(required = false) String subjectType,
                                          @RequestParam(required = false) Boolean optional, @RequestParam(required = false) String status,
                                          @RequestParam(defaultValue = "false") boolean deleted, Pageable pageable) {
        return subjectService.list(search, classId, teacherId, subjectType, optional, status, deleted, pageable);
    }

    @GetMapping("/subjects/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public SubjectResponse subject(@PathVariable Long id) { return subjectService.get(id); }

    @PostMapping("/subjects")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public SubjectResponse createSubject(@Valid @RequestBody SubjectRequest request) { return subjectService.create(request); }

    @PutMapping("/subjects/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public SubjectResponse updateSubject(@PathVariable Long id, @Valid @RequestBody SubjectRequest request) { return subjectService.update(id, request); }

    @DeleteMapping("/subjects/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public void deleteSubject(@PathVariable Long id) { subjectService.delete(id); }

    @PutMapping("/subjects/{id}/restore")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public SubjectResponse restoreSubject(@PathVariable Long id) { return subjectService.restore(id); }

    @GetMapping("/subjects/{id}/teachers")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public java.util.List<TeacherSubject> subjectTeachers(@PathVariable Long id) { return subjectService.teachers(id); }

    @PostMapping("/subjects/{id}/teachers")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public TeacherSubject assignSubjectTeacher(@PathVariable Long id, @Valid @RequestBody SubjectTeacherRequest request) { return subjectService.assign(id, request); }

    @DeleteMapping("/subjects/{id}/teachers/{teacherId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public void unassignSubjectTeacher(@PathVariable Long id, @PathVariable Long teacherId) { subjectService.unassign(id, teacherId); }

    @PostMapping("/teacher-subjects")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public TeacherSubject assignTeacher(@RequestBody TeacherSubjectRequest request) {
        return subjectService.assignLegacy(request);
    }

    @GetMapping("/teacher-subjects")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public java.util.List<TeacherAssignmentRow> teacherSubjects(@RequestParam Long academicSessionId,
            @RequestParam Long classId, @RequestParam Long sectionId) {
        return subjectService.assignmentRows(academicSessionId, classId, sectionId);
    }

    @PutMapping("/teacher-subjects/bulk")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public java.util.List<TeacherAssignmentRow> replaceTeacherSubjects(@Valid @RequestBody TeacherAssignmentBulkRequest request) {
        return subjectService.replaceAssignments(request);
    }

    @GetMapping("/teacher-subjects/self")
    @PreAuthorize("hasRole('TEACHER')")
    public java.util.List<TeacherAssignmentScopeResponse> selfTeacherSubjects(
            @RequestParam(required = false) Long academicSessionId) {
        return subjectService.selfAssignments(academicSessionId);
    }
}
