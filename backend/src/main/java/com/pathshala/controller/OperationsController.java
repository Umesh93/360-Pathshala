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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/operations")
@RequiredArgsConstructor
public class OperationsController {
    private final AttendanceRepository attendanceRepository;
    private final ExamTypeRepository examTypeRepository;
    private final ExamRepository examRepository;
    private final ExamSubjectRepository examSubjectRepository;
    private final MarkRepository markRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final FeeCategoryRepository feeCategoryRepository;
    private final FeeStructureRepository feeStructureRepository;
    private final FeeCollectionRepository feeCollectionRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final NotificationRepository notificationRepository;
    private final SecurityUtils securityUtils;
    private final ModuleAccessService moduleAccessService;

    @PostMapping("/attendance")
    @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public Attendance markAttendance(@RequestBody AttendanceRequest request) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.ATTENDANCE);
        Attendance attendance = new Attendance();
        attendance.setSchoolId(schoolId); attendance.setStudentId(request.studentId()); attendance.setClassId(request.classId());
        attendance.setSectionId(request.sectionId()); attendance.setAttendanceDate(request.attendanceDate()); attendance.setStatus(request.status()); attendance.setRemarks(request.remarks());
        return attendanceRepository.save(attendance);
    }

    @GetMapping("/attendance/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT','PARENT','TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public java.util.List<Attendance> attendance(@PathVariable Long studentId, @RequestParam LocalDate start, @RequestParam LocalDate end) {
        Long schoolId = securityUtils.requiredSchoolId();
        moduleAccessService.require(schoolId, ModuleCode.ATTENDANCE);
        return attendanceRepository.findBySchoolIdAndStudentIdAndAttendanceDateBetweenAndDeletedFalse(schoolId, studentId, start, end);
    }

    @PostMapping("/exam-types")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ExamType examType(@RequestBody ExamTypeRequest request) {
        Long schoolId = securityUtils.requiredSchoolId(); moduleAccessService.require(schoolId, ModuleCode.EXAMINATION);
        ExamType type = new ExamType(); type.setSchoolId(schoolId); type.setName(request.name()); type.setWeightage(request.weightage()); return examTypeRepository.save(type);
    }

    @PostMapping("/exams")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Exam exam(@RequestBody ExamRequest request) {
        Long schoolId = securityUtils.requiredSchoolId(); moduleAccessService.require(schoolId, ModuleCode.EXAMINATION);
        Exam exam = new Exam(); exam.setSchoolId(schoolId); exam.setExamTypeId(request.examTypeId()); exam.setClassId(request.classId());
        exam.setName(request.name()); exam.setStartsOn(request.startsOn()); exam.setEndsOn(request.endsOn()); exam.setPublished(request.published()); return examRepository.save(exam);
    }

    @PostMapping("/exam-subjects")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ExamSubject examSubject(@RequestBody ExamSubjectRequest request) {
        Long schoolId = securityUtils.requiredSchoolId(); moduleAccessService.require(schoolId, ModuleCode.EXAMINATION);
        ExamSubject subject = new ExamSubject(); subject.setSchoolId(schoolId); subject.setExamId(request.examId()); subject.setSubjectId(request.subjectId());
        subject.setExamDate(request.examDate()); subject.setFullMarks(request.fullMarks()); subject.setPassMarks(request.passMarks()); return examSubjectRepository.save(subject);
    }

    @PostMapping("/marks")
    @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public Mark mark(@RequestBody MarkRequest request) {
        Long schoolId = securityUtils.requiredSchoolId(); moduleAccessService.require(schoolId, ModuleCode.EXAMINATION);
        BigDecimal percentage = request.obtainedMarks().multiply(BigDecimal.valueOf(100)).divide(request.fullMarks(), 2, java.math.RoundingMode.HALF_UP);
        Mark mark = new Mark(); mark.setSchoolId(schoolId); mark.setExamSubjectId(request.examSubjectId()); mark.setStudentId(request.studentId()); mark.setObtainedMarks(request.obtainedMarks());
        mark.setGrade(percentage.compareTo(BigDecimal.valueOf(90)) >= 0 ? "A+" : percentage.compareTo(BigDecimal.valueOf(80)) >= 0 ? "A" : percentage.compareTo(BigDecimal.valueOf(60)) >= 0 ? "B" : percentage.compareTo(BigDecimal.valueOf(40)) >= 0 ? "C" : "F");
        mark.setGpa(percentage.divide(BigDecimal.valueOf(20), 2, java.math.RoundingMode.HALF_UP));
        mark.setResultStatus(request.obtainedMarks().compareTo(request.passMarks()) >= 0 ? "PASS" : "FAIL");
        return markRepository.save(mark);
    }

    @PostMapping("/assignments")
    @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public Assignment assignment(@RequestBody AssignmentRequest request) {
        Long schoolId = securityUtils.requiredSchoolId(); moduleAccessService.require(schoolId, ModuleCode.ASSIGNMENT);
        Assignment assignment = new Assignment(); assignment.setSchoolId(schoolId); assignment.setTeacherId(request.teacherId()); assignment.setClassId(request.classId());
        assignment.setSectionId(request.sectionId()); assignment.setSubjectId(request.subjectId()); assignment.setTitle(request.title()); assignment.setDescription(request.description()); assignment.setDueAt(request.dueAt()); return assignmentRepository.save(assignment);
    }

    @PostMapping("/assignment-submissions")
    @PreAuthorize("hasAnyRole('STUDENT','SCHOOL_ADMIN','SUPER_ADMIN')")
    public AssignmentSubmission submit(@RequestBody SubmissionRequest request) {
        Long schoolId = securityUtils.requiredSchoolId(); moduleAccessService.require(schoolId, ModuleCode.ASSIGNMENT);
        AssignmentSubmission submission = new AssignmentSubmission(); submission.setSchoolId(schoolId); submission.setAssignmentId(request.assignmentId()); submission.setStudentId(request.studentId());
        submission.setFileUrl(request.fileUrl()); submission.setAnswerText(request.answerText()); submission.setSubmittedAt(LocalDateTime.now()); return submissionRepository.save(submission);
    }

    @PostMapping("/fee-categories")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public FeeCategory feeCategory(@RequestBody FeeCategoryRequest request) {
        Long schoolId = securityUtils.requiredSchoolId(); moduleAccessService.require(schoolId, ModuleCode.FEE_MANAGEMENT);
        FeeCategory category = new FeeCategory(); category.setSchoolId(schoolId); category.setName(request.name()); category.setDescription(request.description()); return feeCategoryRepository.save(category);
    }

    @PostMapping("/fee-structures")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public FeeStructure feeStructure(@RequestBody FeeStructureRequest request) {
        Long schoolId = securityUtils.requiredSchoolId(); moduleAccessService.require(schoolId, ModuleCode.FEE_MANAGEMENT);
        FeeStructure structure = new FeeStructure(); structure.setSchoolId(schoolId); structure.setFeeCategoryId(request.feeCategoryId()); structure.setClassId(request.classId()); structure.setAmount(request.amount()); structure.setDueDate(request.dueDate()); return feeStructureRepository.save(structure);
    }

    @PostMapping("/fee-collections")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public FeeCollection feeCollection(@RequestBody FeeCollectionRequest request) {
        Long schoolId = securityUtils.requiredSchoolId(); moduleAccessService.require(schoolId, ModuleCode.FEE_MANAGEMENT);
        FeeCollection collection = new FeeCollection(); collection.setSchoolId(schoolId); collection.setStudentId(request.studentId()); collection.setFeeStructureId(request.feeStructureId());
        collection.setPaidAmount(request.paidAmount()); collection.setDiscount(request.discount()); collection.setFine(request.fine()); collection.setPaymentMode(request.paymentMode()); collection.setPaidOn(LocalDate.now()); collection.setReceiptNumber(UUID.randomUUID().toString()); return feeCollectionRepository.save(collection);
    }

    @GetMapping("/fees/outstanding")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','PARENT','STUDENT','SUPER_ADMIN')")
    public Map<String, BigDecimal> outstandingFees() {
        Long schoolId = securityUtils.requiredSchoolId(); moduleAccessService.require(schoolId, ModuleCode.FEE_MANAGEMENT);
        BigDecimal expected = feeStructureRepository.totalExpected(schoolId); BigDecimal collected = feeCollectionRepository.totalCollected(schoolId);
        return Map.of("expected", expected, "collected", collected, "outstanding", expected.subtract(collected));
    }

    @PostMapping("/leave-requests")
    @PreAuthorize("hasAnyRole('TEACHER','PARENT','STUDENT','SCHOOL_ADMIN','SUPER_ADMIN')")
    public LeaveRequest leave(@RequestBody LeaveRequestDto request) {
        Long schoolId = securityUtils.requiredSchoolId(); moduleAccessService.require(schoolId, ModuleCode.LEAVE_MANAGEMENT);
        LeaveRequest leave = new LeaveRequest(); leave.setSchoolId(schoolId); leave.setRequesterUserId(securityUtils.currentUser().getId()); leave.setStudentId(request.studentId());
        leave.setTeacherId(request.teacherId()); leave.setStartsOn(request.startsOn()); leave.setEndsOn(request.endsOn()); leave.setReason(request.reason()); return leaveRequestRepository.save(leave);
    }

    @PutMapping("/leave-requests/{id}/decision")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public LeaveRequest decideLeave(@PathVariable Long id, @RequestBody LeaveDecisionRequest request) {
        Long schoolId = securityUtils.requiredSchoolId(); LeaveRequest leave = leaveRequestRepository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId).orElseThrow();
        leave.setStatus(request.status()); leave.setDecisionRemarks(request.decisionRemarks()); return leaveRequestRepository.save(leave);
    }

    @PostMapping("/notifications")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER','SUPER_ADMIN')")
    public Notification notify(@RequestBody NotificationRequest request) {
        Long schoolId = securityUtils.requiredSchoolId(); moduleAccessService.require(schoolId, ModuleCode.NOTIFICATIONS);
        Notification notification = new Notification(); notification.setSchoolId(schoolId); notification.setUserId(request.userId()); notification.setTitle(request.title()); notification.setMessage(request.message()); notification.setEventType(request.eventType()); return notificationRepository.save(notification);
    }

    @GetMapping("/notifications")
    public Page<Notification> notifications(Pageable pageable) {
        Long schoolId = securityUtils.requiredSchoolId(); moduleAccessService.require(schoolId, ModuleCode.NOTIFICATIONS);
        return notificationRepository.findBySchoolIdAndDeletedFalse(schoolId, pageable);
    }
}
