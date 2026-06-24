package com.pathshala.controller;

import com.pathshala.dto.ApiDtos.*;
import com.pathshala.entity.*;
import com.pathshala.repository.Repositories.*;
import com.pathshala.service.ModuleAccessService;
import com.pathshala.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/academic")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER','SUPER_ADMIN')")
public class AcademicController {
    private final AcademicYearRepository academicYearRepository;
    private final SchoolClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final SecurityUtils securityUtils;
    private final ModuleAccessService moduleAccessService;

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
    public Page<SchoolClass> classes(Pageable pageable) { return classRepository.findBySchoolIdAndDeletedFalse(securityUtils.requiredSchoolId(), pageable); }

    @PostMapping("/classes")
    public SchoolClass createClass(@RequestBody ClassRequest request) {
        SchoolClass schoolClass = new SchoolClass();
        schoolClass.setSchoolId(securityUtils.requiredSchoolId()); schoolClass.setName(request.name()); schoolClass.setCode(request.code());
        return classRepository.save(schoolClass);
    }

    @GetMapping("/sections")
    public Page<Section> sections(Pageable pageable) { return sectionRepository.findBySchoolIdAndDeletedFalse(securityUtils.requiredSchoolId(), pageable); }

    @PostMapping("/sections")
    public Section createSection(@RequestBody SectionRequest request) {
        Section section = new Section();
        section.setSchoolId(securityUtils.requiredSchoolId()); section.setClassId(request.classId()); section.setName(request.name()); section.setCapacity(request.capacity());
        return sectionRepository.save(section);
    }

    @GetMapping("/subjects")
    public Page<Subject> subjects(Pageable pageable) { return subjectRepository.findBySchoolIdAndDeletedFalse(securityUtils.requiredSchoolId(), pageable); }

    @PostMapping("/subjects")
    public Subject createSubject(@RequestBody SubjectRequest request) {
        Subject subject = new Subject();
        subject.setSchoolId(securityUtils.requiredSchoolId()); subject.setName(request.name()); subject.setCode(request.code());
        return subjectRepository.save(subject);
    }

    @PostMapping("/teacher-subjects")
    public TeacherSubject assignTeacher(@RequestBody TeacherSubjectRequest request) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.TEACHER_MANAGEMENT);
        TeacherSubject assignment = new TeacherSubject();
        assignment.setSchoolId(schoolId); assignment.setTeacherId(request.teacherId()); assignment.setSubjectId(request.subjectId());
        assignment.setClassId(request.classId()); assignment.setSectionId(request.sectionId());
        return teacherSubjectRepository.save(assignment);
    }
}
