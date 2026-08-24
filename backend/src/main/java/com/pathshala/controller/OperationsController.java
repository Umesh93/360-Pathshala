package com.pathshala.controller;

import com.pathshala.dto.ApiDtos.*;
import com.pathshala.entity.*;
import com.pathshala.repository.Repositories.*;
import com.pathshala.service.ModuleAccessService;
import com.pathshala.service.AttendanceService;
import com.pathshala.service.ExaminationService;
import com.pathshala.service.AssignmentService;
import com.pathshala.dto.ExaminationDtos.BulkMarksRequest;
import com.pathshala.dto.ExaminationDtos.ExamRequest;
import com.pathshala.dto.ExaminationDtos.MarkInput;
import com.pathshala.dto.AttendanceDtos.BulkStudentRequest;
import com.pathshala.dto.AttendanceDtos.StudentMarkRequest;
import com.pathshala.util.SecurityUtils;
import com.pathshala.exception.ForbiddenException;
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
    private final AttendanceService attendanceService;
    private final AcademicYearRepository academicYearRepository;
    private final ExamTypeRepository examTypeRepository;
    private final ExamRepository examRepository;
    private final ExamSubjectRepository examSubjectRepository;
    private final MarkRepository markRepository;
    private final AssignmentService assignmentService;
    private final FeeCategoryRepository feeCategoryRepository;
    private final FeeStructureRepository feeStructureRepository;
    private final FeeCollectionRepository feeCollectionRepository;
    private final StudentRepository studentRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final NotificationRepository notificationRepository;
    private final SecurityUtils securityUtils;
    private final ModuleAccessService moduleAccessService;
    private final ExaminationService examinationService;

    @PostMapping("/attendance")
    @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public Attendance markAttendance(@RequestBody AttendanceRequest request) {
        Long schoolId = attendanceService.school();
        AcademicYear session = academicYearRepository.findFirstBySchoolIdAndActiveTrueAndDeletedFalseOrderByStartsOnDesc(schoolId)
                .orElseThrow(() -> new IllegalArgumentException("No active academic session"));
        var saved = attendanceService.bulk(new BulkStudentRequest(session.getId(), request.classId(), request.sectionId(),
                request.attendanceDate(), true, java.util.List.of(new StudentMarkRequest(request.studentId(), request.status(), request.remarks())))).getFirst();
        return attendanceRepository.findByIdAndSchoolIdAndDeletedFalse(saved.id(), schoolId).orElseThrow();
    }

    @GetMapping("/attendance/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT','PARENT','TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public java.util.List<Attendance> attendance(@PathVariable Long studentId, @RequestParam LocalDate start, @RequestParam LocalDate end) {
        Long schoolId = attendanceService.school();
        attendanceService.studentHistory(studentId, start, end, null, null);
        return attendanceRepository.findBySchoolIdAndStudentIdAndAttendanceDateBetweenAndDeletedFalse(schoolId, studentId, start, end);
    }

    @PostMapping("/exam-types")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ExamType examType(@RequestBody ExamTypeRequest request) {
        return examinationService.createExamType(null, request.name(), request.weightage());
    }

    @PostMapping("/exams")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Exam exam(@RequestBody com.pathshala.dto.ApiDtos.ExamRequest request) {
        if (request.published()) throw new IllegalArgumentException("Use the examination publish endpoint after completing all marks");
        Long schoolId = examinationService.school(null);
        AcademicYear session = academicYearRepository.findFirstBySchoolIdAndActiveTrueAndDeletedFalseOrderByStartsOnDesc(schoolId).orElseThrow(() -> new IllegalArgumentException("No active academic session"));
        Exam exam = examinationService.createExam(null, new ExamRequest(session.getId(), request.examTypeId(), request.name(), request.startsOn(), request.endsOn(), request.endsOn(), null, "UPCOMING", false));
        return exam;
    }

    @PostMapping("/exam-subjects")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ExamSubject examSubject(@RequestBody ExamSubjectRequest request) {
        throw new IllegalArgumentException("Legacy routine endpoint lacks class, section and time; use POST /api/examinations/routine");
    }

    @PostMapping("/marks")
    @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public Mark mark(@RequestBody MarkRequest request) {
        return examinationService.bulkMarks(null, new BulkMarksRequest(request.examSubjectId(), java.util.List.of(new MarkInput(request.studentId(), request.obtainedMarks(), false)))).getFirst();
    }

    @PostMapping("/assignments")
    @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public Assignment assignment(@RequestBody AssignmentRequest request) {
        return assignmentRepositoryResult(assignmentService.legacyCreate(request).id());
    }

    @PostMapping("/assignment-submissions")
    @PreAuthorize("hasAnyRole('STUDENT','SCHOOL_ADMIN','SUPER_ADMIN')")
    public AssignmentSubmission submit(@RequestBody SubmissionRequest request) {
        var saved = assignmentService.legacySubmit(request);
        AssignmentSubmission value = new AssignmentSubmission(); value.setId(saved.id()); value.setSchoolId(securityUtils.requiredSchoolId()); value.setAssignmentId(saved.assignmentId()); value.setStudentId(saved.studentId()); value.setAnswerText(saved.answerText()); value.setSubmittedAt(saved.submittedAt()); value.setStatus(saved.status()); return value;
    }

    private Assignment assignmentRepositoryResult(Long id) { return assignmentServiceEntity(id); }
    private Assignment assignmentServiceEntity(Long id) {
        var value = assignmentService.get(null, id); Assignment a = new Assignment(); a.setId(value.id()); a.setSchoolId(securityUtils.requiredSchoolId()); a.setAcademicSessionId(value.academicSessionId()); a.setTeacherId(value.teacherId()); a.setClassId(value.classId()); a.setSectionId(value.sectionIds().getFirst()); a.setSubjectId(value.subjectId()); a.setTitle(value.title()); a.setDescription(value.description()); a.setDueAt(value.dueAt()); a.setStatus(value.status()); return a;
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
        if (securityUtils.hasRole(RoleName.STUDENT)) {
            Student student = currentStudent(schoolId);
            BigDecimal expected = feeStructureRepository.totalExpectedForClass(schoolId, student.getClassId());
            BigDecimal collected = feeCollectionRepository.totalCollectedForStudent(schoolId, student.getId());
            return Map.of("expected", expected, "collected", collected, "outstanding", expected.subtract(collected));
        }
        BigDecimal expected = feeStructureRepository.totalExpected(schoolId); BigDecimal collected = feeCollectionRepository.totalCollected(schoolId);
        return Map.of("expected", expected, "collected", collected, "outstanding", expected.subtract(collected));
    }

    @PostMapping("/leave-requests")
    @PreAuthorize("hasAnyRole('TEACHER','PARENT','STUDENT','SCHOOL_ADMIN','SUPER_ADMIN')")
    public LeaveRequest leave(@RequestBody LeaveRequestDto request) {
        Long schoolId = securityUtils.requiredSchoolId(); moduleAccessService.require(schoolId, ModuleCode.LEAVE_MANAGEMENT);
        LeaveRequest leave = new LeaveRequest(); leave.setSchoolId(schoolId); leave.setRequesterUserId(securityUtils.currentUser().getId());
        leave.setStudentId(securityUtils.hasRole(RoleName.STUDENT) ? currentStudent(schoolId).getId() : request.studentId());
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
        if (securityUtils.hasRole(RoleName.STUDENT)) {
            return notificationRepository.findBySchoolIdAndUserIdAndDeletedFalse(schoolId, securityUtils.currentUser().getId(), pageable);
        }
        return notificationRepository.findBySchoolIdAndDeletedFalse(schoolId, pageable);
    }

    private Student currentStudent(Long schoolId) {
        return studentRepository.findBySchoolIdAndUserIdAndDeletedFalse(schoolId, securityUtils.currentUser().getId())
                .orElseThrow(() -> new ForbiddenException("Student profile mapping not found"));
    }
}
