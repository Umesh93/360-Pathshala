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
@RequestMapping("/people")
@RequiredArgsConstructor
public class PeopleController {
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final SecurityUtils securityUtils;
    private final ModuleAccessService moduleAccessService;

    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER','PARENT','STUDENT','SUPER_ADMIN')")
    public Page<Student> students(Pageable pageable) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.STUDENT_MANAGEMENT);
        return studentRepository.findBySchoolIdAndDeletedFalse(schoolId, pageable);
    }

    @PostMapping("/students")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Student createStudent(@RequestBody StudentRequest request) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.STUDENT_MANAGEMENT);
        Student student = new Student();
        student.setSchoolId(schoolId); student.setAdmissionNumber(request.admissionNumber()); student.setRollNumber(request.rollNumber());
        student.setFirstName(request.firstName()); student.setLastName(request.lastName()); student.setDateOfBirth(request.dateOfBirth());
        student.setGender(request.gender()); student.setParentId(request.parentId()); student.setClassId(request.classId()); student.setSectionId(request.sectionId());
        return studentRepository.save(student);
    }

    @PutMapping("/students/{id}/promote")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Student promoteStudent(@PathVariable Long id, @RequestParam Long classId, @RequestParam Long sectionId) {
        Long schoolId = securityUtils.requiredSchoolId();
        Student student = studentRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow();
        student.setClassId(classId); student.setSectionId(sectionId);
        return studentRepository.save(student);
    }

    @PutMapping("/students/{id}/transfer")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Student transferStudent(@PathVariable Long id) {
        Long schoolId = securityUtils.requiredSchoolId();
        Student student = studentRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow();
        student.setStatus("TRANSFERRED");
        return studentRepository.save(student);
    }

    @GetMapping("/teachers")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER','SUPER_ADMIN')")
    public Page<Teacher> teachers(Pageable pageable) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.TEACHER_MANAGEMENT);
        return teacherRepository.findBySchoolIdAndDeletedFalse(schoolId, pageable);
    }

    @PostMapping("/teachers")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Teacher createTeacher(@RequestBody TeacherRequest request) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.TEACHER_MANAGEMENT);
        Teacher teacher = new Teacher();
        teacher.setSchoolId(schoolId); teacher.setEmployeeNumber(request.employeeNumber()); teacher.setFirstName(request.firstName());
        teacher.setLastName(request.lastName()); teacher.setPhone(request.phone()); teacher.setQualification(request.qualification());
        return teacherRepository.save(teacher);
    }

    @GetMapping("/parents")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','PARENT','SUPER_ADMIN')")
    public Page<Parent> parents(Pageable pageable) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.PARENT_MANAGEMENT);
        return parentRepository.findBySchoolIdAndDeletedFalse(schoolId, pageable);
    }

    @PostMapping("/parents")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Parent createParent(@RequestBody ParentRequest request) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.PARENT_MANAGEMENT);
        Parent parent = new Parent();
        parent.setSchoolId(schoolId); parent.setFullName(request.fullName()); parent.setPhone(request.phone()); parent.setEmail(request.email()); parent.setAddress(request.address());
        return parentRepository.save(parent);
    }
}
