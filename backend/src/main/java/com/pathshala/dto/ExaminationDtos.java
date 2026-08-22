package com.pathshala.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public final class ExaminationDtos {
    private ExaminationDtos() {}

    public record ExamRequest(@NotNull Long academicSessionId, Long examTypeId,
                              @NotBlank String name, @NotNull LocalDate startsOn, @NotNull LocalDate endsOn,
                              @NotNull @JsonAlias("publishDate") LocalDate resultPublishDate, String description,
                              String status, Boolean includeInCgpa) {}
    public record ExamTypeRequest(Long id, @NotBlank String name, String description, Integer weightage, Boolean active) {}
    public record ExamClassAssignmentsRequest(@NotNull List<@NotNull Long> classIds) {}
    public record RoutineRequest(@NotNull Long examId, @NotNull Long classId, @NotNull Long sectionId,
                                 @NotNull Long subjectId, @NotNull LocalDate examDate,
                                 @NotNull LocalTime startTime, @NotNull LocalTime endTime, String room,
                                 Long invigilatorId, @NotNull @Positive BigDecimal fullMarks,
                                 @NotNull @DecimalMin("0") BigDecimal passMarks) {}
    public record GradingSystemRequest(@NotNull Long academicSessionId, @NotBlank String name) {}
    public record GradeRuleRequest(@NotNull @DecimalMin("0") @DecimalMax("100") BigDecimal minPercentage,
                                   @NotNull @DecimalMin("0") @DecimalMax("100") BigDecimal maxPercentage,
                                    @NotBlank String grade, @NotNull @DecimalMin("0") @DecimalMax("10") BigDecimal gpa,
                                    boolean passing, String remarks) {}
    public record SubjectAcademicConfigInput(@NotNull Long subjectId, @DecimalMin(value = "0", inclusive = false) BigDecimal creditHours,
                                             Boolean includeInGpa, Boolean includeInCgpa) {}
    public record SubjectAcademicConfigBulkRequest(@NotNull Long academicSessionId, @NotNull Long classId,
                                                   @NotNull List<@Valid SubjectAcademicConfigInput> configs) {}
    public record SubjectAcademicConfigRow(Long academicSessionId, Long classId, Long subjectId,
                                           String subjectCode, String subjectName, BigDecimal creditHours,
                                           boolean includeInGpa, boolean includeInCgpa, boolean configured,
                                           boolean usingLegacyCreditHours) {}
    public record MarkInput(@NotNull Long studentId, BigDecimal obtainedMarks, boolean absent) {}
    public record BulkMarksRequest(@NotNull Long examSubjectId, @NotEmpty List<@Valid MarkInput> marks) {}
    public record RosterRow(Long studentId, String admissionNumber, String rollNumber, String studentName,
                             BigDecimal obtainedMarks, boolean absent, String grade, BigDecimal gpa, String status) {}
    public record TeacherAssignment(Long examSubjectId, Long examId, String examName, LocalDate examDate,
                                    String subjectName, String className, String sectionName,
                                     BigDecimal fullMarks, BigDecimal passMarks, boolean published) {}
    public record PublicationScope(Long examId, Long classId, String className, Long sectionId, String sectionName,
                                   long routineCount, long studentCount, long missingMarksCount, boolean complete,
                                   boolean published, LocalDateTime publishedAt) {}
    public record SubjectResult(Long examSubjectId, Long subjectId, String subjectCode, String subjectName,
                                BigDecimal fullMarks, BigDecimal passMarks, BigDecimal obtainedMarks,
                                BigDecimal percentage, boolean absent, String grade, BigDecimal gradePoint,
                                BigDecimal gpa, BigDecimal creditHours, BigDecimal qualityPoints,
                                String status, String remarks) {}
    public record Result(Long examId, String examName, Long studentId, String studentName,
                         String schoolName, String schoolAddress, String schoolPhone, String schoolEmail,
                         String schoolLogoUrl, String studentPhoto, String admissionNumber, String rollNumber,
                         Long academicSessionId, String academicSessionName, LocalDate examStartsOn,
                         LocalDate examEndsOn, LocalDate resultPublishDate, Long classId, String className,
                         Long sectionId, String sectionName, boolean published, BigDecimal total,
                         BigDecimal fullMarks, BigDecimal percentage, BigDecimal totalCreditHours,
                         BigDecimal gpa, BigDecimal cgpa, Integer cgpaPeriods, String grade,
                         String status, String remarks, Integer classRank, Integer sectionRank,
                         Integer schoolRank, List<SubjectResult> subjects) {}
    public record ChildResults(Long studentId, String studentName, String admissionNumber,
                               String className, String sectionName, List<Result> results) {}
    public record ReportRow(Long subjectId, String subjectName, Long classId, Long sectionId, String grade,
                            long total, long passed, long failed, BigDecimal passPercentage,
                            BigDecimal average, BigDecimal highest, BigDecimal lowest) {}
    public record Dashboard(Map<String, Object> metrics, Map<String, Object> charts) {}
}
