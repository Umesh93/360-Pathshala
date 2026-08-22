package com.pathshala.service;

import com.pathshala.entity.AcademicYear;
import com.pathshala.entity.School;
import com.pathshala.entity.Section;
import com.pathshala.exception.ResourceNotFoundException;
import com.pathshala.repository.Repositories.AcademicYearRepository;
import com.pathshala.repository.Repositories.SchoolClassRepository;
import com.pathshala.repository.Repositories.SchoolRepository;
import com.pathshala.repository.Repositories.SectionRepository;
import com.pathshala.repository.Repositories.StudentRepository;
import com.pathshala.repository.Repositories.TeacherRepository;
import com.pathshala.repository.Repositories.ParentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PeopleIdentifierService {
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SectionRepository sectionRepository;
    private final AcademicYearRepository academicYearRepository;

    @Transactional(readOnly = true)
    public String nextAdmissionNumber(Long schoolId) {
        School school = schoolRepository.findById(schoolId).orElseThrow(() -> new ResourceNotFoundException("School not found"));
        String initials = Arrays.stream(school.getName().trim().split("\\s+"))
                .filter(word -> !word.isBlank())
                .map(word -> word.substring(0, 1).toUpperCase())
                .collect(Collectors.joining());
        if (initials.isBlank()) initials = "SCH";

        String academicYear = academicYearRepository.findFirstBySchoolIdAndActiveTrueAndDeletedFalseOrderByStartsOnDesc(schoolId)
                .map(AcademicYear::getName).orElse("");
        Matcher matcher = Pattern.compile("(2\\d{3})").matcher(academicYear);
        int bsYear = matcher.find() ? Integer.parseInt(matcher.group(1)) : currentBsYear();
        long next = studentRepository.findMaxAdmissionSequence(schoolId) + 1;
        return String.format("%s-%03d-%03d", initials, bsYear % 1000, next);
    }

    @Transactional(readOnly = true)
    public long nextRollNumber(Long schoolId, Long classId, Long sectionId) {
        schoolClassRepository.findByIdAndSchoolIdAndDeletedFalse(classId, schoolId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid class"));
        Section section = sectionRepository.findByIdAndSchoolIdAndDeletedFalse(sectionId, schoolId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid section"));
        if (!classId.equals(section.getClassId())) throw new IllegalArgumentException("Section does not belong to class");
        return studentRepository.findMaxActiveNumericRollNumber(schoolId, classId, sectionId) + 1;
    }

    @Transactional(readOnly = true)
    public String nextTeacherId(Long schoolId) {
        long next = teacherRepository.findMaxTeacherIdSequence(schoolId) + 1;
        String candidate;
        do candidate = "TCH-" + String.format("%04d", next++);
        while (teacherRepository.existsBySchoolIdAndEmployeeNumberIgnoreCase(schoolId, candidate));
        return candidate;
    }

    @Transactional(readOnly = true)
    public String nextEmployeeCode(Long schoolId) {
        long next = teacherRepository.findMaxEmployeeCodeSequence(schoolId) + 1;
        String candidate;
        do candidate = "EMP-" + String.format("%04d", next++);
        while (teacherRepository.countBySchoolIdAndEmployeeCode(schoolId, candidate) > 0);
        return candidate;
    }

    @Transactional(readOnly = true)
    public String nextGuardianCode(Long schoolId) {
        long next = parentRepository.findMaxGuardianCodeSequence(schoolId) + 1;
        String candidate;
        do candidate = "GDN-" + String.format("%04d", next++);
        while (parentRepository.existsBySchoolIdAndGuardianCodeIgnoreCase(schoolId, candidate));
        return candidate;
    }

    private int currentBsYear() {
        LocalDate today = LocalDate.now();
        LocalDate nepaliNewYear = LocalDate.of(today.getYear(), 4, 14);
        return today.getYear() + (today.isBefore(nepaliNewYear) ? 56 : 57);
    }
}
