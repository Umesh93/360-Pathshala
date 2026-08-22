package com.pathshala.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.pathshala.dto.ExaminationDtos.Result;
import com.pathshala.entity.AttendanceStatus;
import com.pathshala.entity.LeaveStatus;
import com.pathshala.entity.ModuleCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;
import java.util.Set;
import lombok.Data;

public class ApiDtos {
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record AccountProfile(Long userId, Long schoolId, String username, String fullName, String email,
                                 String phone, Set<com.pathshala.entity.RoleName> roles) {}
    public record UpdateAccountProfile(@NotBlank String fullName) {
        public UpdateAccountProfile(String fullName, String email, String phone) { this(fullName); }
    }
    public record ChangePasswordRequest(@NotBlank String currentPassword,
                                        @NotBlank @Size(min = 8, max = 128) String newPassword,
                                        @NotBlank @Size(min = 8, max = 128) String confirmPassword) {}
    public record SchoolRequest(@NotBlank String name, @NotBlank String code, String address, String phone, String email, List<String> features) {}
    public record CreateSchoolRequest(@NotBlank String name, String address, @NotBlank String email, String phone, @NotBlank String contactPerson, @NotBlank String designation, List<ModuleCode> modules, String status, String password) {}
    public record CreateSchoolResponse(Long id, String schoolCode, String adminUsername, String adminPassword, java.math.BigDecimal totalAmount, String paymentReference, List<ModuleCode> selectedModules) {}
    public record SchoolSummary(Long id, String code, String name, String address, String phone, String email, String contactPerson, String designation, String status, List<String> modules, String adminUsername, String adminPassword, String logoUrl) {}
    public record SchoolLogoResponse(boolean present, String url) {}
    public record PlanRequest(@NotBlank String name, @PositiveOrZero BigDecimal monthlyPrice, String description,
                              String code, Integer durationDays, List<ModuleCode> moduleCodes, Boolean active) {
        public PlanRequest(String name, BigDecimal monthlyPrice, String description) { this(name, monthlyPrice, description, null, null, null, null); }
    }
    public record ModuleRequest(@NotNull ModuleCode code, @NotBlank String name, String description, boolean active, boolean selectable, boolean comingSoon, String category, boolean required) {}
    public record ModuleAssignmentRequest(@NotNull Long schoolId, @NotNull ModuleCode moduleCode, boolean active) {}
    public record AcademicYearRequest(String name, LocalDate startsOn, LocalDate endsOn, boolean active) {}
    public record ClassRequest(@NotBlank String name, @NotBlank String code) {}
    public record SectionRequest(@NotNull Long classId, @NotBlank String name, @PositiveOrZero Integer capacity) {}
    public record SubjectRequest(@NotNull Long classId, @NotBlank String subjectCode, @NotBlank String subjectName,
                                 @NotBlank String subjectType, @PositiveOrZero BigDecimal creditHours,
                                 @NotNull @Positive BigDecimal fullMarks, @NotNull @PositiveOrZero BigDecimal passMarks,
                                 boolean optional, @NotBlank String status, String description) {}
    public record SubjectResponse(Long id, Long schoolId, Long classId, String className, String subjectCode,
                                  String subjectName, String subjectType, BigDecimal creditHours, BigDecimal fullMarks,
                                  BigDecimal passMarks, boolean optional, String status, String description,
                                  long assignedTeacherCount, boolean deleted, java.time.Instant createdAt,
                                  java.time.Instant updatedAt, Long createdBy, Long updatedBy) {}
    public record SubjectTeacherRequest(@NotNull Long teacherId, @NotNull Long sectionId, Long academicSessionId) {
        public SubjectTeacherRequest(Long teacherId, Long sectionId) { this(teacherId, sectionId, null); }
    }
    public record TeacherSubjectRequest(Long teacherId, Long subjectId, Long classId, Long sectionId, Long academicSessionId) {
        public TeacherSubjectRequest(Long teacherId, Long subjectId, Long classId, Long sectionId) { this(teacherId, subjectId, classId, sectionId, null); }
    }
    public record SubjectTeacherMapping(@NotNull Long subjectId, Long teacherId) {}
    public record TeacherAssignmentBulkRequest(@NotNull Long academicSessionId, @NotNull Long classId,
                                                @NotNull Long sectionId, @NotNull List<SubjectTeacherMapping> mappings) {}
    public record TeacherAssignmentRow(Long subjectId, String subjectCode, String subjectName,
                                       Long teacherId, String teacherName) {}
    public record TeacherAssignmentScopeResponse(Long academicSessionId, String academicSessionName,
                                                 Long classId, String className, Long sectionId, String sectionName,
                                                 Long subjectId, String subjectCode, String subjectName) {}
    public record StudentRequest(
            String admissionNumber, String rollNumber, @NotBlank String firstName,
            @NotBlank String lastName, @NotNull LocalDate dateOfBirth, @NotBlank String gender,
             Long parentId, @NotNull Long classId, @NotNull Long sectionId,
             String province, String district, String municipality, @PositiveOrZero Integer ward, String street,
             String fatherFirstName, String fatherMiddleName, String fatherLastName,
             String fatherOccupation, String fatherPhone, String fatherEmail,
             String fatherCitizenshipNumber, String fatherPhoto,
             String motherFirstName, String motherMiddleName, String motherLastName,
             String motherOccupation, String motherPhone, String motherEmail,
             String motherCitizenshipNumber, String motherPhoto,
             String guardianSelection, String guardianName, String guardianRelationship,
             String guardianPhone, String guardianEmail, String guardianAddress,
             String guardianOccupation, String guardianCitizenshipNumber,
             String academicYear, String medium, LocalDate admissionDate, String house, String status,
             String scholarship, String middleName, String bloodGroup, String religion, String caste,
             String nationality, String motherTongue, String studentPhone, String studentEmail,
             String citizenshipNumber, String emisId, String studentIdBarcode, String photo,
             String medicalBloodGroup, String height, String weight, String medicalConditions,
            String medicalConditionsOther, String allergies, String disability,
            String emergencyContactPerson, String emergencyContactNumber,
            String previousSchool, String previousAddress, String previousClass,
            String transferCertificateNumber, String reasonForLeaving,
            Boolean hasHostel, String hostel, String roomNumber, String bedNumber,
            Boolean usesTransport, String route, String pickupPoint, String vehicle,
            String documents, String documentCategories, String notes) {}
    public record StudentDetailsResponse(
            String academicYear, String medium, String admissionDate, String house, String scholarship,
             String middleName, String bloodGroup, String religion, String caste, String nationality,
             String motherTongue, String studentPhone, String studentEmail, String citizenshipNumber,
             String emisId, String studentIdBarcode, String photo,
             String fatherFirstName, String fatherMiddleName, String fatherLastName,
             String fatherOccupation, String fatherPhone, String fatherEmail,
             String fatherCitizenshipNumber, String fatherPhoto,
             String motherFirstName, String motherMiddleName, String motherLastName,
             String motherOccupation, String motherPhone, String motherEmail,
             String motherCitizenshipNumber, String motherPhoto,
             String guardianSelection, String guardianName, String guardianRelationship,
             String guardianPhone, String guardianEmail, String guardianAddress,
             String guardianOccupation, String guardianCitizenshipNumber,
             String medicalBloodGroup, String height, String weight, String medicalConditions,
            String medicalConditionsOther, String allergies, String disability,
            String emergencyContactPerson, String emergencyContactNumber,
            String previousSchool, String previousAddress, String previousClass,
            String transferCertificateNumber, String reasonForLeaving,
            Boolean hasHostel, String hostel, String roomNumber, String bedNumber,
            Boolean usesTransport, String route, String pickupPoint, String vehicle,
            String documents, String documentCategories, String notes) {}
    public record StudentResponse(Long id, String admissionNo, String rollNumber, String firstName, String lastName,
                                     String dob, String gender, String status, Long classId, Long sectionId, Long guardianId,
                                     String className, String sectionName, String guardianName,
                                     GuardianResponse guardian,
                                     Long provinceId, String province, Long districtId, String district,
                                     Long municipalityId, String municipality, Long wardId, Integer ward, String street,
                                     StudentDetailsResponse details) {}
    public record TeacherRequest(@NotBlank String employeeNumber, @NotBlank String firstName, @NotBlank String lastName,
                                 @NotBlank String phone, @NotBlank String email, String middleName, String gender,
                                 LocalDate dateOfBirth, String photo, LocalDate joiningDate, String employmentType,
                                 String department, String designation, String status, @NotBlank String qualification,
                                 String experience, BigDecimal basicSalary, String details,
                                 List<TeacherSubjectRequest> assignments) {}
    public record TeacherSummaryResponse(long total, long active, long inactive) {}
    public record TeacherActivityResponse(String timestamp, String action, String description) {}
    public record ParentRequest(String fullName, String phone, String email, String address) {}
    public record GuardianRequest(String guardianCode, String fullName, @NotBlank String firstName, String middleName,
                                  @NotBlank String lastName, @NotBlank String gender, @NotBlank String relationship,
                                  LocalDate dateOfBirth, String occupation, String organization, String officeAddress,
                                  String citizenshipNumber, String nationality, String religion, String photo,
                                  @NotBlank String phone, String mobile, String alternativeMobile, String landline,
                                   String email, @NotBlank String address, String communicationPreference,
                                  String emergencyContactPerson, String emergencyContactNumber,
                                  String emergencyContactRelationship, String documents, String documentMetadata, String notes, String status,
                                  String fatherName, String motherName, String fatherOccupation, String fatherPhone, String fatherEmail,
                                  String motherOccupation, String motherPhone, String motherEmail) {}
    public record GuardianResponse(Long id, Long schoolId, String guardianCode, String fullName, String firstName, String middleName,
                                   String lastName, String gender, String relationship, LocalDate dateOfBirth,
                                   String occupation, String organization, String officeAddress, String citizenshipNumber,
                                   String nationality, String religion, String photo, String phone, String mobile,
                                   String alternativeMobile, String landline, String email, String address,
                                   String communicationPreference, String emergencyContactPerson, String emergencyContactNumber,
                                   String emergencyContactRelationship, String documents, String documentMetadata, String notes, String status,
                                   String fatherName, String motherName, String fatherOccupation, String fatherPhone, String fatherEmail,
                                   String motherOccupation, String motherPhone, String motherEmail,
                                   long childrenCount, boolean deleted, java.time.Instant createdAt, java.time.Instant updatedAt, Long createdBy, Long updatedBy) {}
    public record GuardianSummaryResponse(long total, long active, long inactive) {}
    public record LinkStudentRequest(Long studentId) {}
    public record ChildResponse(Long id, String admissionNumber, String rollNumber, String firstName, String lastName,
                                String className, String sectionName, String status, String photo) {}
    public record AttendanceRequest(Long studentId, Long classId, Long sectionId, LocalDate attendanceDate,
                                    AttendanceStatus status, String remarks) {}
    public record ExamTypeRequest(String name, Integer weightage) {}
    public record ExamRequest(Long examTypeId, Long classId, String name, LocalDate startsOn, LocalDate endsOn, boolean published) {}
    public record ExamSubjectRequest(Long examId, Long subjectId, LocalDate examDate, BigDecimal fullMarks, BigDecimal passMarks) {}
    public record MarkRequest(Long examSubjectId, Long studentId, BigDecimal obtainedMarks, BigDecimal fullMarks, BigDecimal passMarks) {}
    public record AssignmentRequest(Long classId, Long sectionId, Long subjectId, String title,
                                    String description, LocalDateTime dueAt) {}
    public record SubmissionRequest(Long assignmentId, Long studentId, String fileUrl, String answerText) {}
    public record FeeCategoryRequest(String name, String description) {}
    public record FeeStructureRequest(Long feeCategoryId, Long classId, BigDecimal amount, LocalDate dueDate) {}
    public record FeeCollectionRequest(Long studentId, Long feeStructureId, BigDecimal paidAmount,
                                       BigDecimal discount, BigDecimal fine, String paymentMode) {}
    public record LeaveRequestDto(Long studentId, Long teacherId, LocalDate startsOn, LocalDate endsOn, String reason) {}
    public record LeaveDecisionRequest(LeaveStatus status, String decisionRemarks) {}
    public record NotificationRequest(Long userId, String title, String message, String eventType) {}
    public record DashboardResponse(Map<String, Object> metrics, Map<String, Object> charts) {}

    public record SelfProfile(String role, String displayName, String photo, Long schoolId, Long personId,
                              Long classId, String className, Long sectionId, String sectionName,
                              String employeeNumber, String department) {}
    public record RoleDashboardContext(Long schoolId, String schoolName, Long academicSessionId,
                                       String academicSessionName) {}
    public record DashboardAssignment(Long id, String title, LocalDateTime dueAt, String status,
                                      String submissionStatus) {}
    public record DashboardAssignmentSection(long count, long pending, List<DashboardAssignment> recent) {}
    public record DashboardTeacherAttendance(LocalDate date, AttendanceStatus status,
                                             java.time.LocalTime checkIn, java.time.LocalTime checkOut) {}
    public record DashboardAttendanceRow(LocalDate date, AttendanceStatus status) {}
    public record DashboardStudentAttendance(long present, long absent, long late, long leave,
                                             double percentage, List<DashboardAttendanceRow> recent) {}
    public record DashboardExamAssignment(Long examSubjectId, Long examId, String examName,
                                          LocalDate examDate, String subjectName, String className,
                                          String sectionName, boolean published) {}
    public record DashboardExamSection(long count, List<DashboardExamAssignment> recent) {}
    public record DashboardResultSection(long publishedCount, Result latestResult) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record TeacherDashboardResponse(RoleDashboardContext context, SelfProfile profile,
                                           Set<ModuleCode> modules,
                                           List<TeacherAssignmentScopeResponse> teachingAssignments,
                                           DashboardAssignmentSection assignments,
                                           DashboardTeacherAttendance teacherAttendance,
                                           DashboardExamSection examinations,
                                           boolean timetableAvailable, List<Object> timetableEntries) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record StudentDashboardResponse(RoleDashboardContext context, SelfProfile profile,
                                           Set<ModuleCode> modules, Long classId, String className,
                                           Long sectionId, String sectionName, Long academicSessionId,
                                           String academicSessionName, DashboardAssignmentSection assignments,
                                           DashboardStudentAttendance attendance, DashboardResultSection results,
                                           boolean timetableAvailable, List<Object> timetableEntries) {}

    public record ParentDashboardResponse(String status, boolean enabled) {}

    public record SchoolAdminDashboardResponse(SchoolDashboardSchool school, SchoolDashboardSession session,
            List<SchoolDashboardSession> availableSessions, Set<ModuleCode> enabledModules,
            SchoolDashboardOverview overview, SchoolDashboardAttendance attendance,
            SchoolDashboardTeacherOverview teacherOverview, SchoolDashboardExaminations examinations,
            SchoolDashboardAssignments assignments, SchoolDashboardAttention attention,
            boolean activityAvailable, List<Object> recentActivity) {}
    public record SchoolDashboardSchool(Long id, String code, String name, String address, String phone, String email, String logoUrl) {}
    public record SchoolDashboardSession(Long id, String name, LocalDate startsOn, LocalDate endsOn, boolean active) {}
    public record SchoolDashboardOverview(long totalStudents, long activeStudents, long totalTeachers,
            long activeTeachers, long totalClasses, long totalSections) {}
    public record SchoolDashboardAttendance(LocalDate date, long total, long present, long absent, long late,
            long leave, long unmarked, double percentage, boolean requiresAttention, List<SchoolDashboardAbsence> todayAbsences) {}
    public record SchoolDashboardAbsence(Long attendanceId, Long studentId, String studentName,
            String className, String sectionName, AttendanceStatus status) {}
    public record SchoolDashboardTeacherOverview(long present, long absent, long onLeave, long unmarked,
            long pendingLeaveCount, List<SchoolDashboardPendingLeave> recentPendingLeaves) {}
    public record SchoolDashboardPendingLeave(Long id, Long teacherId, String teacherName, LocalDate startsOn,
            LocalDate endsOn, String reason, LeaveStatus status) {}
    public record SchoolDashboardExaminations(long upcomingCount, long awaitingPublicationCount,
            long recentlyPublishedCount, List<SchoolDashboardUpcomingExam> upcoming,
            List<SchoolDashboardRecentExam> recent) {}
    public record SchoolDashboardUpcomingExam(Long id, String name, LocalDate startsOn, LocalDate endsOn,
            String status, List<String> classNames) {}
    public record SchoolDashboardRecentExam(Long id, String name, LocalDate endsOn, String publicationStatus) {}
    public record SchoolDashboardAssignments(long active, long dueThisWeek, long pendingSubmissions,
            List<SchoolDashboardAssignment> recent) {}
    public record SchoolDashboardAssignment(Long id, String title, LocalDateTime dueAt, String status,
            String className, String subjectName) {}
    public record SchoolDashboardAttention(long absentStudents, long pendingTeacherLeaves,
            long resultsAwaitingPublication, long assignmentsDueThisWeek) {}
}
