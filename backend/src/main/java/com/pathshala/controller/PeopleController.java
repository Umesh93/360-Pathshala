package com.pathshala.controller;

import com.pathshala.dto.ApiDtos.*;
import com.pathshala.entity.*;
import com.pathshala.repository.Repositories.*;
import com.pathshala.service.ModuleAccessService;
import com.pathshala.service.PeopleIdentifierService;
import com.pathshala.util.SecurityUtils;
import com.pathshala.exception.ResourceNotFoundException;
import com.pathshala.exception.ForbiddenException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Subquery;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/people")
@RequiredArgsConstructor
@Slf4j
public class PeopleController {
    private final StudentRepository studentRepository;
    private final SchoolRepository schoolRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final UserRepository userRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SectionRepository sectionRepository;
    private final AcademicYearRepository academicYearRepository;
    private final ProvinceRepository provinceRepository;
    private final DistrictRepository districtRepository;
    private final MunicipalityRepository municipalityRepository;
    private final WardRepository wardRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final SecurityUtils securityUtils;
    private final ModuleAccessService moduleAccessService;
    private final PeopleIdentifierService peopleIdentifierService;
    private final ObjectMapper objectMapper;
    private final PasswordEncoder passwordEncoder;


    @GetMapping("/self")
    @PreAuthorize("hasAnyRole('TEACHER','STUDENT','PARENT','SCHOOL_ADMIN')")
    @Transactional(readOnly = true)
    public SelfProfile self() {
        var user = securityUtils.currentUser();
        Long schoolId = securityUtils.requiredSchoolId();
        if (user.getRoles().contains(RoleName.TEACHER)) {
            Teacher teacher = teacherRepository.findBySchoolIdAndUserIdAndStatusIgnoreCaseAndDeletedFalse(
                            schoolId, user.getId(), "ACTIVE")
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for authenticated user"));
            return new SelfProfile(RoleName.TEACHER.name(), personName(teacher.getFirstName(), teacher.getMiddleName(), teacher.getLastName()),
                    teacher.getPhoto(), schoolId, teacher.getId(), null, null, null, null,
                    teacher.getEmployeeNumber(), teacher.getDepartment());
        }
        if (user.getRoles().contains(RoleName.STUDENT)) {
            Student student = studentRepository.findBySchoolIdAndUserIdAndDeletedFalse(schoolId, user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for authenticated user"));
            String className = student.getClassId() == null ? null : schoolClassRepository
                    .findByIdAndSchoolIdAndDeletedFalse(student.getClassId(), schoolId).map(SchoolClass::getName).orElse(null);
            String sectionName = student.getSectionId() == null ? null : sectionRepository
                    .findByIdAndSchoolIdAndDeletedFalse(student.getSectionId(), schoolId).map(Section::getName).orElse(null);
            return new SelfProfile(RoleName.STUDENT.name(), personName(student.getFirstName(), student.getMiddleName(), student.getLastName()),
                    student.getPhoto(), schoolId, student.getId(), student.getClassId(), className,
                    student.getSectionId(), sectionName, null, null);
        }
        if (user.getRoles().contains(RoleName.PARENT)) {
            Parent parent = parentRepository.findBySchoolIdAndUserIdAndDeletedFalse(schoolId, user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent profile not found for authenticated user"));
            String displayName = hasText(parent.getFullName()) ? parent.getFullName()
                    : personName(parent.getFirstName(), parent.getMiddleName(), parent.getLastName());
            return new SelfProfile(RoleName.PARENT.name(), displayName, parent.getPhoto(), schoolId, parent.getId(),
                    null, null, null, null, null, null);
        }
        User persisted = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("School administrator profile not found for authenticated user"));
        return new SelfProfile(RoleName.SCHOOL_ADMIN.name(), hasText(persisted.getFullName()) ? persisted.getFullName() : persisted.getUsername(),
                null, schoolId, persisted.getId(), null, null, null, null, null, null);
    }

    @GetMapping("/students/self")
    @PreAuthorize("hasRole('STUDENT')")
    @Transactional(readOnly = true)
    public StudentSelfProfile studentSelf() {
        var user = securityUtils.currentUser();
        Long schoolId = securityUtils.requiredSchoolId();
        Student student = studentRepository.findBySchoolIdAndUserIdAndDeletedFalse(schoolId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for authenticated user"));
        User account = userRepository.findByIdAndDeletedFalse(user.getId()).orElse(null);
        String className = student.getClassId() == null ? null : schoolClassRepository
                .findByIdAndSchoolIdAndDeletedFalse(student.getClassId(), schoolId).map(SchoolClass::getName).orElse(null);
        String sectionName = student.getSectionId() == null ? null : sectionRepository
                .findByIdAndSchoolIdAndDeletedFalse(student.getSectionId(), schoolId).map(Section::getName).orElse(null);
        com.fasterxml.jackson.databind.JsonNode guardian = readParentGuardianDetails(student.getParentGuardianDetails());
        String address = java.util.stream.Stream.of(student.getStreet(), student.getMunicipality(), student.getDistrict(), student.getProvince())
                .filter(PeopleController::hasText).collect(java.util.stream.Collectors.joining(", "));
        return new StudentSelfProfile(student.getId(), personName(student.getFirstName(), student.getMiddleName(), student.getLastName()),
                student.getPhoto(), student.getAdmissionNumber(), student.getRollNumber(), className, sectionName,
                hasText(student.getStudentEmail()) ? student.getStudentEmail() : account == null ? null : account.getEmail(),
                student.getStudentPhone(), student.getDateOfBirth(), student.getGender(), address,
                text(guardian, "guardianName"), text(guardian, "guardianRelationship"), text(guardian, "guardianPhone"), text(guardian, "guardianEmail"));
    }

    private static String personName(String... parts) {
        return Arrays.stream(parts).filter(Objects::nonNull).map(String::trim).filter(part -> !part.isEmpty())
                .collect(java.util.stream.Collectors.joining(" "));
    }

    private static boolean hasText(String value) { return value != null && !value.isBlank(); }

    @GetMapping("/students/next-admission-no")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Map<String, String> nextAdmissionNumber() {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.STUDENT_MANAGEMENT);
        return Map.of("admissionNo", peopleIdentifierService.nextAdmissionNumber(schoolId));
    }

    private GuardianResponse buildGuardian(Parent parent) {
        if (parent == null) return null;
        return new GuardianResponse(
                parent.getId(), parent.getSchoolId(), parent.getGuardianCode(), parent.getFullName(), parent.getFirstName(), parent.getMiddleName(),
                parent.getLastName(), parent.getGender(), parent.getRelationship(), parent.getDateOfBirth(), parent.getOccupation(),
                parent.getOrganization(), parent.getOfficeAddress(), parent.getCitizenshipNumber(), parent.getNationality(), parent.getReligion(),
                parent.getPhoto(), parent.getPhone(), parent.getMobile(), parent.getAlternativeMobile(), parent.getLandline(), parent.getEmail(), parent.getAddress(),
                parent.getCommunicationPreference(),
                parent.getEmergencyContactPerson(), parent.getEmergencyContactNumber(), parent.getEmergencyContactRelationship(),
                parent.getDocuments(), parent.getDocumentMetadata(), parent.getNotes(), parent.getStatus(),
                parent.getFatherName(), parent.getMotherName(), parent.getFatherOccupation(), parent.getFatherPhone(), parent.getFatherEmail(),
                parent.getMotherOccupation(), parent.getMotherPhone(), parent.getMotherEmail(),
                0, parent.isDeleted(), parent.getCreatedAt(), parent.getUpdatedAt(), parent.getCreatedBy(), parent.getUpdatedBy()
        );
    }

    private StudentResponse buildStudentResponse(Student student) {
        Long schoolId = securityUtils.requiredSchoolId();
        SchoolClass schoolClass = student.getClassId() != null
                ? schoolClassRepository.findByIdAndSchoolIdAndDeletedFalse(student.getClassId(), schoolId).orElse(null)
                : null;
        Section section = student.getSectionId() != null
                ? sectionRepository.findByIdAndSchoolIdAndDeletedFalse(student.getSectionId(), schoolId).orElse(null)
                : null;
        Province province = student.getProvince() != null
                ? provinceRepository.findFirstByNameIgnoreCaseAndDeletedFalse(student.getProvince()).orElse(null)
                : null;
        District district = province != null && student.getDistrict() != null
                ? districtRepository.findFirstByProvinceIdAndNameIgnoreCaseAndDeletedFalse(province.getId(), student.getDistrict()).orElse(null)
                : null;
        Municipality municipality = district != null && student.getMunicipality() != null
                ? municipalityRepository.findFirstByDistrictIdAndNameIgnoreCaseAndDeletedFalse(district.getId(), student.getMunicipality()).orElse(null)
                : null;
        Ward ward = municipality != null && student.getWard() != null
                ? wardRepository.findFirstByMunicipalityIdAndNumberAndDeletedFalse(municipality.getId(), student.getWard()).orElse(null)
                : null;
        com.fasterxml.jackson.databind.JsonNode parentDetails = readParentGuardianDetails(student.getParentGuardianDetails());

        return new StudentResponse(
                student.getId(),
                student.getAdmissionNumber(),
                student.getRollNumber(),
                student.getFirstName(),
                student.getLastName(),
                student.getDateOfBirth() != null ? student.getDateOfBirth().toString() : null,
                student.getGender(),
                student.getStatus() != null ? student.getStatus().toLowerCase() : null,
                student.getClassId(),
                student.getSectionId(),
                null,
                schoolClass != null ? schoolClass.getName() : null,
                section != null ? section.getName() : null,
                text(parentDetails, "guardianName"),
                null,
                province != null ? province.getId() : null,
                student.getProvince(),
                district != null ? district.getId() : null,
                student.getDistrict(),
                municipality != null ? municipality.getId() : null,
                student.getMunicipality(),
                ward != null ? ward.getId() : null,
                student.getWard(),
                                     student.getStreet(),
                new StudentDetailsResponse(
                        student.getAcademicYear(), student.getMedium(), student.getAdmissionDate() != null ? student.getAdmissionDate().toString() : null,
                        student.getHouse(), student.getScholarship(), student.getMiddleName(), student.getBloodGroup(), student.getReligion(),
                         student.getCaste(), student.getNationality(), student.getMotherTongue(), student.getStudentPhone(), student.getStudentEmail(),
                         student.getCitizenshipNumber(), student.getEmisId(), student.getStudentIdBarcode(), student.getPhoto(),
                          text(parentDetails, "fatherFirstName"), text(parentDetails, "fatherMiddleName"), text(parentDetails, "fatherLastName"), text(parentDetails, "fatherOccupation"),
                          text(parentDetails, "fatherPhone"), text(parentDetails, "fatherEmail"), text(parentDetails, "fatherCitizenshipNumber"), text(parentDetails, "fatherPhoto"),
                          text(parentDetails, "motherFirstName"), text(parentDetails, "motherMiddleName"), text(parentDetails, "motherLastName"), text(parentDetails, "motherOccupation"),
                          text(parentDetails, "motherPhone"), text(parentDetails, "motherEmail"), text(parentDetails, "motherCitizenshipNumber"), text(parentDetails, "motherPhoto"),
                          text(parentDetails, "guardianSelection"), text(parentDetails, "guardianName"), text(parentDetails, "guardianRelationship"), text(parentDetails, "guardianPhone"),
                          text(parentDetails, "guardianEmail"), text(parentDetails, "guardianAddress"), text(parentDetails, "guardianOccupation"), text(parentDetails, "guardianCitizenshipNumber"),
                         student.getMedicalBloodGroup(),
                         student.getHeight(), student.getWeight(), student.getMedicalConditions(), student.getMedicalConditionsOther(), student.getAllergies(),
                        student.getDisability(), student.getEmergencyContactPerson(), student.getEmergencyContactNumber(), student.getPreviousSchool(),
                        student.getPreviousAddress(), student.getPreviousClass(), student.getTransferCertificateNumber(), student.getReasonForLeaving(),
                        student.getHasHostel(), student.getHostel(), student.getRoomNumber(), student.getBedNumber(), student.getUsesTransport(),
                         student.getRoute(), student.getPickupPoint(), student.getVehicle(), student.getDocuments(), student.getDocumentCategories(), student.getNotes()),
                student.getUserId() != null,
                student.getUserId() == null ? null : userRepository.findByIdAndDeletedFalse(student.getUserId()).map(User::getUsername).orElse(null)
        );
    }

    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER','PARENT','SUPER_ADMIN')")
    public Page<StudentResponse> students(Pageable pageable) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.STUDENT_MANAGEMENT);
        Page<Student> studentPage = studentRepository.findBySchoolIdAndDeletedFalse(schoolId, pageable);

        List<StudentResponse> responses = studentPage.getContent().stream()
                .map(this::buildStudentResponse)
                .toList();

        return new PageImpl<>(responses, pageable, studentPage.getTotalElements());
    }

    @GetMapping("/students/next-roll-number")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Map<String, Long> nextRollNumber(@RequestParam Long classId, @RequestParam Long sectionId) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.STUDENT_MANAGEMENT);
        return Map.of("nextRollNumber", peopleIdentifierService.nextRollNumber(schoolId, classId, sectionId));
    }

    @GetMapping("/students/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER','PARENT','STUDENT','SUPER_ADMIN')")
    public StudentResponse student(@PathVariable Long id) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.STUDENT_MANAGEMENT);
        if (securityUtils.currentUser().getRoles().contains(RoleName.STUDENT)) {
            Student own = studentRepository.findBySchoolIdAndUserIdAndDeletedFalse(schoolId, securityUtils.currentUser().getId())
                    .orElseThrow(() -> new ForbiddenException("Student profile required"));
            if (!own.getId().equals(id)) throw new ForbiddenException("Student profile access denied");
        }
        Student student = studentRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return buildStudentResponse(student);
    }

    @PostMapping("/students")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    @Transactional
    public StudentResponse createStudent(@Valid @RequestBody StudentRequest request) {
        if (log.isDebugEnabled()) {
            log.debug("Student create request: {}", request);
        }
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.STUDENT_MANAGEMENT);
        String admissionNumber = peopleIdentifierService.nextAdmissionNumber(schoolId);
        long rollNumber = peopleIdentifierService.nextRollNumber(schoolId, request.classId(), request.sectionId());
        StudentRequest generatedRequest = withGeneratedStudentNumbers(request, admissionNumber, String.valueOf(rollNumber));
        validateReferences(generatedRequest, schoolId, null);
        Student student = applyRequest(new Student(), generatedRequest, schoolId);
        student = studentRepository.save(student);
        if (Boolean.TRUE.equals(request.createLogin())) {
            User account = createStudentAccount(student, request.loginEmail(), request.username(), request.password(), request.confirmPassword());
            student.setUserId(account.getId());
            student = studentRepository.save(student);
        }
        return buildStudentResponse(student);
    }

    @PostMapping("/students/{id}/login-account")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Transactional
    public StudentLoginAccountResponse createStudentLoginAccount(@PathVariable Long id,
                                                                  @Valid @RequestBody StudentLoginAccountRequest request) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.STUDENT_MANAGEMENT);
        Student student = studentRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        if (student.getUserId() != null) throw new IllegalStateException("Student login account already exists");
        User account = createStudentAccount(student, request.email(), request.username(), request.password(), request.confirmPassword());
        student.setUserId(account.getId());
        studentRepository.save(student);
        return new StudentLoginAccountResponse(student.getId(), account.getId(), account.getUsername(), account.getEmail());
    }

    private StudentRequest withGeneratedStudentNumbers(StudentRequest request, String admissionNumber, String rollNumber) {
         return new StudentRequest(admissionNumber, rollNumber, request.firstName(), request.lastName(), request.dateOfBirth(), request.gender(),
                 request.parentId(), request.classId(), request.sectionId(), request.province(), request.district(), request.municipality(), request.ward(), request.street(),
                 request.fatherFirstName(), request.fatherMiddleName(), request.fatherLastName(), request.fatherOccupation(), request.fatherPhone(),
                 request.fatherEmail(), request.fatherCitizenshipNumber(), request.fatherPhoto(), request.motherFirstName(), request.motherMiddleName(),
                 request.motherLastName(), request.motherOccupation(), request.motherPhone(), request.motherEmail(), request.motherCitizenshipNumber(),
                 request.motherPhoto(), request.guardianSelection(), request.guardianName(), request.guardianRelationship(), request.guardianPhone(),
                 request.guardianEmail(), request.guardianAddress(), request.guardianOccupation(), request.guardianCitizenshipNumber(),
                 request.academicYear(), request.medium(), request.admissionDate(), request.house(), request.status(),
                 request.scholarship(), request.middleName(), request.bloodGroup(), request.religion(), request.caste(), request.nationality(), request.motherTongue(),
                 request.studentPhone(), request.studentEmail(), request.citizenshipNumber(), request.emisId(), request.studentIdBarcode(), request.photo(),
                 request.medicalBloodGroup(), request.height(), request.weight(), request.medicalConditions(), request.medicalConditionsOther(), request.allergies(),
                request.disability(), request.emergencyContactPerson(), request.emergencyContactNumber(), request.previousSchool(), request.previousAddress(),
                request.previousClass(), request.transferCertificateNumber(), request.reasonForLeaving(), request.hasHostel(), request.hostel(), request.roomNumber(),
                 request.bedNumber(), request.usesTransport(), request.route(), request.pickupPoint(), request.vehicle(), request.documents(), request.documentCategories(), request.notes(),
                 request.createLogin(), request.loginEmail(), request.username(), request.password(), request.confirmPassword());
    }

    @PutMapping("/students/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    @Transactional
    public StudentResponse updateStudent(@PathVariable Long id, @Valid @RequestBody StudentRequest request) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.STUDENT_MANAGEMENT);
        Student student = studentRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        validateReferences(request, schoolId, id);
        return buildStudentResponse(studentRepository.save(applyRequest(student, request, schoolId)));
    }

    @DeleteMapping("/students/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    @Transactional
    public void deleteStudent(@PathVariable Long id) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.STUDENT_MANAGEMENT);
        Student student = studentRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        student.setDeleted(true);
        studentRepository.save(student);
    }

    private Student applyRequest(Student student, StudentRequest request, Long schoolId) {
         student.setSchoolId(schoolId);
        student.setParentId(null);
         student.setAdmissionNumber(request.admissionNumber()); student.setRollNumber(request.rollNumber());
        student.setFirstName(request.firstName()); student.setLastName(request.lastName()); student.setDateOfBirth(request.dateOfBirth());
        student.setGender(request.gender()); student.setClassId(request.classId()); student.setSectionId(request.sectionId());
        student.setProvince(request.province()); student.setDistrict(request.district()); student.setMunicipality(request.municipality());
        student.setWard(request.ward()); student.setStreet(request.street()); student.setAcademicYear(request.academicYear());
        student.setMedium(request.medium()); student.setAdmissionDate(request.admissionDate()); student.setHouse(request.house());
        student.setStatus(request.status()); student.setScholarship(request.scholarship()); student.setMiddleName(request.middleName());
        student.setBloodGroup(request.bloodGroup()); student.setReligion(request.religion()); student.setCaste(request.caste());
        student.setNationality(request.nationality()); student.setMotherTongue(request.motherTongue()); student.setStudentPhone(request.studentPhone());
         student.setStudentEmail(request.studentEmail()); student.setCitizenshipNumber(request.citizenshipNumber()); student.setEmisId(request.emisId());
        student.setStudentIdBarcode(request.studentIdBarcode()); student.setPhoto(request.photo());
        student.setParentGuardianDetails(writeParentGuardianDetails(request));
        student.setMedicalBloodGroup(request.medicalBloodGroup());
        student.setHeight(request.height()); student.setWeight(request.weight()); student.setMedicalConditions(request.medicalConditions());
        student.setMedicalConditionsOther(request.medicalConditionsOther()); student.setAllergies(request.allergies()); student.setDisability(request.disability());
        student.setEmergencyContactPerson(request.emergencyContactPerson()); student.setEmergencyContactNumber(request.emergencyContactNumber());
        student.setPreviousSchool(request.previousSchool()); student.setPreviousAddress(request.previousAddress()); student.setPreviousClass(request.previousClass());
        student.setTransferCertificateNumber(request.transferCertificateNumber()); student.setReasonForLeaving(request.reasonForLeaving());
        student.setHasHostel(request.hasHostel()); student.setHostel(request.hostel()); student.setRoomNumber(request.roomNumber()); student.setBedNumber(request.bedNumber());
        student.setUsesTransport(request.usesTransport()); student.setRoute(request.route()); student.setPickupPoint(request.pickupPoint()); student.setVehicle(request.vehicle());
        student.setDocuments(request.documents()); student.setDocumentCategories(request.documentCategories()); student.setNotes(request.notes());

         return student;
    }

    private User createStudentAccount(Student student, String email, String username, String password, String confirmPassword) {
        String normalizedUsername = username == null ? "" : username.trim();
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(java.util.Locale.ROOT);
        if (normalizedUsername.isBlank()) throw new IllegalArgumentException("Username is required");
        if (normalizedEmail.isBlank()) throw new IllegalArgumentException("Email is required");
        if (password == null || password.length() < 8 || password.length() > 128)
            throw new IllegalArgumentException("Password must be between 8 and 128 characters");
        if (!password.equals(confirmPassword)) throw new IllegalArgumentException("Password confirmation does not match");
        if (userRepository.findByUsernameAndDeletedFalse(normalizedUsername).isPresent())
            throw new IllegalArgumentException("Username already exists");
        if (userRepository.findByEmailIgnoreCaseAndDeletedFalse(normalizedEmail).isPresent())
            throw new IllegalArgumentException("Email already exists");
        User account = new User();
        account.setSchoolId(student.getSchoolId());
        account.setUsername(normalizedUsername);
        account.setEmail(normalizedEmail);
        account.setPassword(passwordEncoder.encode(password));
        account.setRawPassword(null);
        account.setFullName(personName(student.getFirstName(), student.getMiddleName(), student.getLastName()));
        account.setRoles(java.util.Set.of(RoleName.STUDENT));
        account.setActive(true);
        return userRepository.save(account);
    }

    private String writeParentGuardianDetails(StudentRequest request) {
        Map<String, Object> details = new java.util.LinkedHashMap<>();
        details.put("fatherFirstName", request.fatherFirstName()); details.put("fatherMiddleName", request.fatherMiddleName());
        details.put("fatherLastName", request.fatherLastName()); details.put("fatherOccupation", request.fatherOccupation());
        details.put("fatherPhone", request.fatherPhone()); details.put("fatherEmail", request.fatherEmail());
        details.put("fatherCitizenshipNumber", request.fatherCitizenshipNumber()); details.put("fatherPhoto", request.fatherPhoto());
        details.put("motherFirstName", request.motherFirstName()); details.put("motherMiddleName", request.motherMiddleName());
        details.put("motherLastName", request.motherLastName()); details.put("motherOccupation", request.motherOccupation());
        details.put("motherPhone", request.motherPhone()); details.put("motherEmail", request.motherEmail());
        details.put("motherCitizenshipNumber", request.motherCitizenshipNumber()); details.put("motherPhoto", request.motherPhoto());
        details.put("guardianSelection", request.guardianSelection()); details.put("guardianName", request.guardianName());
        details.put("guardianRelationship", request.guardianRelationship()); details.put("guardianPhone", request.guardianPhone());
        details.put("guardianEmail", request.guardianEmail()); details.put("guardianAddress", request.guardianAddress());
        details.put("guardianOccupation", request.guardianOccupation()); details.put("guardianCitizenshipNumber", request.guardianCitizenshipNumber());
        try {
            return objectMapper.writeValueAsString(details);
        } catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
            throw new IllegalArgumentException("Unable to save parent and guardian information");
        }
    }

    private com.fasterxml.jackson.databind.JsonNode readParentGuardianDetails(String details) {
        if (details == null || details.isBlank()) return objectMapper.createObjectNode();
        try {
            return objectMapper.readTree(details);
        } catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
            log.warn("Invalid parent/guardian details JSON on student record");
            return objectMapper.createObjectNode();
        }
    }

    private String text(com.fasterxml.jackson.databind.JsonNode details, String field) {
        String value = details.path(field).asText(null);
        return value == null || value.isBlank() ? null : value;
    }

    private void validateReferences(StudentRequest request, Long schoolId, Long studentId) {
        boolean duplicateAdmission = studentId == null
                ? studentRepository.existsBySchoolIdAndAdmissionNumberIgnoreCaseAndDeletedFalse(schoolId, request.admissionNumber())
                : studentRepository.existsBySchoolIdAndAdmissionNumberIgnoreCaseAndIdNotAndDeletedFalse(schoolId, request.admissionNumber(), studentId);
        if (duplicateAdmission) throw new IllegalArgumentException("Admission number already exists");
        boolean duplicateRoll = studentId == null
                ? studentRepository.existsBySchoolIdAndClassIdAndSectionIdAndRollNumberIgnoreCaseAndDeletedFalse(schoolId, request.classId(), request.sectionId(), request.rollNumber())
                : studentRepository.existsBySchoolIdAndClassIdAndSectionIdAndRollNumberIgnoreCaseAndIdNotAndDeletedFalse(schoolId, request.classId(), request.sectionId(), request.rollNumber(), studentId);
        if (duplicateRoll) throw new IllegalArgumentException("Roll number already exists in this class and section");
        if (request.studentEmail() != null && !request.studentEmail().isBlank()) {
            boolean duplicateEmail = studentId == null
                    ? studentRepository.existsBySchoolIdAndStudentEmailIgnoreCaseAndDeletedFalse(schoolId, request.studentEmail())
                    : studentRepository.existsBySchoolIdAndStudentEmailIgnoreCaseAndIdNotAndDeletedFalse(schoolId, request.studentEmail(), studentId);
            if (duplicateEmail) throw new IllegalArgumentException("Student email already exists");
        }
        if (request.studentPhone() != null && !request.studentPhone().isBlank()) {
            boolean duplicatePhone = studentId == null
                    ? studentRepository.existsBySchoolIdAndStudentPhoneAndDeletedFalse(schoolId, request.studentPhone())
                    : studentRepository.existsBySchoolIdAndStudentPhoneAndIdNotAndDeletedFalse(schoolId, request.studentPhone(), studentId);
            if (duplicatePhone) throw new IllegalArgumentException("Student phone already exists");
        }
        schoolClassRepository.findByIdAndSchoolIdAndDeletedFalse(request.classId(), schoolId).orElseThrow(() -> new IllegalArgumentException("Invalid class"));
        Section section = sectionRepository.findByIdAndSchoolIdAndDeletedFalse(request.sectionId(), schoolId).orElseThrow(() -> new IllegalArgumentException("Invalid section"));
        if (!request.classId().equals(section.getClassId())) throw new IllegalArgumentException("Section does not belong to class");
         if (request.province() != null && provinceRepository.findFirstByNameIgnoreCaseAndDeletedFalse(request.province()).isEmpty()) throw new IllegalArgumentException("Invalid province");
        if (request.district() != null && request.province() != null) {
            Province p = provinceRepository.findFirstByNameIgnoreCaseAndDeletedFalse(request.province()).orElseThrow();
            District d = districtRepository.findFirstByProvinceIdAndNameIgnoreCaseAndDeletedFalse(p.getId(), request.district()).orElseThrow(() -> new IllegalArgumentException("Invalid district"));
        }
    }

    @PutMapping("/students/{id}/promote")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Student promoteStudent(@PathVariable Long id, @RequestParam Long classId, @RequestParam Long sectionId) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.STUDENT_MANAGEMENT);
        Student student = studentRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        student.setClassId(classId); student.setSectionId(sectionId);
        return studentRepository.save(student);
    }

    @PutMapping("/students/{id}/transfer")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Student transferStudent(@PathVariable Long id) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.STUDENT_MANAGEMENT);
        Student student = studentRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        student.setStatus("TRANSFERRED");
        return studentRepository.save(student);
    }

    @GetMapping("/students/locations/districts")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER','PARENT','STUDENT','SUPER_ADMIN')")
    public List<Map<String, Object>> districts(@RequestParam(required = false) Long provinceId) {
        List<District> districts = provinceId != null
                ? districtRepository.findByProvinceIdAndDeletedFalse(provinceId)
                : districtRepository.findAllByDeletedFalse();
        return districts.stream()
                .map(d -> Map.<String, Object>of("id", d.getId(), "name", d.getName(), "provinceId", d.getProvinceId()))
                .toList();
    }

    @GetMapping("/students/locations/municipalities")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER','PARENT','STUDENT','SUPER_ADMIN')")
    public List<Map<String, Object>> municipalities(@RequestParam(required = false) Long districtId) {
        List<Municipality> municipalities = districtId != null
                ? municipalityRepository.findByDistrictIdAndDeletedFalse(districtId)
                : municipalityRepository.findAllByDeletedFalse();
        return municipalities.stream()
                .map(m -> Map.<String, Object>of("id", m.getId(), "name", m.getName(), "type", m.getType(), "districtId", m.getDistrictId()))
                .toList();
    }

    @GetMapping("/students/locations/wards")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER','PARENT','STUDENT','SUPER_ADMIN')")
    public List<Map<String, Object>> wards(@RequestParam(required = false) Long municipalityId) {
        List<Ward> wards = municipalityId != null
                ? wardRepository.findByMunicipalityIdAndDeletedFalse(municipalityId)
                : wardRepository.findAllByDeletedFalse();
        return wards.stream()
                .map(w -> Map.<String, Object>of("id", w.getId(), "number", w.getNumber(), "name", w.getName() != null ? w.getName() : "", "municipalityId", w.getMunicipalityId()))
                .toList();
    }

    @GetMapping("/students/locations/provinces")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER','PARENT','STUDENT','SUPER_ADMIN')")
    public List<Map<String, Object>> provinces() {
        return provinceRepository.findAllByDeletedFalse().stream()
                .map(p -> Map.<String, Object>of("id", p.getId(), "name", p.getName()))
                .toList();
    }

    @GetMapping("/students/guardians")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Page<Parent> studentGuardians(Pageable pageable) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.STUDENT_MANAGEMENT);
        return parentRepository.findBySchoolIdAndDeletedFalse(schoolId, pageable);
    }

    @GetMapping("/teachers")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER','SUPER_ADMIN')")
    public Page<Teacher> teachers(@RequestParam(required = false) String search, @RequestParam(required = false) String status, Pageable pageable) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.TEACHER_MANAGEMENT);
        if (status != null && !status.isBlank()) return teacherRepository.findBySchoolIdAndDeletedFalseAndStatusIgnoreCase(schoolId, status, pageable);
        if (search != null && !search.isBlank()) return teacherRepository.findBySchoolIdAndDeletedFalseAndFirstNameContainingIgnoreCaseOrSchoolIdAndDeletedFalseAndLastNameContainingIgnoreCaseOrSchoolIdAndDeletedFalseAndEmployeeNumberContainingIgnoreCase(schoolId, search, schoolId, search, schoolId, search, pageable);
        return teacherRepository.findBySchoolIdAndDeletedFalse(schoolId, pageable);
    }

    @GetMapping("/teachers/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER','SUPER_ADMIN')")
    public Teacher teacher(@PathVariable Long id) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.TEACHER_MANAGEMENT);
        return teacherRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
    }

    @GetMapping("/teachers/summary")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public TeacherSummaryResponse teacherSummary() {
        Long schoolId = securityUtils.requiredSchoolId();
        long total = teacherRepository.countBySchoolIdAndDeletedFalse(schoolId);
        return new TeacherSummaryResponse(total, teacherRepository.countBySchoolIdAndStatusIgnoreCaseAndDeletedFalse(schoolId, "ACTIVE"), teacherRepository.countBySchoolIdAndStatusIgnoreCaseAndDeletedFalse(schoolId, "INACTIVE"));
    }

    @GetMapping("/teachers/next-teacher-id")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Map<String, String> nextTeacherId() {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.TEACHER_MANAGEMENT);
        return Map.of("teacherId", peopleIdentifierService.nextTeacherId(schoolId));
    }

    @GetMapping("/teachers/next-employee-code")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Map<String, String> nextEmployeeCode() {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.TEACHER_MANAGEMENT);
        return Map.of("employeeCode", peopleIdentifierService.nextEmployeeCode(schoolId));
    }

    @PostMapping("/teachers")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Teacher createTeacher(@Valid @RequestBody TeacherRequest request) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.TEACHER_MANAGEMENT);
        if (teacherRepository.existsBySchoolIdAndEmployeeNumberIgnoreCaseAndDeletedFalse(schoolId, request.employeeNumber())) throw new IllegalArgumentException("Employee number already exists");
        if (teacherRepository.existsBySchoolIdAndEmailIgnoreCaseAndDeletedFalse(schoolId, request.email())) throw new IllegalArgumentException("Teacher email already exists");
        validateEmployeeCode(request.details(), schoolId, null);
        Teacher teacher = new Teacher();
        applyTeacher(teacher, request, schoolId);
        return teacherRepository.save(teacher);
    }

    @PutMapping("/teachers/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Teacher updateTeacher(@PathVariable Long id, @Valid @RequestBody TeacherRequest request) {
        Long schoolId = securityUtils.requiredSchoolId();
        Teacher teacher = teacherRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        if (teacherRepository.existsBySchoolIdAndEmployeeNumberIgnoreCaseAndIdNotAndDeletedFalse(schoolId, request.employeeNumber(), id)) throw new IllegalArgumentException("Employee number already exists");
        if (teacherRepository.existsBySchoolIdAndEmailIgnoreCaseAndIdNotAndDeletedFalse(schoolId, request.email(), id)) throw new IllegalArgumentException("Teacher email already exists");
        validateEmployeeCode(request.details(), schoolId, id);
        applyTeacher(teacher, request, schoolId); return teacherRepository.save(teacher);
    }

    @DeleteMapping("/teachers/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public void deleteTeacher(@PathVariable Long id) {
        Long schoolId = securityUtils.requiredSchoolId();
        Teacher teacher = teacherRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        teacher.setDeleted(true); teacherRepository.save(teacher);
    }

    @GetMapping("/teachers/{id}/assignments")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER','SUPER_ADMIN')")
    public List<TeacherSubject> teacherAssignments(@PathVariable Long id) {
        Long schoolId = securityUtils.requiredSchoolId();
        teacherRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        return teacherSubjectRepository.findBySchoolIdAndTeacherIdAndDeletedFalse(schoolId, id);
    }

    @GetMapping("/teachers/{id}/leaves")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER','SUPER_ADMIN')")
    public List<LeaveRequest> teacherLeaves(@PathVariable Long id) {
        Long schoolId = securityUtils.requiredSchoolId();
        return leaveRequestRepository.findBySchoolIdAndTeacherIdAndDeletedFalse(schoolId, id);
    }

    private void applyTeacher(Teacher teacher, TeacherRequest request, Long schoolId) {
        teacher.setSchoolId(schoolId); teacher.setEmployeeNumber(request.employeeNumber()); teacher.setFirstName(request.firstName()); teacher.setLastName(request.lastName());
        teacher.setPhone(request.phone()); teacher.setEmail(request.email()); teacher.setQualification(request.qualification()); teacher.setMiddleName(request.middleName());
        teacher.setGender(request.gender()); teacher.setDateOfBirth(request.dateOfBirth()); teacher.setPhoto(request.photo()); teacher.setJoiningDate(request.joiningDate());
        teacher.setEmploymentType(request.employmentType()); teacher.setDepartment(request.department()); teacher.setDesignation(request.designation());
        teacher.setStatus(request.status() == null ? "ACTIVE" : request.status().toUpperCase()); teacher.setExperience(request.experience()); teacher.setBasicSalary(request.basicSalary()); teacher.setDetails(request.details());
    }

    private void validateEmployeeCode(String details, Long schoolId, Long teacherId) {
        try {
            String employeeCode = objectMapper.readTree(details == null ? "{}" : details).path("employeeCode").asText("").trim();
            if (employeeCode.isEmpty()) throw new IllegalArgumentException("Employee Code must not be blank");
            long duplicates = teacherId == null
                    ? teacherRepository.countBySchoolIdAndEmployeeCode(schoolId, employeeCode)
                    : teacherRepository.countBySchoolIdAndIdNotAndEmployeeCode(schoolId, teacherId, employeeCode);
            if (duplicates > 0) throw new IllegalArgumentException("Employee Code already exists");
        } catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
            throw new IllegalArgumentException("Invalid Teacher details payload");
        }
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
        parent.setSchoolId(schoolId); parent.setGuardianCode(peopleIdentifierService.nextGuardianCode(schoolId)); parent.setFullName(request.fullName()); parent.setPhone(request.phone()); parent.setEmail(request.email()); parent.setAddress(request.address());
        return parentRepository.save(parent);
    }

    @GetMapping("/guardians")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Page<GuardianResponse> guardians(@RequestParam(required = false) String search,
                                            @RequestParam(required = false) String relationship,
                                            @RequestParam(required = false) String occupation,
                                            @RequestParam(required = false) String communicationPreference,
                                            @RequestParam(required = false) String status,
                                            @RequestParam(required = false) String province,
                                            @RequestParam(required = false) String district,
                                            @RequestParam(required = false) Boolean hasStudents,
                                            @RequestParam(required = false) Boolean deleted,
                                            Pageable pageable) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.PARENT_MANAGEMENT);
        Page<Parent> page = parentRepository.findAll(guardianSpecification(schoolId, search, relationship, occupation,
                communicationPreference, status, province, district, hasStudents, deleted), pageable);
        List<GuardianResponse> responses = page.getContent().stream()
                .map(this::buildGuardianWithCount)
                .toList();
        return new PageImpl<>(responses, pageable, page.getTotalElements());
    }

    @GetMapping("/guardians/search")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Page<GuardianResponse> searchGuardians(@RequestParam String search, Pageable pageable) {
        return guardians(search, null, null, null, null, null, null, null, false, pageable);
    }

    @GetMapping("/guardians/summary")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public GuardianSummaryResponse guardianSummary() {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.PARENT_MANAGEMENT);
        long total = parentRepository.countBySchoolIdAndDeletedFalse(schoolId);
        return new GuardianSummaryResponse(total, parentRepository.countBySchoolIdAndStatusIgnoreCaseAndDeletedFalse(schoolId, "ACTIVE"), parentRepository.countBySchoolIdAndStatusIgnoreCaseAndDeletedFalse(schoolId, "INACTIVE"));
    }

    @PostMapping("/guardians")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public GuardianResponse createGuardian(@Valid @RequestBody GuardianRequest request) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.PARENT_MANAGEMENT);
        validateGuardianDuplicates(request.phone(), request.email(), request.citizenshipNumber(), schoolId, null);
        Parent parent = new Parent();
        parent.setGuardianCode(peopleIdentifierService.nextGuardianCode(schoolId));
        applyGuardian(parent, request, schoolId);
        return buildGuardianWithCount(parentRepository.save(parent));
    }

    @GetMapping("/guardians/export")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<byte[]> exportGuardians(@RequestParam(required = false) String search,
                                                   @RequestParam(required = false) String relationship,
                                                   @RequestParam(required = false) String occupation,
                                                   @RequestParam(required = false) String communicationPreference,
                                                   @RequestParam(required = false) String status,
                                                   @RequestParam(required = false) String province,
                                                   @RequestParam(required = false) String district,
                                                   @RequestParam(required = false) Boolean hasStudents,
                                                   @RequestParam(required = false) Boolean deleted) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.PARENT_MANAGEMENT);
        List<Parent> parents = parentRepository.findAll(guardianSpecification(schoolId, search, relationship, occupation,
                communicationPreference, status, province, district, hasStudents, deleted));
        StringBuilder csv = new StringBuilder("Guardian Code,First Name,Middle Name,Last Name,Gender,Relationship,Phone,Email,Occupation,Citizenship Number,Status,Children\r\n");
        for (Parent parent : parents) {
            csv.append(csv(parent.getGuardianCode())).append(',').append(csv(parent.getFirstName())).append(',')
                    .append(csv(parent.getMiddleName())).append(',').append(csv(parent.getLastName())).append(',')
                    .append(csv(parent.getGender())).append(',').append(csv(parent.getRelationship())).append(',')
                    .append(csv(parent.getPhone())).append(',').append(csv(parent.getEmail())).append(',')
                    .append(csv(parent.getOccupation())).append(',').append(csv(parent.getCitizenshipNumber())).append(',')
                    .append(csv(parent.getStatus())).append(',')
                    .append(studentRepository.countBySchoolIdAndParentIdAndDeletedFalse(schoolId, parent.getId())).append("\r\n");
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=guardians.csv")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(csv.toString().getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/guardians/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public GuardianResponse guardian(@PathVariable Long id) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.PARENT_MANAGEMENT);
        Parent parent = parentRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new ResourceNotFoundException("Guardian not found"));
        return buildGuardianWithCount(parent);
    }

    @PutMapping("/guardians/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public GuardianResponse updateGuardian(@PathVariable Long id, @Valid @RequestBody GuardianRequest request) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.PARENT_MANAGEMENT);
        Parent parent = parentRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new ResourceNotFoundException("Guardian not found"));
        validateGuardianDuplicates(request.phone(), request.email(), request.citizenshipNumber(), schoolId, id);
        applyGuardian(parent, request, schoolId);
        return buildGuardianWithCount(parentRepository.save(parent));
    }

    @DeleteMapping("/guardians/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    @Transactional
    public void deleteGuardian(@PathVariable Long id) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.PARENT_MANAGEMENT);
        Parent parent = parentRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new ResourceNotFoundException("Guardian not found"));
        long linkedStudents = studentRepository.countBySchoolIdAndParentId(schoolId, id);
        if (linkedStudents > 0) {
            throw new IllegalArgumentException("This family has enrolled students. Transfer students to another guardian before deleting.");
        }
        parent.setDeleted(true);
        parentRepository.save(parent);
    }

    @RequestMapping(value = "/guardians/{id}/restore", method = {RequestMethod.POST, RequestMethod.PUT})
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public GuardianResponse restoreGuardian(@PathVariable Long id) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.PARENT_MANAGEMENT);
        Parent parent = parentRepository.findByIdAndSchoolId(id, schoolId).orElseThrow(() -> new ResourceNotFoundException("Guardian not found"));
        if (!parent.isDeleted()) {
            throw new IllegalArgumentException("Guardian is not deleted");
        }
        validateGuardianDuplicates(parent.getPhone(), parent.getEmail(), parent.getCitizenshipNumber(), schoolId, id);
        parent.setDeleted(false);
        return buildGuardianWithCount(parentRepository.save(parent));
    }

    @PostMapping("/guardians/{id}/link-student")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    @Transactional
    public GuardianResponse linkStudent(@PathVariable Long id, @Valid @RequestBody LinkStudentRequest request) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.PARENT_MANAGEMENT);
        Parent parent = parentRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new ResourceNotFoundException("Guardian not found"));
        Student student = studentRepository.findByIdAndSchoolIdAndDeletedFalse(request.studentId(), schoolId).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        if (student.getParentId() != null && student.getParentId().equals(id)) {
            throw new IllegalArgumentException("Student is already linked to this guardian");
        }
        if (student.getParentId() != null && !student.getParentId().equals(id)) {
            Parent existingParent = parentRepository.findByIdAndSchoolIdAndDeletedFalse(student.getParentId(), schoolId).orElse(null);
            if (existingParent != null) {
                throw new IllegalArgumentException("Student is already linked to another guardian");
            }
        }
        student.setParentId(id);
        studentRepository.save(student);
        return buildGuardianWithCount(parent);
    }

    @DeleteMapping("/guardians/{id}/unlink-student/{studentId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    @Transactional
    public GuardianResponse unlinkStudent(@PathVariable Long id, @PathVariable Long studentId) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.PARENT_MANAGEMENT);
        Parent parent = parentRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new ResourceNotFoundException("Guardian not found"));
        Student student = studentRepository.findByIdAndSchoolIdAndDeletedFalse(studentId, schoolId).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        if (!id.equals(student.getParentId())) {
            throw new IllegalArgumentException("Student is not linked to this guardian");
        }
        long activeChildren = studentRepository.countBySchoolIdAndParentIdAndDeletedFalse(schoolId, id);
        if (activeChildren <= 1) {
            throw new IllegalArgumentException("Cannot unlink. Student would be without any guardian.");
        }
        student.setParentId(null);
        studentRepository.save(student);
        return buildGuardianWithCount(parent);
    }

    @GetMapping("/guardians/{id}/children")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<ChildResponse> children(@PathVariable Long id) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.PARENT_MANAGEMENT);
        parentRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow(() -> new ResourceNotFoundException("Guardian not found"));
        List<Student> students = studentRepository.findBySchoolIdAndParentIdAndDeletedFalse(schoolId, id);
        return students.stream().map(student -> {
            SchoolClass schoolClass = student.getClassId() != null ? schoolClassRepository.findByIdAndSchoolIdAndDeletedFalse(student.getClassId(), schoolId).orElse(null) : null;
            Section section = student.getSectionId() != null ? sectionRepository.findByIdAndSchoolIdAndDeletedFalse(student.getSectionId(), schoolId).orElse(null) : null;
            return new ChildResponse(
                    student.getId(), student.getAdmissionNumber(), student.getRollNumber(),
                    student.getFirstName(), student.getLastName(),
                    schoolClass != null ? schoolClass.getName() : null,
                    section != null ? section.getName() : null,
                    student.getStatus(),
                    student.getPhoto()
            );
        }).toList();
    }

    private GuardianResponse buildGuardianWithCount(Parent parent) {
        if (parent == null) return null;
        long childrenCount = studentRepository.countBySchoolIdAndParentIdAndDeletedFalse(parent.getSchoolId(), parent.getId());
        return new GuardianResponse(
                parent.getId(), parent.getSchoolId(), parent.getGuardianCode(), parent.getFullName(), parent.getFirstName(), parent.getMiddleName(),
                parent.getLastName(), parent.getGender(), parent.getRelationship(), parent.getDateOfBirth(), parent.getOccupation(),
                parent.getOrganization(), parent.getOfficeAddress(), parent.getCitizenshipNumber(), parent.getNationality(), parent.getReligion(),
                parent.getPhoto(), parent.getPhone(), parent.getMobile(), parent.getAlternativeMobile(), parent.getLandline(), parent.getEmail(), parent.getAddress(),
                parent.getCommunicationPreference(),
                parent.getEmergencyContactPerson(), parent.getEmergencyContactNumber(), parent.getEmergencyContactRelationship(),
                parent.getDocuments(), parent.getDocumentMetadata(), parent.getNotes(), parent.getStatus(),
                parent.getFatherName(), parent.getMotherName(), parent.getFatherOccupation(), parent.getFatherPhone(), parent.getFatherEmail(),
                parent.getMotherOccupation(), parent.getMotherPhone(), parent.getMotherEmail(),
                childrenCount, parent.isDeleted(), parent.getCreatedAt(), parent.getUpdatedAt(), parent.getCreatedBy(), parent.getUpdatedBy()
        );
    }

    private void applyGuardian(Parent parent, GuardianRequest request, Long schoolId) {
        parent.setSchoolId(schoolId);
        parent.setFirstName(request.firstName().trim());
        parent.setMiddleName(trimToNull(request.middleName()));
        parent.setLastName(request.lastName().trim());
        parent.setFullName(String.join(" ", java.util.stream.Stream.of(parent.getFirstName(), parent.getMiddleName(), parent.getLastName())
                .filter(value -> value != null && !value.isBlank()).toList()));
        parent.setGender(request.gender().trim());
        parent.setDateOfBirth(request.dateOfBirth());
        parent.setPhone(request.phone().trim());
        parent.setMobile(trimToNull(request.mobile()));
        parent.setAlternativeMobile(trimToNull(request.alternativeMobile()));
        parent.setLandline(trimToNull(request.landline()));
        parent.setEmail(trimToNull(request.email()));
        parent.setAddress(request.address().trim());
        parent.setRelationship(request.relationship());
        parent.setOccupation(request.occupation());
        parent.setOrganization(request.organization());
        parent.setOfficeAddress(request.officeAddress());
        parent.setCitizenshipNumber(trimToNull(request.citizenshipNumber()));
        parent.setNationality(request.nationality());
        parent.setReligion(request.religion());
        parent.setCommunicationPreference(request.communicationPreference());
        parent.setEmergencyContactPerson(request.emergencyContactPerson());
        parent.setEmergencyContactNumber(request.emergencyContactNumber());
        parent.setEmergencyContactRelationship(request.emergencyContactRelationship());
        parent.setPhoto(request.photo());
        parent.setDocuments(request.documents());
        parent.setDocumentMetadata(request.documentMetadata());
        parent.setNotes(request.notes());
        parent.setFatherName(request.fatherName());
        parent.setMotherName(request.motherName());
        parent.setFatherOccupation(request.fatherOccupation());
        parent.setFatherPhone(request.fatherPhone());
        parent.setFatherEmail(request.fatherEmail());
        parent.setMotherOccupation(request.motherOccupation());
        parent.setMotherPhone(request.motherPhone());
        parent.setMotherEmail(request.motherEmail());
        parent.setStatus(request.status() == null || request.status().isBlank() ?
                (parent.getStatus() == null ? "ACTIVE" : parent.getStatus()) : request.status().trim().toUpperCase());
    }

    private void validateGuardianDuplicates(String phone, String email, String citizenshipNumber, Long schoolId, Long guardianId) {
        boolean phoneExists = guardianId == null
                ? parentRepository.existsBySchoolIdAndPhoneAndDeletedFalse(schoolId, phone.trim())
                : parentRepository.existsBySchoolIdAndPhoneAndIdNotAndDeletedFalse(schoolId, phone.trim(), guardianId);
        if (phoneExists) throw new IllegalArgumentException("Phone number already exists");

        String normalizedEmail = trimToNull(email);
        if (normalizedEmail != null) {
            boolean emailExists = guardianId == null
                    ? parentRepository.existsBySchoolIdAndEmailIgnoreCaseAndDeletedFalse(schoolId, normalizedEmail)
                    : parentRepository.existsBySchoolIdAndEmailIgnoreCaseAndIdNotAndDeletedFalse(schoolId, normalizedEmail, guardianId);
            if (emailExists) throw new IllegalArgumentException("Email already exists");
        }

        String citizenship = trimToNull(citizenshipNumber);
        if (citizenship != null) {
            boolean citizenshipExists = guardianId == null
                    ? parentRepository.existsBySchoolIdAndCitizenshipNumberIgnoreCaseAndDeletedFalse(schoolId, citizenship)
                    : parentRepository.existsBySchoolIdAndCitizenshipNumberIgnoreCaseAndIdNotAndDeletedFalse(schoolId, citizenship, guardianId);
            if (citizenshipExists) throw new IllegalArgumentException("Citizenship number already exists");
        }
    }

    private Specification<Parent> guardianSpecification(Long schoolId, String search, String relationship, String occupation,
                                                         String communicationPreference, String status, String province,
                                                         String district, Boolean hasStudents, Boolean deleted) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(builder.equal(root.get("schoolId"), schoolId));
            predicates.add(builder.equal(root.get("deleted"), Boolean.TRUE.equals(deleted)));
            addEqualIgnoreCase(predicates, builder, root.get("relationship"), relationship);
            addLike(predicates, builder, root.get("occupation"), occupation);
            addEqualIgnoreCase(predicates, builder, root.get("communicationPreference"), communicationPreference);
            addEqualIgnoreCase(predicates, builder, root.get("status"), status);
            addLike(predicates, builder, root.get("address"), province);
            addLike(predicates, builder, root.get("address"), district);

            if (search != null && !search.isBlank()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Subquery<Long> matchingStudents = query.subquery(Long.class);
                var student = matchingStudents.from(Student.class);
                matchingStudents.select(student.get("parentId")).where(
                        builder.equal(student.get("schoolId"), schoolId),
                        builder.isFalse(student.get("deleted")),
                        builder.or(builder.like(builder.lower(student.get("firstName")), term),
                                builder.like(builder.lower(student.get("lastName")), term),
                                builder.like(builder.lower(builder.concat(builder.concat(student.get("firstName"), " "), student.get("lastName"))), term),
                                builder.like(builder.lower(student.get("admissionNumber")), term)));
                predicates.add(builder.or(
                        builder.like(builder.lower(root.get("fullName")), term),
                        builder.like(builder.lower(root.get("fatherName")), term),
                        builder.like(builder.lower(root.get("motherName")), term),
                        builder.like(builder.lower(root.get("phone")), term),
                        builder.like(builder.lower(root.get("email")), term),
                        builder.like(builder.lower(root.get("guardianCode")), term),
                        builder.like(builder.lower(root.get("occupation")), term),
                        root.get("id").in(matchingStudents)));
            }
            if (hasStudents != null) {
                Subquery<Long> linkedStudents = query.subquery(Long.class);
                var student = linkedStudents.from(Student.class);
                linkedStudents.select(student.get("parentId")).where(
                        builder.equal(student.get("schoolId"), schoolId), builder.isFalse(student.get("deleted")));
                predicates.add(hasStudents ? root.get("id").in(linkedStudents) : builder.not(root.get("id").in(linkedStudents)));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private void addEqualIgnoreCase(List<Predicate> predicates, jakarta.persistence.criteria.CriteriaBuilder builder,
                                    jakarta.persistence.criteria.Path<String> path, String value) {
        if (value != null && !value.isBlank()) predicates.add(builder.equal(builder.lower(path), value.trim().toLowerCase()));
    }

    private void addLike(List<Predicate> predicates, jakarta.persistence.criteria.CriteriaBuilder builder,
                         jakarta.persistence.criteria.Path<String> path, String value) {
        if (value != null && !value.isBlank()) predicates.add(builder.like(builder.lower(path), "%" + value.trim().toLowerCase() + "%"));
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String csv(String value) {
        if (value == null) return "";
        return '"' + value.replace("\"", "\"\"") + '"';
    }
}
