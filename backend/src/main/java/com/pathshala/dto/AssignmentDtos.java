package com.pathshala.dto;

import com.pathshala.entity.Assignment;
import com.pathshala.entity.AssignmentSubmission;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public final class AssignmentDtos {
    private AssignmentDtos() {}

    public record AssignmentRequest(@NotNull Long academicSessionId, @NotNull Long classId,
            @NotEmpty List<@NotNull Long> sectionIds, @NotNull Long subjectId, @NotBlank @Size(max=255) String title,
            Assignment.Category category, String description, String instructions, @NotNull LocalDateTime publishAt,
            @NotNull @Future LocalDateTime dueAt, @Positive BigDecimal maximumMarks, boolean allowLateSubmission,
            LocalDateTime lateSubmissionDeadline) {}
    public record Attachment(String key, String originalName, String contentType, long size) {}
    public record AssignmentResponse(Long id, Long academicSessionId, Long teacherId, Long classId, List<Long> sectionIds,
            Long subjectId, String title, Assignment.Category category, String description, String instructions,
            LocalDateTime publishAt, LocalDateTime dueAt, BigDecimal maximumMarks, boolean allowLateSubmission,
            LocalDateTime lateSubmissionDeadline, Assignment.Status status, List<Attachment> attachments,
            LocalDateTime reminderSentAt) {}
    public record SubmissionRequest(String answerText, String comments) {}
    public record SubmissionResponse(Long id, Long assignmentId, Long studentId, List<Attachment> attachments,
            String fileUrl, String answerText, String comments, LocalDateTime submittedAt,
            AssignmentSubmission.Status status, BigDecimal marks, BigDecimal percentage, String feedback,
            Long reviewedBy, LocalDateTime reviewedAt) {}
    public record StudentAssignment(AssignmentResponse assignment, SubmissionResponse submission) {}
    public record ReviewRequest(@PositiveOrZero BigDecimal marks, String feedback, @NotNull AssignmentSubmission.Status status) {}
    public record BulkReviewItem(@NotNull Long submissionId, @Valid @NotNull ReviewRequest review) {}
    public record BulkReviewRequest(@NotEmpty List<@Valid BulkReviewItem> reviews) {}
    public record RosterRow(Long studentId, String studentName, String admissionNumber, String rollNumber, SubmissionResponse submission) {}
    public record Dashboard(long totalAssignments, long activeAssignments, long dueToday, long overdueAssignments,
            long pendingSubmissions, long submittedAssignments, long reviewedAssignments,
            BigDecimal averageSubmissionPercentage, Map<String, Long> submissionStatus,
            Map<String, Long> subjectWiseAssignments, Map<String, Long> classWiseAssignments,
            Map<String, Long> monthlyTrend) {}
    public record ReportRow(Long assignmentId, String assignmentTitle, Long teacherId, Long subjectId, Long studentId,
            String studentName, AssignmentSubmission.Status status, LocalDateTime submittedAt, BigDecimal marks,
            BigDecimal percentage) {}
    public record ChildAssignments(Long studentId, String studentName, List<StudentAssignment> assignments) {}
    public record TeacherAssignmentScope(Long academicSessionId, String academicSessionName,
            Long classId, String className, Long sectionId, String sectionName,
            Long subjectId, String subjectName) {}
}
