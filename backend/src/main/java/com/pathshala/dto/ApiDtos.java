package com.pathshala.dto;

import com.pathshala.entity.AttendanceStatus;
import com.pathshala.entity.LeaveStatus;
import com.pathshala.entity.ModuleCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

public class ApiDtos {
    public record SchoolRequest(@NotBlank String name, @NotBlank String code, String address, String phone, String email) {}
    public record PlanRequest(@NotBlank String name, BigDecimal monthlyPrice, String description) {}
    public record ModuleAssignmentRequest(@NotNull Long schoolId, @NotNull ModuleCode moduleCode, boolean active) {}
    public record AcademicYearRequest(String name, LocalDate startsOn, LocalDate endsOn, boolean active) {}
    public record ClassRequest(String name, String code) {}
    public record SectionRequest(Long classId, String name, Integer capacity) {}
    public record SubjectRequest(String name, String code) {}
    public record TeacherSubjectRequest(Long teacherId, Long subjectId, Long classId, Long sectionId) {}
    public record StudentRequest(String admissionNumber, String rollNumber, String firstName, String lastName,
                                 LocalDate dateOfBirth, String gender, Long parentId, Long classId, Long sectionId) {}
    public record TeacherRequest(String employeeNumber, String firstName, String lastName, String phone, String qualification) {}
    public record ParentRequest(String fullName, String phone, String email, String address) {}
    public record AttendanceRequest(Long studentId, Long classId, Long sectionId, LocalDate attendanceDate,
                                    AttendanceStatus status, String remarks) {}
    public record ExamTypeRequest(String name, Integer weightage) {}
    public record ExamRequest(Long examTypeId, Long classId, String name, LocalDate startsOn, LocalDate endsOn, boolean published) {}
    public record ExamSubjectRequest(Long examId, Long subjectId, LocalDate examDate, BigDecimal fullMarks, BigDecimal passMarks) {}
    public record MarkRequest(Long examSubjectId, Long studentId, BigDecimal obtainedMarks, BigDecimal fullMarks, BigDecimal passMarks) {}
    public record AssignmentRequest(Long teacherId, Long classId, Long sectionId, Long subjectId, String title,
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
}
